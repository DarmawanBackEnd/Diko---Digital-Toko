// Unit tests untuk ESC/POS receipt builder
// Memastikan byte output benar tanpa perlu printer fisik

import { describe, it, expect } from 'vitest';
import {
  ESC_INIT,
  ESC_ALIGN_CENTER,
  ESC_ALIGN_LEFT,
  ESC_BOLD_ON,
  ESC_BOLD_OFF,
  ESC_DOUBLE_SIZE,
  ESC_NORMAL_SIZE,
  ESC_CUT,
  ESC_OPEN_DRAWER,
  encodeText,
  concatBytes,
  labelValueLine,
  separator,
} from '../receipt/builder.js';
import { buildReceipt, buildOpenDrawerCommand } from '../receipt/layout.js';
import type { DataStruk } from '../types/index.js';

describe('ESC/POS constants', () => {
  it('ESC_INIT = 1B 40', () => {
    expect(ESC_INIT).toEqual(new Uint8Array([0x1b, 0x40]));
  });

  it('ESC_ALIGN_CENTER = 1B 61 01', () => {
    expect(ESC_ALIGN_CENTER).toEqual(new Uint8Array([0x1b, 0x61, 0x01]));
  });

  it('ESC_ALIGN_LEFT = 1B 61 00', () => {
    expect(ESC_ALIGN_LEFT).toEqual(new Uint8Array([0x1b, 0x61, 0x00]));
  });

  it('ESC_BOLD_ON = 1B 45 01', () => {
    expect(ESC_BOLD_ON).toEqual(new Uint8Array([0x1b, 0x45, 0x01]));
  });

  it('ESC_BOLD_OFF = 1B 45 00', () => {
    expect(ESC_BOLD_OFF).toEqual(new Uint8Array([0x1b, 0x45, 0x00]));
  });

  it('ESC_DOUBLE_SIZE = 1D 21 11', () => {
    expect(ESC_DOUBLE_SIZE).toEqual(new Uint8Array([0x1d, 0x21, 0x11]));
  });

  it('ESC_NORMAL_SIZE = 1D 21 00', () => {
    expect(ESC_NORMAL_SIZE).toEqual(new Uint8Array([0x1d, 0x21, 0x00]));
  });

  it('ESC_CUT = 1D 56 42 00', () => {
    expect(ESC_CUT).toEqual(new Uint8Array([0x1d, 0x56, 0x42, 0x00]));
  });

  it('ESC_OPEN_DRAWER = 1B 70 00 19 FA', () => {
    expect(ESC_OPEN_DRAWER).toEqual(new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]));
  });
});

describe('encodeText', () => {
  it('mengkonversi string ASCII ke Uint8Array', () => {
    const result = encodeText('ABC');
    expect(result).toEqual(new Uint8Array([65, 66, 67]));
  });
});

describe('concatBytes', () => {
  it('menggabungkan dua array', () => {
    const a = new Uint8Array([1, 2]);
    const b = new Uint8Array([3, 4]);
    expect(concatBytes(a, b)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it('menggabungkan tiga array', () => {
    const a = new Uint8Array([1]);
    const b = new Uint8Array([2]);
    const c = new Uint8Array([3]);
    expect(concatBytes(a, b, c)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('menangani array kosong', () => {
    const a = new Uint8Array([]);
    const b = new Uint8Array([1]);
    expect(concatBytes(a, b)).toEqual(new Uint8Array([1]));
  });
});

describe('separator', () => {
  it('menghasilkan 32 karakter dash', () => {
    const result = separator();
    const decoded = new TextDecoder().decode(result);
    // Berisi ESC_ALIGN_LEFT prefix + 32 dashes + LF
    expect(decoded).toContain('-'.repeat(32));
  });
});

describe('labelValueLine', () => {
  it('label dan value pas 32 karakter', () => {
    const result = labelValueLine('Subtotal', '51.000');
    const decoded = new TextDecoder().decode(result);
    // Harus berisi kedua string
    expect(decoded).toContain('Subtotal');
    expect(decoded).toContain('51.000');
  });
});

describe('buildReceipt', () => {
  const sampleData: DataStruk = {
    nama_merchant: 'Kedai Kopi ABC',
    alamat_merchant: 'Jl. Merdeka No. 10',
    nomor_struk: 'K1-000123',
    tanggal: '15/09/2026 14:32',
    nama_kasir: 'Desia',
    items: [
      {
        nama: 'Kopi Susu (Dingin)',
        qty: 2,
        harga_satuan: 18000,
        subtotal: 36000,
      },
      {
        nama: 'Roti Bakar',
        qty: 1,
        harga_satuan: 15000,
        subtotal: 15000,
      },
    ],
    subtotal: 51000,
    diskon: 5000,
    total: 46000,
    metode_bayar: 'tunai',
    dibayar: 50000,
    kembalian: 4000,
  };

  it('menghasilkan Uint8Array yang tidak kosong', () => {
    const result = buildReceipt(sampleData);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('dimulai dengan ESC_INIT (1B 40)', () => {
    const result = buildReceipt(sampleData);
    expect(result[0]).toBe(0x1b);
    expect(result[1]).toBe(0x40);
  });

  it('diakhiri dengan ESC_CUT (1D 56 42 00)', () => {
    const result = buildReceipt(sampleData);
    const len = result.length;
    expect(result[len - 4]).toBe(0x1d);
    expect(result[len - 3]).toBe(0x56);
    expect(result[len - 2]).toBe(0x42);
    expect(result[len - 1]).toBe(0x00);
  });

  it('berisi nama merchant', () => {
    const result = buildReceipt(sampleData);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Kedai Kopi ABC');
  });

  it('berisi nomor struk', () => {
    const result = buildReceipt(sampleData);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('K1-000123');
  });

  it('berisi nama item', () => {
    const result = buildReceipt(sampleData);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Kopi Susu (Dingin)');
    expect(decoded).toContain('Roti Bakar');
  });

  it('berisi "Terima kasih"', () => {
    const result = buildReceipt(sampleData);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Terima kasih');
  });

  it('tidak menampilkan diskon jika 0', () => {
    const dataNoDiskon = { ...sampleData, diskon: 0 };
    const result = buildReceipt(dataNoDiskon);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).not.toContain('Diskon');
  });

  it('menampilkan diskon jika > 0', () => {
    const result = buildReceipt(sampleData);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Diskon');
  });
});

describe('buildOpenDrawerCommand', () => {
  it('berisi ESC_INIT dan ESC_OPEN_DRAWER', () => {
    const result = buildOpenDrawerCommand();
    // ESC_INIT (2 bytes) + ESC_OPEN_DRAWER (5 bytes) = 7 bytes
    expect(result.length).toBe(7);
    expect(result[0]).toBe(0x1b); // ESC_INIT
    expect(result[1]).toBe(0x40);
    expect(result[2]).toBe(0x1b); // ESC_OPEN_DRAWER
    expect(result[3]).toBe(0x70);
  });
});
