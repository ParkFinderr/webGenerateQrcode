# FIX-0001 — Dashboard Statistics Always 0

## Context

Project: **ParkFinder — Web QR Generator**

BUG ditemukan setelah pengujian nyata:

```text
Generate Ticket → BERHASIL
QR Code → BERHASIL
Scan Ticket → BERHASIL
Claim Ticket → BERHASIL
Gate Open → BERHASIL
```

Namun Dashboard masih menunjukkan:

```text
Tiket Hari Ini = 0
Tiket Aktif = 0
Tiket Sukses = 0
```

Padahal tiket benar-benar dibuat dan sudah berhasil di-claim.

Ini berarti audit 0006 kemungkinan memberikan kesimpulan yang tidak sesuai dengan kondisi aktual.

---

## WAJIB DIBACA SEBELUM MEMULAI

1. agents.md
2. Audit 0006
3. Audit 0008
4. Audit 0011

Jangan langsung mengubah kode.

Jangan membuat asumsi.

Lakukan investigasi terlebih dahulu.

---

## Objective

Temukan ROOT CAUSE mengapa:

```text
Dashboard Overview
- Tiket Hari Ini
- Tiket Aktif
- Tiket Sukses
```

selalu bernilai 0.

Setelah root cause ditemukan:

```text
Perbaiki
Verifikasi
Buktikan
```

---

## Evidence

Contoh kondisi aktual:

```text
Generate Ticket → sukses
Ticket muncul
User scan tiket
Ticket berhasil claimed
Gate Open berjalan

Expected:
Tiket Hari Ini > 0
Tiket Aktif > 0 atau berubah sesuai status
Tiket Sukses > 0

Actual:
Semua counter tetap 0
```

---

## Investigation Step 1 — Firestore Reality Check

Cari source of truth.

Audit Firestore collection:

```text
tickets
```

Ambil contoh dokumen tiket terbaru.

Tampilkan seluruh field aktual:

```json
{
  "id": "...",
  "status": "...",
  "areaId": "...",
  "createdAt": "...",
  "...": "..."
}
```

Jangan menebak.

Gunakan data aktual.

---

## Investigation Step 2 — Dashboard Query Audit

Audit:

```text
Dashboard.jsx
```

Cari:

```javascript
query(...)
where(...)
onSnapshot(...)
```

Verifikasi:

1. Collection benar?
2. Query benar?
3. areaId benar?
4. selectedAreaId benar?
5. Snapshot benar-benar menerima data?

Tambahkan logging sementara jika perlu.

Buktikan jumlah dokumen yang diterima snapshot.

Contoh:

```javascript
console.log(
  'Dashboard Snapshot:',
  snapshot.docs.length
)
```

---

## Investigation Step 3 — Dashboard Overview Audit

Audit:

```text
DashboardOverview.jsx
```

Cari logika:

```javascript
todayCount
activeCount
successCount
```

Verifikasi:

### Tiket Hari Ini

Audit:

```javascript
createdAt
```

Bandingkan:

```text
Format Firestore aktual
vs
Format yang diasumsikan kode
```

Pastikan:

```javascript
Timestamp
Date
String ISO
```

ditangani dengan benar.

---

### Tiket Aktif

Audit:

```javascript
status
```

Bandingkan:

```text
Status aktual Firestore
vs
Status yang dicari kode
```

Contoh:

```text
pending
active
claimed
cancelled
expired
```

Cari mismatch.

---

### Tiket Sukses

Audit:

```javascript
claimed
```

Pastikan status sukses benar-benar cocok dengan data Firestore.

---

## Investigation Step 4 — Data Flow Verification

Verifikasi alur:

```text
Generate Ticket
↓
Firestore Create
↓
Dashboard Snapshot
↓
ticketsList
↓
DashboardOverview
↓
Counter
```

Tentukan titik mana yang gagal.

---

## Root Cause Report

WAJIB menjawab:

```text
Mengapa semua counter 0?
```

Dengan bukti:

1. Data Firestore aktual
2. Data snapshot aktual
3. Data yang diterima DashboardOverview
4. Perbandingan sebelum dan sesudah

---

## Fix Implementation

Setelah root cause ditemukan:

Perbaiki kode.

Jangan membuat workaround.

Perbaiki penyebab utama.

---

## Verification

Lakukan pengujian ulang:

### Test 1

Generate tiket baru.

Expected:

```text
Tiket Hari Ini bertambah
Tiket Aktif bertambah
```

---

### Test 2

Claim tiket.

Expected:

```text
Tiket Aktif berkurang
Tiket Sukses bertambah
```

---

### Test 3

Ganti area.

Expected:

```text
Counter mengikuti area aktif
```

---

## Deliverable

Buat laporan:

```text
FIX-0001-dashboard-statistics.md
```

Wajib berisi:

1. Root Cause Analysis
2. Firestore Actual Structure
3. Dashboard Query Analysis
4. Dashboard Overview Analysis
5. Code Changes
6. Before vs After
7. Verification Results
8. Validation Checklist

---

## Success Criteria

* Root cause ditemukan.
* Dashboard tidak lagi menampilkan 0 palsu.
* Tiket Hari Ini akurat.
* Tiket Aktif akurat.
* Tiket Sukses akurat.
* Data sesuai kondisi Firestore aktual.
* Verifikasi menggunakan tiket nyata, bukan data dummy.
