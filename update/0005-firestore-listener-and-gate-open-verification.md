# Task 0006 — Active Ticket Dashboard & Ticket Management Verification

## Context

Project: **ParkFinder — Web QR Generator**

Update sebelumnya telah memverifikasi:

* 0002 → Authentication Audit
* 0003 → Generate Ticket Contract Verification
* 0004 → QR Rendering & Verification
* 0005 → Firestore Listener & Gate Open Verification

Audit 0005 membuktikan bahwa listener Firestore, sinkronisasi status tiket, gate open, dan cleanup subscription telah berjalan dengan baik.

Tahap berikutnya adalah memverifikasi fitur operasional utama yang digunakan petugas gerbang setiap hari, yaitu:

* Active Tickets List
* Dashboard Overview
* Status Badge
* Ticket Cancellation
* Realtime Ticket Updates

Karena walaupun generate tiket berhasil, sistem tetap dianggap gagal apabila daftar tiket aktif tidak sinkron dengan kondisi aktual di backend dan Firestore.

---

## Objective

Lakukan audit menyeluruh terhadap:

1. Dashboard Overview
2. Active Tickets List
3. Status Badge
4. Ticket Cancellation
5. Realtime Synchronization
6. Data Consistency Frontend vs Firestore
7. Area Filtering
8. Counter Accuracy

Verifikasi bahwa seluruh data tiket yang tampil di dashboard sesuai dengan kondisi aktual backend dan Firestore.

---

## Verification Scope

### 1. Dashboard Overview Audit

Identifikasi seluruh kartu statistik pada dashboard.

Dokumentasikan:

* lokasi file
* sumber data
* cara perhitungan
* field yang digunakan

Verifikasi:

```text
Total Ticket
Active Ticket
Claimed Ticket
Cancelled Ticket
Expired Ticket
```

Jika ada.

Pastikan seluruh angka berasal dari data aktual.

---

### 2. Active Ticket List Audit

Temukan implementasi:

```text
ActiveTicketsList.jsx
```

Audit:

* sumber data
* query Firestore
* sorting
* filtering
* realtime update

Dokumentasikan:

```text
Collection
Query
Order By
Where Clause
```

Verifikasi apakah daftar tiket:

```text
pending
active
claimed
cancelled
expired
```

ditampilkan dengan benar.

---

### 3. Realtime Synchronization Verification

Generate tiket baru.

Verifikasi:

```text
Generate Ticket
↓
Masuk ke daftar tiket aktif
```

Scan tiket.

Verifikasi:

```text
pending
↓
claimed
↓
dashboard update otomatis
```

Cancel tiket.

Verifikasi:

```text
pending
↓
cancelled
↓
dashboard update otomatis
```

Tanpa refresh browser.

---

### 4. Status Badge Verification

Audit komponen:

```text
StatusBadge.jsx
```

Dokumentasikan mapping:

```text
pending
active
claimed
cancelled
expired
```

Verifikasi:

* warna badge
* label badge
* fallback badge

Pastikan tidak ada status backend yang tidak dikenali frontend.

---

### 5. Ticket Cancellation Verification

Audit implementasi:

```text
Cancel Ticket
```

Verifikasi:

Endpoint aktual:

```text
POST /access/cancelTicket
```

atau endpoint lain yang benar.

Dokumentasikan:

### Request

```json
{
  "ticketId": "..."
}
```

### Response

```json
{
  "success": true,
  "message": "..."
}
```

Verifikasi:

```text
Ticket Pending
↓
Cancel
↓
Status Cancelled
↓
Realtime Update
↓
Tidak bisa digunakan lagi
```

---

### 6. Cancelled Ticket Validation

Setelah tiket dibatalkan:

Verifikasi:

```text
POST /access/verify
```

menggunakan QR tiket yang sama.

Dokumentasikan response aktual backend.

Pastikan tiket benar-benar tidak dapat digunakan kembali.

---

### 7. Area Filtering Audit

Verifikasi:

```text
Area A
↓
Generate Ticket

Area B
↓
Generate Ticket
```

Pastikan:

```text
Dashboard Area A
```

hanya menampilkan tiket Area A.

Dan:

```text
Dashboard Area B
```

hanya menampilkan tiket Area B.

Cari kemungkinan:

```text
Cross Area Leakage
```

dimana tiket area lain muncul.

---

### 8. Data Consistency Audit

Bandingkan:

```text
Firestore
vs
Dashboard
vs
Generator View
```

Verifikasi field:

```text
ticketId
qrCode
status
vehicleType
areaId
createdAt
```

Pastikan tidak ada mismatch.

---

### 9. Counter Accuracy Audit

Verifikasi:

```text
Generate 1 Ticket
↓
Counter bertambah 1

Cancel Ticket
↓
Counter berubah sesuai

Claim Ticket
↓
Counter berubah sesuai
```

Pastikan seluruh statistik dashboard sinkron.

---

### 10. Stress Test

Generate minimal:

```text
10 tiket berturut-turut
```

Verifikasi:

* dashboard tetap responsif
* list tetap realtime
* tidak ada duplicate row
* tidak ada missing ticket
* tidak ada render error

---

## Deliverables

Buat laporan:

```text
0006-active-ticket-dashboard-and-ticket-management-verification.md
```

Laporan wajib berisi:

1. Executive Summary
2. Dashboard Architecture Diagram
3. Dashboard Overview Audit
4. Active Ticket List Audit
5. Realtime Synchronization Verification
6. Status Badge Verification
7. Ticket Cancellation Verification
8. Area Filtering Audit
9. Counter Accuracy Audit
10. Stress Test Result
11. Known Issues
12. Recommended Fixes
13. Validation Checklist

---

## Test Ticket

Gunakan tiket terbaru berikut jika masih valid:

```text
PF-1781119031183-db10a47d
```

Jika sudah tidak valid, generate tiket baru dan dokumentasikan tiket yang digunakan selama audit.

---

## Rules

* Jangan membuat asumsi.
* Verifikasi berdasarkan implementasi aktual.
* Sertakan nama file dan potongan kode penting.
* Jika menemukan mismatch frontend vs backend, dokumentasikan kontrak aktual.
* Jika menemukan bug, dokumentasikan root cause dan rekomendasi perbaikan.
* Jalankan build dan pastikan aplikasi tetap dapat dikompilasi.
* Fokus pada fakta implementasi, bukan dugaan.
