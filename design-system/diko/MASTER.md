# Diko Design System Master File

> **LOGIC:** Setiap pembuatan halaman dan komponen baru wajib mengikuti pedoman desain di dokumen ini.
> Pedoman ini dihasilkan dari analisis `ui-ux-pro-max` untuk sistem POS ritel & F&B kasir touchscreen/desktop.

---

**Proyek:** Diko (Digital Toko)  
**Versi:** 1.1  
**Tipe:** Point of Sale (POS) Mobile Touchscreen, Tablet & Desktop  
**Prinsip Desain:** Taktil, Bersih, Ergonomis, Kontras Tinggi, Non-AI-Slop, Pure Lucide Icons  

---

## 1. Skema Warna (Color Palette & Rules)

### 1.1 Enamel (Warna Merek)

Palet utama brand Diko yang bernuansa teal enamel klasik, hangat, profesional, dan tenang.

| Token | Hex | Variabel CSS | Pakai Untuk |
|-------|-----|--------------|-------------|
| `enamel-50` | `#F0F5F6` | `--color-enamel-50` | Latar terpilih yang sangat halus |
| `enamel-100` | `#D9E7E9` | `--color-enamel-100` | Chip aktif, latar badge, pill kategori aktif |
| `enamel-400` | `#6C9DA4` | `--color-enamel-400` | Ikon, strip kategori, keadaan tertekan (pressed) |
| `enamel-600` | `#205C68` | `--color-enamel-600` | Aksi utama. **Satu per layar** (tombol Bayar/Checkout) |
| `enamel-900` | `#16343A` | `--color-enamel-900` | Teks utama, header, permukaan gelap, sidebar |

---

### 1.2 Kertas (Netral)

Palet netral yang mengadopsi nuansa kertas kasir dan cetakan nota (*warm paper & ink*), lembut di mata kasir yang menatap layar berjam-jam.

| Token | Hex | Variabel CSS | Pakai Untuk |
|-------|-----|--------------|-------------|
| `kertas` | `#FFFFFF` | `--color-kertas` | Permukaan panel nota, kartu produk |
| `latar` | `#FAFAF8` | `--color-latar` | Latar aplikasi utama |
| `latar-2` | `#F1F0EC` | `--color-latar-2` | Baris selang-seling, permukaan sekunder, stepper capsule |
| `garis` | `#E4E1DA` | `--color-garis` | Garis nota, pembatas kartu, tepi input |
| `redup` | `#A3A096` | `--color-redup` | Placeholder input, teks nonaktif |
| `teks-2` | `#6B675E` | `--color-teks-2` | Teks sekunder, label subtotal, status normal |
| `teks` | `#16343A` | `--color-teks` | Teks utama — sama dengan `enamel-900` |

---

### 1.3 Status

> [!IMPORTANT]
> **Aturan Khusus Status Diko:**
> **Hanya dua warna status, bukan tiga.**
> Kondisi sukses/tersimpan tidak boleh menggunakan warna hijau mencolok yang mengganggu pandangan kasir.

| Keadaan | Warna & Token | Hex | Alasan & Panduan Penggunaan |
|---------|---------------|-----|------------------------------|
| **Tersimpan** | `teks-2` + ikon centang | `#6B675E` | Kondisi normal. **Tidak perlu berteriak**. Cukup ikon centang dengan warna teks sekunder. |
| **Menunggu kirim** | Amber hangat | `#A06A1B` | Butuh perhatian ringan (outbox pending sync). |
| **Gagal** | Terracotta Red | `#B8504B` | Butuh tindakan kasir / koneksi bermasalah (sync error / validasi gagal). |

---

### 1.4 Aksi Pembayaran Kasir (Emerald Green)

Khusus untuk tombol konfirmasi transaksi dan pembayaran kasir, digunakan warna hijau **Emerald Kasir** (`#059669` $\to$ `#047857`) dengan teks putih kontras tinggi dan shadow lembut, agar tindakan final transaksi kasir tegas, taktil, dan konsisten di seluruh alur:

| Tombol Aksi | Warna / Gradien | Kelas CSS | Penerapan di Antarmuka |
|-------------|-----------------|-----------|------------------------|
| **Bayar Sekarang** | `linear-gradient(135deg, #059669 0%, #047857 100%)` | `.pay-btn`, `.btn-pay` | Tombol checkout utama di panel keranjang belanja |
| **Selesaikan Tunai** | `linear-gradient(135deg, #059669 0%, #047857 100%)` | `.btn-pay-confirm` | Tombol eksekusi pembayaran tunai di modal pembayaran |
| **Konfirmasi QRIS** | `linear-gradient(135deg, #059669 0%, #047857 100%)` | `.btn-pay-confirm` | Tombol konfirmasi pembayaran QRIS di modal pembayaran |
| **Mulai Shift** | `linear-gradient(135deg, #059669 0%, #047857 100%)` | `.btn-pay-confirm` | Tombol pembukaan shift kasir di modal shift |

---

## 2. Standar Ikonografi (Iconography Rules — STRICT)

> [!CAUTION]
> **DILARANG KERAS MENGGUNAKAN EMOTICON / EMOJI SEBAGAI IKON ANTARMUKA**
> Dilarang memakai emoji Unicode (seperti ☕, 🥤, 🍛, 🍟, 💵, 📱, ✕, 🗑️, dll.) di tombol, navigasi, kategori, atau status. Penggunaan emoji membuat aplikasi terlihat murahan (*AI-slop*).

- **WAJIB MENGGUNAKAN `lucide-react`**: Seluruh ikon di dalam aplikasi kasir wajib diimpor langsung dari library `lucide-react`.
- **Ketentuan Ukuran & Stroke Lucide**:
  - Navigasi & Tombol Aksi Utama: `size={20}` atau `size={22}`, `strokeWidth={2}`
  - Tombol Tambah/Kurang/Hapus: `size={16}` atau `size={18}`
  - Ikon Input / Pencarian: `size={18}`
  - Inline / Kategori / Badge: `size={14}` atau `size={16}`
- **Daftar Ikon Resmi yang Digunakan di Diko**:
  - Kategori Produk: `Coffee` (Kopi), `CupSoda` (Non-Kopi), `UtensilsCrossed` (Makanan), `Cookie` (Snack), `LayoutGrid` (Semua Menu)
  - Pembayaran: `Banknote` (Tunai), `QrCode` (QRIS), `CreditCard` (Kartu)
  - Transaksi & Struk: `Receipt`, `Printer`, `RotateCcw`, `CheckCircle2`, `Plus`, `Minus`, `Trash2`
  - Shift & Kasir: `Clock`, `User`, `ShieldCheck`, `LogOut`, `DollarSign`, `AlertTriangle`
  - Utilitas & Filter: `Search`, `X`, `ChevronRight`, `ChevronDown`, `ShoppingBag`

---

## 3. Tipografi & Skala Teks

- **Primary Font**: `Plus Jakarta Sans`, sans-serif
- **Monospace / Tabular**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, monospace (wajib untuk harga, nominal rupiah, nomor struk, dan receipt kalkulasi).

| Skala | Ukuran | Bobot | Penggunaan |
|-------|--------|-------|------------|
| `text-xs` | `11px` | 500 | Badge, label sekunder |
| `text-sm` | `13px` | 500/600 | Kategori, varian, info kasir |
| `text-base` | `15px` | 500/600 | Nama produk, item keranjang |
| `text-lg` | `18px` | 700 | Judul kartu, subtotal |
| `text-xl` | `20px` | 700/800 | Header modal |
| `text-2xl` | `24px` | 800 | Total transaksi, numpad display |
| `text-3xl` | `30px` | 800 | Grand Total kasir |

---

## 4. Grid Katalog & Responsivitas Mobile-First

### Aturan Grid Katalog Produk (`.catalog-grid`):
- **Tampilan Mobile (< 768px)**:
  - Grid 2 kolom yang presisi: `grid-template-columns: repeat(2, 1fr); gap: 10px;`
  - Sidebar desktop diubah menjadi top header kompak atau bottom bar.
  - Keranjang belanja diakses melalui **Floating Bottom Bar** ("*X Item • Rp YYY | Lihat Pesanan >*") yang membuka Bottom Sheet / Drawer keranjang layar penuh, sehingga katalog produk tidak terjepit.
- **Tampilan Tablet (768px - 1024px)**:
  - Grid 3 atau 4 kolom: `grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 12px;`
  - Split 2 kolom dengan proporsi seimbang: Katalog 62%, Keranjang 38% (min 330px).
- **Tampilan Laptop / PC Desktop (> 1024px)**:
  - Grid 4 s.d. 6 kolom adaptif: `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px;`
  - Keranjang tetap di sisi kanan dengan lebar tetap 380px s.d. 420px.

### Anatomi Kartu Produk (`.product-card`):
- Rasio bersih dengan tinggi ideal 120px–135px.
- Latar kartu: `kertas` (`#FFFFFF`) dengan border `garis` (`#E4E1DA`).
- Indikator kategori dengan icon Lucide mini di pojok kiri atas (warna `enamel-400` `#6C9DA4`).
- Badge "Varian" elegan dengan latar `enamel-100` (`#D9E7E9`) dan warna teks `enamel-900` (`#16343A`).
- Nama produk di-clamp maksimal 2 baris (`line-clamp-2`), ukuran font 13.5px–14px, bobot 600, warna `teks` (`#16343A`).
- Harga di bagian bawah kartu dengan font tabular yang tebal dan kontras tinggi.
- Efek sentuh taktil: `active:scale-[0.97]` dengan transisi `100ms ease`.

---

## 5. Ergonomi Sentuh & Efek Taktil

| Token | Ukuran | Penerapan di Diko |
|-------|--------|-------------------|
| `--touch-min` | `48px` | Ukuran target sentuh minimal tombol kasir |
| `--touch-numpad` | `56px-62px` | Tinggi tombol numpad pembayaran |
| `--space-xs` | `4px` | Jarak antar elemen inline |
| `--space-sm` | `8px` | Jarak antar badge & elemen rapat |
| `--space-md` | `12px` | Padding kartu produk |
| `--space-lg` | `16px` | Gap grid produk & padding container |
| `--space-xl` | `20px` | Padding modal & keranjang |
