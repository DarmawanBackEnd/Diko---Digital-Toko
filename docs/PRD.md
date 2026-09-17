# Product Requirements Document (PRD)
## Diko (Digital Toko) — Sistem POS UMKM Offline-First

| Dokumen | Keterangan |
|---------|------------|
| **Nama Produk** | **Diko (Digital Toko)** |
| **Versi** | 1.0 (MVP Fase 1) |
| **Status** | Disetujui / Dalam Pengerjaan |
| **Target Rilis** | Q3 2026 |
| **Platform Target** | Tablet (iPad / Android 10"+), Laptop / PC (Web Desktop) |

---

## 1. Ringkasan Eksekutif & Visi Produk

**Diko (Digital Toko)** adalah aplikasi *Point of Sale* (POS) SaaS yang dirancang khusus untuk merchant UMKM mikro di Indonesia, khususnya sektor F&B (kedai kopi, warung makan, kedai minuman) dan retail kecil (toko kelontong, butik baju).

Tantangan fundamental UMKM di Indonesia adalah **koneksi internet yang sering tidak stabil atau padam**. Diko dibangun dengan prinsip **Offline-First Mutlak**: kasir dapat melayani transaksi antrean penuh, menghitung kembalian, mencetak struk thermal, dan menutup shift tanpa ketergantungan pada koneksi internet. Ketika internet kembali aktif, data akan disinkronisasikan secara otomatis dan idempoten ke server pusat.

---

## 2. Persona Pengguna

### Persona 1: Desia (Kasir F&B / Kedai Kopi)
- **Karakteristik**: Usia 19–25 tahun, bekerja dalam shift, menghadapi jam sibuk (*rush hour*) dengan antrean pelanggan panjang.
- **Kebutuhan Utama**:
  - Transaksi cepat (di bawah 5 detik per pesanan).
  - Tombol sentuh besar yang akurat pada tablet tanpa salah tekan.
  - Perhitungan uang kembalian instan dengan tombol pecahan uang tunai cepat.
  - Tambah catatan pesanan (misal: *"Kurang manis"*, *"Es pisah"*).
  - Kasir tidak boleh *crash* atau *loading spinner* saat internet mati.

### Persona 2: Pak Budi (Pemilik / Merchant UMKM)
- **Karakteristik**: Mengelola outlet sendiri, memantau dari laptop di rumah atau smartphone.
- **Kebutuhan Utama**:
  - Rekap penjualan harian yang akurat per kasir/shift.
  - Transparansi selisih uang kas fisik vs catatan sistem saat tutup shift.
  - Mengubah harga atau menambah menu baru melalui Backoffice web dengan mudah.

---

## 3. Spesifikasi Perangkat & Lingkungan Kerja

| Perangkat | Spesifikasi Teknis | Mode Interaksi |
|-----------|---------------------|----------------|
| **Tablet / iPad** | Layar 9.7"–11", RAM 2–4 GB, Android 10+ / iPadOS | **Touchscreen First**: Tombol $\ge 48\text{px}$, jarak sentuh $\ge 8\text{px}$, numpad virtual besar, modal varian intuitif. |
| **Laptop / PC** | Resolusi 1366x768 s.d. 1920x1080, keyboard fisik | **Keyboard & Mouse**: Tombol pintas (`/` cari, `Esc` cancel, `Space`/`Enter` bayar), multi-kolom grid adaptif. |
| **Printer Kasir** | Thermal 58mm Bluetooth Classic (SPP), 32 karakter font A | Format cetak ESC/POS standar 32 kolom, toleran terhadap printer mati. |

---

## 4. Arsitektur Teknis Sistem

```
diko/
├── apps/
│   ├── kasir/        # Vite + React 18 + TS (SPA murni, dibungkus Capacitor APK)
│   └── backoffice/   # Next.js (App Router) + TS (Web Manajemen Merchant)
├── packages/
│   └── core/         # Logika bersama: tipe, validasi Zod, kalkulasi rupiah, ESC/POS builder
├── docs/
│   └── PRD.md        # Dokumen spesifikasi kebutuhan produk ini
├── AGENTS.md         # Aturan mutlak sistem bagi seluruh pengembang & model AI
└── design-system/    # Token desain Diko, panduan UI/UX Pro Max
```

---

## 5. Rincian Epik & Kebutuhan Fitur (User Stories)

### Epik 1: Autentikasi Kasir & Login Shift
- **US-1.1**: Kasir dapat login cepat menggunakan **PIN 4 Digit** melalui numpad virtual di tablet atau numpad keyboard laptop.
- **US-1.2**: Sistem menampilkan identitas merchant ("Diko"), nama kasir yang sedang aktif, dan waktu saat ini di header aplikasi.
- **US-1.3**: Terdapat opsi ganti kasir / logout yang aman tanpa menghapus transaksi offline yang belum tersinkron.

### Epik 2: Manajemen Shift Kasir (Buka / Tutup Kas)
- **US-2.1**: Saat memulai hari/tugas, kasir wajib melakukan **Buka Shift** dengan memasukkan modal kas awal (misal Rp 200.000).
- **US-2.2**: Saat akhir shift, kasir melakukan **Tutup Shift**: memasukkan jumlah uang fisik yang dihitung di laci kas.
- **US-2.3**: Sistem menghitung secara otomatis:
  $$\text{Total Ekspektasi} = \text{Kas Awal} + \text{Total Penjualan Tunai}$$
  $$\text{Selisih Kas} = \text{Uang Fisik} - \text{Total Ekspektasi}$$
- **US-2.4**: Catatan selisih kas disimpan di transaksi shift untuk diaudit oleh pemilik.

### Epik 3: Katalog Produk & Pemilihan Varian
- **US-3.1**: Kasir dapat memfilter produk berdasarkan tab kategori (*Semua, Kopi, Non-Kopi, Makanan, Snack*).
- **US-3.2**: Pencarian instan produk dengan respon $<100\text{ms}$ berdasarkan nama atau SKU.
- **US-3.3**: Klik pada produk dengan varian (misal: *Panas/Dingin*, *Ukuran*) akan memunculkan **Modal Varian** yang jelas dengan penyesuaian selisih harga.
- **US-3.4**: Kasir dapat menambahkan **Catatan Pesanan** (custom note per item).

### Epik 4: Keranjang Belanja & Kalkulasi Harga Real-Time
- **US-4.1**: Keranjang belanja di sisi kanan menampilkan daftar item, varian, catatan, harga satuan, dan kuantitas.
- **US-4.2**: Tombol kuantitas ($+$ / $-$) berukuran besar dan tombol hapus item instan.
- **US-4.3**: Dukungan **Diskon Item** dan **Diskon Transaksi** (persen atau nominal rupiah).
- **US-4.4**: Seluruh kalkulasi (subtotal, diskon, total akhir) dihitung menggunakan modul terpusat `@kasir-pintar/core` untuk menjamin konsistensi 100%.

### Epik 5: Pembayaran Cepat (Quick Tender) & Kembalian
- **US-5.1**: Modal pembayaran cepat mendukung dua metode utama: **Tunai** dan **QRIS Statis**.
- **US-5.2 (Tunai)**: 
  - Tombol cepat **Uang Pas**.
  - Tombol nominal pecahan rupiah standar: **Rp 10.000**, **Rp 20.000**, **Rp 50.000**, **Rp 100.000**.
  - Numpad virtual interaktif 0–9, 000, dan Backspace untuk input nominal kustom.
  - Perhitungan **Kembalian** secara real-time. Tombol "Selesaikan Transaksi" hanya aktif bila uang tunai $\ge$ total belanja.
- **US-5.3 (QRIS)**:
  - Tampilan kode QRIS statis merchant Diko beserta nominal yang harus dibayar dan petunjuk verifikasi ke pelanggan.
  - Tombol konfirmasi satu-klik: "QRIS Berhasil Dibayar".

### Epik 6: Struk Transaksi & ESC/POS 58mm
- **US-6.1**: Setelah transaksi selesai, sistem menampilkan modal preview struk thermal 58mm bergaya realistis:
  - Header: `DIKO - DIGITAL TOKO`, Nama outlet, Alamat
  - Info: Nomor Struk (`D1-000123`), Tanggal/Jam, Nama Kasir
  - Garis pemisah, rincian item (nama, qty $\times$ harga, subtotal)
  - Subtotal, Diskon, Total, Metode Bayar, Dibayar, Kembalian
  - Footer ucapan terima kasih.
- **US-6.2**: Tombol aksi:
  - **"Cetak Struk"**: Mengirim byte ESC/POS ke printer thermal Bluetooth.
  - **"Transaksi Baru"**: Mereset keranjang belanja secara instan ($<100\text{ms}$) agar kasir siap melayani antrean berikutnya.

### Epik 7: Indikator Sinkronisasi Offline & Outbox
- **US-7.1**: Indikator status koneksi & sync di header kasir:
  - 🟢 **Hijau (Online / Tersinkron)**: Semua data transaksi telah terkirim ke server.
  - 🟡 **Kuning (Offline / Pending Sync)**: Terdapat $N$ transaksi tersimpan aman di outbox lokal dan siap dikirim saat internet tersedia.
  - 🔴 **Merah (Perhatian / Error)**: Kegagalan sinkronisasi berulang $>10$ kali.
- **US-7.2**: Indikator ini bersifat **informatif** dan tidak pernah memblokir operasional kasir.

---

## 6. Kebutuhan Non-Fungsional

1. **Kecepatan & Responsivitas**:
   - Respon penekanan tombol: $<100\text{ms}$.
   - Waktu dari penekanan "Bayar" hingga antarmuka siap transaksi berikutnya: $<1\text{ detik}$.
2. **Kinerja Offline & Toleransi Kesalahan**:
   - Zero-network dependency pada jalur checkout.
   - Jika printer thermal mati, transaksi tetap sukses dan struk dapat dicetak ulang nanti.
3. **Ergonomi Sentuh (Touch Ergonomics)**:
   - Tombol operasional kasir minimum $48\text{px} \times 48\text{px}$.
   - Kontras warna teks dan background memenuhi standar WCAG AA (rasio $\ge 4.5:1$).

---

## 7. Rencana Rilis & Milestone

- **Milestone 1 (Saat Ini)**:
  - Rebranding identitas Diko (Digital Toko).
  - Pengesahan `AGENTS.md` dan `docs/PRD.md`.
  - Pembuatan alur interaktif frontend lengkap (Katalog, Varian, Keranjang, Diskon, Pembayaran Tunai & QRIS, Preview Struk 58mm, Shift Modal, Sync Status Pill).
- **Milestone 2**:
  - Integrasi SQLite lokal (`@capacitor-community/sqlite`) dan tabel outbox.
  - Integrasi Bluetooth Classic SPP untuk cetak fisik printer 58mm.
- **Milestone 3**:
  - Backend sync Edge Function & database Supabase.
  - Web dashboard Backoffice (CRUD produk, riwayat transaksi, laporan shift harian).
