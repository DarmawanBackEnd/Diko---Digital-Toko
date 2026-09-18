// Modal preview struk thermal 58mm Diko
// Mendukung Dual Receipt: Struk Pelanggan & Tiket Dapur (Kitchen Ticket)
// Desain kertas struk realistis 32 kolom font monospaced ESC/POS
// Menggunakan icon murni dari lucide-react (Bebas Emoticon)

import { useState } from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  RotateCcw,
  Receipt,
  ChefHat,
  Layers,
} from 'lucide-react';
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
  nomorMeja?: string;
  catatanPesanan?: string;
}

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
  onNewTransaction: () => void;
}

export function ReceiptModal({ data, onClose, onNewTransaction }: ReceiptModalProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen'>('customer');
  const [autoKitchen, setAutoKitchen] = useState<boolean>(() => {
    return localStorage.getItem('diko_auto_kitchen_ticket') === 'true';
  });
  const [printingType, setPrintingType] = useState<'customer' | 'kitchen' | 'both' | null>(null);
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string | null>(null);

  const totalQty = data.items.reduce((sum, item) => sum + item.qty, 0);

  const handleToggleAutoKitchen = (enabled: boolean) => {
    setAutoKitchen(enabled);
    localStorage.setItem('diko_auto_kitchen_ticket', String(enabled));
  };

  const handlePrint = (type: 'customer' | 'kitchen' | 'both') => {
    setPrintingType(type);
    // Simulasi pengiriman data ESC/POS 58mm ke printer Bluetooth
    setTimeout(() => {
      setPrintingType(null);
      if (type === 'customer') {
        setPrintSuccessMsg('Struk Pelanggan berhasil dikirim ke printer (ESC/POS 58mm)');
      } else if (type === 'kitchen') {
        setPrintSuccessMsg('Tiket Dapur berhasil dikirim ke printer (ESC/POS 58mm)');
      } else {
        setPrintSuccessMsg('Struk Pelanggan & Tiket Dapur berhasil dikirim ke printer (2 struk)');
      }
      setTimeout(() => setPrintSuccessMsg(null), 3000);
    }, 800);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Struk Pembayaran Diko">
      <div className="modal" style={{ maxWidth: 480, background: '#18181B', borderRadius: 16 }}>
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{ borderBottom: '1px solid #27272A', color: '#F4F4F5', justifyContent: 'space-between', padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-success)', display: 'flex' }}>
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Transaksi Berhasil</div>
              <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>{data.nomorStruk} • {data.waktu}</div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            style={{ color: '#A1A1AA', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '16px 20px', maxHeight: '72vh', overflowY: 'auto' }}>
          
          {/* Tab Selector: Struk Pelanggan vs Tiket Dapur */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              background: '#27272A',
              padding: 4,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'customer' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'customer' ? '#FFFFFF' : '#A1A1AA',
                fontWeight: activeTab === 'customer' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
              }}
            >
              <Receipt size={16} strokeWidth={activeTab === 'customer' ? 2.5 : 2} />
              <span>Struk Pelanggan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kitchen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'kitchen' ? '#A06A1B' : 'transparent',
                color: activeTab === 'kitchen' ? '#FFFFFF' : '#A1A1AA',
                fontWeight: activeTab === 'kitchen' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
              }}
            >
              <ChefHat size={16} strokeWidth={activeTab === 'kitchen' ? 2.5 : 2} />
              <span>Tiket Dapur</span>
            </button>
          </div>

          {/* Paper Thermal Receipt Container */}
          <div className="receipt-wrapper" style={{ padding: '0 0 16px 0' }}>
            <div className="receipt-paper">
              {activeTab === 'customer' ? (
                /* === TAMPILAN 1: STRUK PELANGGAN === */
                <>
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
                  {data.nomorMeja && (
                    <div className="receipt-row" style={{ fontWeight: 700 }}>
                      <span>Meja: {data.nomorMeja}</span>
                    </div>
                  )}

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
                      {item.catatan && (
                        <div style={{ fontSize: 10, color: '#4B5563', fontStyle: 'italic' }}>
                          * {item.catatan}
                        </div>
                      )}
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
                </>
              ) : (
                /* === TAMPILAN 2: TIKET PESANAN DAPUR === */
                <>
                  <div className="receipt-header" style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        background: '#18181B',
                        color: '#FFFDF9',
                        fontWeight: 800,
                        fontSize: 14,
                        letterSpacing: 1,
                        borderRadius: 2,
                        marginBottom: 4,
                      }}
                    >
                      ** TIKET DAPUR **
                    </div>
                    <div className="receipt-sub" style={{ fontWeight: 600 }}>Pesanan Masuk (Kitchen / Bar)</div>
                  </div>

                  <div style={{ borderTop: '2px solid #1A1A1A', margin: '6px 0' }} />

                  <div className="receipt-row" style={{ fontWeight: 700 }}>
                    <span>No   : {data.nomorStruk}</span>
                    <span>{data.waktu}</span>
                  </div>
                  {data.nomorMeja && (
                    <div className="receipt-row" style={{ fontSize: 13, fontWeight: 800, color: '#A06A1B' }}>
                      <span>MEJA : {data.nomorMeja}</span>
                    </div>
                  )}
                  <div className="receipt-row">
                    <span>Kasir: {data.kasirNama}</span>
                    <span>Dev: D1</span>
                  </div>

                  <div className="receipt-divider" />

                  <div className="receipt-row" style={{ fontWeight: 800, letterSpacing: 0.5 }}>
                    <span>QTY  PESANAN</span>
                  </div>
                  <div style={{ borderTop: '1px solid #1A1A1A', margin: '4px 0 8px 0' }} />

                  {/* Kitchen Items - Bold, Clear, High Contrast */}
                  {data.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            background: '#F4E8D1',
                            padding: '1px 5px',
                            borderRadius: 3,
                            color: '#78350F',
                          }}
                        >
                          [{item.qty}x]
                        </span>
                        <div style={{ fontWeight: 700, fontSize: 12.5, flex: 1, lineHeight: 1.3 }}>
                          {item.nama_produk}
                        </div>
                      </div>
                      {item.catatan && (
                        <div style={{ marginLeft: 36, fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                          * {item.catatan}
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{ borderTop: '2px solid #1A1A1A', margin: '8px 0' }} />

                  <div className="receipt-row" style={{ fontWeight: 800, fontSize: 13 }}>
                    <span>TOTAL ITEM</span>
                    <span>{totalQty} Porsi</span>
                  </div>

                  {data.catatanPesanan && (
                    <div style={{ marginTop: 6, padding: '4px 6px', background: '#F4F4F5', borderRadius: 4, fontSize: 11 }}>
                      <strong>Catatan:</strong> {data.catatanPesanan}
                    </div>
                  )}

                  <div style={{ borderTop: '1px dashed #71717A', margin: '10px 0 6px 0' }} />

                  <div style={{ textAlign: 'center', fontSize: 10, color: '#6B7280', fontStyle: 'italic' }}>
                    * Verifikasi pesanan sebelum disajikan *
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pengaturan Cepat: Otomatis Cetak Dapur */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#27272A',
              borderRadius: 8,
              fontSize: 12.5,
              color: '#D4D4D8',
              marginTop: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChefHat size={16} style={{ color: '#F59E0B' }} />
              <span>Otomatis cetak tiket dapur setiap transaksi</span>
            </div>
            <input
              type="checkbox"
              id="auto-kitchen-toggle"
              checked={autoKitchen}
              onChange={(e) => handleToggleAutoKitchen(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                cursor: 'pointer',
                accentColor: 'var(--color-success)',
              }}
            />
          </div>

          {/* Feedback print status */}
          {printSuccessMsg && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid var(--color-success)',
                borderRadius: 8,
                color: '#34D399',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{printSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer: Action Buttons */}
        <div
          className="modal-footer"
          style={{
            borderTop: '1px solid #27272A',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Baris Tombol Print */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                background: '#27272A',
                borderColor: activeTab === 'customer' ? 'var(--color-primary)' : '#3F3F46',
                color: '#F4F4F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 44,
                padding: '0 8px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
              onClick={() => handlePrint('customer')}
              disabled={printingType !== null}
            >
              <Printer size={16} />
              <span>{printingType === 'customer' ? 'Mencetak...' : 'Struk Kasir'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                background: '#27272A',
                borderColor: activeTab === 'kitchen' ? '#A06A1B' : '#3F3F46',
                color: '#F4F4F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 44,
                padding: '0 8px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
              onClick={() => handlePrint('kitchen')}
              disabled={printingType !== null}
            >
              <ChefHat size={16} style={{ color: '#F59E0B' }} />
              <span>{printingType === 'kitchen' ? 'Mencetak...' : 'Tiket Dapur'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                background: '#27272A',
                borderColor: '#3F3F46',
                color: '#F4F4F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 44,
                padding: '0 8px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
              onClick={() => handlePrint('both')}
              disabled={printingType !== null}
            >
              <Layers size={16} style={{ color: '#38BDF8' }} />
              <span>{printingType === 'both' ? 'Mencetak...' : 'Cetak 2 Struk'}</span>
            </button>
          </div>

          {/* Tombol Utama Transaksi Baru */}
          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              minHeight: 48,
              width: '100%',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 8,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
            }}
            onClick={onNewTransaction}
          >
            <RotateCcw size={18} />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
