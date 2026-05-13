# Dokumentasi Revisi QR Code Generator

Dokumentasi ini ditujukan untuk tim yang mengelola website generator QR Code agar menghasilkan output yang sesuai dengan kebutuhan aplikasi Web User saat ini.

## Latar Belakang
Berdasarkan penyesuaian terbaru pada alur booking Web User:
1. Backend tidak lagi menggunakan atau menyediakan `ticketId`.
2. Validasi booking sekarang menggunakan `guestSessionId` yang diambil langsung dari hasil scan QR Code.
3. Oleh karena itu, isi dari QR Code harus menyediakan nilai `guestSessionId` tersebut.

---

## Format Konten QR Code yang Direkomendasikan

Kami menyarankan 2 opsi format konten di dalam QR Code. Tim Backend bisa memilih salah satu yang paling mudah diimplementasikan.

### Opsi 1: Format JSON (Sangat Direkomendasikan)
QR Code berisi string JSON terkompresi yang memiliki field `guestSessionId`.

**Contoh Isi QR Code:**
```json
{
  "guestSessionId": "GS-20260513-XYZ99"
}
```
*Kelebihan: Fleksibel jika di masa depan perlu menambahkan data lain (seperti timestamp atau kode area).*

### Opsi 2: Format Plain Text (Sederhana)
QR Code hanya berisi string ID saja tanpa format JSON. Aplikasi Web User akan langsung menganggap string tersebut sebagai `guestSessionId`.

**Contoh Isi QR Code:**
```text
GS-20260513-XYZ99
```

---

## Dampak pada Aplikasi Web User
Aplikasi Web User saat ini sudah dikonfigurasi untuk:
1. Membaca QR Code (baik format JSON field `guestSessionId` maupun plain text).
2. Menyimpan nilai tersebut sebagai `guestSessionId`.
3. Mengirimkan nilai tersebut ke endpoint `/reservations` dengan payload:
   ```json
   {
     "slotId": "...",
     "guestSessionId": "GS-20260513-XYZ99",
     "name": "...",
     "plateNumber": "..."
   }
   ```

Mohon dipastikan generator QR Code menghasilkan salah satu dari format di atas agar proses booking berjalan lancar.
