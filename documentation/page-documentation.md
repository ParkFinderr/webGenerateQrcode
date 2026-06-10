# Dokumentasi Halaman (Page Documentation)

Dokumen ini merinci inventori halaman, sub-tampilan, widget, serta komponen utama yang terdapat pada aplikasi Web QR Generator ParkFinder.

---

## 1. Inventori Halaman & Struktur Navigasi
Aplikasi ini dikembangkan dengan arsitektur Single Page Application (SPA). Seluruh visualisasi dinavigasikan melalui sidebar pada satu halaman koordinator utama (`Dashboard.jsx`), setelah pengguna berhasil melewati autentikasi pada rute `/login`.

Struktur pembagian UI:
- **Halaman Utama**: 
  - `Login.jsx` (Rute: `/login`)
  - `Dashboard.jsx` (Rute: `/`)
- **Sub-Tampilan (Tabs)**:
  - Dashboard Overview (Ringkasan statistik)
  - Ticket Generator (Form pembuat & penayang QR)
  - Active Tickets List (Daftar tiket aktif gerbang)
- **Komponen & Widget Internal**:
  - `DashboardOverview.jsx`
  - `TicketGenerator.jsx`
  - `ActiveTicketsList.jsx`
  - `StatusBadge.jsx`

---

## 2. Dokumentasi Halaman Rinci

### Halaman Login (Login.jsx)

- **Tujuan**:
  Autentikasi akun petugas pintu gerbang masuk kiosk parkir sebelum diizinkan mengakses panel kontrol.

- **Fitur**:
  - **Form Input Kredensial**: Input email dan sandi aman dengan visual focus ring glow premium.
  - **Error Handling Visual**: Menampilkan banner merah berisikan pesan error jika login ditolak oleh server backend.
  - **Loading State Indicator**: Tombol login berubah menjadi loading spinner dinamis saat proses otentikasi sedang berlangsung.
  - **Auto Pemuatan Area**: Mendapatkan daftar wilayah area parkir aktif pasca-login secara instan menggunakan token JWT baru untuk di-cache di penyimpanan browser.

- **Endpoint yang Digunakan**:
  - `POST /auth/login` ➔ Memvalidasi kredensial email & password petugas.
  - `GET /areas` ➔ Memuat data list gerbang wilayah parkir aktif menggunakan JWT token yang baru didapat.

- **Komponen & Library yang Digunakan**:
  - `ShieldCheck`, `LogIn` (Lucide React)
  - Axios client instance (`api`)

- **Screenshot yang Diperlukan**:
  - **Tampilan Halaman Login**: Tampilan form login utama dalam kondisi kosong.
  - **Error Login**: Banner peringatan error saat sandi salah (*"Kata sandi salah"* atau *"Email tidak terdaftar"*).
  - **Loading Login**: Visual tombol masuk saat berubah menjadi animasi loading spinner.

---

### Halaman Dashboard Utama (Dashboard.jsx)

- **Tujuan**:
  Koordinator utama layout panel, status controller, data listener, dan sidebar navigasi utama bagi petugas gerbang.

- **Fitur**:
  - **Dropdown Filter Area**: Dropdown selektor area gerbang aktif di bagian kiri header.
  - **Area Caching**: Menyimpan ID area yang aktif dipilih ke dalam `localStorage` ('selectedAreaId') agar tetap bertahan saat reload halaman.
  - **Dashboard Guard**: Memastikan pengguna terautentikasi sebelum memuat layout, melakukan redirect ke `/login` jika token kosong.
  - **Firestore Listener Connection**: Menghubungkan query real-time database Firestore untuk memantau koleksi tiket di area aktif.
  - **Axios Header Injector**: Menyisipkan JWT token di header Authorization untuk semua komunikasi REST API.
  - **Logout Session**: Menghapus data token JWT dan menghapus session dari sisi klien.

- **Endpoint yang Digunakan**:
  - `GET /areas` ➔ Memuat list area gerbang jika cache lokal tidak ditemukan.
  - `POST /auth/logout` ➔ Mengakhiri sesi login di server backend.
  - Firestore Client SDK `onSnapshot` ➔ Berlangganan query collection `tickets` real-time terfilter `areaId`.

- **Komponen & Library yang Digunakan**:
  - `LayoutDashboard`, `PlusCircle`, `List`, `QrCode`, `LogOut`, `AlertCircle` (Lucide React)
  - Sub-views: `DashboardOverview`, `TicketGenerator`, `ActiveTicketsList`

- **Screenshot yang Diperlukan**:
  - **Dashboard Layout Utama**: Tampilan header dashboard dan sidebar navigasi aktif.
  - **Dropdown Area Selector**: Visual dropdown header saat diklik untuk berpindah area kerja.
  - **Warning Banner Firestore Error**: Tampilan banner merah jika konfigurasi Firebase salah atau listener diblokir database.

---

### Sub-Tampilan: Ringkasan Statistik (DashboardOverview.jsx)

- **Tujuan**:
  Menampilkan ringkasan data statistik tiket harian dan log log aktivitas tiket masuk terbaru secara real-time.

- **Fitur**:
  - **Statistik Tiket Dibuat Hari Ini**: Counter dinamis yang menghitung jumlah total tiket yang dibuat pada tanggal hari ini.
  - **Statistik Tiket Aktif**: Menghitung tiket yang berstatus pending/active (belum di-scan).
  - **Statistik Tiket Sukses**: Menghitung tiket yang berstatus `claimed` (telah berhasil dipindai oleh pengunjung).
  - **Log Aktivitas Terbaru**: Menampilkan daftar 5 tiket buatan terbaru lengkap dengan plat nomor, jam pembuatan, dan status badge.

- **Endpoint yang Digunakan**:
  - None (Data dihitung secara client-side dari reactive state Firestore snapshot).

- **Komponen & Library yang Digunakan**:
  - `Calendar`, `Clock`, `CheckCircle`, `History`, `FileText`, `CarFront`, `TrendingUp` (Lucide React)
  - `StatusBadge`

- **Screenshot yang Diperlukan**:
  - **Dashboard Ringkasan Utama**: Tampilan overview 3 kartu widget statistik dan aktivitas terbaru.
  - **Log Aktivitas Kosong**: Tampilan visual khusus (empty state) jika tidak ada riwayat tiket sama sekali.

---

### Sub-Tampilan: Generator Tiket & Gate Controller (TicketGenerator.jsx)

- **Tujuan**:
  Form utama bagi petugas untuk membuat tiket masuk, menampilkan kode QR tiket, memantau masa berlaku tiket, serta memvisualisasikan palang gerbang terbuka.

- **Fitur**:
  - **Generate Button**: Tombol besar pembuat e-tiket masuk mobil.
  - **QR Code SVG Rendering**: Menampilkan QR Code murni yang berisi plain string tiket ID.
  - **Ticket Metadata Display**: Menampilkan informasi plat nomor, waktu dibuat, nama pengunjung, dan jenis kendaraan.
  - **Countdown Timer**: Menampilkan batas waktu pemakaian tiket (10 menit / 600 detik) yang berkurang per detik.
  - **Copy Ticket ID Code**: Fitur menyalin string ID kode tiket ke clipboard secara cepat dengan menyentuh kolom kode.
  - **Cancel Current Ticket**: Tombol membatalkan e-tiket yang sedang ditampilkan ke Firestore secara instan.
  - **Gate Open Visual**: Animasi sukses palang pintu gerbang terbuka berwarna hijau selama 3 detik setelah status berubah menjadi `claimed`.

- **Endpoint yang Digunakan**:
  - `POST /gate/generateTicket` ➔ Membuat tiket masuk baru di database backend.
  - Firestore Client SDK `onSnapshot` ➔ Melacak dokumen tiket aktif untuk transisi status `claimed`.
  - Firestore Client SDK `updateDoc` ➔ Pembatalan tiket terpilih langsung ke Firestore.

- **Komponen & Library yang Digunakan**:
  - `QRCodeSVG` dari pustaka `qrcode.react`
  - `CarFront`, `PlusCircle`, `Copy`, `Check`, `AlertCircle`, `CheckCircle` (Lucide React)

- **Screenshot yang Diperlukan**:
  - **Form Generator Tiket (Idle)**: Form awal sebelum tiket digenerate.
  - **Proses Loading Tiket**: Tampilan loading saat menunggu respons API `/gate/generateTicket`.
  - **QR Code E-Ticket (Generated)**: QR Code visual tiket yang berhasil dibuat beserta timer aktif.
  - **Visual Sukses Gerbang Terbuka (Claimed)**: Tampilan animasi palang gerbang terbuka sukses.

---

### Sub-Tampilan: Daftar Tiket Aktif (ActiveTicketsList.jsx)

- **Tujuan**:
  Menampilkan tabel daftar tiket aktif yang belum di-scan di area gerbang tersebut untuk dipantau atau dibatalkan oleh petugas.

- **Fitur**:
  - **Filter Otomatis Tiket Aktif**: Otomatis menyaring dan menampilkan data tiket yang hanya berstatus `pending` atau `active`.
  - **Tabel Responsif**: Menampilkan kolom kode tiket, waktu dibuat, badge status, dan tombol aksi.
  - **Aksi Cepat Salin Kode**: Menyalin kode tiket ke clipboard dari baris tabel.
  - **Aksi Hapus/Batal Tiket**: Menghapus dan membatalkan tiket aktif langsung dari baris tabel.

- **Endpoint yang Digunakan**:
  - Firestore Client SDK `updateDoc` ➔ Memperbarui status tiket menjadi `cancelled` di database Firestore.

- **Komponen & Library yang Digunakan**:
  - `StatusBadge`
  - `PlusCircle`, `QrCode`, `Copy`, `Trash2` (Lucide React)

- **Screenshot yang Diperlukan**:
  - **Daftar Tiket Aktif**: Tabel tiket aktif terfilter.
  - **Confirm Cancel Dialog**: Dialog konfirmasi peringatan pembatalan tiket saat tombol sampah diklik.
  - **Daftar Tiket Aktif Kosong**: Tampilan empty state jika seluruh tiket aktif telah habis dipindai atau dibatalkan.
