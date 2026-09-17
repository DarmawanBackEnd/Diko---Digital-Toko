// Validasi Zod untuk boundary parsing JSON
// Digunakan saat menerima data dari API, SQLite, atau input user

import { z } from 'zod';

// === Skema Reusable ===

const uuidSchema = z.string().uuid();
const timestampSchema = z.string().datetime({ offset: true });
const timestampNullableSchema = z.string().datetime({ offset: true }).nullable();
const rupiah = z.number().int(); // Rupiah penuh, BUKAN float

// === Entitas Master ===

export const merchantSchema = z.object({
  id: uuidSchema,
  nama: z.string().min(1),
  alamat: z.string().optional(),
  created_at: timestampSchema,
});

export const deviceSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  kode: z.string().min(1),
  nama: z.string().min(1),
  last_sync_at: timestampNullableSchema,
});

export const penggunaSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  nama: z.string().min(1),
  pin_hash: z.string().min(1),
  peran: z.enum(['owner', 'kasir']),
  aktif: z.boolean(),
});

export const kategoriSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  nama: z.string().min(1),
  urutan: z.number().int().min(0),
  updated_at: timestampSchema,
  deleted_at: timestampNullableSchema,
});

export const produkSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  kategori_id: uuidSchema.nullable(),
  nama: z.string().min(1),
  sku: z.string().nullable(),
  harga: rupiah.min(0),
  lacak_stok: z.boolean(),
  updated_at: timestampSchema,
  deleted_at: timestampNullableSchema,
});

export const varianSchema = z.object({
  id: uuidSchema,
  produk_id: uuidSchema,
  nama: z.string().min(1),
  selisih_harga: rupiah,
  updated_at: timestampSchema,
  deleted_at: timestampNullableSchema,
});

// === Entitas Transaksi ===

export const shiftSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  device_id: uuidSchema,
  pengguna_id: uuidSchema,
  dibuka_pada: timestampSchema,
  ditutup_pada: timestampNullableSchema,
  kas_awal: rupiah.min(0),
  kas_akhir: rupiah.nullable(),
  selisih: rupiah.nullable(),
});

export const transaksiSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  device_id: uuidSchema,
  shift_id: uuidSchema,
  pengguna_id: uuidSchema,
  nomor_struk: z.string().min(1),
  subtotal: rupiah.min(0),
  diskon: rupiah.min(0),
  total: rupiah.min(0),
  metode_bayar: z.enum(['tunai', 'qris']),
  dibayar: rupiah.min(0),
  kembalian: rupiah.min(0),
  status: z.enum(['selesai', 'void']),
  waktu_client: timestampSchema,
  waktu_server: timestampSchema,
});

export const transaksiItemSchema = z.object({
  id: uuidSchema,
  transaksi_id: uuidSchema,
  produk_id: uuidSchema,
  varian_id: uuidSchema.nullable(),
  nama_produk: z.string().min(1),
  harga_satuan: rupiah.min(0),
  qty: z.number().int().min(1),
  diskon: rupiah.min(0),
  subtotal: rupiah.min(0),
});

export const pergerakanStokSchema = z.object({
  id: uuidSchema,
  merchant_id: uuidSchema,
  produk_id: uuidSchema,
  varian_id: uuidSchema.nullable(),
  qty: z.number().int(),
  tipe: z.enum(['penjualan', 'penyesuaian', 'awal']),
  ref_id: uuidSchema.nullable(),
  waktu_client: timestampSchema,
  waktu_server: timestampSchema,
});

// === Entitas Khusus Perangkat ===

export const outboxSchema = z.object({
  id: uuidSchema,
  tabel: z.enum(['transaksi', 'shift', 'pergerakan_stok']),
  record_id: uuidSchema,
  payload: z.string().min(1),
  percobaan: z.number().int().min(0),
  error_terakhir: z.string().nullable(),
  dibuat_pada: timestampSchema,
  terkirim_pada: timestampNullableSchema,
});

export const syncStateSchema = z.object({
  tabel: z.string().min(1),
  terakhir_ditarik: timestampNullableSchema,
});

// === Input Schemas ===

export const itemKeranjangSchema = z.object({
  produk_id: uuidSchema,
  varian_id: uuidSchema.nullable(),
  nama_produk: z.string().min(1),
  harga_satuan: rupiah.min(0),
  qty: z.number().int().min(1),
  diskon: rupiah.min(0),
});

export const inputTransaksiSchema = z.object({
  items: z.array(itemKeranjangSchema).min(1),
  diskon_transaksi: rupiah.min(0),
  metode_bayar: z.enum(['tunai', 'qris']),
  dibayar: rupiah.min(0),
});

// === Skema untuk sync push payload ===

export const syncPushPayloadSchema = z.object({
  transaksi: z.array(transaksiSchema).optional(),
  transaksi_items: z.array(transaksiItemSchema).optional(),
  shifts: z.array(shiftSchema).optional(),
  pergerakan_stok: z.array(pergerakanStokSchema).optional(),
});

export type SyncPushPayload = z.infer<typeof syncPushPayloadSchema>;
