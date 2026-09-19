// Halaman Manajemen Menu (CRUD Produk, Kategori, & Varian) di Aplikasi Kasir Diko
// Berjalan langsung di localhost:5173 terintegrasi dengan layar kasir POS

import { useState, useEffect, useMemo } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { catalogService, ProductWithDetails } from '../services/catalogService';
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

export function MenuPage() {
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
      setFormHarga(10000);
      setFormLacakStok(true);
      setFormVariants([]);
    }
    setShowProductModal(true);
  };

  // Handle Submit Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (formHarga < 0) {
      setFormError('Harga tidak boleh negatif.');
      return;
    }

    try {
      catalogService.saveProduct({
        id: editingProduct?.id,
        nama: formNama.trim(),
        kategori_id: formKategoriId || null,
        sku: formSku.trim() || null,
        harga: Math.round(Number(formHarga)),
        lacak_stok: formLacakStok,
        variants: formVariants.filter((v) => v.nama.trim().length > 0),
      });

      showToast(editingProduct ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
      setShowProductModal(false);
      loadData();
    } catch {
      setFormError('Gagal menyimpan produk.');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = (product: ProductWithDetails) => {
    catalogService.deleteProduct(product.id);
    showToast(`Produk "${product.nama}" berhasil dihapus.`);
    setShowDeleteConfirm(null);
    loadData();
  };

  // Variant Helpers
  const handleAddVariant = () => {
    setFormVariants((prev) => [...prev, { nama: '', selisih_harga: 0 }]);
  };

  const handleUpdateVariant = (index: number, field: keyof VariantInput, val: string | number) => {
    setFormVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        return {
          ...v,
          [field]: field === 'selisih_harga' ? Number(val) || 0 : val,
        };
      })
    );
  };

  const handleRemoveVariant = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Category Helpers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    catalogService.saveCategory(newCatName.trim());
    setNewCatName('');
    loadData();
    showToast('Kategori baru berhasil dibuat.');
  };

  const handleUpdateCategory = (cat: Kategori) => {
    if (!editCatName.trim()) return;
    catalogService.saveCategory(editCatName.trim(), cat.urutan, cat.id);
    setEditingCat(null);
    setEditCatName('');
    loadData();
    showToast('Kategori berhasil diperbarui.');
  };

  const handleDeleteCategory = (catId: string) => {
    catalogService.deleteCategory(catId);
    loadData();
    showToast('Kategori berhasil dihapus.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-latar)', display: 'flex', flexDirection: 'column' }}>
      <AdminNavbar title="Manajemen Menu & Katalog" />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--color-enamel-900)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(22, 52, 58, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 2000,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Konten Utama */}
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {/* Header Title & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-enamel-900)' }}>
              Daftar Menu & Produk
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-teks-2)', marginTop: 4 }}>
              Kelola katalog makanan, minuman, harga dan variasi menu toko langsung di kasir
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="bo-btn bo-btn-secondary"
              onClick={() => setShowCategoryModal(true)}
              style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}
            >
              <FolderPlus size={16} />
              <span>Kelola Kategori</span>
            </button>
            <button
              type="button"
              className="bo-btn bo-btn-primary"
              onClick={() => handleOpenProductModal()}
              style={{ background: 'var(--color-enamel-600)', color: '#fff', fontWeight: 600 }}
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Filter Kategori & Search */}
        <div className="bo-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`bo-btn ${selectedCategory === 'all' ? 'bo-btn-primary' : 'bo-btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.8125rem',
                background: selectedCategory === 'all' ? 'var(--color-enamel-600)' : 'var(--color-kertas)',
                color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--color-teks)',
              }}
            >
              Semua ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.kategori_id === c.id).length;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`bo-btn ${isSelected ? 'bo-btn-primary' : 'bo-btn-secondary'}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    background: isSelected ? 'var(--color-enamel-600)' : 'var(--color-kertas)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-teks)',
                  }}
                >
                  {c.nama} ({count})
                </button>
              );
            })}
          </div>

          <div className="bo-search-box">
            <Search size={16} color="var(--color-teks-2)" />
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
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
              >
                <X size={14} color="var(--color-teks-2)" />
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Produk */}
        <div className="bo-table-wrapper" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <table className="bo-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Nama Menu / Produk</th>
                <th style={{ width: '15%' }}>Kategori</th>
                <th style={{ width: '15%' }}>Harga Dasar</th>
                <th style={{ width: '20%' }}>Varian & Inventori</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-teks-2)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Boxes size={36} strokeWidth={1.5} color="var(--color-redup)" />
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Tidak ada menu produk ditemukan</span>
                      <span style={{ fontSize: '0.8125rem' }}>
                        Coba ubah kata kunci pencarian atau tambahkan menu baru
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-enamel-900)', fontSize: '0.875rem' }}>
                          {p.nama}
                        </span>
                        {p.sku && (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-teks-2)' }}>
                            SKU: {p.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: 'var(--color-latar-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {p.kategori_nama}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-enamel-900)' }}>
                        {formatRupiahFull(p.harga)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {p.variants && p.variants.length > 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-enamel-600)', fontWeight: 600 }}>
                            {p.variants.length} Varian ({p.variants.map((v) => v.nama).join(', ')})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)' }}>Tanpa varian</span>
                        )}
                        <span style={{ fontSize: '0.6875rem', color: p.lacak_stok ? 'var(--color-enamel-600)' : 'var(--color-teks-2)' }}>
                          {p.lacak_stok ? '● Lacak stok gudang' : '○ Non-stok'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="bo-badge bo-badge--success">Aktif</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          className="bo-btn-ghost"
                          title="Edit Produk"
                          onClick={() => handleOpenProductModal(p)}
                          style={{ borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="bo-btn-danger"
                          title="Hapus Produk"
                          onClick={() => setShowDeleteConfirm(p)}
                          style={{ borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Tambah / Edit Produk */}
      {showProductModal && (
        <div className="bo-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="bo-modal bo-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">
                {editingProduct ? 'Edit Menu / Produk' : 'Tambah Menu / Produk Baru'}
              </h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowProductModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="bo-modal-body">
                {formError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #F87171',
                      color: 'var(--color-status-gagal)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 16,
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="bo-form-group">
                  <label className="bo-form-label">Nama Menu / Produk *</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Contoh: Kopi Susu Aren Spesial"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    required
                  />
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Kategori</label>
                    <select
                      className="bo-select"
                      value={formKategoriId}
                      onChange={(e) => setFormKategoriId(e.target.value)}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Kode SKU / Barcode</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      placeholder="Contoh: KOP-001"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Harga Jual Dasar (Rupiah) *</label>
                    <input
                      type="number"
                      className="bo-form-input"
                      placeholder="20000"
                      value={formHarga || ''}
                      onChange={(e) => setFormHarga(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="bo-form-group" style={{ justifyContent: 'center' }}>
                    <label className="bo-switch-label">
                      <div
                        className={`bo-switch ${formLacakStok ? 'active' : ''}`}
                        onClick={() => setFormLacakStok(!formLacakStok)}
                      >
                        <div className="bo-switch-handle" />
                      </div>
                      <span>Lacak Stok di Gudang</span>
                    </label>
                  </div>
                </div>

                {/* Varian Builder */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="bo-form-label" style={{ fontWeight: 600 }}>
                        Opsi Varian Produk
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)' }}>
                        Tambahkan variasi ukuran, suhu, atau rasa dengan penyesuaian harga
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bo-btn bo-btn-secondary"
                      onClick={handleAddVariant}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} />
                      <span>Tambah Opsi</span>
                    </button>
                  </div>

                  {formVariants.length > 0 && (
                    <div className="bo-variant-card">
                      {formVariants.map((v, idx) => (
                        <div key={idx} className="bo-variant-row">
                          <input
                            type="text"
                            className="bo-form-input"
                            placeholder="Nama Varian (misal: Large / Panas)"
                            value={v.nama}
                            onChange={(e) => handleUpdateVariant(idx, 'nama', e.target.value)}
                            style={{ flex: 2 }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1.5 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)', fontWeight: 600 }}>
                              +Rp
                            </span>
                            <input
                              type="number"
                              className="bo-form-input"
                              placeholder="0"
                              value={v.selisih_harga || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'selisih_harga', e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="bo-btn-danger"
                            onClick={() => handleRemoveVariant(idx)}
                            style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                          >
                            <Trash2 size={16} />
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
                <button
                  type="submit"
                  className="bo-btn bo-btn-primary"
                  style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori */}
      {showCategoryModal && (
        <div className="bo-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Kelola Kategori Menu</h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowCategoryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="bo-modal-body">
              {/* Form Tambah Kategori */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  type="text"
                  className="bo-form-input"
                  placeholder="Nama Kategori Baru..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="bo-btn bo-btn-primary"
                  style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
                >
                  <Plus size={16} />
                  <span>Tambah</span>
                </button>
              </form>

              {/* List Kategori */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--color-latar)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {editingCat?.id === c.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <input
                          type="text"
                          className="bo-form-input"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          autoFocus
                          style={{ height: 30 }}
                        />
                        <button
                          type="button"
                          className="bo-btn bo-btn-primary"
                          onClick={() => handleUpdateCategory(c)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          className="bo-btn bo-btn-secondary"
                          onClick={() => setEditingCat(null)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nama}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="bo-btn-ghost"
                            onClick={() => {
                              setEditingCat(c);
                              setEditCatName(c.nama);
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="bo-btn-danger"
                            onClick={() => handleDeleteCategory(c.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bo-modal-footer">
              <button
                type="button"
                className="bo-btn bo-btn-secondary"
                onClick={() => setShowCategoryModal(false)}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Produk */}
      {showDeleteConfirm && (
        <div className="bo-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bo-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Hapus Menu / Produk</h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowDeleteConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="bo-modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground)' }}>
                Apakah Anda yakin ingin menghapus produk{' '}
                <strong>"{showDeleteConfirm.nama}"</strong> dari katalog?
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)', marginTop: 8 }}>
                Data riwayat transaksi sebelumnya tidak akan terhapus.
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
                className="bo-btn bo-btn-danger"
                style={{ background: '#FEF2F2', color: 'var(--color-destructive)' }}
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
