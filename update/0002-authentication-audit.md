# Pembaruan: Audit & Verifikasi Sistem Autentikasi

- **Indeks**: 0002
- **Tanggal/Waktu**: 2026-06-11 01:45
- **Tujuan**: Melakukan audit keamanan dan fungsionalitas sistem autentikasi pada project Web QR Generator sesuai dengan panduan di `prompt.md`.

---

## Executive Summary
Sistem autentikasi pada Web QR Generator saat ini menggunakan token JWT (JSON Web Token) yang disimpan di `localStorage` dan dikirim secara otomatis melalui Axios request interceptor. Secara umum, alur utama login, proteksi rute dasar, dan logout telah berfungsi. Namun, audit ini menemukan beberapa celah kritis terkait penanganan token kedaluwarsa (expired token), kebocoran residu data pada `localStorage` saat logout, dan ketiadaan file konfigurasi `.env` di workspace lokal.

---

## Authentication Flow Diagram

```mermaid
graph TD
    A[Halaman Login] -->|Input email & password| B(POST /auth/login)
    B -->|Sukses: Simpan JWT & User Data| C{localStorage}
    C -->|Set token, user, adminAreas, selectedAreaId| D[Redirect ke Dashboard /]
    
    E[Protected Rute App.jsx] -->|Periksa token & userStr di localStorage| F{Apakah Data Ada?}
    F -->|Tidak Ada| A
    F -->|Ada| D

    D -->|Klik Logout| G(POST /auth/logout)
    G -->|Finally: Hapus token & user| H[Redirect ke Halaman Login]
    Note over H: Celah Keamanan: adminAreas & selectedAreaId tidak dihapus dari localStorage!
```

---

## 1. Login Endpoint & Contract Verification
*   **Endpoint**: `/auth/login`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "email": "admin@parkfinder.id",
      "password": "••••••••"
    }
    ```
*   **Response Body (Sukses)**:
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": "admin-123",
          "email": "admin@parkfinder.id",
          "name": "Admin Gate",
          "role": "admin",
          "managedAreaId": "area-xyz"
        }
      }
    }
    ```
*   **JWT Location**: Nilai token diambil dari `response.data.data.token` dan disimpan langsung ke `localStorage.setItem('token', token)`.
*   **Error Response**: Respons error ditangkap melalui `err.response?.data?.message` untuk ditampilkan ke komponen UI login.

---

## 2. JWT Storage Strategy
Aplikasi menggunakan **Web Storage (localStorage)** untuk mempertahankan session:
*   `token`: Menyimpan raw JWT string untuk otorisasi API header.
*   `user`: Menyimpan data user terautentikasi dalam format JSON string.
*   `adminAreas`: Menyimpan cache area yang dikelola untuk mempercepat rendering dropdown.
*   `selectedAreaId`: Menyimpan ID area yang sedang aktif/dipilih oleh admin.

**Kelemahan**: Penyimpanan di `localStorage` rentan terhadap serangan XSS (Cross-Site Scripting).

---

## 3. Axios Authentication Audit (`src/config/axios.js`)
*   **Otorisasi Otomatis**: Request interceptor berhasil menyisipkan token ke setiap request API:
    ```javascript
    config.headers['Authorization'] = `Bearer ${token}`;
    ```
*   **Temuan Kritis**: **Tidak ada Response Interceptor**. Jika backend mengembalikan status HTTP `401 Unauthorized` atau `403 Forbidden` (misal token kedaluwarsa atau dimanipulasi), aplikasi tidak memiliki penanganan terpusat untuk otomatis menghapus token dari `localStorage` dan meredireksi user ke `/login`.

---

## 4. Route Protection Audit
*   **Mekanisme**: Rute dilindungi menggunakan wrapper `<ProtectedRoute>` di `src/App.jsx`.
*   **Kondisi Verifikasi**: Rute memeriksa kehadiran `token` dan `user` di `localStorage`. Jika salah satu kosong, user di-redireksi ke `/login`.
*   **Celah Keamanan**: Proteksi ini murni bersifat client-side. Jika token di `localStorage` kedaluwarsa atau diubah dengan string acak secara manual, rute `/` tetap akan terbuka dan menampilkan Dashboard. Aplikasi baru akan menampilkan error ketika memicu pemanggilan REST API `/areas` di `Dashboard.jsx`.

---

## 5. Logout Verification
*   **Proses**: Admin memicu fungsi `handleLogout` yang mengirim API `POST /auth/logout` lalu menghapus item di `localStorage`.
*   **Temuan Masalah**: Fungsi logout hanya menghapus `token` dan `user`. Item `adminAreas` dan `selectedAreaId` **tetap tertinggal** di `localStorage`. Hal ini menyebabkan residu data sesi sebelumnya dapat terbaca oleh user berikutnya yang menggunakan browser yang sama.

---

## 6. Expired Token & Error Handling Behavior
*   **Infinite Loading / Blank Screen**: Tidak terjadi blank screen secara total, namun jika token expired:
    1. Menu dropdown area di dashboard akan menampilkan teks merah "Tidak ada area" karena pemanggilan `/areas` ditolak oleh backend (401).
    2. Konsol browser akan dipenuhi error HTTP 401.
    3. User tetap berada di halaman dashboard dalam kondisi tidak dapat melakukan generate tiket parkir (tindakan generate tiket memicu alert error 401 terus-menerus).
*   Tidak ada auto-logout/auto-redirect saat token kedaluwarsa.

---

## 7. Security Findings & Hardcoded Credentials
*   **Hardcoded Auth**: Tidak ditemukan adanya hardcoded JWT token, mockup user, password, ataupun mekanisme bypass otentikasi di kode program.
*   **Missing Configuration**: Tidak adanya file `.env` di workspace. Aplikasi mengandalkan `import.meta.env.VITE_API_BASE_URL` di Axios, yang berarti saat dideploy tanpa env vars, pemanggilan API akan rusak (mengarah ke root URL frontend host secara default).

---

## 8. Build Status
*   **Status Build**: **SUKSES** (Exit Code: 0) melalui pengujian `npm run build`.
*   **Assets Terkompresi**:
    *   `dist/index.html` (0.47 kB)
    *   `dist/assets/index-D5AQcAVM.css` (8.21 kB)
    *   `dist/assets/index-BLXu3M58.js` (596.07 kB)
*   **Warning Pembangunan**:
    *   CSS Optimization warning: Aturan `@import` Google Font di `index.css` diletakkan setelah definisi CSS lainnya. Hal ini melanggar spesifikasi standar CSS karena `@import` harus diletakkan di bagian paling atas dokumen CSS.

---

## Rencana Tindakan Perbaikan (Recommended Next Steps)
1. **Memperbaiki Logout Logic**: Mengubah penanganan pembersihan session menjadi `localStorage.clear()` untuk membersihkan seluruh data termasuk `adminAreas` dan `selectedAreaId`.
2. **Menambahkan Response Interceptor**: Mengimplementasikan response interceptor pada `src/config/axios.js` untuk secara otomatis membersihkan session dan mengarahkan ke `/login` ketika server merespons dengan status `401`.
3. **Mengatur Ulang Font @import**: Memindahkan `@import` font Inter ke baris paling atas di file CSS utama untuk menghilangkan build warning.
4. **Membuat File Template .env**: Menambahkan `.env.example` ke repositori untuk memandu konfigurasi basis URL API dan variabel Firebase.
