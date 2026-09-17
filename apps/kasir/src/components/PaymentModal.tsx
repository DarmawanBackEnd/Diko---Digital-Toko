// Modal pembayaran Diko — Quick Tender Tunai & QRIS Statis
// Dioptimalkan untuk touchscreen Tablet/Mobile dan Keyboard Komputer
// Menggunakan icon murni dari lucide-react (Bebas Emoticon)

import { useState, useCallback, useEffect } from 'react';
import { Banknote, QrCode, X, Delete, CheckCircle2 } from 'lucide-react';
import { formatRupiah, calculateTransaction, validatePayment } from '@kasir-pintar/core';
import type { MetodeBayar } from '@kasir-pintar/core';
import { useCartStore } from '../stores/cartStore';
import { useShiftStore } from '../stores/shiftStore';
import { useAuthStore } from '../stores/authStore';
import type { ReceiptData } from './ReceiptModal';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onSuccess: (receiptData: ReceiptData) => void;
}

const COMMON_DENOMINATIONS = [10000, 20000, 50000, 100000];

export function PaymentModal({ total, onClose, onSuccess }: PaymentModalProps) {
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>('tunai');
  const [dibayar, setDibayar] = useState<string>(total.toString());

  const items = useCartStore((state) => state.items);
  const diskonTransaksi = useCartStore((state) => state.diskonTransaksi);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const currentUser = useAuthStore((state) => state.currentUser);
  const recordTransaction = useShiftStore((state) => state.recordTransaction);

  const dibayarNum = parseInt(dibayar, 10) || 0;

  const result = calculateTransaction({
    items,
    diskon_transaksi: diskonTransaksi,
    metode_bayar: metodeBayar,
    dibayar: dibayarNum,
  });

  const validation = validatePayment(result.total, dibayarNum, metodeBayar);

  const kembalian =
    metodeBayar === 'tunai' ? Math.max(0, dibayarNum - result.total) : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (validation.valid) {
          handlePay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handlePay = useCallback(() => {
    if (!validation.valid) return;

    recordTransaction(result.total, metodeBayar);

    const counter = Math.floor(100000 + Math.random() * 900000);
    const receiptData: ReceiptData = {
      nomorStruk: `D1-${counter}`,
      waktu: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      kasirNama: currentUser?.nama || 'Kasir',
      items: [...items],
      subtotal: getSubtotal(),
      diskonTransaksi,
      total: result.total,
      metodeBayar,
      dibayar: dibayarNum,
      kembalian,
    };

    clearCart();
    onSuccess(receiptData);
  }, [
    validation.valid,
    recordTransaction,
    result.total,
    metodeBayar,
    currentUser,
    items,
    getSubtotal,
    diskonTransaksi,
    dibayarNum,
    kembalian,
    clearCart,
    onSuccess,
  ]);

  const handleNumpadClick = (val: string) => {
    if (val === 'C') {
      setDibayar('0');
    } else if (val === 'DEL') {
      setDibayar((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '000') {
      setDibayar((prev) => (prev === '0' ? '0' : prev + '000'));
    } else {
      setDibayar((prev) => (prev === '0' ? val : prev + val));
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Pembayaran Transaksi" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Pembayaran</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>
              Selesaikan transaksi penjualan
            </span>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Box Total */}
          <div
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md) var(--space-lg)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Tagihan
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '26px',
                fontWeight: 800,
                marginTop: 2,
              }}
            >
              {formatRupiah(total)}
            </div>
          </div>

          {/* Toggle Metode Pembayaran — Lucide Icons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <button
              type="button"
              className={`btn ${metodeBayar === 'tunai' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                minHeight: 46,
                background: metodeBayar === 'tunai' ? 'var(--color-primary)' : undefined,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={() => {
                setMetodeBayar('tunai');
                setDibayar(total.toString());
              }}
            >
              <Banknote size={18} />
              <span>Uang Tunai</span>
            </button>
            <button
              type="button"
              className={`btn ${metodeBayar === 'qris' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                minHeight: 46,
                background: metodeBayar === 'qris' ? 'var(--color-accent)' : undefined,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={() => {
                setMetodeBayar('qris');
                setDibayar(total.toString());
              }}
            >
              <QrCode size={18} />
              <span>QRIS Statis</span>
            </button>
          </div>

          {/* Konten Tab Tunai */}
          {metodeBayar === 'tunai' && (
            <div>
              {/* Tombol Pecahan Cepat */}
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-muted-foreground)', marginBottom: 6 }}>
                Pecahan Cepat:
              </div>
              <div className="quick-amounts-grid" style={{ marginBottom: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className={`quick-amount-btn quick-amount-btn--exact ${dibayarNum === total ? 'active' : ''}`}
                  onClick={() => setDibayar(total.toString())}
                >
                  Uang Pas
                </button>
                {COMMON_DENOMINATIONS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`quick-amount-btn ${dibayarNum === amount ? 'active' : ''}`}
                    onClick={() => setDibayar(amount.toString())}
                  >
                    {formatRupiah(amount)}
                  </button>
                ))}
                {total > 10000 && (
                  <button
                    type="button"
                    className={`quick-amount-btn ${dibayarNum === Math.ceil(total / 50000) * 50000 ? 'active' : ''}`}
                    onClick={() => setDibayar((Math.ceil(total / 50000) * 50000).toString())}
                  >
                    {formatRupiah(Math.ceil(total / 50000) * 50000)}
                  </button>
                )}
              </div>

              {/* Display Uang Diterima */}
              <div className="form-group" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                  <span>Uang Diterima:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    {formatRupiah(dibayarNum)}
                  </span>
                </div>
                <input
                  type="number"
                  className="form-input"
                  style={{
                    height: 46,
                    fontSize: 'var(--text-xl)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                  value={dibayar}
                  onChange={(e) => setDibayar(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Virtual Numpad Touchscreen */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    style={{
                      height: 42,
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: k === 'C' ? 'rgba(220, 38, 38, 0.08)' : 'var(--color-card)',
                      color: k === 'C' ? 'var(--color-destructive)' : 'var(--color-foreground)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: 'var(--text-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => handleNumpadClick(k)}
                  >
                    {k === 'DEL' ? <Delete size={18} /> : k}
                  </button>
                ))}
              </div>

              {/* Kembalian Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: dibayarNum < total ? 'rgba(220, 38, 38, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${dibayarNum < total ? 'var(--color-destructive)' : 'var(--color-success)'}`,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                    color: dibayarNum < total ? 'var(--color-destructive)' : 'var(--color-success)',
                  }}
                >
                  {dibayarNum < total ? 'Kurang Bayar:' : 'Kembalian:'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 800,
                    color: dibayarNum < total ? 'var(--color-destructive)' : 'var(--color-success)',
                  }}
                >
                  {formatRupiah(dibayarNum < total ? total - dibayarNum : kembalian)}
                </span>
              </div>
            </div>
          )}

          {/* Konten Tab QRIS */}
          {metodeBayar === 'qris' && (
            <div>
              <div className="qris-container" style={{ padding: 'var(--space-md)' }}>
                <div className="qris-image-mock" style={{ width: 150, height: 150 }}>
                  <div className="qris-badge">QRIS STATIS</div>
                  <QrCode size={80} style={{ color: '#0F172A' }} />
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 4 }}>DIKO MERCHANT POS</div>
                </div>

                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-foreground)' }}>
                  Tunjukkan QRIS Outlet ke Pelanggan
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                  Pastikan pelanggan membayar tepat{' '}
                  <strong style={{ color: 'var(--color-foreground)' }}>{formatRupiah(total)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '12px 20px' }}>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 46 }} onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-pay-confirm"
            onClick={handlePay}
            disabled={!validation.valid}
          >
            <CheckCircle2 size={18} strokeWidth={2.5} />
            <span>{metodeBayar === 'tunai' ? 'Selesaikan Tunai' : 'Konfirmasi QRIS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
