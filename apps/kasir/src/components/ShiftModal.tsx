// Modal Manajemen Shift Kasir Diko — Buka Shift & Tutup Shift
// Menghitung ekspektasi uang kas fisik vs catatan sistem sesuai brief §5.1 & §8.9
// Menggunakan icon murni dari lucide-react (Bebas Emoticon)

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '@kasir-pintar/core';
import { useShiftStore } from '../stores/shiftStore';
import { useAuthStore } from '../stores/authStore';

interface ShiftModalProps {
  onClose: () => void;
}

export function ShiftModal({ onClose }: ShiftModalProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const isShiftOpen = useShiftStore((state) => state.isShiftOpen);
  const kasAwal = useShiftStore((state) => state.kasAwal);
  const dibukaPada = useShiftStore((state) => state.dibukaPada);
  const totalTunai = useShiftStore((state) => state.totalTunai);
  const totalQris = useShiftStore((state) => state.totalQris);
  const jumlahTransaksi = useShiftStore((state) => state.jumlahTransaksi);

  const openShift = useShiftStore((state) => state.openShift);
  const closeShift = useShiftStore((state) => state.closeShift);

  // Form states
  const [modalAwalInput, setModalAwalInput] = useState('150000');
  const [kasFisikInput, setKasFisikInput] = useState('');
  const [shiftSummary, setShiftSummary] = useState<ReturnType<typeof closeShift> | null>(null);

  const totalEkspektasi = kasAwal + totalTunai;
  const kasFisikNum = parseInt(kasFisikInput, 10) || 0;
  const selisih = kasFisikNum - totalEkspektasi;

  const handleOpenShift = () => {
    const nominal = parseInt(modalAwalInput, 10) || 0;
    openShift(nominal);
    onClose();
  };

  const handleCloseShift = () => {
    const summary = closeShift(kasFisikNum);
    setShiftSummary(summary);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Manajemen Shift Kasir">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {shiftSummary
                ? 'Ringkasan Tutup Shift'
                : isShiftOpen
                ? 'Tutup Shift Kasir'
                : 'Buka Shift Baru'}
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', marginTop: 2 }}>
              Kasir: {currentUser?.nama || 'Kasir'} • Device: D1
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tampilan Ringkasan Selesai Tutup Shift */}
          {shiftSummary ? (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-md)',
                  background: 'rgba(5, 150, 105, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: 'var(--text-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={18} />
                  <span>Shift Berhasil Ditutup</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>
                  Data shift telah dicatat untuk audit pemilik
                </div>
              </div>

              <div className="shift-card">
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Kas Awal Modal</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(shiftSummary.kasAwal)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Total Penjualan Tunai</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(shiftSummary.totalTunai)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Total Penjualan QRIS</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(shiftSummary.totalQris)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Total Transaksi</span>
                  <span style={{ fontWeight: 600 }}>{shiftSummary.jumlahTransaksi} transaksi</span>
                </div>
                <div className="shift-data-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>Ekspektasi Kas Fisik</span>
                  <span style={{ fontWeight: 700 }}>{formatRupiah(shiftSummary.totalEkspektasi)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ fontWeight: 700 }}>Uang Fisik Dihitung</span>
                  <span style={{ fontWeight: 700 }}>{formatRupiah(shiftSummary.kasAkhir)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ fontWeight: 700 }}>Selisih Kas</span>
                  <span
                    className={`shift-diff-badge ${
                      shiftSummary.selisih === 0
                        ? 'shift-diff-badge--zero'
                        : shiftSummary.selisih < 0
                        ? 'shift-diff-badge--neg'
                        : 'shift-diff-badge--pos'
                    }`}
                  >
                    {shiftSummary.selisih === 0
                      ? 'Pas (Rp 0)'
                      : shiftSummary.selisih > 0
                      ? `Lebih ${formatRupiah(shiftSummary.selisih)}`
                      : `Kurang ${formatRupiah(Math.abs(shiftSummary.selisih))}`}
                  </span>
                </div>
              </div>
            </div>
          ) : isShiftOpen ? (
            /* Formulir Tutup Shift Aktif */
            <div>
              <div className="shift-card">
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Dibuka Sejak</span>
                  <span style={{ fontWeight: 600 }}>{dibukaPada || 'Hari ini'}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Modal Kas Awal</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(kasAwal)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Penjualan Tunai ({jumlahTransaksi} Trx)</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{formatRupiah(totalTunai)}</span>
                </div>
                <div className="shift-data-row">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Penjualan QRIS</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(totalQris)}</span>
                </div>
                <div className="shift-data-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>Ekspektasi Uang di Laci</span>
                  <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-foreground)' }}>
                    {formatRupiah(totalEkspektasi)}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                  Hitung Uang Fisik di Laci Kasir (Rp):
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{
                      height: 44,
                      fontSize: 'var(--text-lg)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      flex: 1,
                    }}
                    placeholder="Contoh: 350000"
                    value={kasFisikInput}
                    onChange={(e) => setKasFisikInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ minHeight: 44, fontSize: 'var(--text-xs)', padding: '0 12px' }}
                    onClick={() => setKasFisikInput(totalEkspektasi.toString())}
                  >
                    Uang Sesuai
                  </button>
                </div>
              </div>

              {kasFisikInput && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Perhitungan Selisih:</span>
                  <span
                    className={`shift-diff-badge ${
                      selisih === 0
                        ? 'shift-diff-badge--zero'
                        : selisih < 0
                        ? 'shift-diff-badge--neg'
                        : 'shift-diff-badge--pos'
                    }`}
                  >
                    {selisih === 0
                      ? 'Pas (Tidak ada selisih)'
                      : selisih > 0
                      ? `Lebih +${formatRupiah(selisih)}`
                      : `Kurang -${formatRupiah(Math.abs(selisih))}`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Formulir Buka Shift Baru */
            <div>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', marginBottom: 'var(--space-md)' }}>
                  Masukkan modal kas kecil awal yang tersedia di laci uang sebelum mulai melayani pelanggan hari ini.
                </p>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                    Modal Kas Awal (Rp):
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{
                      height: 44,
                      fontSize: 'var(--text-lg)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                    value={modalAwalInput}
                    onChange={(e) => setModalAwalInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick denominations for modal awal */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {[100000, 150000, 200000, 300000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: 'var(--space-sm)', fontSize: 'var(--text-xs)' }}
                    onClick={() => setModalAwalInput(nominal.toString())}
                  >
                    {formatRupiah(nominal)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '12px 20px' }}>
          {shiftSummary ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'var(--color-primary)', width: '100%', minHeight: 44 }}
              onClick={onClose}
            >
              Selesai
            </button>
          ) : isShiftOpen ? (
            <>
              <button type="button" className="btn btn-secondary" style={{ minHeight: 44 }} onClick={onClose}>
                Kembali ke Kasir
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ minHeight: 44, padding: '0 var(--space-lg)' }}
                onClick={handleCloseShift}
                disabled={!kasFisikInput}
              >
                Konfirmasi Tutup Shift
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" style={{ minHeight: 44 }} onClick={onClose}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-pay-confirm"
                style={{ minHeight: 46, padding: '0 var(--space-xl)', fontSize: 'var(--text-sm)', fontWeight: 800 }}
                onClick={handleOpenShift}
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
                <span>Mulai Shift</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
