// Modal pemilihan varian dan catatan pesanan Diko
// Touch-first, tombol besar, ergonomis untuk iPad/tablet dan komputer

import { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { formatRupiah } from '@kasir-pintar/core';

export interface ProductItem {
  id: string;
  kategori_id: string;
  nama: string;
  harga: number;
  variants?: {
    id: string;
    nama: string;
    selisih_harga: number;
  }[];
}

interface VariantModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onConfirm: (data: {
    produk_id: string;
    varian_id: string | null;
    nama_produk: string;
    harga_satuan: number;
    qty: number;
    catatan?: string;
  }) => void;
}

const COMMON_NOTES = [
  'Kurang Manis',
  'Tanpa Es',
  'Extra Shot',
  'Pedas Sedang',
  'Tidak Pedas',
  'Pisah Sambal',
  'Bungkus (Takeaway)',
];

export function VariantModal({ product, onClose, onConfirm }: VariantModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState('');

  // Set default varian pertama jika produk memiliki varian
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0]?.id ?? null);
    } else {
      setSelectedVariantId(null);
    }
    setQty(1);
    setCatatan('');
  }, [product]);

  // Keyboard shortcut: Esc untuk close, Enter untuk confirm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    return product.harga + (selectedVariant?.selisih_harga || 0);
  }, [product, selectedVariant]);

  const totalPrice = unitPrice * qty;

  if (!product) return null;

  const handleConfirm = () => {
    const variantSuffix = selectedVariant ? ` (${selectedVariant.nama})` : '';
    const finalName = `${product.nama}${variantSuffix}${catatan.trim() ? ` [${catatan.trim()}]` : ''}`;

    onConfirm({
      produk_id: product.id,
      varian_id: selectedVariantId,
      nama_produk: finalName,
      harga_satuan: unitPrice,
      qty,
      catatan: catatan.trim() || undefined,
    });
    onClose();
  };

  const handleAddNoteTag = (tag: string) => {
    if (catatan.includes(tag)) return;
    setCatatan((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Pilih Varian Produk" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{product.nama}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', marginTop: 2 }}>
              Harga dasar: {formatRupiah(product.harga)}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Opsi Varian jika ada */}
          {product.variants && product.variants.length > 0 && (
            <div className="variant-modal-section">
              <div className="variant-section-title">
                <span>Pilih Varian</span>
                <span style={{ fontSize: 11, color: 'var(--color-accent)' }}>Wajib</span>
              </div>
              <div className="variant-chips-grid">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`variant-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      <span>{variant.nama}</span>
                      {variant.selisih_harga !== 0 && (
                        <span className="variant-price-tag">
                          {variant.selisih_harga > 0 ? `+${formatRupiah(variant.selisih_harga)}` : formatRupiah(variant.selisih_harga)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kuantitas (Jumlah Pesanan) */}
          <div className="variant-modal-section">
            <div className="variant-section-title">Jumlah Pesanan</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="cart-stepper" style={{ height: 44, padding: 2 }}>
                <button
                  type="button"
                  className="stepper-btn"
                  style={{ width: 42, height: 38 }}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={18} />
                </button>
                <span
                  className="stepper-qty"
                  style={{
                    fontSize: 'var(--text-lg)',
                    minWidth: 52,
                  }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  style={{ width: 42, height: 38 }}
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Tambah jumlah"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Catatan Khusus */}
          <div className="variant-modal-section" style={{ marginBottom: 0 }}>
            <div className="variant-section-title">
              <span>Catatan Khusus</span>
              <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>Opsional</span>
            </div>
            {/* Quick tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--space-sm)' }}>
              {COMMON_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleAddNoteTag(note)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-muted)',
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  +{note}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%' }}
              placeholder="Contoh: Es sedikit, tidak pakai gula..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>Total Item</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-foreground)' }}>
              {formatRupiah(totalPrice)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'var(--color-accent)', minHeight: 44, padding: '0 var(--space-xl)' }}
              onClick={handleConfirm}
            >
              Tambahkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
