# Pemetaan Halaman & Screenshot (Skripsi BAB 4 Mapping)

Dokumen ini memetakan relasi antara halaman web, kebutuhan tangkapan layar (screenshot), dan susunan sub-bab skripsi pada **BAB 4 (Implementasi dan Pengujian)**.

---

## 1. Pemetaan Halaman Login

### Kebutuhan Screenshot
- **Tangkapan Layar 4.1: Antarmuka Halaman Login (Normal State)**  
  *Keterangan*: Tampilan awal form login admin pintu gerbang masuk kiosk sebelum kredensial diinput.
- **Tangkapan Layar 4.2: Penanganan Peringatan Kesalahan Login (Error State)**  
  *Keterangan*: Banner peringatan kesalahan merah saat petugas menginput email atau kata sandi salah.
- **Tangkapan Layar 4.3: Status Proses Masuk (Loading State)**  
  *Keterangan*: Tombol submit login berubah menjadi pemuatan spinner dinamis saat autentikasi berlangsung.

### Relasi Sub-Bab Skripsi (BAB 4)
- **Sub-Bab 4.1.1: Implementasi Modul Autentikasi Petugas**  
  Membahas implementasi form login, validasi email dan sandi di sisi klien, penyimpanan data sesi JWT dan informasi user ke dalam media penyimpanan browser local storage, serta alur otentikasi REST API `/auth/login`.

---

## 2. Pemetaan Halaman Dashboard Generator

### Kebutuhan Screenshot
- **Tangkapan Layar 4.4: Halaman Dashboard Utama (Overview State)**  
  *Keterangan*: Tampilan ringkasan statistik (Hari Ini, Aktif, Sukses) dan log history 5 tiket terbaru.
- **Tangkapan Layar 4.5: Dropdown Wilayah Gerbang Terbuka (Area Selector)**  
  *Keterangan*: Komponen header dropdown untuk menyaring data berdasarkan wilayah pintu gerbang parkir aktif.
- **Tangkapan Layar 4.6: Antarmuka Pembuat Tiket Masuk (Generator Idle State)**  
  *Keterangan*: Form awal penampung inisiasi generate tiket masuk baru.
- **Tangkapan Layar 4.7: Pemuatan Tiket Masuk Baru (Generator Loading State)**  
  *Keterangan*: Tampilan spinner pemuatan di dalam generator saat memanggil REST API `/gate/generateTicket`.
- **Tangkapan Layar 4.8: Penayangan QR Code E-Ticket (Generator Generated State)**  
  *Keterangan*: QR Code SVG statis berisi plain string ID tiket, sisa waktu countdown timer 10 menit, dan info metadata kendaraan.
- **Tangkapan Layar 4.9: Visualisasi Palang Pintu Terbuka (Generator Claimed State)**  
  *Keterangan*: Layar sukses hijau "Gerbang Terbuka" setelah terdeteksi status claimed di Firestore.
- **Tangkapan Layar 4.10: Antarmuka Tabel Tiket Aktif (Active Ticket Table List)**  
  *Keterangan*: Tabel dinamis penyaji seluruh data e-ticket berstatus pending/active terfilter area aktif.
- **Tangkapan Layar 4.11: Konfirmasi Pembatalan Tiket Aktif (Cancel Action Dialog)**  
  *Keterangan*: Alert dialog peringatan saat petugas mengklik tombol batal untuk mengonfirmasi pembatalan tiket.

### Relasi Sub-Bab Skripsi (BAB 4)
- **Sub-Bab 4.1.2: Implementasi Dashboard Operator & Area Selector**  
  Membahas koordinasi sidebar panel navigation, dropdown penyeleksi area gerbang parkir, dan mekanisme caching area terpilih menggunakan `localStorage` agar tidak hilang saat halaman dimuat ulang.
- **Sub-Bab 4.1.3: Implementasi Generator Tiket Masuk & Render QR Code**  
  Membahas integrasi REST API `/gate/generateTicket` dengan pengiriman parameter area, pembuatan visualisasi QR Code SVG statis berisikan ID plain string dari data respons server, penyalinan string ke clipboard, serta implementasi countdown timer 10 menit.
- **Sub-Bab 4.1.4: Implementasi Real-time Listener & Pemicu Gerbang Masuk**  
  Membahas pemantauan real-time status dokumen tiket menggunakan Firestore client SDK `onSnapshot`, pendeteksian transisi status tiket menjadi `claimed` saat di-scan pengunjung, pemicuan animasi sukses gerbang terbuka selama 3 detik, dan penjadwalan reset otomatis ke keadaan semula.
- **Sub-Bab 4.1.5: Implementasi Tabel Tiket Aktif & Pembatalan Tiket**  
  Membahas penyajian data tiket pending aktif terfilter wilayah gerbang aktif, perhitungan statistik kartu counter dinamis, dan mekanisme pembatalan tiket aktif di sisi petugas.

---

## 3. Pemetaan screenshot untuk Tabel BAB 4
Daftar tangkapan layar sistem dapat dirangkum ke dalam tabel berikut untuk disertakan pada bagian awal bab implementasi:

| No | Label Tangkapan Layar | Halaman Terkait | Deskripsi Sistem yang Ditunjukkan |
| :--- | :--- | :--- | :--- |
| 1 | Tangkapan Layar 4.1 | Halaman Login (`Login.jsx`) | Form input autentikasi awal petugas gerbang masuk. |
| 2 | Tangkapan Layar 4.2 | Halaman Login (`Login.jsx`) | Banner visual kesalahan kredensial login ditolak server. |
| 3 | Tangkapan Layar 4.3 | Halaman Login (`Login.jsx`) | Animasi spinner loading status saat memverifikasi sandi. |
| 4 | Tangkapan Layar 4.4 | Dashboard Overview (`Dashboard.jsx`) | Kartu ringkasan counter statistik harian & riwayat log. |
| 5 | Tangkapan Layar 4.5 | Dashboard Header (`Dashboard.jsx`) | Dropdown pilihan area gerbang aktif untuk koordinasi. |
| 6 | Tangkapan Layar 4.6 | Generator Tiket (`TicketGenerator.jsx`) | Form inisiasi generator tiket masuk mobil. |
| 7 | Tangkapan Layar 4.7 | Generator Tiket (`TicketGenerator.jsx`) | Tampilan pemuatan saat mengirim payload tiket baru. |
| 8 | Tangkapan Layar 4.8 | Generator Tiket (`TicketGenerator.jsx`) | Tampilan e-tiket QR Code SVG, data, dan countdown timer. |
| 9 | Tangkapan Layar 4.9 | Generator Tiket (`TicketGenerator.jsx`) | Peringatan sukses palang pintu gerbang terbuka hijau (3s). |
| 10 | Tangkapan Layar 4.10 | Daftar Tiket Aktif (`ActiveTicketsList.jsx`) | Tabel data list tiket pending yang belum dipindai. |
| 11 | Tangkapan Layar 4.11 | Daftar Tiket Aktif (`ActiveTicketsList.jsx`) | Konfirmasi pembatalan tiket aktif di database. |
