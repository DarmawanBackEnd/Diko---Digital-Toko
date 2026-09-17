// Modal preview struk thermal 58mm Diko
// Desain kertas struk realistis 32 kolom font A monospaced
// Menggunakan icon murni dari lucide-react (Bebas Emoticon)

import { useState } from 'react';
import { CheckCircle2, X, Printer, RotateCcw } from 'lucide-react';
import { formatRupiah } from '@kasir-pintar/core';
import type { ItemKeranjang, MetodeBayar } from '@kasir-pintar/core';

export interface ReceiptData {
  nomorStruk: string;
  waktu: string;
  kasirNama: string;
  items: ItemKeranjang[];
  subtotal: number;
  diskonTransaksi: number;
  total: number;
  metodeBayar: MetodeBayar;
  dibayar: number;
  kembalian: number;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
  onNewTransaction: () => void;
}

export function ReceiptModal({ data, onClose, onNewTransaction }: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // Simulasi pengiriman data ESC/POS 58mm ke printer Bluetooth
    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Struk Pembayaran Diko">
      <div className="modal" style={{ maxWidth: 440, background: '#18181B' }}>
        <div
          className="modal-header"
          style={{ borderBottom: '1px solid #27272A', color: '#F4F4F5', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--color-success)', display: 'flex' }}>
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>Transaksi Berhasil</span>
          </div>
          <button
            type="button"
            className="modal-close"
            style={{ color: '#A1A1AA' }}
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
          {/* Paper Thermal Receipt Container */}
          <div className="receipt-wrapper">
            <div className="receipt-paper">
              <div className="receipt-header">
                <div className="receipt-brand">DIKO - DIGITAL TOKO</div>
                <div className="receipt-sub">Outlet Pusat — Jakarta</div>
                <div className="receipt-sub">Telp: 0812-3456-7890</div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>No : {data.nomorStruk}</span>
                <span>{data.waktu}</span>
              </div>
              <div className="receipt-row">
                <span>Kasir: {data.kasirNama}</span>
                <span>Dev: D1 (Tablet)</span>
              </div>

              <div className="receipt-divider" />

              {/* Items */}
              {data.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <div className="receipt-item-name">{item.nama_produk}</div>
                  <div className="receipt-item-detail">
                    <span>
                      {item.qty} x {formatRupiah(item.harga_satuan)}
                    </span>
                    <span>{formatRupiah(item.qty * item.harga_satuan)}</span>
                  </div>
                  {item.diskon > 0 && (
                    <div className="receipt-item-detail" style={{ color: '#DC2626' }}>
                      <span>Diskon item</span>
                      <span>-{formatRupiah(item.diskon * item.qty)}</span>
                    </div>
                  )}
                </div>
              ))}

              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>Subtotal</span>
                <span>{formatRupiah(data.subtotal)}</span>
              </div>
              {data.diskonTransaksi > 0 && (
                <div className="receipt-row" style={{ color: '#DC2626' }}>
                  <span>Diskon Transaksi</span>
                  <span>-{formatRupiah(data.diskonTransaksi)}</span>
                </div>
              )}
              <div className="receipt-row receipt-row--bold" style={{ marginTop: 4 }}>
                <span>TOTAL</span>
                <span>{formatRupiah(data.total)}</span>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>Metode Bayar</span>
                <span style={{ textTransform: 'uppercase' }}>{data.metodeBayar}</span>
              </div>
              <div className="receipt-row">
                <span>Dibayar</span>
                <span>{formatRupiah(data.dibayar)}</span>
              </div>
              {data.metodeBayar === 'tunai' && (
                <div className="receipt-row receipt-row--bold">
                  <span>Kembalian</span>
                  <span>{formatRupiah(data.kembalian)}</span>
                </div>
              )}

              <div className="receipt-divider" />

              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11 }}>
                <div style={{ fontWeight: 600 }}>TERIMA KASIH</div>
                <div style={{ color: '#6B7280', fontSize: 10, marginTop: 2 }}>
                  Sistem Kasir Pintar Diko (Offline-Ready)
                </div>
              </div>
            </div>
          </div>

          {/* Feedback print status */}
          {printSuccess && (
            <div
              style={{
                marginTop: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                background: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                color: '#34D399',
                fontSize: 'var(--text-xs)',
                textAlign: 'center',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={14} />
              <span>Struk terkirim ke printer thermal Bluetooth (ESC/POS 58mm)</span>
            </div>
          )}
        </div>

        <div
          className="modal-footer"
          style={{
            borderTop: '1px solid #27272A',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-lg) var(--space-xl)',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              background: '#27272A',
              borderColor: '#3F3F46',
              color: '#F4F4F5',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 46,
            }}
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <Printer size={18} />
            <span>{isPrinting ? 'Mencetak...' : 'Cetak Struk'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: 'var(--color-success)',
              minHeight: 46,
              padding: '0 var(--space-xl)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onClick={onNewTransaction}
          >
            <RotateCcw size={16} />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
