// Layout struk untuk printer thermal 58mm — lebar cetak 32 karakter
// Menyusun data transaksi menjadi byte array ESC/POS siap cetak
// Format sesuai template brief §7

import type { DataStruk } from '../types/index';
import { formatRupiah } from '../utils/format';
import {
  ESC_INIT,
  ESC_CUT,
  ESC_OPEN_DRAWER,
  concatBytes,
  centerText,
  doubleSizeText,
  separator,
  leftText,
  labelValueLine,
  feed,
  ESC_ALIGN_CENTER,
  boldText,
  ESC_LF,
  ESC_ALIGN_LEFT,
} from './builder';

/**
 * Bangun seluruh byte array struk dari data transaksi
 * Mengembalikan Uint8Array siap kirim ke printer Bluetooth
 *
 * Layout:
 *        NAMA MERCHANT
 *       Alamat merchant
 * --------------------------------
 * No  : K1-000123
 * Tgl : 15/09/2026 14:32
 * Kasir: Desia
 * --------------------------------
 * Kopi Susu (Dingin)
 *   2 x 18.000           36.000
 * --------------------------------
 * Subtotal               51.000
 * Diskon                 -5.000
 * TOTAL                  46.000
 * Tunai                  50.000
 * Kembali                 4.000
 * --------------------------------
 *         Terima kasih
 */
export function buildReceipt(data: DataStruk): Uint8Array {
  const parts: Uint8Array[] = [];

  // Inisialisasi printer
  parts.push(ESC_INIT);

  // Header — nama merchant (ukuran ganda, rata tengah)
  parts.push(ESC_ALIGN_CENTER);
  parts.push(doubleSizeText(data.nama_merchant));

  // Alamat merchant (rata tengah, ukuran normal)
  parts.push(centerText(data.alamat_merchant));
  parts.push(feed(1));

  // Garis pemisah
  parts.push(separator());

  // Info transaksi
  parts.push(leftText(`No   : ${data.nomor_struk}`));
  parts.push(leftText(`Tgl  : ${data.tanggal}`));
  parts.push(leftText(`Kasir: ${data.nama_kasir}`));

  // Garis pemisah
  parts.push(separator());

  // Daftar item
  for (const item of data.items) {
    // Baris 1: nama produk (termasuk varian)
    parts.push(leftText(item.nama));

    // Baris 2: qty x harga           subtotal
    const qtyHarga = `  ${item.qty} x ${formatRupiah(item.harga_satuan)}`;
    const subtotalStr = formatRupiah(item.subtotal);
    parts.push(labelValueLine(qtyHarga, subtotalStr));
  }

  // Garis pemisah
  parts.push(separator());

  // Ringkasan
  parts.push(labelValueLine('Subtotal', formatRupiah(data.subtotal)));

  if (data.diskon > 0) {
    parts.push(labelValueLine('Diskon', `-${formatRupiah(data.diskon)}`));
  }

  // Total — tebal
  parts.push(ESC_ALIGN_LEFT);
  const totalLabel = 'TOTAL';
  const totalValue = formatRupiah(data.total);
  const totalSpaces = 32 - totalLabel.length - totalValue.length;
  const totalLine = totalLabel + ' '.repeat(Math.max(1, totalSpaces)) + totalValue;
  parts.push(boldText(totalLine));
  parts.push(ESC_LF);

  // Metode bayar
  const metodeBayarLabel = data.metode_bayar === 'tunai' ? 'Tunai' : 'QRIS';
  parts.push(labelValueLine(metodeBayarLabel, formatRupiah(data.dibayar)));

  if (data.metode_bayar === 'tunai' && data.kembalian > 0) {
    parts.push(labelValueLine('Kembali', formatRupiah(data.kembalian)));
  }

  // Garis pemisah
  parts.push(separator());

  // Footer
  parts.push(feed(1));
  parts.push(centerText('Terima kasih'));
  parts.push(feed(3));

  // Potong kertas
  parts.push(ESC_CUT);

  return concatBytes(...parts);
}

/**
 * Buat perintah buka laci kas
 */
export function buildOpenDrawerCommand(): Uint8Array {
  return concatBytes(ESC_INIT, ESC_OPEN_DRAWER);
}

/**
 * Bangun byte array tiket dapur (kitchen ticket) untuk printer thermal 58mm
 * Khusus untuk operasional F&B / Resto / Cafe:
 * - Menampilkan No Struk, Meja (jika ada), Waktu, Kasir
 * - Menampilkan daftar pesanan & QTY dengan huruf tebal dan format jelas
 * - Menampilkan catatan varian / pesanan jika ada
 * - TANPA rincian harga / nominal uang (fokus eksekusi pesanan dapur)
 */
export function buildKitchenTicket(data: DataStruk): Uint8Array {
  const parts: Uint8Array[] = [];

  // Inisialisasi printer
  parts.push(ESC_INIT);

  // Header — TIKET PESANAN DAPUR (ukuran ganda, rata tengah)
  parts.push(ESC_ALIGN_CENTER);
  parts.push(doubleSizeText('TIKET DAPUR'));
  parts.push(feed(1));

  // Garis pemisah ganda
  parts.push(separator('='));

  // Info transaksi
  parts.push(leftText(`No   : ${data.nomor_struk}`));
  if (data.nomor_meja) {
    parts.push(ESC_ALIGN_LEFT);
    parts.push(boldText(`Meja : ${data.nomor_meja}`));
    parts.push(ESC_LF);
  }
  parts.push(leftText(`Waktu: ${data.tanggal}`));
  parts.push(leftText(`Kasir: ${data.nama_kasir}`));

  // Garis pemisah
  parts.push(separator());

  // Header kolom pesanan
  parts.push(ESC_ALIGN_LEFT);
  parts.push(boldText('QTY  PESANAN'));
  parts.push(ESC_LF);
  parts.push(separator());

  let totalQty = 0;

  // Daftar item dapur
  for (const item of data.items) {
    totalQty += item.qty;
    // Baris pesanan: [ QTY ] NAMA ITEM (tebal)
    const qtyTag = `[ ${item.qty} ] `;
    const itemLine = `${qtyTag}${item.nama}`;
    parts.push(ESC_ALIGN_LEFT);
    parts.push(boldText(itemLine));
    parts.push(ESC_LF);

    // Jika ada catatan khusus item
    if (item.catatan) {
      parts.push(leftText(`      * ${item.catatan}`));
    }
  }

  // Garis pemisah
  parts.push(separator());

  // Ringkasan total kuantitas
  parts.push(ESC_ALIGN_LEFT);
  const itemLabel = 'TOTAL ITEM';
  const itemValue = `${totalQty}`;
  const itemSpaces = 32 - itemLabel.length - itemValue.length;
  const itemLine = itemLabel + ' '.repeat(Math.max(1, itemSpaces)) + itemValue;
  parts.push(boldText(itemLine));
  parts.push(ESC_LF);

  if (data.catatan_pesanan) {
    parts.push(feed(1));
    parts.push(ESC_ALIGN_LEFT);
    parts.push(boldText(`Catatan: ${data.catatan_pesanan}`));
    parts.push(ESC_LF);
  }

  parts.push(separator('='));

  // Feed dan potong kertas
  parts.push(feed(3));
  parts.push(ESC_CUT);

  return concatBytes(...parts);
}

