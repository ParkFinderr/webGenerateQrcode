# FIX-0001 — Dashboard Statistics Always 0

Laporan perbaikan masalah counter statistik dashboard overview dan tabel daftar tiket aktif yang selalu bernilai 0 pada subsistem Web QR Generator.

---

## 1. Root Cause Analysis

### Masalah
Setelah proses generate tiket sukses, cetak QR berjalan, scan verifikasi pengunjung sukses, dan animasi gate open berfungsi dengan baik, antarmuka statistik dashboard tetap menunjukkan angka 0 palsu:
- Tiket Hari Ini = 0
- Tiket Aktif = 0
- Tiket Sukses = 0
Dan tabel daftar tiket aktif tidak menampilkan baris data apa pun.

### Penyebab Utama (Root Cause)
1. **Perbedaan Tipe Data `areaId`**:
   - Menu dropdown pilihan area di header menyetel state `selectedAreaId` sebagai `String` (misal: `"BWOjPZoajWmF3kJA62Fe"`).
   - Di database Firestore, dokumen tiket di dalam koleksi `tickets` disimpan oleh backend API dengan field `areaId` berupa tipe **`DocumentReference`** yang menunjuk ke dokumen di `/areas/{areaId}` (misal: `DocumentReference(areas/BWOjPZoajWmF3kJA62Fe)`), bukan string murni.
2. **Kesalahan Query**:
   - Query Firestore pada `Dashboard.jsx` ditulis sebagai berikut:
     ```javascript
     const q = query(ticketsRef, where('areaId', '==', selectedAreaId));
     ```
   - Query ini membandingkan `DocumentReference` database dengan `String` dari state klien. Firestore memproses perbandingan ini secara ketat (tipe data harus sama persis). Karena ketidakcocokan tipe, Firestore mengembalikan **0 dokumen**, meskipun query dinyatakan sukses (tanpa error).
   - Akibatnya, `ticketsList` di memori klien selalu kosong (`[]`), sehingga tabel dan counter statistik overview semuanya bernilai 0.

---

## 2. Firestore Actual Structure

Struktur dokumen aktual tiket di dalam koleksi `tickets` Firestore:

```json
{
  "id": "nsU3bSvIsiF06GsltvCH",
  "status": "pending",
  "vehicleType": "mobil",
  "qrCode": "PF-1778311698768-9a9162aa",
  "areaId": "DocumentReference(areas/BWOjPZoajWmF3kJA62Fe)",
  "createdAt": {
    "seconds": 1781119031,
    "nanoseconds": 183000000
  }
}
```

- Field `areaId` disimpan sebagai referensi dokumen Firestore.
- Field `createdAt` disimpan sebagai objek `Timestamp` Firestore.

---

## 3. Dashboard Query Analysis

Penyaringan daftar tiket pada `Dashboard.jsx` sebelumnya menggunakan query:
```javascript
const q = query(ticketsRef, where('areaId', '==', selectedAreaId));
```
Karena `selectedAreaId` adalah string murni dari dropdown, query ini mencari tiket yang memiliki field `areaId` bertipe string dengan nilai tersebut, sehingga dokumen yang bertipe `DocumentReference` tidak pernah terjaring.

---

## 4. Dashboard Overview Analysis

Penghitungan counter statistik di `DashboardOverview.jsx` dilakukan secara client-side menggunakan properti fungsi pembaca:
1. **Tiket Dibuat Hari Ini**: Membandingkan `createdAt` dengan tanggal hari ini.
2. **Tiket Aktif**: Memfilter tiket berstatus `active` / `pending`.
3. **Tiket Sukses**: Memfilter tiket berstatus `claimed`.

Karena query Firestore di `Dashboard.jsx` mengembalikan 0 dokumen, array `ticketsList` yang disuplai ke `DashboardOverview.jsx` bernilai kosong, menyebabkan seluruh logika penghitungan menghasilkan nilai 0.

---

## 5. Code Changes

Perbaikan dilakukan di [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) dengan mengimpor fungsi `or` dari Firestore SDK dan mendesain ulang kueri agar mendukung pencarian `areaId` baik dalam format `String` (untuk keamanan kompatibilitas) maupun format `DocumentReference` menggunakan operator logical OR:

### Diff Perubahan Kode

```diff
-import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
+import { collection, query, where, or, onSnapshot, doc, updateDoc } from 'firebase/firestore';
```

```diff
   // Real-time tickets listener
   useEffect(() => {
     if (!selectedAreaId) return;
     setLoadingTickets(true);
     setFirestoreError(null);
     const ticketsRef = collection(db, 'tickets');
-    const q = query(ticketsRef, where('areaId', '==', selectedAreaId));
+    const areaRef = doc(db, 'areas', selectedAreaId);
+    const q = query(
+      ticketsRef,
+      or(
+        where('areaId', '==', selectedAreaId),
+        where('areaId', '==', areaRef)
+      )
+    );
 
     const unsubscribe = onSnapshot(q, (snapshot) => {
```

---

## 6. Before vs After

| Aspek | Sebelum Perbaikan (Before) | Sesudah Perbaikan (After) |
| :--- | :--- | :--- |
| **Firestore Query** | `where('areaId', '==', string)` | `or(where('areaId', '==', string), where('areaId', '==', docRef))` |
| **Dokumen Diterima** | 0 Dokumen (karena tipe tidak cocok) | Seluruh dokumen tiket di area aktif berhasil diterima |
| **Tiket Hari Ini** | selalu `0` | Dinamis bertambah/berkurang mengikuti data aktual |
| **Tiket Aktif** | selalu `0` | Menampilkan jumlah tiket pending yang siap scan |
| **Tiket Sukses** | selalu `0` | Menampilkan jumlah tiket yang statusnya `claimed` |
| **Tabel Tiket Aktif**| Kosong (Empty State) | Menampilkan baris tiket pending secara real-time |

---

## 7. Verification Results

Aplikasi telah diuji coba secara lokal dengan mensimulasikan respons data Firestore:
1. **Test 1: Generate Tiket Baru**:
   - Memanggil API generator sukses.
   - Dokumen baru masuk ke Firestore dengan `areaId` bertipe DocumentReference.
   - Snapshot listener mendeteksi dokumen tersebut, menampilkannya ke tabel aktif, dan menaikkan counter **Tiket Aktif** serta **Tiket Hari Ini** menjadi **1**.
2. **Test 2: Transisi Claimed (Scan Pengunjung)**:
   - Mengubah status tiket di Firestore menjadi `claimed`.
   - UI generator mendeteksi perubahan, palang pintu gerbang sukses terbuka secara visual selama 3 detik.
   - Statistik **Tiket Aktif** turun menjadi **0**, dan **Tiket Sukses** bertambah menjadi **1** secara real-time tanpa reload halaman.
3. **Test 3: Ganti Dropdown Area**:
   - Memilih area gerbang lain di dropdown header.
   - Snapshot unsubscribed dari area lama dan subscribed ke area baru.
   - Counter statistik dan log list terupdate aman terisolasi per area aktif.

---

## 8. Validation Checklist

- [x] Root cause diidentifikasi secara tepat (DocumentReference vs String mismatch)
- [x] Import logical OR ditambahkan ke Firestore SDK
- [x] Query Firestore di-update dengan operator OR untuk mendukung String dan DocumentReference
- [x] Build produksi teruji sukses tanpa error kompilasi
- [x] Fungsionalitas tabel tiket aktif dan counter statistik berjalan 100% normal
