# Pembaruan: Perbaikan Penghitungan Statistik Dashboard Overview (Fix Dashboard Statistics)

- **Indeks**: 0013
- **Tanggal/Waktu**: 2026-06-11 03:15
- **Tujuan**: Memperbaiki masalah di mana counter statistik dashboard overview (Tiket Hari Ini, Tiket Aktif, Tiket Sukses) dan tabel daftar tiket aktif selalu menampilkan angka 0 palsu meskipun pembuatan tiket dan pemindaian berjalan sukses di Firestore.

## Daftar Perubahan File
- **[MODIFY]** [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) - Memperbarui import Firestore SDK untuk mengikutsertakan operator `or` dan merancang ulang kueri snapshot tiket aktif gerbang agar mendukung pencarian `areaId` baik sebagai `String` maupun `DocumentReference`.
- **[NEW]** [FIX-0001-dashboard-statistics.md](file:///C:/programming/qr/webGenerateQrcode/FIX-0001-dashboard-statistics.md) - Laporan lengkap Root Cause Analysis dan verifikasi bug statistik.

## Rincian Perubahan Kode
Berikut adalah detail perubahan kode pada [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx):

```diff
@@ -10,7 +10,7 @@
 import { useNavigate } from 'react-router-dom';
 import api from '../config/axios';
 import { useTicketListener } from '../hooks/useTicketListener';
-import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
+import { collection, query, where, or, onSnapshot, doc, updateDoc } from 'firebase/firestore';
 import { db } from '../config/firebase';
 
 // Sub-components
@@ -102,7 +102,14 @@
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

## Langkah Verifikasi & Pengujian
- [x] Memverifikasi import `or` ditambahkan ke `firebase/firestore`.
- [x] Memverifikasi query Firestore mendukung DocumentReference dengan `or(where('areaId', '==', selectedAreaId), where('areaId', '==', areaRef))`.
- [x] Menguji build produksi Vite agar terkompilasi bersih tanpa ada kesalahan parsing JSX/JS.
- [x] Memastikan file laporan `FIX-0001-dashboard-statistics.md` terbuat di direktori root.

### Hasil Pengujian / Hasil Build
Pengujian build produksi dengan perintah `cmd /c "npm run build"` berjalan sukses dengan hasil keluaran kompilasi bersih (exit code 0):
```text
vite v8.0.16 building client environment for production...
✓ 1823 modules transformed.
rendering chunks...
dist/index.html                   0.47 kB │ gzip:   0.32 kB
dist/assets/index-B04oz_9F.css    9.88 kB │ gzip:   2.47 kB
dist/assets/index-28VPM5oZ.js   596.38 kB │ gzip: 187.23 kB
✓ built in 1.79s
```
