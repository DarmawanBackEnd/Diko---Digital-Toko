# 🏪 Diko (Digital Toko)

> **Sistem Kasir Digital Cepat, Andal, & Offline-First untuk UMKM Indonesia**  
> Dirancang khusus untuk Tablet Touchscreen (Android/iPad) dan Laptop/PC Kasir.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Offline First](https://img.shields.io/badge/Architecture-Offline--First-059669)](AGENTS.md)

---

## 💡 Tentang Diko

**Diko (Digital Toko)** adalah aplikasi Point of Sale (POS) modern yang dirancang untuk mengatasi tantangan koneksi internet yang sering tidak stabil di Indonesia. Dengan arsitektur **Offline-First**, kasir dapat memproses transaksi penjualan, menghitung diskon, mencetak struk thermal 58mm, dan mengelola shift kerja secara instan tanpa menunggu respons jaringan.

### 🌟 Karakteristik Utama
- ⚡ **Zero-Wait Checkout (< 1 detik)**: Alur pembayaran kasir murni berjalan lokal di perangkat (*Outbox Pattern*). UI kasir tidak pernah menunggu jaringan (`fetch`).
- 🆔 **Client-Side UUIDv7**: Seluruh ID transaksi dan shift digenerate langsung di perangkat kasir secara time-ordered dan bebas tabrakan server.
- 📦 **Stok Berbasis Ledger (Append-Only)**: Stok dicatat sebagai pergerakan kuantitas masuk/keluar, bukan mutasi angka langsung (`UPDATE`). Sinkronisasi multi-kasir bebas konflik.
- 🖨️ **Struk Thermal 58mm ESC/POS**: Builder byte murni dengan lebar cetak 32 karakter untuk printer thermal Bluetooth / USB.
- 🎨 **Desain Komersial Kelas Atas (Non-AI Slop)**: Menggunakan palet resmi **Enamel & Kertas**, font *Plus Jakarta Sans*, angka tabular, dan 100% ikon SVG murni dari `lucide-react`.

---

## 🏗️ Arsitektur Monorepo

Proyek ini dibangun menggunakan arsitektur monorepo dengan **pnpm workspace**:

```
kasir-pintar/
├── apps/
│   ├── kasir/             # Vite + React 18 + TS SPA (Target APK Android via Capacitor)
│   └── backoffice/        # Next.js App Router (Dashboard analitik & manajemen katalog)
├── packages/
│   └── core/              # Shared logic murni (kalkulator harga, ESC/POS builder, schema, Zod)
├── design-system/
│   └── diko/
│       └── MASTER.md      # Master token, palet Enamel, aturan tipografi & status
├── supabase/
│   └── migrations/        # Skema Postgres & tabel sync outbox
├── docs/
│   └── PRD.md             # Product Requirement Document lengkap
├── AGENTS.md              # 9 Aturan inti arsitektur sistem
└── README.md
```

---

## 🎨 Sistem Desain & Palet Warna

Diko mengadopsi palet warna klasik **Enamel & Kertas** yang hangat, profesional, dan nyaman di mata kasir:

- **Enamel (Warna Merek)**:
  - `enamel-900` (`#16343A`): Teks utama, header bar, sidebar
  - `enamel-600` (`#205C68`): Aksi sekunder brand
  - `enamel-400` (`#6C9DA4`): Ikon & strip kategori
  - `enamel-100` (`#D9E7E9`): Chip aktif, latar badge
  - `enamel-50` (`#F0F5F6`): Latar terpilih halus
- **Kertas (Netral)**:
  - `kertas` (`#FFFFFF`): Kartu produk & panel nota
  - `latar` (`#FAFAF8`): Background aplikasi utama
  - `latar-2` (`#F1F0EC`): Kapsul stepper kuantitas & permukaan sekunder
  - `garis` (`#E4E1DA`): Garis pembatas kartu & tepi input
- **Aksi Kasir (Emerald Green)**:
  - Tombol **"Bayar Sekarang"**, **"Selesaikan Tunai"**, **"Konfirmasi QRIS"**, dan **"Mulai Shift"** menggunakan gradien hijau Emerald (`#059669` $\to$ `#047857`) untuk ketegasan aksi transaksi.
- **Filosofi Status (Hanya 2 Warna Status)**:
  - **Tersimpan**: Kondisi normal / tidak berteriak (`#6B675E` + ikon centang)
  - **Menunggu Kirim**: Amber hangat (`#A06A1B`)
  - **Gagal**: Terracotta Red (`#B8504B`)

---

## 🚀 Memulai (Quick Start)

### Prasyarat
- **Node.js**: `v18.0.0` atau lebih baru
- **pnpm**: `v9.0.0` atau lebih baru

### 1. Kloning Repositori
```bash
git clone https://github.com/DarmawanBackEnd/Diko---Digital-Toko.git
cd Diko---Digital-Toko
```

### 2. Instal Dependensi
```bash
pnpm install
```

### 3. Jalankan Aplikasi Kasir (Frontend Dev Server)
```bash
pnpm dev:kasir
```
Buka browser pada **`http://localhost:5173/`**.
- Masuk dengan PIN kasir default: **`1234`**

### 4. Menjalankan Unit Test (Core Domain)
```bash
pnpm --filter @kasir-pintar/core test
```
*46/46 unit tests lulus memvalidasi kalkulasi diskon, subtotal, validasi pembayaran, dan byte stream ESC/POS.*

### 5. Build Produksi
```bash
pnpm --filter @kasir-pintar/kasir build
```

---

## ⌨️ Tombol Pintas Kasir (Desktop / Laptop)

| Pintasan | Fungsi |
|---|---|
| `/` atau `F2` | Fokus cepat ke kolom pencarian produk |
| `Esc` | Batalkan pencarian atau tutup modal aktif |
| `Space` | Buka modal pembayaran cepat / tender |
| `Enter` | Konfirmasi pembayaran di dalam modal |

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
Dikembangkan untuk mendukung digitalisasi UMKM Indonesia secara andal dan mandiri.
