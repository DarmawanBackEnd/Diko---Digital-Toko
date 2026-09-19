'use client';

// Halaman Manajemen Menu (CRUD Produk & Kategori) Backoffice Diko
// Desain bersih, elegan, profesional, dan bebas dari AI-slop

import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { catalogService, ProductWithDetails } from '../../services/catalogService';
import { Kategori, formatRupiahFull } from '@kasir-pintar/core';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  CheckCircle2,
  X,
  AlertCircle,
  Boxes,
} from 'lucide-react';

interface VariantInput {
  id?: string;
  nama: string;
  selisih_harga: number;
}

export default function ProdukPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ProductWithDetails | null>(null);

  // Form State Produk
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);
  const [formNama, setFormNama] = useState<string>('');
  const [formKategoriId, setFormKategoriId] = useState<string>('');
  const [formSku, setFormSku] = useState<string>('');
  const [formHarga, setFormHarga] = useState<number>(0);
  const [formLacakStok, setFormLacakStok] = useState<boolean>(false);
  const [formVariants, setFormVariants] = useState<VariantInput[]>([]);
  const [formError, setFormError] = useState<string>('');

  // Form State Kategori Baru
  const [newCatName, setNewCatName] = useState<string>('');
  const [editingCat, setEditingCat] = useState<Kategori | null>(null);
  const [editCatName, setEditCatName] = useState<string>('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadData = () => {
    const cats = catalogService.getCategories();
    const prods = catalogService.getProducts();
    setCategories(cats);
    setProducts(prods);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.kategori_id === selectedCategory;
      const matchSearch =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Open Create / Edit Modal
  const handleOpenProductModal = (product?: ProductWithDetails) => {
    setFormError('');
    if (product) {
      setEditingProduct(product);
      setFormNama(product.nama);
      setFormKategoriId(product.kategori_id || '');
      setFormSku(product.sku || '');
      setFormHarga(product.harga);
      setFormLacakStok(product.lacak_stok);
      setFormVariants(
        (product.variants || []).map((v) => ({
          id: v.id,
          nama: v.nama,
          selisih_harga: v.selisih_harga,
        }))
      );
    } else {
      setEditingProduct(null);
      setFormNama('');
      setFormKategoriId(categories[0]?.id || '');
      setFormSku('');
      setFormHarga(15000);
      setFormLacakStok(false);
      setFormVariants([]);
    }
    setShowProductModal(true);
  };

  // Variant helper
  const handleAddVariant = () => {
    setFormVariants((prev) => [...prev, { nama: '', selisih_harga: 0 }]);
  };

  const handleUpdateVariant = (index: number, field: 'nama' | 'selisih_harga', value: string | number) => {
    setFormVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === 'selisih_harga') {
          return { ...v, selisih_harga: Number(value) || 0 };
        }
        return { ...v, nama: String(value) };
      })
    );
  };

  const handleRemoveVariant = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (formHarga <= 0) {
      setFormError('Harga jual produk harus lebih dari 0.');
      return;
    }

    // Validasi varian tidak boleh kosong namanya
    for (const v of formVariants) {
      if (!v.nama.trim()) {
        setFormError('Nama opsi varian tidak boleh kosong.');
        return;
      }
    }

    catalogService.saveProduct({
      id: editingProduct?.id,
      nama: formNama.trim(),
      kategori_id: formKategoriId || null,
      sku: formSku.trim() || null,
      harga: formHarga,
      lacak_stok: formLacakStok,
      variants: formVariants,
    });

    loadData();
    setShowProductModal(false);
    showToast(editingProduct ? 'Produk berhasil diperbarui' : 'Produk baru berhasil ditambahkan');
  };

  // Submit Delete Product
  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;
    catalogService.deleteProduct(showDeleteConfirm.id);
    loadData();
    setShowDeleteConfirm(null);
    showToast('Produk telah dihapus');
  };

  // Category Actions
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    catalogService.saveCategory(newCatName.trim());
    setNewCatName('');
    loadData();
    showToast('Kategori baru berhasil ditambahkan');
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editCatName.trim()) return;
    catalogService.saveCategory(editCatName.trim(), undefined, id);
    setEditingCat(null);
    setEditCatName('');
    loadData();
    showToast('Kategori berhasil diperbarui');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      catalogService.deleteCategory(id);
      loadData();
      showToast('Kategori telah dihapus');
    }
  };

  return (
    <div className="bo-layout">
      <Sidebar />

      <main className="bo-main">
        {/* Top Header */}
        <header className="bo-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="bo-header-title">Manajemen Menu & Produk</h1>
          </div>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="bo-btn bo-btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            <FolderPlus size={15} />
            <span>Kelola Kategori</span>
          </button>
          <button
            type="button"
            className="bo-btn bo-btn-primary"
            onClick={() => handleOpenProductModal()}
          >
            <Plus size={16} />
            <span>Tambah Produk</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="bo-content">
          {/* Toast Alert */}
          {toastMessage && (
            <div
              style={{
                background: 'var(--color-enamel-900)',
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#10B981' }} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Action Bar (Search & Category Chips) */}
          <div className="bo-action-bar">
            {/* Search Box */}
            <div className="bo-search-box">
              <Search size={15} style={{ color: 'var(--color-muted-foreground)' }} />
              <input
                type="text"
                placeholder="Cari nama menu atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`bo-btn ${selectedCategory === 'all' ? 'bo-btn-primary' : 'bo-btn-secondary'}`}
                style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 12 }}
                onClick={() => setSelectedCategory('all')}
              >
                Semua ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.kategori_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`bo-btn ${selectedCategory === cat.id ? 'bo-btn-primary' : 'bo-btn-secondary'}`}
                    style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 12 }}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.nama} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Table */}
          <div className="bo-table-wrapper">
            <table className="bo-table">
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>Nama Menu</th>
                  <th>Kategori</th>
                  <th>SKU</th>
                  <th>Harga Dasar</th>
                  <th>Varian</th>
                  <th>Lacak Stok</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-muted-foreground)' }}>
                      <Boxes size={36} strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Menu tidak ditemukan</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Belum ada produk pada kategori ini'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{p.nama}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--color-enamel-50)',
                            color: 'var(--color-enamel-900)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            border: '1px solid var(--color-enamel-100)',
                          }}
                        >
                          {p.kategori_nama}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                        {p.sku || '-'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-foreground)' }}>
                        {formatRupiahFull(p.harga)}
                      </td>
                      <td>
                        {p.variants && p.variants.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {p.variants.map((v) => (
                              <span
                                key={v.id}
                                style={{
                                  fontSize: 11,
                                  background: 'var(--color-latar-2)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  border: '1px solid var(--color-garis)',
                                }}
                              >
                                {v.nama} {v.selisih_harga > 0 ? `(+${v.selisih_harga / 1000}k)` : ''}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>Standar (1 varian)</span>
                        )}
                      </td>
                      <td>
                        {p.lacak_stok ? (
                          <span className="bo-badge bo-badge--success">Aktif</span>
                        ) : (
                          <span className="bo-badge bo-badge--neutral">Non-Stok</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            type="button"
                            className="bo-btn bo-btn-ghost"
                            title="Edit Menu"
                            onClick={() => handleOpenProductModal(p)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="bo-btn bo-btn-danger"
                            title="Hapus Menu"
                            onClick={() => setShowDeleteConfirm(p)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: Tambah / Edit Produk */}
      {showProductModal && (
        <div className="bo-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="bo-modal bo-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">
                {editingProduct ? 'Edit Menu Produk' : 'Tambah Menu Produk Baru'}
              </h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowProductModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="bo-modal-body">
                {formError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      color: 'var(--color-destructive)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Nama Menu *</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      placeholder="Contoh: Kopi Susu Diko"
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Kategori *</label>
                    <select
                      className="bo-select"
                      value={formKategoriId}
                      onChange={(e) => setFormKategoriId(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Harga Dasar (Rupiah) *</label>
                    <input
                      type="number"
                      className="bo-form-input"
                      placeholder="20000"
                      min="100"
                      step="500"
                      value={formHarga || ''}
                      onChange={(e) => setFormHarga(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">SKU / Kode Menu (Opsional)</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      placeholder="Contoh: KOP-01"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                    />
                  </div>
                </div>

                {/* Toggle Lacak Stok */}
                <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', margin: '12px 0' }}>
                  <label className="bo-switch-label">
                    <div
                      className={`bo-switch ${formLacakStok ? 'active' : ''}`}
                      onClick={() => setFormLacakStok((prev) => !prev)}
                    >
                      <div className="bo-switch-handle" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>Lacak Stok Inventori</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>
                        Jika aktif, stok produk ini akan dipantau di modul Warehouse melalui riwayat pergerakan stok.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Builder Opsi Varian */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-foreground)' }}>
                        Opsi Varian Tambahan
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>
                        Misal ukuran (Reguler/Large) atau temperatur (Panas/Dingin).
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bo-btn bo-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={handleAddVariant}
                    >
                      <Plus size={13} />
                      <span>Tambah Opsi</span>
                    </button>
                  </div>

                  {formVariants.length === 0 ? (
                    <div style={{ background: 'var(--color-latar)', padding: '12px', borderRadius: 8, fontSize: 12, color: 'var(--color-muted-foreground)', textAlign: 'center' }}>
                      Belum ada varian (produk dijual dengan harga dasar standar).
                    </div>
                  ) : (
                    <div className="bo-variant-card">
                      {formVariants.map((v, idx) => (
                        <div key={idx} className="bo-variant-row">
                          <input
                            type="text"
                            className="bo-form-input"
                            style={{ flex: 2 }}
                            placeholder="Nama Opsi (mis: Dingin, Large)"
                            value={v.nama}
                            onChange={(e) => handleUpdateVariant(idx, 'nama', e.target.value)}
                            required
                          />
                          <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>+Rp</span>
                            <input
                              type="number"
                              className="bo-form-input"
                              placeholder="0"
                              step="500"
                              value={v.selisih_harga}
                              onChange={(e) => handleUpdateVariant(idx, 'selisih_harga', e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="bo-btn bo-btn-ghost"
                            onClick={() => handleRemoveVariant(idx)}
                            style={{ color: 'var(--color-destructive)', padding: '6px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bo-modal-footer">
                <button
                  type="button"
                  className="bo-btn bo-btn-secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="bo-btn bo-btn-primary">
                  {editingProduct ? 'Simpan Perubahan' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kelola Kategori */}
      {showCategoryModal && (
        <div className="bo-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Kelola Kategori Menu</h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowCategoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="bo-modal-body">
              {/* Form Tambah Kategori */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  className="bo-form-input"
                  style={{ flex: 1 }}
                  placeholder="Nama kategori baru (mis: Dessert, Mocktail)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button
                  type="button"
                  className="bo-btn bo-btn-primary"
                  onClick={handleAddCategory}
                >
                  <Plus size={15} />
                  <span>Tambah</span>
                </button>
              </div>

              {/* List Kategori */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map((cat) => {
                  const isEditing = editingCat?.id === cat.id;
                  const count = products.filter((p) => p.kategori_id === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--color-latar)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-garis)',
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 6, flex: 1, marginRight: 8 }}>
                          <input
                            type="text"
                            className="bo-form-input"
                            style={{ height: 32, flex: 1 }}
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                          />
                          <button
                            type="button"
                            className="bo-btn bo-btn-primary"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => handleSaveEditCategory(cat.id)}
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            className="bo-btn bo-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => setEditingCat(null)}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{cat.nama}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginLeft: 8 }}>
                            ({count} produk)
                          </span>
                        </div>
                      )}

                      {!isEditing && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            className="bo-btn bo-btn-ghost"
                            onClick={() => {
                              setEditingCat(cat);
                              setEditCatName(cat.nama);
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="bo-btn bo-btn-danger"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bo-modal-footer">
              <button
                type="button"
                className="bo-btn bo-btn-secondary"
                onClick={() => setShowCategoryModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Produk */}
      {showDeleteConfirm && (
        <div className="bo-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bo-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title" style={{ color: 'var(--color-destructive)' }}>
                Hapus Menu Produk
              </h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowDeleteConfirm(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bo-modal-body">
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus <strong>"{showDeleteConfirm.nama}"</strong>? Menu ini tidak akan ditampilkan lagi di aplikasi kasir.
              </p>
            </div>
            <div className="bo-modal-footer">
              <button
                type="button"
                className="bo-btn bo-btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="bo-btn"
                style={{ background: 'var(--color-destructive)', color: '#FFFFFF' }}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
