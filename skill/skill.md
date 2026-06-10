# Skill: Dokumentasi Pembaruan Project (Project Updates Documentation)

Dokumen ini mendefinisikan aturan dan prosedur standar bagi Agen AI untuk mendokumentasikan setiap perubahan kode, konfigurasi, atau struktur dalam project ini ke dalam folder `update/`.

## Aturan Utama
1. **Setiap Perubahan Harus Dicatat**: Setiap kali ada modifikasi file, penambahan fitur, perbaikan bug, atau perubahan konfigurasi, Agen AI **wajib** membuat file dokumentasi baru di folder `update/`.
2. **Format Penamaan File**: Gunakan format penamaan sekuensial dengan 4 digit angka diikuti deskripsi singkat: `update/XXXX-deskripsi-singkat.md` (Contoh: `update/0001-konfigurasi-qrcode-verify.md`).
3. **Pemberian Indeks**: Selalu periksa folder `update/` terlebih dahulu untuk melihat nomor indeks terakhir yang digunakan, lalu gunakan indeks berikutnya (`nomor_terakhir + 1`).

---

## Struktur Konten Dokumen Update
Setiap file pembaruan di folder `update/` harus mengikuti template berikut:

```markdown
# Pembaruan: [Judul Singkat Perubahan]

- **Indeks**: [Nomor Sekuensial, misal: 0001]
- **Tanggal/Waktu**: [Format: YYYY-MM-DD HH:mm]
- **Tujuan**: [Deskripsi singkat mengenai alasan dilakukannya perubahan]

## Daftar Perubahan File
- [NEW/MODIFY/DELETE] [Nama File](file:///absolute/path/to/file) - [Deskripsi perubahan pada file tersebut]

## Rincian Perubahan Kode
Gunakan blok kode `diff` atau jelaskan logika baru yang diterapkan:
\`\`\`diff
- Kode lama
+ Kode baru
\`\`\`

## Langkah Verifikasi & Pengujian
- [ ] Langkah 1 pengujian
- [ ] Langkah 2 pengujian
- [Hasil Pengujian / Hasil Build]
```

---

## Prosedur Alur Kerja Agen AI
Saat Agen AI menerima tugas untuk mengubah project:
1. **Fase Persiapan**: Baca `skill/skill.md` dan list folder `update/` untuk menentukan indeks berikutnya.
2. **Fase Eksekusi**: Lakukan perubahan kode yang diperlukan pada project.
3. **Fase Dokumentasi**: Buat file `update/XXXX-deskripsi-singkat.md` yang merinci perubahan tersebut sebelum mengakhiri sesi pengerjaan.
