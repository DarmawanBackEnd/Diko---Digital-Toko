// Service layer pengelolaan Katalog Menu (Produk, Kategori, Varian) Backoffice Diko
// Mendukung persistensi lokal (localStorage) dan siap disambungkan ke Supabase client

import { Produk, Kategori, Varian, generateId } from '@kasir-pintar/core';

export interface ProductWithDetails extends Produk {
  kategori_nama?: string;
  variants: Varian[];
  stok_saat_ini?: number;
}

const DEFAULT_MERCHANT_ID = '01918a90-0000-7000-8000-000000000001';

const INITIAL_CATEGORIES: Kategori[] = [
  { id: 'cat-1', merchant_id: DEFAULT_MERCHANT_ID, nama: 'Kopi', urutan: 1, updated_at: new Date().toISOString(), deleted_at: null },
  { id: 'cat-2', merchant_id: DEFAULT_MERCHANT_ID, nama: 'Non-Kopi', urutan: 2, updated_at: new Date().toISOString(), deleted_at: null },
  { id: 'cat-3', merchant_id: DEFAULT_MERCHANT_ID, nama: 'Makanan', urutan: 3, updated_at: new Date().toISOString(), deleted_at: null },
  { id: 'cat-4', merchant_id: DEFAULT_MERCHANT_ID, nama: 'Snack', urutan: 4, updated_at: new Date().toISOString(), deleted_at: null },
];

const INITIAL_PRODUCTS: Array<Produk & { variants: Varian[] }> = [
  {
    id: 'p1',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-1',
    nama: 'Espresso',
    sku: 'KOP-ESP-01',
    harga: 15000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [
      { id: 'v1', produk_id: 'p1', nama: 'Single Shot', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'v2', produk_id: 'p1', nama: 'Double Shot', selisih_harga: 5000, updated_at: new Date().toISOString(), deleted_at: null },
    ],
  },
  {
    id: 'p2',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-1',
    nama: 'Americano',
    sku: 'KOP-AME-02',
    harga: 18000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [
      { id: 'v3', produk_id: 'p2', nama: 'Panas (Hot)', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'v4', produk_id: 'p2', nama: 'Dingin (Iced)', selisih_harga: 2000, updated_at: new Date().toISOString(), deleted_at: null },
    ],
  },
  {
    id: 'p3',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-1',
    nama: 'Kopi Susu Diko',
    sku: 'KOP-KSD-03',
    harga: 22000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [
      { id: 'v5', produk_id: 'p3', nama: 'Reguler (Dingin)', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'v6', produk_id: 'p3', nama: 'Large (Dingin)', selisih_harga: 5000, updated_at: new Date().toISOString(), deleted_at: null },
    ],
  },
  {
    id: 'p4',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-1',
    nama: 'Cappuccino',
    sku: 'KOP-CAP-04',
    harga: 25000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [
      { id: 'v7', produk_id: 'p4', nama: 'Panas', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'v8', produk_id: 'p4', nama: 'Dingin', selisih_harga: 2000, updated_at: new Date().toISOString(), deleted_at: null },
    ],
  },
  {
    id: 'p5',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-2',
    nama: 'Matcha Latte',
    sku: 'NON-MAT-05',
    harga: 27000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [
      { id: 'v9', produk_id: 'p5', nama: 'Dingin', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'v10', produk_id: 'p5', nama: 'Panas', selisih_harga: 0, updated_at: new Date().toISOString(), deleted_at: null },
    ],
  },
  {
    id: 'p6',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-2',
    nama: 'Coklat Belgia',
    sku: 'NON-COK-06',
    harga: 24000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [],
  },
  {
    id: 'p7',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-3',
    nama: 'Nasi Goreng Diko Spesial',
    sku: 'MAK-NGS-07',
    harga: 28000,
    lacak_stok: false,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [],
  },
  {
    id: 'p8',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-3',
    nama: 'Roti Bakar Coklat Keju',
    sku: 'MAK-ROB-08',
    harga: 18000,
    lacak_stok: false,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [],
  },
  {
    id: 'p9',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-4',
    nama: 'Kentang Goreng Krispi',
    sku: 'SNK-KTG-09',
    harga: 18000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [],
  },
  {
    id: 'p10',
    merchant_id: DEFAULT_MERCHANT_ID,
    kategori_id: 'cat-4',
    nama: 'Croissant Butter',
    sku: 'SNK-CRS-10',
    harga: 19000,
    lacak_stok: true,
    updated_at: new Date().toISOString(),
    deleted_at: null,
    variants: [],
  },
];

const STORAGE_KEY_CATEGORIES = 'diko_backoffice_categories';
const STORAGE_KEY_PRODUCTS = 'diko_backoffice_products';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const catalogService = {
  // === KATEGORI ===
  getCategories(): Kategori[] {
    if (!isBrowser()) return INITIAL_CATEGORIES;
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      const parsed: Kategori[] = JSON.parse(stored);
      return parsed.filter((c) => !c.deleted_at);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategory(nama: string, urutan?: number, id?: string): Kategori {
    const categories = this.getCategories();
    const now = new Date().toISOString();

    if (id) {
      // Update
      const updated = categories.map((c) =>
        c.id === id ? { ...c, nama, urutan: urutan ?? c.urutan, updated_at: now } : c
      );
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      }
      return updated.find((c) => c.id === id)!;
    } else {
      // Create baru
      const newCat: Kategori = {
        id: generateId(),
        merchant_id: DEFAULT_MERCHANT_ID,
        nama,
        urutan: urutan ?? categories.length + 1,
        updated_at: now,
        deleted_at: null,
      };
      const updated = [...categories, newCat];
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      }
      return newCat;
    }
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const now = new Date().toISOString();
    const updated = categories.map((c) => (c.id === id ? { ...c, deleted_at: now } : c));
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    }
  },

  // === PRODUK ===
  getProducts(): ProductWithDetails[] {
    const categories = this.getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c.nama]));

    let rawProducts: Array<Produk & { variants: Varian[] }> = INITIAL_PRODUCTS;
    if (isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      } else {
        try {
          rawProducts = JSON.parse(stored);
        } catch {
          rawProducts = INITIAL_PRODUCTS;
        }
      }
    }

    return rawProducts
      .filter((p) => !p.deleted_at)
      .map((p) => ({
        ...p,
        kategori_nama: p.kategori_id ? catMap.get(p.kategori_id) || 'Tanpa Kategori' : 'Tanpa Kategori',
        variants: (p.variants || []).filter((v) => !v.deleted_at),
      }));
  },

  saveProduct(data: {
    id?: string;
    nama: string;
    kategori_id: string | null;
    sku: string | null;
    harga: number;
    lacak_stok: boolean;
    variants: Array<{ id?: string; nama: string; selisih_harga: number }>;
  }): ProductWithDetails {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const productId = data.id || generateId();

    const formattedVariants: Varian[] = data.variants.map((v) => ({
      id: v.id || generateId(),
      produk_id: productId,
      nama: v.nama,
      selisih_harga: Number(v.selisih_harga) || 0,
      updated_at: now,
      deleted_at: null,
    }));

    let updated: Array<Produk & { variants: Varian[] }>;

    if (data.id) {
      // Update produk
      updated = products.map((p) =>
        p.id === data.id
          ? {
              ...p,
              nama: data.nama,
              kategori_id: data.kategori_id,
              sku: data.sku,
              harga: Math.round(Number(data.harga)),
              lacak_stok: data.lacak_stok,
              updated_at: now,
              variants: formattedVariants,
            }
          : p
      );
    } else {
      // Tambah baru
      const newProduct: Produk & { variants: Varian[] } = {
        id: productId,
        merchant_id: DEFAULT_MERCHANT_ID,
        nama: data.nama,
        kategori_id: data.kategori_id,
        sku: data.sku,
        harga: Math.round(Number(data.harga)),
        lacak_stok: data.lacak_stok,
        updated_at: now,
        deleted_at: null,
        variants: formattedVariants,
      };
      updated = [newProduct, ...products];
    }

    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    }

    return this.getProducts().find((p) => p.id === productId)!;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const updated = products.map((p) => (p.id === id ? { ...p, deleted_at: now } : p));
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    }
  },
};
