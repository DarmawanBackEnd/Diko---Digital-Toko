// ESC/POS command builder untuk printer thermal 58mm
// Fungsi murni yang mengembalikan Uint8Array — bisa di-unit-test tanpa printer
// Referensi perintah dari brief §7

// === Konstanta perintah ESC/POS ===

/** Inisialisasi printer */
export const ESC_INIT = new Uint8Array([0x1b, 0x40]);

/** Rata tengah */
export const ESC_ALIGN_CENTER = new Uint8Array([0x1b, 0x61, 0x01]);

/** Rata kiri */
export const ESC_ALIGN_LEFT = new Uint8Array([0x1b, 0x61, 0x00]);

/** Tebal on */
export const ESC_BOLD_ON = new Uint8Array([0x1b, 0x45, 0x01]);

/** Tebal off */
export const ESC_BOLD_OFF = new Uint8Array([0x1b, 0x45, 0x00]);

/** Ukuran ganda (tinggi + lebar) */
export const ESC_DOUBLE_SIZE = new Uint8Array([0x1d, 0x21, 0x11]);

/** Ukuran normal */
export const ESC_NORMAL_SIZE = new Uint8Array([0x1d, 0x21, 0x00]);

/** Feed dan potong kertas */
export const ESC_CUT = new Uint8Array([0x1d, 0x56, 0x42, 0x00]);

/** Buka laci kas */
export const ESC_OPEN_DRAWER = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);

/** Line feed */
export const ESC_LF = new Uint8Array([0x0a]);

// === Builder Functions ===

/**
 * Encode string ke Uint8Array (CP437/ASCII)
 * Printer thermal 58mm menggunakan encoding sederhana
 */
export function encodeText(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Gabungkan beberapa Uint8Array menjadi satu
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Buat baris teks rata tengah
 */
export function centerText(text: string): Uint8Array {
  return concatBytes(
    ESC_ALIGN_CENTER,
    encodeText(text),
    ESC_LF
  );
}

/**
 * Buat baris teks rata kiri
 */
export function leftText(text: string): Uint8Array {
  return concatBytes(
    ESC_ALIGN_LEFT,
    encodeText(text),
    ESC_LF
  );
}

/**
 * Buat teks tebal
 */
export function boldText(text: string): Uint8Array {
  return concatBytes(
    ESC_BOLD_ON,
    encodeText(text),
    ESC_BOLD_OFF
  );
}

/**
 * Buat teks ukuran ganda (untuk nama merchant)
 */
export function doubleSizeText(text: string): Uint8Array {
  return concatBytes(
    ESC_DOUBLE_SIZE,
    encodeText(text),
    ESC_NORMAL_SIZE,
    ESC_LF
  );
}

/**
 * Buat garis pemisah (32 karakter untuk 58mm)
 */
export function separator(): Uint8Array {
  return concatBytes(
    ESC_ALIGN_LEFT,
    encodeText('-'.repeat(32)),
    ESC_LF
  );
}

/**
 * Buat baris dengan label di kiri dan nilai di kanan
 * Total lebar 32 karakter untuk printer 58mm
 */
export function labelValueLine(label: string, value: string): Uint8Array {
  const maxWidth = 32;
  const spaces = maxWidth - label.length - value.length;
  const line = spaces > 0
    ? label + ' '.repeat(spaces) + value
    : label + ' ' + value; // Fallback jika terlalu panjang
  return leftText(line);
}

/**
 * Buat beberapa baris kosong (feed)
 */
export function feed(lines: number = 1): Uint8Array {
  const feeds: Uint8Array[] = [];
  for (let i = 0; i < lines; i++) {
    feeds.push(ESC_LF);
  }
  return concatBytes(...feeds);
}
