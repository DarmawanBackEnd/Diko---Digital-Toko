'use client';

// Halaman Manajemen Warehouse & Stok Inventori Backoffice Diko
// Menerapkan aturan mutlak AGENTS.md Rule 2.4: Stok adalah Ledger, Bukan Angka yang Di-Update!

import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { warehouseService, Gudang, PergerakanStokRecord, StokProdukRingkasan } from '../../services/warehouseService';
import { formatRupiahFull } from '@kasir-pintar/core';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  History,
  Building2,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses' | 'ledger'>('inventory');

  const [warehouses, setWarehouses] = useState<Gudang[]>([]);
  const [stockSummary, setStockSummary] = useState<StokProdukRingkasan[]>([]);
  const [stockMovements, setStockMovements] = useState<PergerakanStokRecord[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');

  // Modal States
  const [showWarehouseModal, setShowWarehouseModal] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Gudang | null>(null);
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);
  const [selectedProductForLedger, setSelectedProductForLedger] = useState<string | null>(null);

  // Form Warehouse
  const [whKode, setWhKode] = useState<string>('');
  const [whNama, setWhNama] = useState<string>('');
  const [whLokasi, setWhLokasi] = useState<string>('');
  const [whPic, setWhPic] = useState<string>('');
  const [whError, setWhError] = useState<string>('');

  // Form Restock (Stok Masuk)
  const [restockProductId, setRestockProductId] = useState<string>('');
  const [restockWarehouseId, setRestockWarehouseId] = useState<string>('');
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockRef, setRestockRef] = useState<string>('');
  const [restockCatatan, setRestockCatatan] = useState<string>('');

  // Form Opname (Penyesuaian Fisik)
  const [opnameProductId, setOpnameProductId] = useState<string>('');
  const [opnameWarehouseId, setOpnameWarehouseId] = useState<string>('');
  const [opnameFisik, setOpnameFisik] = useState<number>(0);
  const [opnameAlasan, setOpnameAlasan] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadData = () => {
    const whList = warehouseService.getGudang();
    const stockList = warehouseService.getStokRingkasan();
    const movementList = warehouseService.getPergerakanStok();

    setWarehouses(whList);
    setStockSummary(stockList);
    setStockMovements(movementList);

    if (whList[0] && !restockWarehouseId) {
      setRestockWarehouseId(whList[0].id);
      setOpnameWarehouseId(whList[0].id);
    }
    if (stockList[0] && !restockProductId) {
      setRestockProductId(stockList[0].produk_id);
      setOpnameProductId(stockList[0].produk_id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Stock Summary
  const filteredStock = useMemo(() => {
    return stockSummary.filter((item) => {
      const matchSearch =
        item.produk_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [stockSummary, searchQuery]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      const matchWh = selectedWarehouseFilter === 'all' || m.gudang_id === selectedWarehouseFilter;
      const matchProd = !selectedProductForLedger || m.produk_id === selectedProductForLedger;
      const matchSearch =
        m.produk_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.nomor_referensi && m.nomor_referensi.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchWh && matchProd && matchSearch;
    });
  }, [stockMovements, selectedWarehouseFilter, selectedProductForLedger, searchQuery]);

  // Stats calculation
  const totalTrackedItems = stockSummary.length;
  const totalUnits = stockSummary.reduce((acc, s) => acc + s.total_stok, 0);
  const lowStockCount = stockSummary.filter((s) => s.status === 'menipis' || s.status === 'habis' || s.status === 'minus').length;
  const totalInventoryValue = stockSummary.reduce((acc, s) => acc + Math.max(0, s.total_stok) * s.harga, 0);

  // Handlers: Warehouse
  const handleOpenWarehouseModal = (wh?: Gudang) => {
    setWhError('');
    if (wh) {
      setEditingWarehouse(wh);
      setWhKode(wh.kode);
      setWhNama(wh.nama);
      setWhLokasi(wh.lokasi || '');
      setWhPic(wh.pic);
    } else {
      setEditingWarehouse(null);
      setWhKode(`GD-0${warehouses.length + 1}`);
      setWhNama('');
      setWhLokasi('');
      setWhPic('');
    }
    setShowWarehouseModal(true);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whNama.trim()) {
      setWhError('Nama gudang wajib diisi.');
      return;
    }
    if (!whPic.trim()) {
      setWhError('Penanggung jawab (PIC) wajib diisi.');
      return;
    }

    warehouseService.saveGudang({
      id: editingWarehouse?.id,
      kode: whKode.trim(),
      nama: whNama.trim(),
      lokasi: whLokasi.trim(),
      pic: whPic.trim(),
    });

    loadData();
    setShowWarehouseModal(false);
    showToast(editingWarehouse ? 'Data gudang berhasil diperbarui' : 'Gudang baru berhasil ditambahkan');
  };

  const handleDeleteWarehouse = (id: string) => {
    if (confirm('Yakin ingin menghapus gudang ini?')) {
      warehouseService.deleteGudang(id);
      loadData();
      showToast('Gudang telah dihapus');
    }
  };

  // Handlers: Restock
  const handleOpenRestock = (productId?: string) => {
    if (productId) setRestockProductId(productId);
    setRestockQty(10);
    setRestockRef('');
    setRestockCatatan('Penerimaan stok masuk dari supplier');
    setShowRestockModal(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockQty <= 0) {
      alert('Jumlah stok masuk harus lebih dari 0.');
      return;
    }

    warehouseService.catatStokMasuk({
      produk_id: restockProductId,
      gudang_id: restockWarehouseId,
      qty: restockQty,
      nomor_referensi: restockRef,
      catatan: restockCatatan,
    });

    loadData();
    setShowRestockModal(false);
    showToast('Stok masuk berhasil dicatat ke dalam ledger');
  };

  // Handlers: Opname
  const handleOpenOpname = (item?: StokProdukRingkasan) => {
    if (item) {
      setOpnameProductId(item.produk_id);
      setOpnameFisik(item.total_stok);
    }
    setOpnameAlasan('Penyesuaian stok opname rutin bulanan');
    setShowOpnameModal(true);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    warehouseService.catatPenyesuaianStok({
      produk_id: opnameProductId,
      gudang_id: opnameWarehouseId,
      stok_fisik: opnameFisik,
      alasan: opnameAlasan,
    });

    loadData();
    setShowOpnameModal(false);
    showToast('Penyesuaian stok opname berhasil dicatat');
  };

  return (
    <div className="bo-layout">
      <Sidebar />

      <main className="bo-main">
        {/* Header */}
        <header className="bo-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="bo-header-title">Manajemen Warehouse & Stok</h1>
          </div>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="bo-btn bo-btn-secondary"
            onClick={() => handleOpenOpname()}
          >
            <Sliders size={15} />
            <span>Stok Opname</span>
          </button>
          <button
            type="button"
            className="bo-btn bo-btn-primary"
            onClick={() => handleOpenRestock()}
          >
            <Plus size={16} />
            <span>Catat Stok Masuk</span>
          </button>
        </header>

        {/* Content */}
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

          {/* Stats Summary Grid */}
          <div className="bo-stats-grid">
            <div className="bo-stat-card">
              <div className="bo-stat-label">Total Item Ber-Stok</div>
              <div className="bo-stat-value">{totalTrackedItems}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4 }}>
                Menu dengan pelacakan inventori aktif
              </div>
            </div>

            <div className="bo-stat-card">
              <div className="bo-stat-label">Total Unit Tersedia</div>
              <div className="bo-stat-value">{totalUnits} pcs</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4 }}>
                Akumulasi di seluruh gudang toko
              </div>
            </div>

            <div className="bo-stat-card">
              <div className="bo-stat-label">Perlu Perhatian / Menipis</div>
              <div
                className="bo-stat-value"
                style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}
              >
                {lowStockCount} Item
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4 }}>
                {lowStockCount > 0 ? 'Perlu restock segera' : 'Kondisi inventori aman'}
              </div>
            </div>

            <div className="bo-stat-card">
              <div className="bo-stat-label">Estimasi Nilai Stok</div>
              <div className="bo-stat-value" style={{ fontSize: '1.25rem' }}>
                {formatRupiahFull(totalInventoryValue)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4 }}>
                Berdasarkan harga jual menu
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bo-tabs">
            <button
              type="button"
              className={`bo-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Boxes size={16} />
              <span>Ringkasan Stok Produk ({stockSummary.length})</span>
            </button>

            <button
              type="button"
              className={`bo-tab ${activeTab === 'warehouses' ? 'active' : ''}`}
              onClick={() => setActiveTab('warehouses')}
            >
              <Building2 size={16} />
              <span>Master Gudang / Lokasi ({warehouses.length})</span>
            </button>

            <button
              type="button"
              className={`bo-tab ${activeTab === 'ledger' ? 'active' : ''}`}
              onClick={() => setActiveTab('ledger')}
            >
              <History size={16} />
              <span>Riwayat Ledger Pergerakan Stok</span>
            </button>
          </div>

          {/* TAB 1: RINGKASAN STOK PRODUK */}
          {activeTab === 'inventory' && (
            <div>
              <div className="bo-action-bar">
                <div className="bo-search-box">
                  <Search size={15} style={{ color: 'var(--color-muted-foreground)' }} />
                  <input
                    type="text"
                    placeholder="Cari produk ber-stok..."
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
              </div>

              <div className="bo-table-wrapper">
                <table className="bo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Nama Menu</th>
                      <th>Kategori</th>
                      <th>SKU</th>
                      <th>Stok Saat Ini</th>
                      <th>Status Stok</th>
                      <th>Estimasi Nilai</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted-foreground)' }}>
                          <Boxes size={36} strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                          <div style={{ fontWeight: 600 }}>Tidak ada produk ber-stok</div>
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            Aktifkan toggle "Lacak Stok" pada menu di halaman Manajemen Produk.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStock.map((item) => (
                        <tr key={item.produk_id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.produk_nama}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: 11.5, color: 'var(--color-muted-foreground)' }}>
                              {item.kategori_nama}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            {item.sku || '-'}
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 14,
                                fontWeight: 800,
                                color:
                                  item.status === 'minus'
                                    ? 'var(--color-destructive)'
                                    : item.status === 'menipis'
                                    ? 'var(--color-warning)'
                                    : 'var(--color-foreground)',
                              }}
                            >
                              {item.total_stok} pcs
                            </span>
                          </td>
                          <td>
                            {item.status === 'aman' && (
                              <span className="bo-badge bo-badge--success">Aman</span>
                            )}
                            {item.status === 'menipis' && (
                              <span className="bo-badge bo-badge--warning">Menipis</span>
                            )}
                            {item.status === 'habis' && (
                              <span className="bo-badge bo-badge--error">Habis (0)</span>
                            )}
                            {item.status === 'minus' && (
                              <span className="bo-badge bo-badge--error">
                                Minus ({item.total_stok})
                              </span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {formatRupiahFull(Math.max(0, item.total_stok) * item.harga)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                className="bo-btn bo-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: 11 }}
                                onClick={() => handleOpenRestock(item.produk_id)}
                                title="Catat Stok Masuk"
                              >
                                <Plus size={12} />
                                <span>Restock</span>
                              </button>
                              <button
                                type="button"
                                className="bo-btn bo-btn-ghost"
                                style={{ padding: '4px 8px', fontSize: 11 }}
                                onClick={() => {
                                  setSelectedProductForLedger(item.produk_id);
                                  setActiveTab('ledger');
                                }}
                                title="Lihat Kartu Stok"
                              >
                                <History size={12} />
                                <span>Kartu Stok</span>
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
          )}

          {/* TAB 2: MASTER GUDANG */}
          {activeTab === 'warehouses' && (
            <div>
              <div className="bo-action-bar">
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Daftar Lokasi & Gudang Penyimpanan</h2>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                    Kelola gudang pusat, dapur, atau bar untuk distribusi barang dagangan.
                  </p>
                </div>
                <button
                  type="button"
                  className="bo-btn bo-btn-primary"
                  onClick={() => handleOpenWarehouseModal()}
                >
                  <Plus size={15} />
                  <span>Tambah Gudang Baru</span>
                </button>
              </div>

              <div className="bo-table-wrapper">
                <table className="bo-table">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama Gudang</th>
                      <th>Lokasi / Alamat</th>
                      <th>Penanggung Jawab (PIC)</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((wh) => (
                      <tr key={wh.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {wh.kode}
                        </td>
                        <td style={{ fontWeight: 600 }}>{wh.nama}</td>
                        <td style={{ color: 'var(--color-muted-foreground)' }}>{wh.lokasi || '-'}</td>
                        <td>{wh.pic}</td>
                        <td>
                          <span className="bo-badge bo-badge--success">Aktif</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            <button
                              type="button"
                              className="bo-btn bo-btn-ghost"
                              onClick={() => handleOpenWarehouseModal(wh)}
                              title="Edit Gudang"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="bo-btn bo-btn-danger"
                              onClick={() => handleDeleteWarehouse(wh.id)}
                              title="Hapus Gudang"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT LEDGER PERGERAKAN STOK */}
          {activeTab === 'ledger' && (
            <div>
              <div className="bo-action-bar">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="bo-search-box">
                    <Search size={15} style={{ color: 'var(--color-muted-foreground)' }} />
                    <input
                      type="text"
                      placeholder="Cari produk atau no. ref..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="bo-select"
                    style={{ width: 180 }}
                    value={selectedWarehouseFilter}
                    onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  >
                    <option value="all">Semua Gudang</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>

                  {selectedProductForLedger && (
                    <button
                      type="button"
                      className="bo-btn bo-btn-secondary"
                      onClick={() => setSelectedProductForLedger(null)}
                      style={{ fontSize: 11 }}
                    >
                      <X size={13} />
                      <span>Hapus Filter Produk</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                  Total {filteredMovements.length} transaksi pergerakan tercatat
                </div>
              </div>

              <div className="bo-table-wrapper">
                <table className="bo-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Nama Menu</th>
                      <th>Gudang</th>
                      <th>Tipe</th>
                      <th>Perubahan Qty</th>
                      <th>No. Referensi</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted-foreground)' }}>
                          Belum ada riwayat pergerakan stok.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((m) => {
                        const isPositive = Number(m.qty) > 0;
                        const isZero = Number(m.qty) === 0;

                        return (
                          <tr key={m.id}>
                            <td style={{ fontSize: 11.5, color: 'var(--color-muted-foreground)' }}>
                              {new Date(m.waktu_client).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td style={{ fontWeight: 600 }}>{m.produk_nama}</td>
                            <td>
                              <span style={{ fontSize: 12 }}>{m.gudang_nama || 'Gudang Utama'}</span>
                            </td>
                            <td>
                              {m.tipe === 'awal' && (
                                <span className="bo-badge bo-badge--success" style={{ gap: 4 }}>
                                  <ArrowUpRight size={11} /> Masuk / Awal
                                </span>
                              )}
                              {m.tipe === 'penjualan' && (
                                <span className="bo-badge bo-badge--error" style={{ gap: 4 }}>
                                  <ArrowDownRight size={11} /> Penjualan
                                </span>
                              )}
                              {m.tipe === 'penyesuaian' && (
                                <span className="bo-badge bo-badge--warning" style={{ gap: 4 }}>
                                  <Sliders size={11} /> Penyesuaian
                                </span>
                              )}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                              <span
                                style={{
                                  color: isZero
                                    ? 'var(--color-muted-foreground)'
                                    : isPositive
                                    ? 'var(--color-success)'
                                    : 'var(--color-destructive)',
                                }}
                              >
                                {isPositive ? `+${m.qty}` : m.qty} pcs
                              </span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                              {m.nomor_referensi || '-'}
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                              {m.catatan || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Tambah / Edit Master Gudang */}
      {showWarehouseModal && (
        <div className="bo-modal-overlay" onClick={() => setShowWarehouseModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">
                {editingWarehouse ? 'Edit Master Gudang' : 'Tambah Gudang Baru'}
              </h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowWarehouseModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse}>
              <div className="bo-modal-body">
                {whError && (
                  <div style={{ color: 'var(--color-destructive)', fontSize: 12.5, marginBottom: 12 }}>
                    {whError}
                  </div>
                )}

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Kode Gudang *</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      value={whKode}
                      onChange={(e) => setWhKode(e.target.value)}
                      placeholder="GD-01"
                      required
                    />
                  </div>
                  <div className="bo-form-group">
                    <label className="bo-form-label">Nama Gudang *</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      value={whNama}
                      onChange={(e) => setWhNama(e.target.value)}
                      placeholder="Gudang Utama / Dapur Bar"
                      required
                    />
                  </div>
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Penanggung Jawab (PIC) *</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    value={whPic}
                    onChange={(e) => setWhPic(e.target.value)}
                    placeholder="Nama staf atau owner penanggung jawab"
                    required
                  />
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Lokasi / Keterangan Alamat</label>
                  <textarea
                    className="bo-textarea"
                    value={whLokasi}
                    onChange={(e) => setWhLokasi(e.target.value)}
                    placeholder="Contoh: Ruko Blok A Lantai 1..."
                  />
                </div>
              </div>

              <div className="bo-modal-footer">
                <button
                  type="button"
                  className="bo-btn bo-btn-secondary"
                  onClick={() => setShowWarehouseModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="bo-btn bo-btn-primary">
                  {editingWarehouse ? 'Simpan Perubahan' : 'Simpan Gudang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Catat Stok Masuk (Restock) */}
      {showRestockModal && (
        <div className="bo-modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Penerimaan Stok Masuk (Restock)</h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowRestockModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRestock}>
              <div className="bo-modal-body">
                <div className="bo-form-group">
                  <label className="bo-form-label">Pilih Menu / Produk *</label>
                  <select
                    className="bo-select"
                    value={restockProductId}
                    onChange={(e) => setRestockProductId(e.target.value)}
                  >
                    {stockSummary.map((p) => (
                      <option key={p.produk_id} value={p.produk_id}>
                        {p.produk_nama} (Stok Saat Ini: {p.total_stok} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Gudang Tujuan *</label>
                    <select
                      className="bo-select"
                      value={restockWarehouseId}
                      onChange={(e) => setRestockWarehouseId(e.target.value)}
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama} ({w.kode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Jumlah Masuk (Pcs) *</label>
                    <input
                      type="number"
                      className="bo-form-input"
                      min="1"
                      value={restockQty}
                      onChange={(e) => setRestockQty(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">No. Referensi / Surat Jalan (Opsional)</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Contoh: PO-2026-004 / SJ-Supplier-88"
                    value={restockRef}
                    onChange={(e) => setRestockRef(e.target.value)}
                  />
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Catatan</label>
                  <textarea
                    className="bo-textarea"
                    placeholder="Keterangan kondisi barang atau supplier..."
                    value={restockCatatan}
                    onChange={(e) => setRestockCatatan(e.target.value)}
                  />
                </div>
              </div>

              <div className="bo-modal-footer">
                <button
                  type="button"
                  className="bo-btn bo-btn-secondary"
                  onClick={() => setShowRestockModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="bo-btn bo-btn-primary">
                  Simpan Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Stok Opname / Penyesuaian Fisik */}
      {showOpnameModal && (
        <div className="bo-modal-overlay" onClick={() => setShowOpnameModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Stok Opname / Penyesuaian Fisik</h2>
              <button
                type="button"
                className="bo-modal-close"
                onClick={() => setShowOpnameModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOpname}>
              <div className="bo-modal-body">
                <div className="bo-form-group">
                  <label className="bo-form-label">Pilih Menu / Produk *</label>
                  <select
                    className="bo-select"
                    value={opnameProductId}
                    onChange={(e) => {
                      setOpnameProductId(e.target.value);
                      const prod = stockSummary.find((s) => s.produk_id === e.target.value);
                      if (prod) setOpnameFisik(prod.total_stok);
                    }}
                  >
                    {stockSummary.map((p) => (
                      <option key={p.produk_id} value={p.produk_id}>
                        {p.produk_nama} (Sistem: {p.total_stok} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Gudang Audit *</label>
                    <select
                      className="bo-select"
                      value={opnameWarehouseId}
                      onChange={(e) => setOpnameWarehouseId(e.target.value)}
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama} ({w.kode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Jumlah Fisik Terhitung *</label>
                    <input
                      type="number"
                      className="bo-form-input"
                      value={opnameFisik}
                      onChange={(e) => setOpnameFisik(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Alasan Penyesuaian *</label>
                  <textarea
                    className="bo-textarea"
                    placeholder="Contoh: Selisih hitung fisik akhir bulan, barang rusak, tumpah..."
                    value={opnameAlasan}
                    onChange={(e) => setOpnameAlasan(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bo-modal-footer">
                <button
                  type="button"
                  className="bo-btn bo-btn-secondary"
                  onClick={() => setShowOpnameModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="bo-btn bo-btn-primary">
                  Catat Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
