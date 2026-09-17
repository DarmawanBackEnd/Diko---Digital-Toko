// Definisi tipe TypeScript untuk seluruh entitas domain
// Nama field menggunakan bahasa Indonesia sesuai konvensi §10

// === Entitas Master (server → perangkat) ===

export interface Merchant {
  id: string;
  nama: string;
  alamat?: string;
  created_at: string;
}

export interface Device {
  id: string;
  merchant_id: string;
  kode: string; // 'K1', 'K2'
  nama: string;
  last_sync_at: string | null;
}

export interface Pengguna {
  id: string;
  merchant_id: string;
  nama: string;
  pin_hash: string;
  peran: 'owner' | 'kasir';
  aktif: boolean;
}

export interface Kategori {
  id: string;
  merchant_id: string;
  nama: string;
  urutan: number;
  updated_at: string;
  deleted_at: string | null;
}

export interface Produk {
  id: string;
  merchant_id: string;
  kategori_id: string | null;
  nama: string;
  sku: string | null;
  harga: number; // Rupiah penuh, integer. BUKAN float/desimal.
  lacak_stok: boolean;
  updated_at: string;
  deleted_at: string | null;
}

export interface Varian {
  id: string;
  produk_id: string;
  nama: string; // 'Panas', 'Dingin', 'L'
  selisih_harga: number; // Bisa positif atau negatif
  updated_at: string;
  deleted_at: string | null;
}

// === Entitas Transaksi (perangkat → server) ===

export type MetodeBayar = 'tunai' | 'qris';
export type StatusTransaksi = 'selesai' | 'void';

export interface Shift {
  id: string;
  merchant_id: string;
  device_id: string;
  pengguna_id: string;
  dibuka_pada: string;
  ditutup_pada: string | null;
  kas_awal: number;
  kas_akhir: number | null;
  selisih: number | null;
}

export interface Transaksi {
  id: string; // UUIDv7 dari client
  merchant_id: string;
  device_id: string;
  shift_id: string;
  pengguna_id: string;
  nomor_struk: string; // 'K1-000123'
  subtotal: number;
  diskon: number;
  total: number;
  metode_bayar: MetodeBayar;
  dibayar: number;
  kembalian: number;
  status: StatusTransaksi;
  waktu_client: string;
  waktu_server: string;
}

export interface TransaksiItem {
  id: string;
  transaksi_id: string;
  produk_id: string;
  varian_id: string | null;
  nama_produk: string; // SNAPSHOT — nama saat transaksi terjadi
  harga_satuan: number; // SNAPSHOT — harga saat transaksi terjadi
  qty: number;
  diskon: number;
  subtotal: number;
}

// === Entitas Stok ===

export type TipePergerakan = 'penjualan' | 'penyesuaian' | 'awal';

export interface PergerakanStok {
  id: string;
  merchant_id: string;
  produk_id: string;
  varian_id: string | null;
  qty: number; // Negatif = keluar
  tipe: TipePergerakan;
  ref_id: string | null; // transaksi_id jika tipe 'penjualan'
  waktu_client: string;
  waktu_server: string;
}

// === Entitas Khusus Perangkat ===

export type TabelOutbox = 'transaksi' | 'shift' | 'pergerakan_stok';

export interface Outbox {
  id: string;
  tabel: TabelOutbox;
  record_id: string;
  payload: string; // JSON
  percobaan: number;
  error_terakhir: string | null;
  dibuat_pada: string;
  terkirim_pada: string | null; // NULL = belum terkirim
}

export interface SyncState {
  tabel: string;
  terakhir_ditarik: string | null; // updated_at terakhir yang sudah di-pull
}

// === Input Types (untuk fungsi kalkulasi) ===

export interface ItemKeranjang {
  produk_id: string;
  varian_id: string | null;
  nama_produk: string;
  harga_satuan: number; // Harga dasar produk + selisih_harga varian
  qty: number;
  diskon: number; // Diskon per item dalam rupiah
}

export interface InputTransaksi {
  items: ItemKeranjang[];
  diskon_transaksi: number; // Diskon untuk keseluruhan transaksi
  metode_bayar: MetodeBayar;
  dibayar: number;
}

// === Receipt Types ===

export interface DataStruk {
  nama_merchant: string;
  alamat_merchant: string;
  nomor_struk: string;
  tanggal: string;
  nama_kasir: string;
  items: ItemStruk[];
  subtotal: number;
  diskon: number;
  total: number;
  metode_bayar: MetodeBayar;
  dibayar: number;
  kembalian: number;
}

export interface ItemStruk {
  nama: string; // Termasuk nama varian jika ada
  qty: number;
  harga_satuan: number;
  subtotal: number;
}
