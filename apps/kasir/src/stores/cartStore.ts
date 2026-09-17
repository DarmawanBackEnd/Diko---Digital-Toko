// Store keranjang belanja — state management kasir
// Menggunakan kalkulasi dari @kasir-pintar/core

import { create } from 'zustand';
import type { ItemKeranjang } from '@kasir-pintar/core';
import { calculateItemSubtotal, calculateTransaction } from '@kasir-pintar/core';

interface CartState {
  items: ItemKeranjang[];
  diskonTransaksi: number;

  // Aksi
  addItem: (item: Omit<ItemKeranjang, 'qty' | 'diskon'>) => void;
  removeItem: (produkId: string, varianId: string | null) => void;
  updateQty: (produkId: string, varianId: string | null, qty: number) => void;
  updateItemDiskon: (produkId: string, varianId: string | null, diskon: number) => void;
  setDiskonTransaksi: (diskon: number) => void;
  clearCart: () => void;

  // Computed (dihitung lewat selector)
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  diskonTransaksi: 0,

  addItem: (item) =>
    set((state) => {
      // Cek apakah produk+varian sudah ada di keranjang
      const existingIndex = state.items.findIndex(
        (i) => i.produk_id === item.produk_id && i.varian_id === item.varian_id
      );

      if (existingIndex >= 0) {
        // Tambah qty
        const newItems = [...state.items];
        const existing = newItems[existingIndex];
        if (existing) {
          newItems[existingIndex] = { ...existing, qty: existing.qty + 1 };
        }
        return { items: newItems };
      }

      // Item baru
      return {
        items: [
          ...state.items,
          { ...item, qty: 1, diskon: 0 },
        ],
      };
    }),

  removeItem: (produkId, varianId) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.produk_id === produkId && i.varian_id === varianId)
      ),
    })),

  updateQty: (produkId, varianId, qty) =>
    set((state) => {
      if (qty <= 0) {
        return {
          items: state.items.filter(
            (i) => !(i.produk_id === produkId && i.varian_id === varianId)
          ),
        };
      }

      return {
        items: state.items.map((i) =>
          i.produk_id === produkId && i.varian_id === varianId
            ? { ...i, qty }
            : i
        ),
      };
    }),

  updateItemDiskon: (produkId, varianId, diskon) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.produk_id === produkId && i.varian_id === varianId
          ? { ...i, diskon }
          : i
      ),
    })),

  setDiskonTransaksi: (diskon) => set({ diskonTransaksi: diskon }),

  clearCart: () => set({ items: [], diskonTransaksi: 0 }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  },

  getTotal: () => {
    const { items, diskonTransaksi } = get();
    const result = calculateTransaction({
      items,
      diskon_transaksi: diskonTransaksi,
      metode_bayar: 'tunai',
      dibayar: 0,
    });
    return result.total;
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.qty, 0);
  },
}));
