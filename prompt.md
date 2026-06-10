# Task 0003 — QR Rendering & Verification Audit

## Objective

Memastikan QR Code yang dihasilkan oleh Web QR Generator benar-benar valid dan dapat digunakan oleh seluruh client ParkFinder (Web User, PWA, dan Mobile App).

Lakukan verifikasi end-to-end terhadap QR yang dihasilkan.

Jangan melakukan asumsi berdasarkan kode.

Gunakan ticket real untuk pengujian.

---

## Context

Saat ini audit telah memverifikasi:

✅ Login Flow

✅ Generate Ticket Contract

✅ Area Loading

✅ Ticket Lifecycle

Namun belum ada bukti bahwa QR yang dihasilkan benar-benar dapat dipindai dan diverifikasi oleh sistem lain.

QR merupakan inti bisnis aplikasi.

Jika QR tidak valid maka seluruh flow parkir gagal.

---

## Requirements

### 1. QR Generation Audit

Audit:

```txt
src/components/TicketGenerator.jsx
```

Verifikasi:

```jsx
<QRCodeSVG
  value={ticketData.qrCode || ticketData.ticketId}
/>
```

Pastikan value yang digunakan berasal dari backend.

---

### 2. Generated QR Verification

Generate ticket baru menggunakan aplikasi.

Dokumentasikan response aktual:

```json
{
  "ticketId": "...",
  "qrCode": "...",
  "status": "pending"
}
```

Catat nilai QR yang dihasilkan.

---

### 3. QR Content Verification

Verifikasi isi QR menggunakan scanner.

Pastikan QR berisi:

```txt
PF-xxxxxxxxxxxxxxxx
```

dan bukan:

```txt
JSON
URL
String tambahan
Object serialize
```

Dokumentasikan hasil scan aktual.

---

### 4. Cross Platform Scan Test

Uji QR menggunakan:

```txt
Mobile Android
PWA
Web User
```

Verifikasi bahwa hasil scan identik.

---

### 5. Backend Verification Test

Gunakan hasil scan untuk memanggil:

```http
POST /access/verify
```

Payload:

```json
{
  "qrCode": "PF-xxxxxxxxxxxxxxxx"
}
```

Verifikasi response backend.

Dokumentasikan seluruh field yang dikembalikan.

---

### 6. Ticket Status Transition Audit

Setelah verify berhasil:

Verifikasi perubahan status:

```txt
pending
↓
claimed
```

Pastikan perubahan terjadi di backend.

---

### 7. Firestore Synchronization Check

Audit apakah perubahan status tiket:

```txt
pending
↓
claimed
```

juga muncul pada dokumen Firestore yang dipantau generator.

Dokumentasikan:

- collection
- document
- field yang berubah

---

### 8. Failure Case Audit

Uji:

```txt
QR tidak valid
QR sudah digunakan
QR expired
QR random string
```

Verifikasi response backend.

---

## Validation Checklist

- [ ] QR berhasil dihasilkan
- [ ] Isi QR tervalidasi
- [ ] QR tidak berisi JSON
- [ ] QR tidak berisi URL
- [ ] QR berhasil dipindai
- [ ] POST /access/verify berhasil
- [ ] Status berubah menjadi claimed
- [ ] Firestore ikut berubah
- [ ] Failure case terdokumentasi

---

## Deliverables

Buat laporan:

```txt
update/0004-qr-rendering-verification.md
```

Laporan wajib berisi:

- generated ticket sample
- QR content verification
- scan verification
- verify endpoint response
- status transition
- firestore synchronization
- failure cases
- known issues
- executive summary

---

## Success Criteria

- QR terbukti valid secara end-to-end
- Mobile dapat memverifikasi ticket hasil generator
- Status ticket berubah sesuai kontrak backend
- Firestore menerima update
- Tidak ada mismatch antara QR Generator dan Mobile/PWA