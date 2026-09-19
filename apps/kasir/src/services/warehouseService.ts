// Service layer pengelolaan Gudang (Warehouse) dan Ledger Pergerakan Stok di Aplikasi Kasir Diko
// Mengikuti aturan mutlak AGENTS.md Rule 2.4: Stok adalah Ledger, Bukan Angka yang Di-Update Langsung!

import { PergerakanStok, generateId } from '@kasir-pintar/core';
import { catalogService } from './catalogService';

export interface Gudang {
  id: string;
  merchant_id: string;
  kode: string; // 'G1', 'GD', 'GT'
  nama: string; // 'Gudang Utama', 'Gudang Dapur', 'Gudang Toko'
  lokasi?: string;
  pic: string; // Penanggung Jawab
  aktif: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface PergerakanStokRecord extends PergerakanStok {
  produk_nama: string;
  gudang_id?: string;
  gudang_nama?: string;
  nomor_referensi?: string;
  catatan?: string;
}

export interface StokProdukRingkasan {
  produk_id: string;
  produk_nama: string;
  sku: string | null;
  kategori_nama: string;
  harga: number;
  total_stok: number;
  status: 'aman' | 'menipis' | 'habis' | 'minus';
  terakhir_diperbarui: string;
}

const DEFAULT_MERCHANT_ID = '01918a90-0000-7000-8000-000000000001';

const INITIAL_GUDANG: Gudang[] = [
  {
    id: 'g-1',
    merchant_id: DEFAULT_MERCHANT_ID,
    kode: 'GD-01',
    nama: 'Gudang Utama (Pusat)',
    lokasi: 'Ruko Blok A No. 12',
    pic: 'Pak Budi (Owner)',
    aktif: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    deleted_at: null,
  },
  {
    id: 'g-2',
    merchant_id: DEFAULT_MERCHANT_ID,
    kode: 'GD-02',
    nama: 'Gudang Dapur & Bar',
    lokasi: 'Outlet Kasir Diko',
    pic: 'Desia (Kasir/Barista)',
    aktif: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    deleted_at: null,
  },
];

const INITIAL_PERGERAKAN_STOK: PergerakanStokRecord[] = [
  {
    id: 'ps-1',
    merchant_id: DEFAULT_MERCHANT_ID,
    produk_id: 'p1', // Espresso
    produk_nama: 'Espresso (Beans Arabica)',
    gudang_id: 'g-1',
    gudang_nama: 'Gudang Utama (Pusat)',
    varian_id: null,
    qty: 50,
    tipe: 'awal',
    ref_id: null,
    nomor_referensi: 'PO-2026-001',
    catatan: 'Stok awal pembukaan toko',
    waktu_client: new Date(Date.now() - 5 * 86400000).toISOString(),
    waktu_server: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'ps-2',
    merchant_id: DEFAULT_MERCHANT_ID,
    produk_id: 'p2', // Americano
    produk_nama: 'Americano',
    gudang_id: 'g-1',
    gudang_nama: 'Gudang Utama (Pusat)',
    varian_id: null,
    qty: 40,
    tipe: 'awal',
    ref_id: null,
    nomor_referensi: 'PO-2026-001',
    catatan: 'Stok awal pembukaan toko',
    waktu_client: new Date(Date.now() - 5 * 86400000).toISOString(),
    waktu_server: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'ps-3',
    merchant_id: DEFAULT_MERCHANT_ID,
    produk_id: 'p3', // Kopi Susu Diko
    produk_nama: 'Kopi Susu Diko',
    gudang_id: 'g-2',
    gudang_nama: 'Gudang Dapur & Bar',
    varian_id: null,
    qty: 35,
    tipe: 'awal',
    ref_id: null,
    nomor_referensi: 'PO-2026-002',
    catatan: 'Stok awal sirup & susu',
    waktu_client: new Date(Date.now() - 4 * 86400000).toISOString(),
    waktu_server: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'ps-4',
    merchant_id: DEFAULT_MERCHANT_ID,
    produk_id: 'p9', // Kentang Goreng
    produk_nama: 'Kentang Goreng Krispi',
    gudang_id: 'g-2',
    gudang_nama: 'Gudang Dapur & Bar',
    varian_id: null,
    qty: 8,
    tipe: 'awal',
    ref_id: null,
    nomor_referensi: 'PO-2026-003',
    catatan: 'Stok kentang beku (menipis)',
    waktu_client: new Date(Date.now() - 3 * 86400000).toISOString(),
    waktu_server: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ps-5',
    merchant_id: DEFAULT_MERCHANT_ID,
    produk_id: 'p10', // Croissant
    produk_nama: 'Croissant Butter',
    gudang_id: 'g-2',
    gudang_nama: 'Gudang Dapur & Bar',
    varian_id: null,
    qty: 0,
    tipe: 'penyesuaian',
    ref_id: null,
    nomor_referensi: 'ADJ-2026-001',
    catatan: 'Stok habis terjual di akhir shift',
    waktu_client: new Date(Date.now() - 1 * 86400000).toISOString(),
    waktu_server: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const STORAGE_KEY_GUDANG = 'diko_backoffice_gudang';
const STORAGE_KEY_PERGERAKAN_STOK = 'diko_backoffice_pergerakan_stok';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const warehouseService = {
  // === MASTER GUDANG (CRUD) ===
  getGudang(): Gudang[] {
    if (!isBrowser()) return INITIAL_GUDANG;
    const stored = localStorage.getItem(STORAGE_KEY_GUDANG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_GUDANG, JSON.stringify(INITIAL_GUDANG));
      return INITIAL_GUDANG;
    }
    try {
      const parsed: Gudang[] = JSON.parse(stored);
      return parsed.filter((g) => !g.deleted_at);
    } catch {
      return INITIAL_GUDANG;
    }
  },

  saveGudang(data: { id?: string; kode: string; nama: string; lokasi?: string; pic: string }): Gudang {
    const warehouses = this.getGudang();
    const now = new Date().toISOString();

    if (data.id) {
      const updated = warehouses.map((g) =>
        g.id === data.id
          ? {
              ...g,
              kode: data.kode,
              nama: data.nama,
              lokasi: data.lokasi,
              pic: data.pic,
            }
          : g
      );
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY_GUDANG, JSON.stringify(updated));
      }
      return updated.find((g) => g.id === data.id)!;
    } else {
      const newGudang: Gudang = {
        id: generateId(),
        merchant_id: DEFAULT_MERCHANT_ID,
        kode: data.kode,
        nama: data.nama,
        lokasi: data.lokasi,
        pic: data.pic,
        aktif: true,
        created_at: now,
        deleted_at: null,
      };
      const updated = [newGudang, ...warehouses];
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY_GUDANG, JSON.stringify(updated));
      }
      return newGudang;
    }
  },

  deleteGudang(id: string): void {
    const warehouses = this.getGudang();
    const now = new Date().toISOString();
    const updated = warehouses.map((g) => (g.id === id ? { ...g, deleted_at: now } : g));
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_GUDANG, JSON.stringify(updated));
    }
  },

  // === LEDGER PERGERAKAN STOK (APPEND-ONLY) ===
  getPergerakanStok(produkId?: string, gudangId?: string): PergerakanStokRecord[] {
    let records = INITIAL_PERGERAKAN_STOK;
    if (isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEY_PERGERAKAN_STOK);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PERGERAKAN_STOK, JSON.stringify(INITIAL_PERGERAKAN_STOK));
      } else {
        try {
          records = JSON.parse(stored);
        } catch {
          records = INITIAL_PERGERAKAN_STOK;
        }
      }
    }

    let filtered = records;
    if (produkId) {
      filtered = filtered.filter((r) => r.produk_id === produkId);
    }
    if (gudangId) {
      filtered = filtered.filter((r) => r.gudang_id === gudangId);
    }

    // Urutkan dari yang terbaru ke terlama
    return filtered.sort((a, b) => new Date(b.waktu_client).getTime() - new Date(a.waktu_client).getTime());
  },

  // Perhitungan stok real-time: SUM(pergerakan_stok.qty WHERE produk_id = ?)
  // Menerapkan AGENTS.md Rule 2.4 secara ketat!
  getStokRingkasan(): StokProdukRingkasan[] {
    const products = catalogService.getProducts().filter((p) => p.lacak_stok);
    const ledger = this.getPergerakanStok();

    return products.map((product) => {
      // Hitung total dari seluruh pergerakan stok
      const productMovements = ledger.filter((m) => m.produk_id === product.id);
      const totalStok = productMovements.reduce((acc, m) => acc + Number(m.qty), 0);

      let status: 'aman' | 'menipis' | 'habis' | 'minus' = 'aman';
      if (totalStok < 0) {
        status = 'minus'; // Oversell normal per Rule 2.4
      } else if (totalStok === 0) {
        status = 'habis';
      } else if (totalStok <= 10) {
        status = 'menipis';
      }

      const latestMovement = productMovements[0];
      const terakhir = latestMovement?.waktu_client || product.updated_at;

      return {
        produk_id: product.id,
        produk_nama: product.nama,
        sku: product.sku,
        kategori_nama: product.kategori_nama || 'Menu',
        harga: product.harga,
        total_stok: totalStok,
        status,
        terakhir_diperbarui: terakhir,
      };
    });
  },

  // Catat Stok Masuk (Restock / Penerimaan Barang) -> Append ledger positif
  catatStokMasuk(data: {
    produk_id: string;
    gudang_id: string;
    qty: number;
    nomor_referensi?: string;
    catatan?: string;
  }): PergerakanStokRecord {
    const products = catalogService.getProducts();
    const warehouses = this.getGudang();
    const product = products.find((p) => p.id === data.produk_id);
    const warehouse = warehouses.find((g) => g.id === data.gudang_id);

    const now = new Date().toISOString();
    const newEntry: PergerakanStokRecord = {
      id: generateId(),
      merchant_id: DEFAULT_MERCHANT_ID,
      produk_id: data.produk_id,
      produk_nama: product?.nama || 'Produk',
      gudang_id: data.gudang_id,
      gudang_nama: warehouse?.nama || 'Gudang Utama',
      varian_id: null,
      qty: Math.abs(Number(data.qty)), // Selalu positif untuk stok masuk
      tipe: 'awal', // Stok masuk
      ref_id: null,
      nomor_referensi: data.nomor_referensi || `RCV-${Date.now().toString().slice(-6)}`,
      catatan: data.catatan || 'Penerimaan stok masuk (Restock)',
      waktu_client: now,
      waktu_server: now,
    };

    const allMovements = this.getPergerakanStok();
    const updated = [newEntry, ...allMovements];

    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_PERGERAKAN_STOK, JSON.stringify(updated));
    }

    return newEntry;
  },

  // Penyesuaian Stok (Stok Opname / Audit Fisik) -> Hitung selisih dan append delta
  catatPenyesuaianStok(data: {
    produk_id: string;
    gudang_id: string;
    stok_fisik: number;
    alasan: string;
  }): PergerakanStokRecord {
    const products = catalogService.getProducts();
    const warehouses = this.getGudang();
    const product = products.find((p) => p.id === data.produk_id);
    const warehouse = warehouses.find((g) => g.id === data.gudang_id);

    // Hitung stok tercatat saat ini
    const allMovements = this.getPergerakanStok();
    const currentRecorded = allMovements
      .filter((m) => m.produk_id === data.produk_id)
      .reduce((acc, m) => acc + Number(m.qty), 0);

    const delta = Number(data.stok_fisik) - currentRecorded;
    const now = new Date().toISOString();

    const newEntry: PergerakanStokRecord = {
      id: generateId(),
      merchant_id: DEFAULT_MERCHANT_ID,
      produk_id: data.produk_id,
      produk_nama: product?.nama || 'Produk',
      gudang_id: data.gudang_id,
      gudang_nama: warehouse?.nama || 'Gudang',
      varian_id: null,
      qty: delta, // Delta bisa positif (kelebihan fisik) atau negatif (selisih kurang/rusak)
      tipe: 'penyesuaian',
      ref_id: null,
      nomor_referensi: `OPN-${Date.now().toString().slice(-6)}`,
      catatan: `Penyesuaian Opname: Fisik ${data.stok_fisik} vs Sistem ${currentRecorded}. Alasan: ${data.alasan}`,
      waktu_client: now,
      waktu_server: now,
    };

    const updated = [newEntry, ...allMovements];
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_PERGERAKAN_STOK, JSON.stringify(updated));
    }

    return newEntry;
  },
};
