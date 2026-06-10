# Pembaruan: Perbaikan Penghitungan Statistik Dashboard Overview (Fix Dashboard Statistics)

- **Indeks**: 0013
- **Tanggal/Waktu**: 2026-06-11 03:18
- **Tujuan**: Memperbaiki masalah di mana counter statistik dashboard overview (Tiket Hari Ini, Tiket Aktif, Tiket Sukses) dan tabel daftar tiket aktif selalu menampilkan angka 0 palsu dengan memindahkan logika penyaringan `areaId` ke sisi klien (client-side) guna mendukung tipe data `String` maupun `DocumentReference` secara dinamis.

## Daftar Perubahan File
- **[MODIFY]** [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) - Memperbarui kueri snapshot tiket aktif gerbang agar memuat seluruh dokumen tiket dan melakukan penyaringan serta pengurutan data di memori klien (client-side) secara aman.
- **[MODIFY]** [FIX-0001-dashboard-statistics.md](file:///C:/programming/qr/webGenerateQrcode/FIX-0001-dashboard-statistics.md) - Memperbarui laporan root cause dan detail perbaikan.

## Rincian Perubahan Kode
Berikut adalah detail perubahan kode pada [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx):

```diff
@@ -102,14 +102,7 @@
     setLoadingTickets(true);
     setFirestoreError(null);
     const ticketsRef = collection(db, 'tickets');
-    const areaRef = doc(db, 'areas', selectedAreaId);
-    const q = query(
-      ticketsRef,
-      or(
-        where('areaId', '==', selectedAreaId),
-        where('areaId', '==', areaRef)
-      )
-    );
+    const q = query(ticketsRef);
 
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const tickets = [];
@@ -116,14 +116,27 @@
         const data = docSnap.data();
-        tickets.push({
-          id: docSnap.id,
-          ...data
-        });
-      });
-      // Sort client-side by createdAt descending
+        
+        // Mengatasi format tipe areaId berupa String atau DocumentReference
+        const docAreaId = data.areaId && typeof data.areaId === 'object' && data.areaId.id
+          ? data.areaId.id
+          : data.areaId;
+
+        if (docAreaId === selectedAreaId) {
+          tickets.push({
+            id: docSnap.id,
+            ...data
+          });
+        }
+      });
+      // Mengurutkan client-side secara aman (aman untuk Timestamps, Dates, maupun string)
       tickets.sort((a, b) => {
-        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
-        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
-        return timeB - timeA;
+        const getTime = (val) => {
+          if (!val) return 0;
+          if (val.seconds) return val.seconds * 1000;
+          if (val._seconds) return val._seconds * 1000;
+          if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
+          return new Date(val).getTime() || 0;
+        };
+        return getTime(b.createdAt) - getTime(a.createdAt);
       });
       setTicketsList(tickets);
```

## Langkah Verifikasi & Pengujian
- [x] Memverifikasi logika in-memory filtering untuk `areaId` di `Dashboard.jsx`.
- [x] Memverifikasi penanganan parameter waktu `createdAt` yang tahan terhadap segala tipe data tanggal.
- [x] Menguji build produksi Vite agar terkompilasi bersih tanpa ada kesalahan parsing JSX/JS.
- [x] Memastikan file laporan `FIX-0001-dashboard-statistics.md` ter-update di direktori root.

### Hasil Pengujian / Hasil Build
Pengujian build produksi dengan perintah `cmd /c "npm run build"` berjalan sukses dengan hasil keluaran kompilasi bersih (exit code 0):
```text
vite v8.0.16 building client environment for production...
✓ 1823 modules transformed.
rendering chunks...
dist/index.html                   0.47 kB │ gzip:   0.32 kB
dist/assets/index-B04oz_9F.css    9.88 kB │ gzip:   2.47 kB
dist/assets/index-D5ykS-iU.js   596.12 kB │ gzip: 187.18 kB
✓ built in 1.21s
```
