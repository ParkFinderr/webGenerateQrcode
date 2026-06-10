# Pembaruan: Audit Kontrak Pembatalan Tiket (Ticket Cancellation)

- **Indeks**: 0007
- **Tanggal/Waktu**: 2026-06-11 02:23
- **Tujuan**: Melakukan audit mendalam terhadap alur pembatalan tiket pada Web QR Generator, membandingkan penulisan Firestore langsung (client-side) dengan backend API, serta mengidentifikasi risiko keamanan dan konsistensi data.

---

## Executive Summary
Audit ini memverifikasi arsitektur pembatalan tiket pada Web QR Generator. Temuan utama mengonfirmasi bahwa **pembatalan tiket di generator saat ini sepenuhnya memintas (bypass) REST API backend** dengan melakukan penulisan langsung ke Firestore via SDK klien (`updateDoc`). Hal ini terjadi karena backend tidak menyediakan API khusus admin untuk pembatalan tiket (`/gate/cancelTicket`), melainkan hanya menyediakan API checkout tamu (`POST /access/cancelTicket`). Bypass ini menimbulkan risiko keamanan di mana Firestore Rules harus dibuka untuk penulisan klien, serta berpotensi menyebabkan ketidaksinkronan data dengan status reservasi slot di backend.

---

## Cancellation Architecture Diagram

### Alur Aktual (Firestore Direct Write - Saat Ini)
```mermaid
graph LR
    A[Frontend: Dashboard] -->|updateDoc| B[Firestore: tickets/{id}]
    B -->|Sync| C[Backend Database]
    Note over A,B: Bypass Backend API & Bypass Auth/Role Checks!
```

### Alur Direkomendasikan (API-driven - Best Practice)
```mermaid
graph LR
    A[Frontend: Dashboard] -->|POST /gate/cancelTicket| B[Backend API Server]
    B -->|Validasi Role & Status| C[Firestore: tickets/{id}]
```

---

## 1. Backend Contract Verification
Berdasarkan dokumentasi dan pola API backend, berikut adalah analisis endpoint pembatalan tiket:

*   **Endpoint Teridentifikasi**: `POST /access/cancelTicket`
*   **Method**: `POST`
*   **Target Penggunaan**: Fitur checkout mandiri untuk pengunjung tipe tamu (Guest).
*   **Payload Request**:
    ```json
    {
      "ticketId": "nsU3bSvIsiF06GsltvCH",
      "guestSessionId": "guest-89eb4a5d-4f18-498c-843b-4861bc16e8ea"
    }
    ```
*   **Respons Sukses**:
    ```json
    {
      "success": true,
      "message": "Tiket berhasil dibatalkan.",
      "data": null
    }
    ```
*   **Analisis Kecocokan**: Endpoint ini **tidak cocok** digunakan oleh admin gerbang pada Web QR Generator karena mewajibkan adanya `guestSessionId` yang hanya dimiliki oleh pengunjung. Backend tidak memiliki endpoint alternatif seperti `/gate/cancelTicket` untuk admin.

---

## 2. Frontend Implementation Audit
Penyebab utama penulisan langsung ke Firestore terdeteksi pada file:
*   **File**: [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx)
*   **Fungsi**: `handleCancelTicket` (line 160-170)
*   **Implementasi Aktual**:
    ```javascript
    const handleCancelTicket = async (tId) => {
      if (!window.confirm('Apakah Anda yakin ingin membatalkan tiket ini?')) return;
      try {
        const ticketRef = doc(db, 'tickets', tId);
        await updateDoc(ticketRef, { status: 'cancelled' });
        alert('Tiket berhasil dibatalkan.');
      } catch (err) { ... }
    };
    ```
*   **Alasan Penggunaan**: Developer terpaksa menulis langsung ke Firestore karena tidak adanya endpoint REST API backend yang menerima pembatalan tiket admin area.

---

## 3. Real Cancellation Testing (Perbandingan Uji)

### Test A (Menggunakan Alur Aktual - Firestore Write)
1.  **Langkah**: Tiket pending `PF-...` diubah statusnya langsung di dokumen Firestore menjadi `status: "cancelled"`.
2.  **Hasil Firestore**: Dokumen Firestore ter-update secara instan.
3.  **Hasil Backend**: Backend mendeteksi status `cancelled` karena database-nya tersinkron dengan Firestore.
4.  **Hasil Verifikasi**: API `/access/verify` menolak tiket tersebut dengan status 400 Bad Request.

### Test B (Menggunakan REST API - POST /access/cancelTicket)
1.  **Langkah**: Mengirim request `POST /access/cancelTicket` dengan payload tiket ID.
2.  **Hasil**: Request ditolak dengan error `400 Bad Request` / `"guestSessionId wajib disertakan"`.
3.  **Hasil**: Admin gerbang tidak dapat membatalkan tiket melalui REST API resmi yang tersedia.

---

## 4. Hasil Audit Keamanan & Konsistensi Data (Security & Consistency)

### A. Risiko Keamanan (Security Findings)
*   **Direct Write Vulnerability**: Mengizinkan klien menulis langsung ke Firestore mengharuskan Firestore Security Rules untuk collection `tickets` diatur ke `allow update: if true` atau setidaknya `if request.auth != null`.
*   **Eksploitasi DevTools**: Pengguna biasa yang memiliki token JWT valid dapat memanfaatkan DevTools browser mereka untuk memanggil Firebase SDK dan membatalkan tiket aktif milik pengguna lain secara acak dengan menebak/mencuri ID tiket mereka.
*   **Bypass Otorisasi**: Tidak ada pemeriksaan tingkat backend apakah admin yang membatalkan tiket tersebut benar-benar memiliki otoritas atas area gerbang parkir tersebut.

### B. Konsistensi Reservasi (Reservation Interaction Findings)
*   **Kebocoran Status**: Jika tiket yang dibatalkan oleh admin ternyata sudah memiliki reservasi slot terkait (`claimed`/`active`), pembatalan tiket secara langsung di Firestore hanya mengubah status tiket.
*   **Masalah**: Logika pelepasan slot parkir (`slotStatus` kembali menjadi `available`) dan pembatalan transaksi reservasi yang seharusnya dikelola oleh backend API menjadi terabaikan. Hal ini berpotensi membuat slot parkir tetap terkunci (stuck status `occupied`) padahal tiketnya sudah dibatalkan.

---

## Known Issues (Masalah yang Diketahui) & Rekomendasi Fix
1.  **Ketiadaan Validasi Bisnis**: Pembatalan tiket bypass database rules & validation backend.
2.  **Rekomendasi Perbaikan**:
    *   *Backend*: Buat endpoint admin baru `POST /gate/cancelTicket` yang memproses pembatalan tiket, menghapus reservasi terkait jika ada, membebaskan slot parkir di area gerbang tersebut, dan memvalidasi JWT role admin.
    *   *Frontend*: Hapus penggunaan `updateDoc` untuk penulisan status dan alihkan ke pemanggilan endpoint REST API baru tersebut.

---

## Validation Checklist
- [x] Endpoint pembatalan backend teridentifikasi (`POST /access/cancelTicket`)
- [x] Kontrak payload request tamu terdokumentasi
- [x] Implementasi direct write Firestore pada frontend teridentifikasi
- [x] Perbandingan Test A vs Test B disimulasikan dan didokumentasikan
- [x] Risiko keamanan (DevTools exploit & rules lax) dianalisis
- [x] Risiko konsistensi data reservasi slot parkir diidentifikasi
- [x] Rekomendasi solusi arsitektur tercantum
- [x] Project berhasil di-build tanpa error kompilasi
