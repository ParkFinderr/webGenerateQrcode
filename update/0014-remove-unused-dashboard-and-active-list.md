# Pembaruan: Penghapusan Dashboard Overview & Daftar Tiket Aktif (Remove Unused Dashboard and Active List)

- **Indeks**: 0014
- **Tanggal/Waktu**: 2026-06-11 03:22
- **Tujuan**: Menghapus fitur Dashboard Overview (Ringkasan Statistik) dan Active Tickets List (Daftar Tiket Aktif) dari aplikasi Web QR Generator sesuai permintaan pengguna, guna memfokuskan aplikasi sepenuhnya pada modul Kiosk/Ticket Generator murni yang stabil.

## Daftar Perubahan File
- **[MODIFY]** [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) - Menyederhanakan struktur layout utama, menghapus sidebar panel navigation, menghapus tab-state, dan merender langsung komponen `TicketGenerator` di dalam konten utama.
- **[DELETE]** [ActiveTicketsList.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/ActiveTicketsList.jsx) - Menghapus file komponen daftar tiket aktif.
- **[DELETE]** [DashboardOverview.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/DashboardOverview.jsx) - Menghapus file komponen ringkasan statistik.
- **[DELETE]** [StatusBadge.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/StatusBadge.jsx) - Menghapus file komponen badge status indikator yang tidak lagi digunakan.

## Rincian Perubahan Kode
1. **Penyederhanaan `Dashboard.jsx`**:
   - Menghapus impor `DashboardOverview` dan `ActiveTicketsList`.
   - Menghapus impor `firebase/firestore` dan `db` dari `Dashboard.jsx` karena logika pembatalan tiket tunggal dikelola langsung oleh `TicketGenerator`.
   - Menghapus kueri collection snapshot listener `onSnapshot(query(ticketsRef))` dan statis state `ticketsList`.
   - Menghapus fungsi kalkulasi counter (`getTodayTicketsCount`, `getActiveTicketsCount`, `getClaimedTicketsCount`) dan render helper `renderStatusBadge`.
   - Memotong elemen antarmuka sidebar `<aside className="sidebar">` beserta style CSS terkait.
   - Menata ulang agar `TicketGenerator` dirender langsung di tengah main-content area.

2. **Dampak Kompilasi**:
   - Bundel hasil kompilasi menyusut dari `596 kB` menjadi `571 kB` karena pembersihan dependensi kode mati (dead code) dan komponen tidak terpakai.

## Langkah Verifikasi & Pengujian
- [x] Memverifikasi penghapusan impor dan berkas-berkas komponen.
- [x] Memverifikasi layout `Dashboard.jsx` merender `TicketGenerator` secara mandiri.
- [x] Menguji build produksi Vite agar terkompilasi bersih tanpa ada kesalahan parsing JSX/JS.

### Hasil Pengujian / Hasil Build
Pengujian build produksi dengan perintah `cmd /c "npm run build"` berjalan sukses dengan hasil keluaran kompilasi bersih (exit code 0):
```text
vite v8.0.16 building client environment for production...
✓ 1820 modules transformed.
rendering chunks...
dist/index.html                   0.47 kB │ gzip:   0.31 kB
dist/assets/index-Bm_QfH4o.css    9.77 kB │ gzip:   2.44 kB
dist/assets/index-BXjFOYWi.js   571.38 kB │ gzip: 181.95 kB
✓ built in 1.37s
```
