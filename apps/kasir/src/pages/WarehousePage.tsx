// Halaman Manajemen Warehouse & Stok Inventori di Aplikasi Kasir Diko
// Menerapkan aturan mutlak AGENTS.md Rule 2.4: Stok adalah Ledger, Bukan Angka yang Di-Update!
// Terintegrasi langsung di localhost:5173

import { useState, useEffect, useMemo } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { warehouseService, Gudang, PergerakanStokRecord, StokProdukRingkasan } from '../services/warehouseService';
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

export function WarehousePage() {
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
    let list = stockMovements;
    if (selectedWarehouseFilter !== 'all') {
      list = list.filter((m) => m.gudang_id === selectedWarehouseFilter);
    }
    if (selectedProductForLedger) {
      list = list.filter((m) => m.produk_id === selectedProductForLedger);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.produk_nama.toLowerCase().includes(q) ||
          (m.nomor_referensi && m.nomor_referensi.toLowerCase().includes(q))
      );
    }
    return list;
  }, [stockMovements, selectedWarehouseFilter, selectedProductForLedger, searchQuery]);

  // Total unit stok
  const totalUnits = useMemo(() => {
    return stockSummary.reduce((acc, s) => acc + s.total_stok, 0);
  }, [stockSummary]);

  // Low stock count
  const lowStockCount = useMemo(() => {
    return stockSummary.filter((s) => s.status === 'menipis' || s.status === 'habis' || s.status === 'minus').length;
  }, [stockSummary]);

  // Handlers Master Gudang
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
    if (!whKode.trim() || !whNama.trim()) {
      setWhError('Kode dan Nama Gudang wajib diisi.');
      return;
    }
    warehouseService.saveGudang({
      id: editingWarehouse?.id,
      kode: whKode.trim(),
      nama: whNama.trim(),
      lokasi: whLokasi.trim(),
      pic: whPic.trim() || 'Admin Toko',
    });
    showToast(editingWarehouse ? 'Gudang berhasil diperbarui!' : 'Gudang baru berhasil dibuat!');
    setShowWarehouseModal(false);
    loadData();
  };

  const handleDeleteWarehouse = (id: string) => {
    warehouseService.deleteGudang(id);
    showToast('Gudang berhasil dinonaktifkan.');
    loadData();
  };

  // Handlers Restock
  const handleOpenRestock = (produkId?: string) => {
    if (produkId) {
      setRestockProductId(produkId);
    } else if (stockSummary[0]) {
      setRestockProductId(stockSummary[0].produk_id);
    }
    if (warehouses[0]) {
      setRestockWarehouseId(warehouses[0].id);
    }
    setRestockQty(10);
    setRestockRef(`PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setRestockCatatan('');
    setShowRestockModal(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId || !restockWarehouseId || restockQty <= 0) return;

    warehouseService.catatStokMasuk({
      produk_id: restockProductId,
      gudang_id: restockWarehouseId,
      qty: restockQty,
      nomor_referensi: restockRef,
      catatan: restockCatatan,
    });

    showToast(`Stok masuk berhasil dicatat (+${restockQty} unit)!`);
    setShowRestockModal(false);
    loadData();
  };

  // Handlers Opname
  const handleOpenOpname = (produkId?: string) => {
    if (produkId) {
      setOpnameProductId(produkId);
      const current = stockSummary.find((s) => s.produk_id === produkId);
      setOpnameFisik(current ? current.total_stok : 0);
    } else if (stockSummary[0]) {
      setOpnameProductId(stockSummary[0].produk_id);
      setOpnameFisik(stockSummary[0].total_stok);
    }
    if (warehouses[0]) {
      setOpnameWarehouseId(warehouses[0].id);
    }
    setOpnameAlasan('Hasil penghitungan fisik berkala');
    setShowOpnameModal(true);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opnameProductId || !opnameWarehouseId) return;

    warehouseService.catatPenyesuaianStok({
      produk_id: opnameProductId,
      gudang_id: opnameWarehouseId,
      stok_fisik: Number(opnameFisik),
      alasan: opnameAlasan,
    });

    showToast('Penyesuaian stok opname berhasil dicatat di ledger!');
    setShowOpnameModal(false);
    loadData();
  };

  return (
    <div className="bo-page-container">
      <AdminNavbar title="Gudang & Stok Ledger" />

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
              Manajemen Gudang & Stok (Ledger)
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-teks-2)', marginTop: 4 }}>
              Mutasi inventori append-only tanpa update statis, aman untuk multi-kasir offline
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="bo-btn bo-btn-secondary"
              onClick={() => handleOpenOpname()}
              style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}
            >
              <Sliders size={16} />
              <span>Penyesuaian (Opname)</span>
            </button>
            <button
              type="button"
              className="bo-btn bo-btn-primary"
              onClick={() => handleOpenRestock()}
              style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF', fontWeight: 600 }}
            >
              <ArrowDownRight size={16} />
              <span>Catat Stok Masuk</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="bo-stats-grid">
          <div className="bo-stat-card" style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}>
            <div className="bo-stat-label">Total Unit Stok Tersedia</div>
            <div className="bo-stat-value" style={{ color: 'var(--color-enamel-900)' }}>
              {totalUnits} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Unit</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)', marginTop: 4 }}>
              Dihitung real-time dari Σ(pergerakan_stok)
            </div>
          </div>

          <div className="bo-stat-card" style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}>
            <div className="bo-stat-label">Jenis SKU Menu Ber-Stok</div>
            <div className="bo-stat-value" style={{ color: 'var(--color-enamel-900)' }}>
              {stockSummary.length} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Item</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)', marginTop: 4 }}>
              Produk dengan status lacak stok aktif
            </div>
          </div>

          <div className="bo-stat-card" style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}>
            <div className="bo-stat-label">Stok Menipis / Habis</div>
            <div
              className="bo-stat-value"
              style={{ color: lowStockCount > 0 ? 'var(--color-status-menunggu)' : 'var(--color-enamel-900)' }}
            >
              {lowStockCount} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Item</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: lowStockCount > 0 ? 'var(--color-status-menunggu)' : 'var(--color-teks-2)', marginTop: 4 }}>
              {lowStockCount > 0 ? 'Perlu restock dari supplier' : 'Seluruh stok dalam kondisi aman'}
            </div>
          </div>

          <div className="bo-stat-card" style={{ background: 'var(--color-kertas)', border: '1px solid var(--color-garis)' }}>
            <div className="bo-stat-label">Jumlah Gudang / Lokasi</div>
            <div className="bo-stat-value" style={{ color: 'var(--color-enamel-900)' }}>
              {warehouses.length} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Lokasi</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-teks-2)', marginTop: 4 }}>
              Gudang Pusat & Dapur Outlet
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bo-tabs">
          <button
            type="button"
            className={`bo-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('inventory');
              setSelectedProductForLedger(null);
            }}
          >
            <Boxes size={16} />
            <span>Ringkasan Stok Produk</span>
          </button>
          <button
            type="button"
            className={`bo-tab ${activeTab === 'warehouses' ? 'active' : ''}`}
            onClick={() => setActiveTab('warehouses')}
          >
            <Building2 size={16} />
            <span>Master Gudang ({warehouses.length})</span>
          </button>
          <button
            type="button"
            className={`bo-tab ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <History size={16} />
            <span>Riwayat Ledger Mutasi ({stockMovements.length})</span>
          </button>
        </div>

        {/* === TAB 1: RINGKASAN STOK PRODUK === */}
        {activeTab === 'inventory' && (
          <div>
            <div className="bo-action-bar">
              <div className="bo-search-box">
                <Search size={16} color="var(--color-teks-2)" />
                <input
                  type="text"
                  placeholder="Cari produk berstok..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--color-teks-2)' }}>
                Menampilkan <strong>{filteredStock.length}</strong> produk ber-stok
              </div>
            </div>

            <div className="bo-table-wrapper" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table className="bo-table" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 200 }}>Nama Produk / SKU</th>
                    <th style={{ minWidth: 120 }}>Kategori</th>
                    <th style={{ minWidth: 120 }}>Harga Satuan</th>
                    <th style={{ minWidth: 150 }}>Total Stok Saat Ini</th>
                    <th style={{ minWidth: 130 }}>Status Stok</th>
                    <th style={{ minWidth: 140, textAlign: 'right' }}>Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-teks-2)' }}>
                        Tidak ada produk ber-stok yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => (
                      <tr key={item.produk_id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-enamel-900)' }}>
                              {item.produk_nama}
                            </span>
                            {item.sku && (
                              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-teks-2)' }}>
                                {item.sku}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.8125rem' }}>{item.kategori_nama}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {formatRupiahFull(item.harga)}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1rem',
                              fontWeight: 700,
                              color:
                                item.status === 'minus'
                                  ? 'var(--color-status-gagal)'
                                  : item.status === 'habis'
                                  ? 'var(--color-status-gagal)'
                                  : item.status === 'menipis'
                                  ? 'var(--color-status-menunggu)'
                                  : 'var(--color-enamel-900)',
                            }}
                          >
                            {item.total_stok} Unit
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {item.status === 'aman' && (
                            <span className="bo-badge bo-badge--success">Aman ({item.total_stok})</span>
                          )}
                          {item.status === 'menipis' && (
                            <span className="bo-badge bo-badge--warning">Menipis ({item.total_stok})</span>
                          )}
                          {item.status === 'habis' && (
                            <span className="bo-badge bo-badge--error">Habis (0)</span>
                          )}
                          {item.status === 'minus' && (
                            <span className="bo-badge bo-badge--error" title="Oversell diperbolehkan di Diko">
                              Minus ({item.total_stok})
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="bo-btn bo-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleOpenRestock(item.produk_id)}
                              title="Restock stok masuk"
                            >
                              <Plus size={13} />
                              <span>Restock</span>
                            </button>
                            <button
                              type="button"
                              className="bo-btn bo-btn-ghost"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedProductForLedger(item.produk_id);
                                setActiveTab('ledger');
                              }}
                              title="Lihat riwayat ledger produk ini"
                            >
                              <History size={13} />
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

        {/* === TAB 2: MASTER GUDANG === */}
        {activeTab === 'warehouses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                type="button"
                className="bo-btn bo-btn-primary"
                onClick={() => handleOpenWarehouseModal()}
                style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
              >
                <Plus size={16} />
                <span>Tambah Gudang Baru</span>
              </button>
            </div>

            <div className="bo-table-wrapper" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table className="bo-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 90 }}>Kode</th>
                    <th style={{ minWidth: 180 }}>Nama Gudang / Lokasi</th>
                    <th style={{ minWidth: 180 }}>Alamat / Detail</th>
                    <th style={{ minWidth: 150 }}>Penanggung Jawab (PIC)</th>
                    <th style={{ minWidth: 90 }}>Status</th>
                    <th style={{ minWidth: 90, textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh) => (
                    <tr key={wh.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-enamel-900)' }}>
                          {wh.kode}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{wh.nama}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-teks-2)', fontSize: '0.8125rem' }}>
                          {wh.lokasi || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{wh.pic}</span>
                      </td>
                      <td>
                        <span className="bo-badge bo-badge--success">Aktif</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="bo-btn-ghost"
                            onClick={() => handleOpenWarehouseModal(wh)}
                          >
                            <Edit2 size={16} />
                          </button>
                          {warehouses.length > 1 && (
                            <button
                              type="button"
                              className="bo-btn-danger"
                              onClick={() => handleDeleteWarehouse(wh.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 3: RIWAYAT LEDGER PERGERAKAN STOK === */}
        {activeTab === 'ledger' && (
          <div>
            <div className="bo-action-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div className="bo-search-box">
                  <Search size={16} color="var(--color-teks-2)" />
                  <input
                    type="text"
                    placeholder="Cari produk / no referensi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="bo-select"
                  value={selectedWarehouseFilter}
                  onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  style={{ width: 'auto', height: 38 }}
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
                    style={{ height: 38 }}
                  >
                    <span>Hapus Filter Produk</span>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--color-teks-2)' }}>
                Audit trail ledger mutasi stok <strong>(Append-only)</strong>
              </div>
            </div>

            <div className="bo-table-wrapper" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table className="bo-table" style={{ minWidth: 940 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 140 }}>Waktu Mutasi</th>
                    <th style={{ minWidth: 180 }}>Nama Produk</th>
                    <th style={{ minWidth: 150 }}>Lokasi Gudang</th>
                    <th style={{ minWidth: 130 }}>Jenis Mutasi</th>
                    <th style={{ minWidth: 150 }}>No. Referensi / Dokumen</th>
                    <th style={{ minWidth: 180 }}>Catatan</th>
                    <th style={{ minWidth: 100, textAlign: 'right' }}>Kuantitas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-teks-2)' }}>
                        Belum ada mutasi stok tercatat pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => (
                      <tr key={m.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-teks-2)' }}>
                            {new Date(m.waktu_client).toLocaleString('id-ID', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-enamel-900)' }}>
                            {m.produk_nama}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.8125rem' }}>{m.gudang_nama || 'Gudang Utama'}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {m.tipe === 'awal' && (
                            <span className="bo-badge bo-badge--success" style={{ display: 'inline-flex', gap: 4 }}>
                              <ArrowDownRight size={12} /> Stok Masuk
                            </span>
                          )}
                          {m.tipe === 'penjualan' && (
                            <span className="bo-badge bo-badge--neutral" style={{ display: 'inline-flex', gap: 4 }}>
                              <ArrowUpRight size={12} /> Penjualan
                            </span>
                          )}
                          {m.tipe === 'penyesuaian' && (
                            <span className="bo-badge bo-badge--warning" style={{ display: 'inline-flex', gap: 4 }}>
                              <Sliders size={12} /> Penyesuaian
                            </span>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {m.nomor_referensi || '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-teks-2)' }}>
                            {m.catatan || '-'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '0.9375rem',
                              color: m.qty > 0 ? 'var(--color-success)' : 'var(--color-destructive)',
                            }}
                          >
                            {m.qty > 0 ? `+${m.qty}` : m.qty}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Tambah / Edit Gudang */}
      {showWarehouseModal && (
        <div className="bo-modal-overlay" onClick={() => setShowWarehouseModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">
                {editingWarehouse ? 'Edit Master Gudang' : 'Tambah Gudang Baru'}
              </h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowWarehouseModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse}>
              <div className="bo-modal-body">
                {whError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#B91C1C', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                    {whError}
                  </div>
                )}

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Kode Gudang *</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      placeholder="GD-01"
                      value={whKode}
                      onChange={(e) => setWhKode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bo-form-group">
                    <label className="bo-form-label">Nama Gudang *</label>
                    <input
                      type="text"
                      className="bo-form-input"
                      placeholder="Gudang Utama"
                      value={whNama}
                      onChange={(e) => setWhNama(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Nama staf / PIC gudang"
                    value={whPic}
                    onChange={(e) => setWhPic(e.target.value)}
                  />
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Alamat / Lokasi Gudang</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Alamat fisik atau ruko"
                    value={whLokasi}
                    onChange={(e) => setWhLokasi(e.target.value)}
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
                <button
                  type="submit"
                  className="bo-btn bo-btn-primary"
                  style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
                >
                  Simpan Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Stok Masuk (Restock) */}
      {showRestockModal && (
        <div className="bo-modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Catat Penerimaan Stok Masuk</h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowRestockModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRestock}>
              <div className="bo-modal-body">
                <div className="bo-form-group">
                  <label className="bo-form-label">Pilih Produk *</label>
                  <select
                    className="bo-select"
                    value={restockProductId}
                    onChange={(e) => setRestockProductId(e.target.value)}
                    required
                  >
                    {stockSummary.map((s) => (
                      <option key={s.produk_id} value={s.produk_id}>
                        {s.produk_nama} (Stok Saat Ini: {s.total_stok})
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
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama} ({w.kode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Jumlah Masuk (Unit) *</label>
                    <input
                      type="number"
                      min="1"
                      className="bo-form-input"
                      value={restockQty}
                      onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                      required
                    />
                  </div>
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Nomor Dokumen / Surat Jalan / PO</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="PO-2026-001"
                    value={restockRef}
                    onChange={(e) => setRestockRef(e.target.value)}
                  />
                </div>

                <div className="bo-form-group">
                  <label className="bo-form-label">Catatan Mutasi</label>
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Keterangan pembelian supplier / restock rutin"
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
                <button
                  type="submit"
                  className="bo-btn bo-btn-primary"
                  style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
                >
                  Catat ke Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penyesuaian Stok (Stok Opname) */}
      {showOpnameModal && (
        <div className="bo-modal-overlay" onClick={() => setShowOpnameModal(false)}>
          <div className="bo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bo-modal-header">
              <h2 className="bo-modal-title">Penyesuaian Stok (Stok Opname)</h2>
              <button type="button" className="bo-modal-close" onClick={() => setShowOpnameModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOpname}>
              <div className="bo-modal-body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-teks-2)', marginBottom: 16 }}>
                  Sistem akan otomatis menghitung selisih delta antara fisik nyata dengan stok sistem dan mencatatnya sebagai baris mutasi penyesuaian baru.
                </p>

                <div className="bo-form-group">
                  <label className="bo-form-label">Pilih Produk yang Dihitung Fisik *</label>
                  <select
                    className="bo-select"
                    value={opnameProductId}
                    onChange={(e) => {
                      setOpnameProductId(e.target.value);
                      const current = stockSummary.find((s) => s.produk_id === e.target.value);
                      setOpnameFisik(current ? current.total_stok : 0);
                    }}
                    required
                  >
                    {stockSummary.map((s) => (
                      <option key={s.produk_id} value={s.produk_id}>
                        {s.produk_nama} (Stok Sistem: {s.total_stok})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bo-form-row">
                  <div className="bo-form-group">
                    <label className="bo-form-label">Lokasi Gudang *</label>
                    <select
                      className="bo-select"
                      value={opnameWarehouseId}
                      onChange={(e) => setOpnameWarehouseId(e.target.value)}
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bo-form-group">
                    <label className="bo-form-label">Hasil Hitung Fisik (Unit) *</label>
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
                  <input
                    type="text"
                    className="bo-form-input"
                    placeholder="Contoh: Barang rusak saat display / selisih opname akhir bulan"
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
                <button
                  type="submit"
                  className="bo-btn bo-btn-primary"
                  style={{ background: 'var(--color-enamel-600)', color: '#FFFFFF' }}
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
