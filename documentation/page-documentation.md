# Dokumentasi Halaman (Page Documentation)

Dokumen ini merinci inventori halaman, sub-tampilan, widget, serta komponen utama yang terdapat pada aplikasi Web QR Generator ParkFinder setelah penyederhanaan fitur.

---

## 1. Inventori Halaman & Struktur Navigasi
Aplikasi ini dikembangkan dengan arsitektur Single Page Application (SPA). Setelah melewati autentikasi pada rute `/login`, pengguna disuguhkan langsung dengan modul Kiosk utama (`TicketGenerator`) di bawah koordinator layout halaman utama (`Dashboard.jsx`), tanpa adanya sidebar navigation atau tabs tambahan.

Struktur pembagian UI:
- **Halaman Utama**: 
  - `Login.jsx` (Rute: `/login`)
  - `Dashboard.jsx` (Rute: `/`)
- **Komponen Kiosk Utama**:
  - `TicketGenerator.jsx`

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

### Halaman Dashboard Kiosk Utama (Dashboard.jsx)

- **Tujuan**:
  Koordinator utama layout panel, status controller, dan data listener bagi petugas gerbang.

- **Fitur**:
  - **Dropdown Filter Area**: Dropdown selektor area gerbang aktif di bagian kiri header.
  - **Area Caching**: Menyimpan ID area yang aktif dipilih ke dalam `localStorage` ('selectedAreaId') agar tetap bertahan saat reload halaman.
  - **Dashboard Guard**: Memastikan pengguna terautentikasi sebelum memuat layout, melakukan redirect ke `/login` jika token kosong.
  - **Logout Session**: Menghapus data token JWT dan menghapus session dari sisi klien.

- **Endpoint yang Digunakan**:
  - `GET /areas` ➔ Memuat list area gerbang jika cache lokal tidak ditemukan.
  - `POST /auth/logout` ➔ Mengakhiri sesi login di server backend.

- **Komponen & Library yang Digunakan**:
  - `QrCode`, `LogOut`, `AlertCircle` (Lucide React)
  - Sub-view Kiosk: `TicketGenerator`

- **Screenshot yang Diperlukan**:
  - **Dashboard Layout Utama**: Tampilan header dashboard dan area kiosk generator utama.
  - **Dropdown Area Selector**: Visual dropdown header saat diklik untuk berpindah area kerja.

---

### Komponen Utama: Generator Tiket & Gate Controller (TicketGenerator.jsx)

- **Tujuan**:
  Form utama bagi petugas untuk membuat tiket masuk, menampilkan kode QR tiket, memantau masa berlaku tiket, serta memvisualisasikan palang gerbang terbuka.

- **Fitur**:
  - **Generate Button**: Tombol besar pembuat e-tiket masuk mobil.
  - **QR Code SVG Rendering**: Menampilkan QR Code murni yang berisi plain string tiket ID.
  - **Ticket Metadata Display**: Menampilkan informasi plat nomor, waktu dibuat, nama pengunjung, dan jenis kendaraan.
  - **Countdown Timer**: Menampilkan batas waktu pemakaian tiket (10 menit / 600 detik) yang berkurang per detik.
  - **Copy Ticket ID Code**: Fitur menyalin string ID kode tiket ke clipboard secara cepat dengan menyentuh kolom kode.
  - **Cancel Current Ticket**: Tombol membatalkan e-tiket yang sedang ditampilkan ke Firestore secara instan.
  - **Gate Open Visual**: Animasi sukses palang pintu gerbang terbuka berwarna hijau selama 3 detik setelah status berubah menjadi `claimed` pada Firestore listener.

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
