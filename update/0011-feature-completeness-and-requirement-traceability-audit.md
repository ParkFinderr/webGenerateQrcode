# Pembaruan: Audit Kelengkapan Fitur & Keterlacakan Persyaratan (Feature Completeness & Traceability Audit)

- **Indeks**: 0011
- **Tanggal/Waktu**: 2026-06-11 02:42
- **Tujuan**: Melakukan audit komprehensif terhadap kelengkapan fitur berdasarkan spesifikasi yang tertulis dalam `agents.md`, memetakan matriks keterlacakan persyaratan (*traceability matrix*), melakukan audit detail terhadap API integration coverage, kelengkapan antarmuka (UI), verifikasi alur bisnis end-to-end, dan pemetaan utang teknis (*technical debt*).

---

## 1. Inventarisasi Persyaratan (Requirement Inventory)

Berdasarkan dokumen spesifikasi [agents.md](file:///C:/programming/qr/webGenerateQrcode/agents.md), berikut adalah daftar seluruh persyaratan sistem yang harus diimplementasikan pada aplikasi Web QR Generator:

### A. Authentication
- **Req-1.1**: Form login untuk petugas gerbang menggunakan email dan kata sandi.
- **Req-1.2**: Sistem penyimpanan session aman via token JWT.
- **Req-1.3**: Mekanisme logout petugas untuk menghapus session token dan data pengguna dari penyimpanan lokal.

### B. Generate Ticket
- **Req-2.1**: Pembuatan tiket masuk baru secara instan untuk area parkir aktif.
- **Req-2.2**: Pengiriman parameter tipe kendaraan (`vehicleType`) dengan nilai default `'mobil'`.
- **Req-2.3**: Batas waktu pemakaian tiket (countdown timer) selama 10 menit (600 detik).

### C. QR Code
- **Req-3.1**: Menampilkan visualisasi QR Code statis untuk tiket yang berhasil digenerate.
- **Req-3.2**: Isi QR Code wajib berupa string kode tiket murni (*plain string* ID), bukan URL atau serialized JSON.
- **Req-3.3**: Fitur penyalinan (*copy*) kode tiket secara instan ke clipboard.

### D. Real-Time Listener
- **Req-4.1**: Deteksi real-time perubahan status tiket dari Firestore database.
- **Req-4.2**: Pemicu visual "Gerbang Terbuka" (gate open animation) saat mendeteksi status tiket berubah menjadi `'claimed'`.
- **Req-4.3**: Penjadwalan otomatis reset generator ke keadaan semula (idle) setelah 3 detik status claimed terdeteksi.

### E. Dashboard
- **Req-5.1**: Ringkasan statistik jumlah tiket yang dibuat hari ini (*Created Today*).
- **Req-5.2**: Ringkasan statistik jumlah tiket aktif yang belum di-scan (*Active Tickets*).
- **Req-5.3**: Ringkasan statistik jumlah tiket sukses / dipindai (*Success/Claimed Tickets*).
- **Req-5.4**: Daftar log 5 aktivitas tiket terbaru di area aktif.

### F. Ticket Management
- **Req-6.1**: Menampilkan daftar tabel tiket aktif yang sedang menunggu pemindaian.
- **Req-6.2**: Menyediakan tombol aksi cepat untuk menyalin kode tiket.
- **Req-6.3**: Menyediakan fitur pembatalan tiket aktif oleh petugas.

### G. Area Management
- **Req-7.1**: Dropdown selector di header untuk memilih area gerbang aktif.
- **Req-7.2**: Penyimpanan cache area terpilih di localStorage agar tidak hilang saat reload halaman.

### H. Monitoring
- **Req-8.1**: Penanganan error visual jika koneksi database Firestore gagal atau terputus.
- **Req-8.2**: Status loading indicator yang informatif saat memproses operasi API atau pemuatan database.

---

## 2. Matriks Keterlacakan Persyaratan (Requirement Traceability Matrix)

| Requirement | Status | File Utama | Endpoint / API | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Req-1.1** (Login) | Implemented | [Login.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Login.jsx#L13-L47) | `POST /auth/login` | Validasi kredensial form email & password |
| **Req-1.2** (Session JWT) | Implemented | [axios.js](file:///C:/programming/qr/webGenerateQrcode/src/config/axios.js#L7-L18) | Request Interceptor | Token JWT diinject otomatis pada header `Authorization` |
| **Req-1.3** (Logout) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L134-L140) | `POST /auth/logout` | Menghapus token dan data user di localStorage |
| **Req-2.1** (Generate Ticket) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L142-L158) | `POST /gate/generateTicket` | Mengirim payload areaId dan tipe kendaraan |
| **Req-2.2** (Vehicle Default) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L36) | - | Di-hardcode default ke `'mobil'` |
| **Req-2.3** (Countdown Timer) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L90-L98) | - | Sisa waktu 10 menit (600 detik) dengan interval 1 detik |
| **Req-3.1** (QR Render) | Implemented | [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L126-L132) | - | QRCodeSVG merender barcode visual |
| **Req-3.2** (Plain String QR) | Implemented | [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L127) | - | Menggunakan `value={ticketData.qrCode \|\| ticketData.ticketId}` |
| **Req-3.3** (Copy Ticket ID) | Implemented | [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L172-L183) | - | Menggunakan `navigator.clipboard.writeText` |
| **Req-4.1** (Status Listener) | Implemented | [useTicketListener.js](file:///C:/programming/qr/webGenerateQrcode/src/hooks/useTicketListener.js#L23-L36) | Firestore Client SDK | Melakukan `onSnapshot` ke dokumen `tickets/{ticketId}` |
| **Req-4.2** (Gate Open Visual) | Implemented | [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L273-L295) | - | Layout animasi sukses gerbang terbuka |
| **Req-4.3** (Auto Reset) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L82-L88) | - | Menunggu 3 detik lalu me-reset status state ke `'idle'` |
| **Req-5.1** (Today Stats) | Implemented | [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx#L38-L43) | - | Dihitung dari `ticketsList` berdasarkan tanggal hari ini |
| **Req-5.2** (Active Stats) | Implemented | [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx#L56-L61) | - | Dihitung dari tiket dengan status `active` / `pending` |
| **Req-5.3** (Success Stats) | Implemented | [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx#L75-L80) | - | Dihitung dari tiket dengan status `claimed` |
| **Req-5.4** (Recent Log) | Implemented | [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx#L105-L137) | - | Menampilkan list history 5 tiket terbaru |
| **Req-6.1** (Active List Table)| Implemented | [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx#L62-L129) | - | Tabel list tiket `pending` dan `active` |
| **Req-6.2** (Copy Action Row) | Implemented | [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx#L90-L105) | - | Tombol salin clipboard pada row tabel |
| **Req-6.3** (Cancel Ticket API)| **Partially** | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L160-L170) | Firestore Client SDK | Memintas backend REST API dengan menulis langsung ke Firestore |
| **Req-7.1** (Header Dropdown) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L331-L340) | `GET /areas` | Dropdown filter area di pojok kiri atas header layout |
| **Req-7.2** (Area Cache) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L41) | - | Menyimpan area terpilih ke localStorage `'selectedAreaId'` |
| **Req-8.1** (Firestore Error) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L413-L430) | - | Banner warning ditampilkan jika `firestoreError` non-null |
| **Req-8.2** (Loading State) | Implemented | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L433-L445) | - | Visual spinner dimuat pada inisialisasi area dan loading tiket |

---

## 3. Audit Kelengkapan Fitur (Feature Completeness Audit)

### A. Generate Ticket Verification
1. **Generate Ticket**: Berhasil diverifikasi. Fungsionalitas pembuatan tiket berjalan sukses melalui pemanggilan fungsi `handleGenerateTicket` di [Dashboard.jsx:L142-158](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L142-L158) yang memicu endpoint `/gate/generateTicket`.
2. **QR Render**: Berhasil diverifikasi. Pustaka `qrcode.react` merender komponen `<QRCodeSVG>` dengan benar di [TicketGenerator.jsx:L126-132](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L126-L132) berdasarkan kode string tiket murni.
3. **Copy Ticket**: Berhasil diverifikasi. Salin kode tiket ke clipboard berjalan lancar menggunakan `navigator.clipboard.writeText` di [TicketGenerator.jsx:L172-183](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx#L172-L183) dan [Dashboard.jsx:L184-191](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L184-L191).
4. **Countdown Timer**: Berhasil diverifikasi. Hitung mundur sisa waktu 10 menit (600 detik) dikontrol oleh `useEffect` di [Dashboard.jsx:L90-98](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L90-L98) dan mereset status generator jika waktu habis.

### B. Realtime Verification
1. **Status Transition**: Transisi status tiket didukung penuh:
   - `pending` / `active` ➔ Render status badge biru *"Aktif"* di [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx#L9-L13).
   - `claimed` ➔ Mengaktifkan transisi gerbang terbuka dan render badge hijau *"Sukses"* di [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx#L14-L18).
   - `cancelled` ➔ Dibatalkan oleh petugas (badge merah *"Dibatalkan"* di [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx#L19-L23)).
   - `expired` ➔ Kedaluwarsa karena countdown habis (badge oranye *"Kedaluwarsa"* di [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx#L24-L28)).
2. **Listener**: Hook `useTicketListener` di [useTicketListener.js](file:///C:/programming/qr/webGenerateQrcode/src/hooks/useTicketListener.js) memantau status dokumen tiket real-time via Firestore SDK `onSnapshot`.
3. **Gate Open**: Transisi visual "Gerbang Terbuka" dipicu saat `firestoreStatus === 'claimed'` di [Dashboard.jsx:L83-88](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L83-L88). Visual sukses ditayangkan selama 3 detik sebelum otomatis kembali ke mode idle.
4. **Realtime Dashboard**: Daftar tiket dan ringkasan statistik otomatis terupdate berkat listener global collection query `onSnapshot` di [Dashboard.jsx:L108-129](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L108-L129).

### C. Dashboard Completeness
1. **Statistics**: Counter dinamis pada widget atas (Hari Ini, Aktif, Sukses) terhitung akurat dari total array `ticketsList` di memori klien.
2. **Active Ticket List**: List tabel memfilter hanya tiket dengan status `active` atau `pending` di [ActiveTicketsList.jsx:L17](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx#L17).
3. **Status Badge**: Badge warna konsisten terintegrasi untuk visualisasi siklus hidup status tiket di [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx).
4. **Area Filtering**: Berjalan sukses. Inisiasi `onSnapshot` Firestore menyertakan klausa `where('areaId', '==', selectedAreaId)` di [Dashboard.jsx:L106](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L106) untuk membatasi tiket hanya dari area yang aktif dipilih.

### D. Ticket Management Completeness
1. **View Ticket**: Kode tiket murni dapat dilihat langsung secara jelas pada baris tabel di list aktif.
2. **Cancel Ticket**: Fungsionalitas pembatalan tiket berjalan lancar melalui trigger klik pada ikon sampah, memicu dialog konfirmasi, dan memanggil Firestore client SDK `updateDoc` di [Dashboard.jsx:L160-170](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L160-L170).
3. **Realtime Update**: Tiket yang dibatalkan langsung menghilang dari daftar tabel aktif berkat pembaruan state real-time dari Firestore snapshot.

---

## 4. Cakupan Integrasi API (Endpoint Coverage Audit)

### A. Endpoint yang Digunakan
1.  `POST /auth/login` ➔ Digunakan di [Login.jsx:L18](file:///C:/programming/qr/webGenerateQrcode/src/pages/Login.jsx#L18) untuk memvalidasi kredensial login.
2.  `POST /auth/logout` ➔ Digunakan di [Dashboard.jsx:L135](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L135) saat sesi kerja diakhiri.
3.  `GET /areas` ➔ Digunakan di [Login.jsx:L24](file:///C:/programming/qr/webGenerateQrcode/src/pages/Login.jsx#L24) dan [Dashboard.jsx:L66](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L66) untuk mengambil seluruh daftar area parkir.
4.  `POST /gate/generateTicket` ➔ Digunakan di [Dashboard.jsx:L146](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L146) untuk membuat tiket baru.

### B. Endpoint Tersedia di Backend tetapi Tidak Digunakan (Unused APIs)
- `POST /auth/register` ➔ Tidak digunakan (Hanya relevan di aplikasi mobile pengunjung).
- `GET /users/profile` ➔ Tidak digunakan (Data profil user dibaca langsung dari `localStorage` yang disimpan pasca-login).
- `GET /users/vehicles` ➔ Tidak digunakan (Data kendaraan tidak relevan untuk modul generator pintu gerbang masuk kiosk).
- `POST /reservations` ➔ Tidak digunakan (Reservasi dikelola oleh aplikasi Web User pengunjung).
- `POST /access/verify` ➔ Tidak digunakan (Verifikasi tiket dikirimkan dari mobile scanner / pemindai tiket di gerbang oleh pengunjung).

### C. Kesenjangan Integrasi API (Missing API Integration Gaps)
- **`POST /access/cancelTicket`** (atau sejenisnya): Generator memiliki fitur pembatalan tiket, namun tidak memanggil REST API backend melainkan melakukan penulisan langsung ke database Firestore via SDK client `updateDoc`. Ini melewati validasi hak akses middleware API.

---

## 5. Audit Kelengkapan Antarmuka Pengguna (UI Completeness Audit)

| Elemen UI | Status | Lokasi File | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `Implemented` | [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx) | Tampilan grid ringkasan counter statistik dan log riwayat aktivitas. |
| **Generator** | `Implemented` | [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx) | Menangani view form generator (`idle`), loading spinner (`loading`), QR code SVG visual (`generated`), dan visual sukses (`claimed`). |
| **Area Selector**| `Implemented` | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L331) | Dropdown pilihan area di pojok kiri atas header layout. |
| **Ticket List** | `Implemented` | [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx) | Tabel data list tiket aktif lengkap dengan badge status dan aksi. |
| **Error State** | `Implemented` | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L413) | Alert dialog API Axios dan banner peringatan Firestore error. |
| **Loading State**| `Implemented` | [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L433) | Spinner overlay pada transisi pemuatan data area dan generate tiket. |
| **Empty State** | `Implemented` | [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx#L55) | Teks dan ilustrasi informatif jika tidak ada tiket aktif di area terpilih. |

---

## 6. Verifikasi Alur Bisnis (Business Flow Verification)

Alur operasional utama Web QR Generator berjalan sukses tanpa kendala deadlock status:
1. **Login Sesi**: Petugas masuk menggunakan akun admin gerbang melalui halaman `/login`.
2. **Pemuatan Area**: Dashboard mengambil area dari API atau local storage, lalu memuat data area yang dipilih.
3. **Generate Tiket**: Petugas mengklik tombol "Generate Tiket Mobil", mengirim request ke `/gate/generateTicket`.
4. **Tayangkan QR**: Tiket baru berhasil dibuat dengan status `pending` di Firestore. Generator merender QR Code SVG berisi plain string tiket ID.
5. **Scan Pengunjung**: Pengunjung memindai QR gerbang. REST API `/access/verify` dipanggil oleh client pengunjung.
6. **Transisi Status**: API Backend memverifikasi tiket dan mengubah status dokumen tiket di Firestore menjadi `claimed`.
7. **Deteksi Gerbang Terbuka**: Listener generator mendeteksi status `claimed`, UI beralih menayangkan animasi "Gerbang Terbuka" secara visual.
8. **Auto Reset**: Setelah 3 detik, layar generator kembali ke mode `idle` awal secara otomatis.
9. **Pembatalan**: Tiket aktif yang tidak dipindai dapat dibatalkan secara manual oleh petugas, mengubah status dokumen menjadi `cancelled`.

---

## 7. Temuan Utang Teknis (Technical Debt Findings)

1. **Hardcoded `vehicleType`**: 
   Variabel `vehicleType` di-hardcode ke `'mobil'` di [Dashboard.jsx:L36](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx#L36). Tombol pada form bertuliskan statis *"Generate Tiket Mobil"*. Fungsionalitas pembuatan tiket untuk tipe kendaraan lain (misalnya `'motor'`) tidak didukung oleh antarmuka UI.
2. **Google Font `@import` Warning**:
   Baris `@import` pada [index.css:L5](file:///C:/programming/qr/webGenerateQrcode/src/index.css#L5) ditulis setelah anotasi `@tailwind` base/components/utilities. Kompilator Vite mengeluarkan warning saat build karena aturan CSS modern mewajibkan `@import` berada di baris paling atas stylesheet.
3. **Dead Code**:
   State modifier `setVehicleType` dideklarasikan di `Dashboard.jsx` tetapi tidak pernah dipanggil/digunakan sama sekali di dalam kode program.
4. **Bypass REST API**:
   Proses pembatalan tiket (`handleCancelTicket`) memintas server API dan melakukan penulisan langsung ke database Firestore via SDK client `updateDoc`. Ini melanggar prinsip desentralisasi keamanan backend.

---

## 8. Kesenjangan Fungsional (Known Gaps)

1. **Ketiadaan Selektor Tipe Kendaraan**:
   Tidak ada komponen selektor visual (tabs atau radio button) untuk memilih tipe kendaraan (Mobil vs Motor) di modul generator.
2. **Ketiadaan Proteksi Role check pada Route**:
   Komponen `<ProtectedRoute>` di [App.jsx](file:///C:/programming/qr/webGenerateQrcode/src/App.jsx) hanya memeriksa eksistensi token, tetapi tidak memverifikasi apakah role pengguna terdaftar sebagai `'admin'`. Pengguna biasa (`role: 'user'`) dapat mengakses halaman dashboard jika mencoba membuka URL langsung.
3. **localStorage JSON Parse Crash**:
   Fungsi pembacaan `localStorage.getItem('user')` dan `localStorage.getItem('adminAreas')` di [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) dipanggil langsung ke dalam `JSON.parse` tanpa proteksi blok `try/catch`. Jika isi cache penyimpanan browser korup atau terformat tidak valid, aplikasi akan mengalami crash total (blank screen).
4. **JWT Expiration / Malformed Token Handling**:
   Jika token JWT kedaluwarsa, API backend menolak akses ke endpoint `/gate/generateTicket` dengan error HTTP 403. Namun, aplikasi generator tidak menangani penolakan ini untuk memicu logout otomatis, melainkan membiarkan petugas terjebak di halaman dashboard yang tidak berfungsi.

---

## 9. Rekomendasi Pembenahan (Recommended Improvements)

1. **Tambahkan Elemen UI Selektor Kendaraan**:
   Perbarui form generator di [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx) dengan menambahkan tabs/button group selektor tipe kendaraan agar petugas dapat membuat tiket untuk motor (`vehicleType: 'motor'`).
2. **Proteksi Role pada ProtectedRoute**:
   Modifikasi `<ProtectedRoute>` agar membaca role user dari objek penyimpanan dan menolak akses (redirect ke `/login` atau halaman error) jika role bukan `'admin'`.
3. **Perbaiki Penanganan Memori Lokal (localStorage)**:
   Bungkus seluruh pemanggilan `JSON.parse(localStorage.getItem(...))` dalam blok `try/catch` dan berikan nilai fallback default (seperti objek kosong atau `null`) untuk menghentikan risiko crash layar putih.
4. **Axios Response Interceptor untuk Auto-Logout**:
   Tambahkan response interceptor global di [axios.js](file:///C:/programming/qr/webGenerateQrcode/src/config/axios.js) agar mendeteksi response status `401 Unauthorized` atau `403 Forbidden`, lalu secara otomatis membersihkan cache lokal dan mengalihkan petugas ke halaman Login.
5. **Migrasi Aksi Pembatalan ke API**:
   Implementasikan endpoint REST API `/access/cancelTicket` di backend dan panggil endpoint tersebut di generator untuk menggantikan fungsi `updateDoc` Firestore demi keamanan.

---

## 10. Checklist Validasi (Validation Checklist)

- [x] Semua requirement agents.md diinventarisasi
- [x] Traceability matrix dibuat
- [x] Semua fitur diverifikasi
- [x] Endpoint coverage diverifikasi
- [x] UI completeness diverifikasi
- [x] Business flow diverifikasi
- [x] Technical debt diidentifikasi
- [x] Build sukses
