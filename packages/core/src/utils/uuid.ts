// Wrapper UUIDv7 — ID digenerate di client (§4.1)
// UUIDv7 dipilih karena terurut berdasarkan waktu, indeks Postgres tetap efisien

import { uuidv7 } from 'uuidv7';

/**
 * Generate UUIDv7 baru
 * Digunakan di perangkat kasir untuk membuat ID yang dijamin unik tanpa server
 */
export function generateId(): string {
  return uuidv7();
}
