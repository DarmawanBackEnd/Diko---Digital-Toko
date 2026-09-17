// Utilitas format angka — tampilan rupiah, tanggal, dll

/**
 * Format angka ke format rupiah Indonesia
 * Contoh: 46000 → "46.000"
 */
export function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID');
}

/**
 * Format angka ke format rupiah lengkap dengan simbol
 * Contoh: 46000 → "Rp 46.000"
 */
export function formatRupiahFull(amount: number): string {
  return `Rp ${formatRupiah(amount)}`;
}

/**
 * Format tanggal ke format Indonesia untuk struk
 * Contoh: "15/09/2026 14:32"
 */
export function formatTanggalStruk(isoString: string): string {
  const date = new Date(isoString);
  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Format tanggal ke format Indonesia lengkap
 * Contoh: "Senin, 15 September 2026"
 */
export function formatTanggalLengkap(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
