# Dokumentasi Review & Revisi Generator Tiket (QR Code)

Dokumentasi ini dibuat untuk mereview dan merevisi format output dari website generator QR Code agar sesuai dengan ekspektasi backend dan aplikasi Web User.

## Masalah Saat Ini
1. Ketika aplikasi Web User mengirimkan payload dengan field `ticketId` (mengambil nilai dari QR Code), backend merespon dengan pesan **"tiket tidak valid"**.
2. Sebelumnya, ketika mencoba mengirimkan `guestSessionId`, backend merespon dengan **"guestsessionid not allowed"**.

Hal ini menunjukkan bahwa:
- Backend **memang mengharapkan** field `ticketId` pada endpoint `/reservations`.
- Namun, **nilai** dari `ticketId` yang dihasilkan oleh website generator (dan discan oleh Web User) dianggap tidak valid oleh backend.

## Rekomendasi Revisi untuk Website Generator QR Code

Tim yang mengelola website generator QR Code perlu memastikan hal-hal berikut:

### 1. Format Isi QR Code
Pastikan QR Code menghasilkan string yang sesuai dengan yang diharapkan oleh endpoint `/reservations` dan `/access/verify` di backend.

**Opsi yang disarankan (diskusikan dengan tim Backend):**

*   **Plain Text (Paling Aman jika backend hanya membaca string):**
    QR Code hanya berisi string ID tiket saja tanpa format JSON.
    ```text
    TICKET-VALID-12345
    ```
*   **JSON (Jika perlu data tambahan):**
    Jika harus menggunakan JSON, gunakan key `ticketId` (bukan `guestSessionId` seperti rencana di `qr.md`).
    ```json
    {
      "ticketId": "TICKET-VALID-12345"
    }
    ```

### 2. Validitas Nilai Tiket
Pastikan nilai string tiket yang dihasilkan:
- Terdaftar di database backend (jika backend menggunakan sistem whitelist/pre-generated tickets).
- Memiliki format yang benar (misal: panjang karakter, karakter khusus, atau prefix tertentu yang diwajibkan backend).

## Langkah Selanjutnya
1. **Konfirmasi ke Tim Backend**: Tanyakan format `ticketId` yang valid itu seperti apa (apakah harus ada di DB dulu, atau bebas generate asal unik, atau ada prefix khusus).
2. **Update Generator**: Sesuaikan output QR Code di website generator berdasarkan konfirmasi dari tim backend.
