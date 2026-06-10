# Pembaruan: Audit Isolasi Area & Verifikasi Multi-Area

- **Indeks**: 0008
- **Tanggal/Waktu**: 2026-06-11 02:26
- **Tujuan**: Melakukan audit menyeluruh terhadap keandalan multi-area, konsistensi penyimpanan selectedAreaId, isolasi query Firestore, verifikasi cross-area leakage pada pencatatan dan gate open, serta ketahanan local storage.

---

## Executive Summary
Audit isolasi area ini memverifikasi bahwa Web QR Generator mampu beroperasi pada multi-area parkir tanpa adanya risiko kebocoran data (*cross-area leakage*). Hasil audit mengonfirmasi bahwa penyaringan rute database query snapshot di [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) terisolasi secara aman menggunakan klausa filter `areaId`. Namun, temuan kritis kembali didapatkan pada fitur pembatalan tiket: **karena pembatalan memintas API backend dan menulis langsung ke Firestore**, admin yang secara teknis mengirimkan ID dokumen tiket area lain (misal via konsol pengembang) tetap dapat memicu pembatalan tiket di area berbeda.

---

## Area Architecture Diagram (Area Initialization)

```mermaid
graph TD
    A[Admin Login Sukses] -->|1. Response user data| B{Apakah user memiliki managedAreaId?}
    B -->|Ya| C[Set selectedAreaId = managedAreaId]
    B -->|Tidak| D[Panggil GET /areas]
    D -->|2. Dapatkan list area| E{Apakah list area > 0?}
    E -->|Ya| F[Set selectedAreaId = areas[0].id]
    E -->|Tidak| G[selectedAreaId = Kosong]
    
    C --> H[Simpan all data ke localStorage]
    F --> H
    G --> H
    H --> I[Dashboard dimuat menggunakan selectedAreaId]
```

---

## 1. Audit Inisialisasi Area (Admin Area Loading Audit)
*   **Sumber Data**: API endpoint `/areas` dipanggil pada halaman login untuk mendapatkan semua area yang diasosiasikan dengan akun admin tersebut.
*   **Penyimpanan**: Data disimpan di `localStorage` dengan kunci `adminAreas`.
*   **Logika Penentuan Area Aktif (`selectedAreaId`)**:
    1.  Membaca properti `user.managedAreaId` (area khusus yang ditugaskan ke admin tersebut). Jika ada, area tersebut langsung terpilih sebagai default.
    2.  Jika `managedAreaId` kosong, sistem mengambil area pertama dari response `GET /areas` (`adminAreas[0].id`).
    3.  Data ini disimpan di `localStorage.setItem('selectedAreaId', ID_TERPILIH)`.
*   **Refresh Browser**: Saat halaman direfresh, inisialisasi state mengambil data dari local storage secara instan:
    ```javascript
    const [selectedAreaId, setSelectedAreaId] = useState(localStorage.getItem('selectedAreaId') || '');
    ```
    Ini menjamin status area tetap konsisten setelah browser dimuat ulang.

---

## 2. Verifikasi Pembuatan Tiket per Area (Generate Ticket)
Kami memverifikasi parameter payload saat men-generate tiket baru di dua area uji coba:
*   **Area A (Jurusan Teknik Elektro Unila)**: `BWOjPZoajWmF3kJA62Fe`
*   **Area B (Masjid Teknik Unila)**: `WPo6iohpkwNSdj0Y79lx`

### Hasil Verifikasi Payload:
*   **Request Area A**: `POST /gate/generateTicket` ➔ `{ "areaId": "BWOjPZoajWmF3kJA62Fe", "vehicleType": "mobil" }`
*   **Request Area B**: `POST /gate/generateTicket` ➔ `{ "areaId": "WPo6iohpkwNSdj0Y79lx", "vehicleType": "mobil" }`
*   **Respons Backend & Firestore**: Dokumen tiket sukses terdaftar di Firestore di dalam collection `tickets` dengan field `areaId` yang tepat sesuai request payload masing-masing area. Tidak ada kesalahan pemetaan ID area oleh backend.

---

## 3. Audit Isolasi Firestore & Dashboard (Firestore Isolation & Dashboard Filtering)
*   Penyaringan daftar tiket pada tabel [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx) dan penghitungan counter statistik di dashboard overview sepenuhnya mengandalkan array `ticketsList`.
*   Array ini disuplai oleh Firestore query snapshot:
    ```javascript
    const q = query(ticketsRef, where('areaId', '==', selectedAreaId));
    ```
*   **Hasil Evaluasi Leakage**: Terbukti **tidak ada kebocoran data (Cross-Area Leakage) di UI**. Tiket milik Area A tidak akan pernah dimuat di memori generator Area B, dan statistik ringkasan dashboard (Aktif, Hari Ini, Sukses) dihitung secara lokal dari array yang telah terfilter tersebut.

---

## 4. Audit Keamanan Pembatalan Lintas Area (Ticket Cancellation Area Audit)
*   **Kasus Uji**: Admin membuat tiket di Area A (`BWOjPZoajWmF3kJA62Fe`). Admin kemudian berpindah ke Area B (`WPo6iohpkwNSdj0Y79lx`).
*   **Batas UI**: Pada tampilan normal, tiket Area A menghilang dari tabel aktif karena query Firestore beralih memantau Area B.
*   **Kerentanan Bypass (Bypass Vulnerability)**:
    *   Karena fungsi pembatalan tiket langsung menulis ke Firestore menggunakan Firebase Client SDK:
        ```javascript
        const ticketRef = doc(db, 'tickets', tId);
        await updateDoc(ticketRef, { status: 'cancelled' });
        ```
    *   Jika admin memanggil fungsi ini secara manual menggunakan DevTools konsol pengembang dengan menyertakan ID dokumen tiket milik Area A, operasi update **tetap berhasil dan disetujui** oleh Firestore.
    *   **Penyebab**: Firestore Security Rules di sisi server tidak melakukan pemeriksaan silang (cross-check) apakah admin memiliki kepemilikan atas `areaId` tiket tersebut sebelum mengizinkan modifikasi status.

---

## 5. Audit Isolasi Pembukaan Gerbang (Gate Open Isolation Audit)
*   **Kasus Uji**: Tiket untuk Area A (`PF-1781119191731-0d77e821`) dipindai dan diverifikasi sukses oleh pengunjung.
*   **Hasil Evaluasi**:
    *   **Generator Area A**: Menerima event claimed karena hook `useTicketListener` di generator Area A sedang aktif men-subscribe dokumen tersebut. Visual gerbang Area A sukses terbuka.
    *   **Generator Area B**: Tidak menerima event apa pun karena status listener-nya aktif men-subscribe dokumen tiket Area B yang berbeda (atau bernilai null). Gerbang Area B tetap aman tertutup.

---

## 6. Pengujian Stress Multi-Area (Multi Area Stress Test)
*   **Skenario**: Men-generate 5 tiket di Area A dan 5 tiket di Area B secara bergantian.
*   **Hasil**:
    *   Daftar tiket aktif di kedua area terbagi dengan rapi sesuai seleksi menu dropdown header.
    *   Statistik counter dashboard akurat 100% mengikuti visual data yang aktif.
    *   Tampilan dashboard tetap responsif dan lancar saat melakukan peralihan area gerbang secara cepat.

---

## Temuan Masalah & Rekomendasi
1.  **Risiko Keamanan Modifikasi Firestore Lintas Area**:
    *   *Temuan*: Modifikasi status tiket langsung via client SDK memungkinkan admin/petugas gerbang yang nakal membatalkan tiket area lain secara sengaja jika mengetahui ID dokumennya.
    *   *Rekomendasi*: Seluruh modifikasi status (klaim, batal, expired) wajib dilewatkan melalui REST API Backend agar backend dapat melakukan validasi kepemilikan area (`areaId`) dan memverifikasi JWT token admin sebelum mengubah data Firestore.

---

## Validation Checklist
- [x] Logika inisialisasi default selectedAreaId tervalidasi
- [x] Penyimpanan local storage selectedAreaId konsisten saat reload
- [x] Parameter payload generate ticket menyertakan areaId yang tepat
- [x] Firestore query snapshot terisolasi menggunakan klausa where areaId
- [x] Statistik counter terbukti terisolasi per area aktif
- [x] Pembukaan gerbang claimed terisolasi aman dan tidak bocor ke area lain
- [x] Pengujian stress 10 tiket lintas area berjalan sukses
- [x] Project berhasil di-build tanpa error kompilasi
