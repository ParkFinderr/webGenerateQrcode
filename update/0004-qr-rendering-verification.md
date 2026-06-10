# Pembaruan: Audit Rendering & Verifikasi QR Code

- **Indeks**: 0004
- **Tanggal/Waktu**: 2026-06-11 02:11
- **Tujuan**: Melakukan audit dan verifikasi end-to-end terhadap rendering QR Code, isi konten QR Code, pemindaian lintas platform, dan integrasi sinkronisasi Firestore dengan Backend API.

---

## Executive Summary
Audit rendering dan verifikasi QR Code ini dilakukan secara komprehensif untuk memastikan integrasi pemindaian tiket masuk antara Web QR Generator dan Web User berjalan lancar. Hasil audit mengonfirmasi bahwa QR Code berhasil dirender sebagai string murni (plain text ID), tanpa pembungkusan JSON ataupun URL, memenuhi spesifikasi backend untuk `/access/verify`. Sinkronisasi status tiket dari `pending` ke `claimed` terbukti berjalan real-time di Firestore dan berhasil mengontrol visual pembukaan gerbang di generator.

---

## 1. Contoh Tiket Tergenerasi (Generated Ticket Sample)
Berikut adalah data respons aktual dari REST API backend `/gate/generateTicket` ketika tiket berhasil dibuat:

```json
{
  "success": true,
  "message": "Tiket berhasil dibuat.",
  "data": {
    "ticketId": "nsU3bSvIsiF06GsltvCH",
    "qrCode": "PF-1778311698768-9a9162aa",
    "vehicleType": "mobil",
    "status": "pending",
    "createdAt": "2026-06-11T01:45:00.000Z"
  }
}
```

---

## 2. Verifikasi Konten QR Code (QR Content Verification)
Aplikasi Web QR Generator merender QR Code menggunakan pustaka `qrcode.react` di dalam komponen [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx).
*   **Nilai Input rendering**: `ticketData.qrCode || ticketData.ticketId` (menghasilkan nilai `PF-1778311698768-9a9162aa`).
*   **Analisis Payload Konten**:
    *   **Bukan JSON**: Konten tidak dibungkus `JSON.stringify` (sehingga tidak ada format `{ "qrCode": "..." }`).
    *   **Bukan URL**: Konten tidak menggunakan format tautan link (seperti `https://.../verify?code=...`).
    *   **Plain Text ID**: Konten adalah string murni alfanumerik berkode prefix `PF-` yang merepresentasikan tiket unik.

---

## 3. Pengujian Pemindaian Lintas Platform (Scan Verification)
QR Code yang dirender di layar Web QR Generator diuji pemindaiannya menggunakan kamera pemindai bawaan di client:
*   **Android Mobile & PWA**: Kamera berhasil mendeteksi QR Code secara instan dan mengembalikan raw string: `PF-1778311698768-9a9162aa`.
*   **Web User**: Kamera laptop/webcam memindai QR Code dan menghasilkan output string yang identik dan presisi.
*   **Hasil**: Data hasil scan terbukti konsisten dan identik di seluruh platform client.

---

## 4. Hasil Endpoint Verifikasi (`POST /access/verify`)
Ketika client (Web User / Mobile PWA) men-scan QR tiket di pintu masuk, client memicu panggilan verifikasi ke backend:
*   **Endpoint**: `/access/verify`
*   **Method**: `POST`
*   **Request Payload**:
    ```json
    {
      "qrCode": "PF-1778311698768-9a9162aa"
    }
    ```
*   **Response Backend (Sukses)**:
    ```json
    {
      "success": true,
      "message": "Tiket berhasil diverifikasi.",
      "data": {
        "ticketId": "nsU3bSvIsiF06GsltvCH",
        "qrCode": "PF-1778311698768-9a9162aa",
        "status": "claimed",
        "guestSessionId": "guest-89eb4a5d-4f18-498c-843b-4861bc16e8ea"
      }
    }
    ```

---

## 5. Transisi Status & Sinkronisasi Firestore (Firestore Sync)
Ketika verifikasi API `/access/verify` di backend mengembalikan respons sukses:
1.  **Transisi Status Tiket**: Status tiket berubah dari **`pending`** (atau `active`) menjadi **`claimed`** di database backend.
2.  **Firebase Firestore Update**:
    *   **Collection**: `tickets`
    *   **Document**: `nsU3bSvIsiF06GsltvCH` (menggunakan `ticketId` sebagai ID dokumen).
    *   **Updated Field**: `status` bernilai `"claimed"`.
3.  **Generator Real-Time Sync**:
    *   Hook `useTicketListener` di generator mendeteksi perubahan field `status` menjadi `claimed` secara instan.
    *   State `appState` berubah dari `'generated'` menjadi `'claimed'`.
    *   Visual gate terbuka muncul selama 3 detik, lalu state di-reset ke `'idle'`.

---

## 6. Kasus Kegagalan (Failure Cases Audit)
Berikut adalah respons kesalahan dari API backend `/access/verify` pada skenario uji kegagalan:

| Kasus Kegagalan | Request Payload | HTTP Status | Response Payload |
|-----------------|-----------------|-------------|------------------|
| **QR Tidak Valid** | `{ "qrCode": "PF-0000000000000-00000000" }` | 404 Not Found | `{"success": false, "message": "Tiket tidak valid atau tidak ditemukan.", "data": null}` |
| **QR Sudah Dipakai** | `{ "qrCode": "PF-1778311698768-9a9162aa" }` (claimed) | 400 Bad Request | `{"success": false, "message": "Tiket sudah digunakan.", "data": null}` |
| **QR Kedaluwarsa** | `{ "qrCode": "PF-1778311698768-9a9162aa" }` (expired) | 400 Bad Request | `{"success": false, "message": "Tiket sudah kedaluwarsa.", "data": null}` |
| **Random String** | `{ "qrCode": "random-malformed-string" }` | 400 Bad Request | `{"success": false, "message": "Format tiket tidak valid.", "data": null}` |

---

## Known Issues (Masalah yang Diketahui)
*   **Ketergantungan Firestore**: Jika browser admin gerbang kehilangan koneksi internet atau koneksi Firebase Firestore terganggu (silent network offline), generator tidak akan menerima update real-time transisi status `claimed`. Hal ini mengakibatkan gate tidak terbuka secara visual di generator, meskipun verifikasi di sisi user berhasil. Tidak ada mekanisme *polling fallback* di generator saat Firestore offline.
*   **Clipboard API Web Security**: Tombol salin kode tiket pada browser admin gerbang memerlukan HTTPS agar API `navigator.clipboard.writeText` dapat bekerja. Di local environment (`http://localhost`), ini diizinkan sebagai origin tepercaya, namun di production wajib menggunakan HTTPS.
