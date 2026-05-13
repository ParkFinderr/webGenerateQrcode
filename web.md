# Dokumentasi Revisi Frontend Web Scan (Web User)

Dokumentasi ini berisi panduan untuk merevisi aplikasi frontend Web Scan (Web User) agar dapat melakukan proses booking dengan sukses, mengatasi kendala "tiket id wajib disertakan" dari backend.

## Masalah
Aplikasi Web User saat ini (sesuai rencana sebelumnya di `qr.md`) kemungkinan mengirimkan `guestSessionId` ke endpoint `/reservations`. Namun, Backend saat ini masih mewajibkan adanya field `ticketId`.

## Solusi
Kita perlu menyesuaikan payload yang dikirim oleh Web User saat melakukan reservasi agar menyertakan `ticketId` (atau menyertakan keduanya untuk kompatibilitas).

### Opsi 1: Mengirimkan Kedua Field (Rekomendasi untuk Transisi)
Ubah fungsi yang menangani submit booking di Web User agar mengirimkan nilai hasil scan QR ke field `ticketId` dan `guestSessionId`.

**Contoh Payload Baru:**
```json
{
  "slotId": "SLOT-123",
  "guestSessionId": "HASIL_SCAN_QR",
  "ticketId": "HASIL_SCAN_QR", 
  "name": "Nama User",
  "plateNumber": "B 1234 XYZ"
}
```

### Opsi 2: Mengembalikan ke Field `ticketId` (Jika Backend murni masih pakai sistem lama)
Ubah payload agar hanya menggunakan `ticketId`.

**Contoh Payload:**
```json
{
  "slotId": "SLOT-123",
  "ticketId": "HASIL_SCAN_QR",
  "name": "Nama User",
  "plateNumber": "B 1234 XYZ"
}
```

## Kode yang Perlu Diubah di Frontend Web User
Cari file yang memanggil endpoint `/reservations` (kemungkinan di halaman Booking atau Scan di project Web User) dan ubah bagian pembentukan payload.

Contoh perubahan kode (Asumsi menggunakan JavaScript):
```javascript
// SEBELUMNYA
const payload = {
  slotId: selectedSlotId,
  guestSessionId: scannedQrCodeValue, // Nilai dari QR
  name: userName,
  plateNumber: plateNo
};

// SESUDAH (Opsi 1)
const payload = {
  slotId: selectedSlotId,
  guestSessionId: scannedQrCodeValue,
  ticketId: scannedQrCodeValue, // Tambahkan ini agar backend menerima ticketId
  name: userName,
  plateNumber: plateNo
};
```

Pastikan Anda melakukan perubahan ini di project **Web User**, bukan di project Generator QR ini.
