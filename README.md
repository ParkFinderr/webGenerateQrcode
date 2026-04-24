# Generate QR Code ParkFinder

Aplikasi frontend untuk mengelola pembuatan QR Code tiket parkir secara dinamis. Aplikasi ini digunakan oleh admin di area parkir (Gate Display) untuk mencetak tiket QR bagi pengunjung.

## ✨ Fitur Utama
- **Login Admin**: Akses khusus untuk petugas gerbang.
- **Generate QR Code**: Membuat tiket QR secara otomatis untuk kendaraan (Mobil).
- **Status Real-time**: Mendeteksi secara instan kapan tiket dipindai menggunakan Firebase Firestore.
- **Support Docker**: Mudah dijalankan di lingkungan lokal maupun production (GCP VM).

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Firestore (Real-time listener)
- **Container**: Docker & Docker Compose

## 🚀 Cara Menjalankan

### 1. Persiapan Environment
Buat file `.env` dan isi dengan konfigurasi berikut:
```env
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 2. Jalankan dengan Docker
- **Mode Development (Lokal):**
  ```bash
  docker-compose up --build
  ```
- **Mode Production (GCP VM):**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d --build
  ```

## 📁 Struktur Folder
- `src/pages`: Halaman Login dan Dashboard.
- `src/config`: Konfigurasi Axios dan Firebase.
- `src/hooks`: Hook untuk mendengarkan perubahan status tiket di Firestore.
