// Unit tests untuk fungsi kalkulasi — Kriteria Penerimaan §8 poin 8
// Memastikan total transaksi dihitung identik di core dan backoffice

import { describe, it, expect } from 'vitest';
import {
  calculateItemSubtotal,
  calculateEffectivePrice,
  calculateTransaction,
  validatePayment,
  calculateShiftBalance,
  generateNomorStruk,
} from '../calculations/index';
import type { ItemKeranjang, InputTransaksi } from '../types/index';

describe('calculateItemSubtotal', () => {
  it('menghitung subtotal tanpa diskon', () => {
    const item: ItemKeranjang = {
      produk_id: 'test',
      varian_id: null,
      nama_produk: 'Kopi Susu',
      harga_satuan: 18000,
      qty: 2,
      diskon: 0,
    };
    expect(calculateItemSubtotal(item)).toBe(36000);
  });

  it('menghitung subtotal dengan diskon per item', () => {
    const item: ItemKeranjang = {
      produk_id: 'test',
      varian_id: null,
      nama_produk: 'Roti Bakar',
      harga_satuan: 15000,
      qty: 1,
      diskon: 2000,
    };
    expect(calculateItemSubtotal(item)).toBe(13000);
  });

  it('subtotal tidak pernah negatif', () => {
    const item: ItemKeranjang = {
      produk_id: 'test',
      varian_id: null,
      nama_produk: 'Test',
      harga_satuan: 5000,
      qty: 1,
      diskon: 10000, // Diskon lebih besar dari harga
    };
    expect(calculateItemSubtotal(item)).toBe(0);
  });

  it('menghitung qty besar dengan benar (integer math)', () => {
    const item: ItemKeranjang = {
      produk_id: 'test',
      varian_id: null,
      nama_produk: 'Item Banyak',
      harga_satuan: 99000,
      qty: 100,
      diskon: 0,
    };
    expect(calculateItemSubtotal(item)).toBe(9900000);
  });
});

describe('calculateEffectivePrice', () => {
  it('harga produk tanpa varian', () => {
    expect(calculateEffectivePrice(18000)).toBe(18000);
  });

  it('harga produk + varian positif (misalnya Dingin)', () => {
    expect(calculateEffectivePrice(18000, 3000)).toBe(21000);
  });

  it('harga produk + varian negatif (misalnya diskon size S)', () => {
    expect(calculateEffectivePrice(18000, -2000)).toBe(16000);
  });
});

describe('calculateTransaction', () => {
  it('transaksi sederhana tanpa diskon', () => {
    const input: InputTransaksi = {
      items: [
        {
          produk_id: 'p1',
          varian_id: null,
          nama_produk: 'Kopi Susu',
          harga_satuan: 18000,
          qty: 2,
          diskon: 0,
        },
        {
          produk_id: 'p2',
          varian_id: null,
          nama_produk: 'Roti Bakar',
          harga_satuan: 15000,
          qty: 1,
          diskon: 0,
        },
      ],
      diskon_transaksi: 0,
      metode_bayar: 'tunai',
      dibayar: 51000,
    };

    const result = calculateTransaction(input);
    expect(result.subtotal).toBe(51000);
    expect(result.diskon).toBe(0);
    expect(result.total).toBe(51000);
    expect(result.kembalian).toBe(0);
  });

  it('transaksi dengan diskon item + diskon transaksi (Kriteria §8.8)', () => {
    const input: InputTransaksi = {
      items: [
        {
          produk_id: 'p1',
          varian_id: 'v1',
          nama_produk: 'Kopi Susu (Dingin)',
          harga_satuan: 21000, // 18000 + 3000 varian
          qty: 2,
          diskon: 2000, // Diskon per item
        },
        {
          produk_id: 'p2',
          varian_id: null,
          nama_produk: 'Roti Bakar',
          harga_satuan: 15000,
          qty: 1,
          diskon: 0,
        },
      ],
      diskon_transaksi: 5000,
      metode_bayar: 'tunai',
      dibayar: 50000,
    };

    const result = calculateTransaction(input);
    // Item 1: (21000 × 2) - 2000 = 40000
    // Item 2: (15000 × 1) - 0 = 15000
    // Subtotal: 40000 + 15000 = 55000
    // Total: 55000 - 5000 = 50000
    // Kembalian: 50000 - 50000 = 0
    expect(result.subtotal).toBe(55000);
    expect(result.diskon).toBe(5000);
    expect(result.total).toBe(50000);
    expect(result.kembalian).toBe(0);
  });

  it('transaksi tunai dengan kembalian', () => {
    const input: InputTransaksi = {
      items: [
        {
          produk_id: 'p1',
          varian_id: null,
          nama_produk: 'Es Teh',
          harga_satuan: 5000,
          qty: 1,
          diskon: 0,
        },
      ],
      diskon_transaksi: 0,
      metode_bayar: 'tunai',
      dibayar: 10000,
    };

    const result = calculateTransaction(input);
    expect(result.total).toBe(5000);
    expect(result.kembalian).toBe(5000);
  });

  it('transaksi QRIS tidak menghasilkan kembalian', () => {
    const input: InputTransaksi = {
      items: [
        {
          produk_id: 'p1',
          varian_id: null,
          nama_produk: 'Kopi',
          harga_satuan: 18000,
          qty: 1,
          diskon: 0,
        },
      ],
      diskon_transaksi: 0,
      metode_bayar: 'qris',
      dibayar: 18000,
    };

    const result = calculateTransaction(input);
    expect(result.kembalian).toBe(0);
  });

  it('total tidak pernah negatif meski diskon besar', () => {
    const input: InputTransaksi = {
      items: [
        {
          produk_id: 'p1',
          varian_id: null,
          nama_produk: 'Sample',
          harga_satuan: 10000,
          qty: 1,
          diskon: 0,
        },
      ],
      diskon_transaksi: 50000, // Diskon lebih besar dari subtotal
      metode_bayar: 'tunai',
      dibayar: 0,
    };

    const result = calculateTransaction(input);
    expect(result.total).toBe(0);
  });
});

describe('validatePayment', () => {
  it('tunai cukup → valid', () => {
    const result = validatePayment(50000, 50000, 'tunai');
    expect(result.valid).toBe(true);
  });

  it('tunai kurang → invalid', () => {
    const result = validatePayment(50000, 40000, 'tunai');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('kurang');
  });

  it('QRIS selalu valid (hanya pencatatan)', () => {
    const result = validatePayment(50000, 50000, 'qris');
    expect(result.valid).toBe(true);
  });
});

describe('calculateShiftBalance', () => {
  it('kas sesuai ekspektasi → selisih 0', () => {
    const result = calculateShiftBalance(200000, 800000, 1000000);
    expect(result.ekspektasi).toBe(1000000);
    expect(result.selisih).toBe(0);
  });

  it('kas lebih → selisih positif', () => {
    const result = calculateShiftBalance(200000, 800000, 1010000);
    expect(result.ekspektasi).toBe(1000000);
    expect(result.selisih).toBe(10000);
  });

  it('kas kurang → selisih negatif', () => {
    const result = calculateShiftBalance(200000, 800000, 990000);
    expect(result.ekspektasi).toBe(1000000);
    expect(result.selisih).toBe(-10000);
  });
});

describe('generateNomorStruk', () => {
  it('format K1-000001', () => {
    expect(generateNomorStruk('K1', 1)).toBe('K1-000001');
  });

  it('format K2-000123', () => {
    expect(generateNomorStruk('K2', 123)).toBe('K2-000123');
  });

  it('counter besar', () => {
    expect(generateNomorStruk('K1', 999999)).toBe('K1-999999');
  });
});
