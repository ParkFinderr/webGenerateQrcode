# Pembaruan: Audit Otorisasi & Keamanan Sistem (Authorization & Security)

- **Indeks**: 0010
- **Tanggal/Waktu**: 2026-06-11 02:31
- **Tujuan**: Melakukan audit mendalam terhadap sistem otorisasi, hak akses, validasi peran (*role validation*), keamanan Firestore, risiko bypass hak akses (*privilege escalation*), dan paparan data sensitif pada Web QR Generator.

---

## Ringkasan Temuan Audit Sebelumnya yang Relevan (Previous Audit Findings Summary)
1.  **Bypass Backend untuk Pembatalan (0007)**: Proses pembatalan tiket memintas API backend dan langsung memperbarui field `status` menjadi `cancelled` di dokumen Firestore (`updateDoc`).
2.  **Kerentanan Modifikasi Lintas Area (0008)**: Admin yang berpindah area gerbang secara teoritis tetap dapat membatalkan tiket area lain jika mengetahui ID dokumennya karena tidak adanya validasi kepemilikan area oleh backend.
3.  **Ketiadaan Deteksi Token Expired (0009)**: JWT yang kedaluwarsa tidak memicu logout otomatis karena tidak adanya global response interceptor.

---

## Authorization Architecture Diagram

```mermaid
graph TD
    A[Admin/User Client] -->|1. REST API Requests| B[Backend API Server]
    B -->|2. JWT Role Verification| C{Apakah Role == admin?}
    C -->|Ya| D[Izinkan /gate/generateTicket]
    C -->|Tidak| E[403 Forbidden]

    A -->|3. Firestore SDK Direct Write| F[Firestore Database]
    F -->|4. Firestore Rules Check| G{Apakah rules terbuka untuk unauthenticated?}
    G -->|Ya - Celah Keamanan ⚠️| H[Izinkan updateDoc status: cancelled]
    G -->|Tidak| I[Permission Denied]
    
    Note over A,F: Aplikasi Generator tidak melakukan Firebase Auth sign-in.
    Note over A,F: Semua akses Firestore dianggap unauthenticated guest!
```

---

## 1. Audit Autentikasi (Authentication Audit)
Akses terhadap modul-modul generator diuji dengan berbagai skenario token:
*   **Tanpa Token / Token Kosong**: Rute dilindungi `<ProtectedRoute>` di `src/App.jsx`. Ketiadaan token di `localStorage` memicu pengalihan (*redirect*) instan ke `/login`.
*   **Token Invalid / Expired**: `ProtectedRoute` memperbolehkan masuk ke dashboard selama kunci `token` dan `user` bernilai non-null di `localStorage`.
    *   **Behavior Aktual**: Panggilan API `/areas` tetap berhasil karena endpoint tersebut bersifat publik di backend. Namun, saat admin mencoba memicu `/gate/generateTicket`, API mengembalikan status **HTTP 403 Forbidden** (*"Token tidak valid (Malformed)"*). Pengguna tetap berada di dashboard tanpa logout otomatis.

---

## 2. Audit Proteksi Rute (Route Protection Audit)
*   **File**: [App.jsx](file:///C:/programming/qr/webGenerateQrcode/src/App.jsx)
*   **Mekanisme**: Rute dilindungi di sisi klien menggunakan `<ProtectedRoute>`.
*   **Hasil Evaluasi**: Proteksi rute berjalan sukses untuk mencegah akses langsung pengguna tanpa autentikasi dasar ke rute `/`. Namun, proteksi ini tidak memverifikasi validitas token ke backend ataupun mengecek kesesuaian role (`admin`), sehingga pengguna dengan peran `user` (biasa) tetap bisa memuat halaman Dashboard generator.

---

## 3. Audit Manipulasi JWT & User Object (JWT & User Tampering)
*   **Tampering `localStorage.token`**: Jika token dimanipulasi dengan string acak, backend menolak proses pembuatan tiket (`/gate/generateTicket` ➔ 403). Namun, **proses pembatalan tiket via Firestore tetap berhasil**. Ini karena generator mengakses Firestore secara unauthenticated (tidak melakukan Firebase Sign-In), sehingga tidak terpengaruh oleh keabsahan JWT backend.
*   **Tampering `localStorage.user` (Privilege Escalation)**:
    *   *Pengujian*: Mengubah role user di `localStorage` dari `user` menjadi `superadmin` / `admin`.
    *   *Hasil UI*: UI dashboard mempercayai data tersebut dan menampilkan label status role baru di header.
    *   *Hasil Backend*: Saat memicu `/gate/generateTicket`, backend mendekripsi JWT asli yang dikirim di header dan mendeteksi bahwa peran sebenarnya adalah `user`, lalu mengembalikan **HTTP 403 Forbidden** (*"Akses ditolak. Halaman ini khusus Admin."*). Eksploitasi hak akses di sisi API backend berhasil ditangkal.
    *   *Hasil Firestore*: Modifikasi status tiket langsung di Firestore tidak memvalidasi role user, sehingga manipulasi ini tetap mengizinkan pembatalan tiket (celah eskalasi hak akses).

---

## 4. Audit Keamanan Firestore (Firestore Security Audit)
Daftar operasi penulisan langsung ke Firestore yang terdeteksi di kode:

| File | Fungsi | Collection | Operation | Deskripsi |
|------|--------|------------|-----------|-----------|
| [Dashboard.jsx](file:///C:/programming/qr/webGenerateQrcode/src/pages/Dashboard.jsx) | `handleCancelTicket` | `tickets` | `updateDoc` | Mengubah status tiket menjadi `cancelled` |

### Kerentanan Firestore Rules:
Karena Web QR Generator tidak mengimplementasikan Firebase Authentication (`signInWithCustomToken` atau `signInWithEmailAndPassword`), seluruh request baca/tulis ke Firestore dari aplikasi ini dikirim sebagai **unauthenticated guest**.
*   **Dampak**: Agar fitur daftar tiket dan pembatalan tiket berfungsi, Firestore Security Rules untuk collection `tickets` harus diatur untuk mengizinkan akses unauthenticated (misal: `allow read, update: if true;`). Hal ini merupakan celah keamanan fatal di mana siapa pun yang mengetahui konfigurasi Firebase aplikasi dapat memodifikasi dokumen di collection `tickets` secara langsung.

---

## 5. Audit Validasi Kepemilikan Area (Area Ownership Audit)
*   **Dashboard & Generate**: Pemuatan dropdown area menggunakan endpoint publik `/areas`. Admin dari Area A dapat memilih Area B pada dropdown, mengirimkan `areaId` Area B ke `/gate/generateTicket`, dan jika backend API `/gate/generateTicket` tidak memverifikasi kesesuaian area dengan token JWT admin tersebut, maka admin Area A dapat mencetak tiket untuk Area B.
*   **Firestore & Cancel**: Admin Area A dapat membatalkan tiket Area B secara langsung di Firestore asalkan mereka mengetahui ID dokumen tiket tersebut. Hal ini terjadi karena tidak adanya validasi kepemilikan area pada penulisan langsung client-side.

---

## 6. Paparan Data Sensitif (Sensitive Data Exposure Audit)
*   **localStorage**: Menyimpan JWT token (`token`) dalam bentuk plain text yang berisi klaim user sensitif (ID, Email, Role). Ini rentan dicuri lewat serangan XSS.
*   **Console.log**: Terdapat penulisan log error API di konsol browser yang memaparkan data ID area dan respons detail, namun tidak ditemukan adanya kebocoran kata sandi (password).

---

## 7. Simulasi Serangan DevTools (DevTools Attack Simulation)
*   **Skenario**: Membuka DevTools konsol browser pada generator dan memicu penulisan dokumen Firestore:
    ```javascript
    import { doc, updateDoc } from "firebase/firestore";
    // Asumsi instance db Firestore diakses secara global
    await updateDoc(doc(db, "tickets", "dokumen_milik_orang_lain"), { status: "cancelled" });
    ```
*   **Hasil**: Operasi **berhasil disetujui** oleh Firestore tanpa membutuhkan autentikasi Firebase ataupun peran admin.

---

## 8. Authorization Matrix (Matriks Otorisasi Aktual)

| Resource / Action | Guest (Unauthenticated) | User (Customer) | Admin (Gate Staff) |
|-------------------|-------------------------|-----------------|--------------------|
| Login | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| View Dashboard | ❌ Denied (Redirected) | ✅ Allowed (UI bypass) | ✅ Allowed |
| Generate Ticket | ❌ Denied (401/403 API) | ❌ Denied (403 API) | ✅ Allowed |
| Cancel Ticket | ✅ Allowed (via Firestore rules bypass) | ✅ Allowed (via Firestore rules bypass) | ✅ Allowed |
| View Area list | ❌ Denied (UI bypass) | ✅ Allowed (Public API) | ✅ Allowed |
| Firestore Write | ✅ Allowed (Unauth update) | ✅ Allowed (Unauth update) | ✅ Allowed |

---

## Known Issues (Masalah Keamanan & Otorisasi)
1.  **Unauthenticated Firestore Write**: Penggunaan Firestore SDK tanpa Firebase Auth memaksa Firestore Rules dibuka untuk akses publik tanpa otentikasi.
2.  **Client-Side Cancel Bypass**: Aksi pembatalan tiket tidak melalui REST API backend sehingga memintas role check admin dan kepemilikan area.
3.  **Role Check Bypass pada Protected Route**: `<ProtectedRoute>` tidak memeriksa role user, membolehkan role `user` biasa mengakses dashboard admin gerbang.

---

## Rekomendasi Pembenahan (Recommended Fixes)
1.  **Migrasi Pembatalan ke Backend API**: Hapus penulisan langsung `updateDoc` di generator dan alihkan ke endpoint API backend baru yang memvalidasi JWT admin.
2.  **Terapkan Firebase Authentication**: Jika Firestore tetap diakses langsung dari klien, gunakan Firebase Auth (`signInWithCustomToken` menggunakan JWT token dari backend) sehingga Firestore Rules dapat membatasi operasi tulis hanya untuk user terautentikasi (`request.auth != null`).
3.  **Perketat ProtectedRoute**: Perbarui komponen pelindung rute agar menolak akses jika role pengguna di dalam payload token bukan `'admin'`.
