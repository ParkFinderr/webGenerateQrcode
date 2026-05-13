# Panduan Penyelarasan (Prompt) untuk Web Generator & Web User (UPDATE API LENGKAP)

File ini berisi instruksi/prompt yang sudah diperbarui berdasarkan dokumentasi API asli (Screenshot) untuk masing-masing project agar sistem QR Code, Verifikasi, dan Booking berjalan lancar.

## 📌 Referensi API Backend (Berdasarkan Screenshot)
Berikut adalah kontrak API lengkap yang harus dipenuhi:

1. **Verifikasi Tiket (Scan)**:
   - **Method**: `POST`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/access/verify`
   - **Payload**: `{ "qrCode": "PF-1778311698768-9a9162aa" }`
   - *Catatan: QR Code harus berisi string murni (seperti "PF-...") yang akan dikirim ke field `qrCode`.*

2. **Reservasi Booking**:
   - **Method**: `POST`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/reservations`
   - **Payload**: 
     ```json
     {
       "slotId": "3QHzrYhMBlPtpJ0xklOe",
       "ticketId": "nsU3bSvIsiF06GsltvCH",
       "name": "citra",
       "plateNumber": "B 9999 AA"
     }
     ```
   - *PENTING: Di sini backend mewajibkan field `ticketId`.*

3. **Cek Status Tiket**:
   - **Method**: `GET`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/access/activeTicket`
   - **Params**: `guestSessionId` (Contoh: `guest-89eb4a5d-...`)

4. **Cancel Tiket Guest**:
   - **Method**: `POST`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/access/cancelTicket`
   - **Payload**: `{ "ticketId": "...", "guestSessionId": "..." }`

---

## 1. Prompt untuk Project: **Web Generator (Aplikasi Ini)**
*Salin prompt ini jika Anda ingin memastikan generator mengeluarkan string yang benar.*

```markdown
Tolong pastikan QR Code yang dihasilkan oleh website generator ini berisi string ID murni (seperti "PF-1778311698768-9a9162aa"), bukan URL dan bukan JSON.

Di file `Dashboard.jsx`, pastikan komponen `QRCodeSVG` menggunakan nilai string ID tersebut:
`value={ticketData.qrCode || ticketData.ticketId}`

Pastikan tidak ada pembungkusan JSON.stringify lagi karena backend API `/access/verify` membutuhkan string ID murni di dalam field `qrCode`.
```

---

## 2. Prompt untuk Project: **Web User (Aplikasi Scan & Booking)**
*Salin prompt ini dan gunakan di project Web User untuk memperbaiki alur scan, verifikasi, dan booking.*

```markdown
Tolong sesuaikan fungsi Scan, Verifikasi, dan Booking di aplikasi Web User ini agar sesuai dengan dokumentasi API terbaru:

1. **Saat Men-scan QR Code**:
   - Ambil string murni hasil scan (contoh: "PF-1778311698768-9a9162aa").

2. **Panggil API Verifikasi**:
   - **Method**: `POST`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/access/verify`
   - **Payload**: 
     ```json
     {
       "qrCode": "HASIL_SCAN_MURNI"
     }
     ```
   - *PENTING: Gunakan key `qrCode`.*

3. **Saat Melakukan Reservasi (Booking)**:
   - Ambil `ticketId` yang valid (didapat dari respons API verifikasi atau gunakan hasil scan jika itu adalah ticketId-nya).
   - **Method**: `POST`
   - **URL**: `https://backend-api-services-291631508657.asia-southeast2.run.app/reservations`
   - **Payload**:
     ```json
     {
       "slotId": "ID_SLOT_PILIHAN",
       "ticketId": "NILAI_TICKET_ID", // Wajib disertakan
       "name": "NAMA_USER",
       "plateNumber": "PLAT_NOMOR"
     }
     ```

4. **Cek Status Tiket**:
   - Gunakan `guestSessionId` yang didapat dari respons API verifikasi untuk mengecek status di:
     `GET https://backend-api-services-291631508657.asia-southeast2.run.app/access/activeTicket?guestSessionId=...`
```
