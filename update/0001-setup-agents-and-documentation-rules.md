# Pembaruan: Inisialisasi Dokumentasi Project & Standardisasi QR Code

- **Indeks**: 0001
- **Tanggal/Waktu**: 2026-06-11 01:41
- **Tujuan**: Membersihkan dokumentasi markdown lama, menambahkan panduan agen (`agents.md`), menetapkan aturan pencatatan update (`skill/skill.md`), serta merekam standarisasi nilai QR Code.

## Daftar Perubahan File
- [NEW] [agents.md](file:///C:/programming/qr/webGenerateQrcode/agents.md) - Panduan detail mengenai arsitektur, data flow, spesifikasi QR Code, dan tech stack project Web QR Generator.
- [NEW] [prompt.md](file:///C:/programming/qr/webGenerateQrcode/prompt.md) - Template panduan prompt untuk sinkronisasi API, pemeliharaan kode, dan inisialisasi environment.
- [NEW] [skill/skill.md](file:///C:/programming/qr/webGenerateQrcode/skill/skill.md) - Aturan wajib bagi Agen AI untuk mendokumentasikan setiap pembaruan project di bawah folder `update/`.
- [DELETE] `all.md`, `qr.md`, `tiket.md`, `web.md`, `README.md` - Dihapus karena sudah usang dan digantikan oleh `agents.md`.
- [MODIFY] [TicketGenerator.jsx](file:///C:/programming/qr/webGenerateQrcode/src/components/TicketGenerator.jsx) - (Perubahan Sebelumnya) Memastikan QRCodeSVG menggunakan nilai string ID murni: `value={ticketData.qrCode || ticketData.ticketId}`.

## Rincian Perubahan Kode

### Standardisasi QRCodeSVG Value di `TicketGenerator.jsx`
```diff
- <QRCodeSVG value={JSON.stringify(ticketData)} ... /> // Atau pembungkus JSON lainnya
+ <QRCodeSVG
+   value={ticketData.qrCode || ticketData.ticketId}
+   size={200}
+   level="H"
+   includeMargin={true}
+ />
```

---

## Langkah Verifikasi & Pengujian
- [x] Memastikan file markdown lama berhasil dihapus dari direktori project.
- [x] Memvalidasi pembuatan folder `skill/` dan file `skill.md` untuk aturan dokumentasi.
- [x] Memvalidasi pembuatan `prompt.md` untuk panduan prompt pengguna.
- [x] Memverifikasi kode QRCodeSVG di `TicketGenerator.jsx` memuat plain string ID.
