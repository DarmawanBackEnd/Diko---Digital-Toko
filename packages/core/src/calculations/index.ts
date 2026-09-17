// Fungsi kalkulasi total transaksi
// SATU-SATUNYA tempat logika harga — dipakai kasir dan backoffice
// Jangan duplikasi logika ini di tempat lain (§4, aturan packages/core)

import type { ItemKeranjang, InputTransaksi } from '../types/index';

/**
 * Hitung subtotal satu item keranjang
 * subtotal = (harga_satuan × qty) - diskon
 * Semua nilai dalam rupiah penuh (integer)
 */
export function calculateItemSubtotal(item: ItemKeranjang): number {
  const bruto = item.harga_satuan * item.qty;
  const subtotal = bruto - item.diskon;
  // Subtotal tidak boleh negatif
  return Math.max(0, subtotal);
}

/**
 * Hitung harga efektif produk + varian
 * Harga = harga dasar produk + selisih harga varian
 */
export function calculateEffectivePrice(
  hargaProduk: number,
  selisihHargaVarian: number = 0
): number {
  return hargaProduk + selisihHargaVarian;
}

/**
 * Hitung seluruh komponen transaksi dari input keranjang
 * Mengembalikan subtotal, total setelah diskon, dan kembalian
 */
export function calculateTransaction(input: InputTransaksi): {
  subtotal: number;
  diskon: number;
  total: number;
  kembalian: number;
} {
  // Hitung subtotal = jumlah seluruh item subtotal
  const subtotal = input.items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item);
  }, 0);

  // Total = subtotal - diskon transaksi (tidak boleh negatif)
  const total = Math.max(0, subtotal - input.diskon_transaksi);

  // Kembalian hanya untuk tunai, QRIS selalu pas
  const kembalian = input.metode_bayar === 'tunai'
    ? Math.max(0, input.dibayar - total)
    : 0;

  return {
    subtotal,
    diskon: input.diskon_transaksi,
    total,
    kembalian,
  };
}

/**
 * Validasi bahwa pembayaran cukup untuk menutupi total
 * Untuk QRIS, dibayar harus sama persis dengan total
 * Untuk tunai, dibayar harus >= total
 */
export function validatePayment(
  total: number,
  dibayar: number,
  metodeBayar: 'tunai' | 'qris'
): { valid: boolean; message: string } {
  if (metodeBayar === 'qris') {
    // QRIS: dicatat pas, tidak ada kembalian
    return { valid: true, message: '' };
  }

  if (dibayar < total) {
    return {
      valid: false,
      message: `Pembayaran kurang. Total: ${total}, Dibayar: ${dibayar}`,
    };
  }

  return { valid: true, message: '' };
}

/**
 * Hitung ekspektasi kas saat tutup shift
 * ekspektasi = kas_awal + total_tunai
 * Selisih = kas_akhir_fisik - ekspektasi
 */
export function calculateShiftBalance(
  kasAwal: number,
  totalTunai: number,
  kasAkhirFisik: number
): { ekspektasi: number; selisih: number } {
  const ekspektasi = kasAwal + totalTunai;
  const selisih = kasAkhirFisik - ekspektasi;
  return { ekspektasi, selisih };
}

/**
 * Generate nomor struk berdasarkan kode device dan counter
 * Format: {kode_device}-{counter 6 digit} → 'K1-000123'
 */
export function generateNomorStruk(kodeDevice: string, counter: number): string {
  const paddedCounter = counter.toString().padStart(6, '0');
  return `${kodeDevice}-${paddedCounter}`;
}
