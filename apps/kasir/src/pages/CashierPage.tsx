// Halaman utama kasir Diko (Digital Toko) — Responsif Mobile, Tablet & Laptop
// Menggunakan icon murni dari lucide-react (Bebas Emoticon/Emoji)

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Coffee,
  CupSoda,
  UtensilsCrossed,
  Cookie,
  Search,
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { formatRupiah } from '@kasir-pintar/core';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useShiftStore } from '../stores/shiftStore';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal, type ReceiptData } from '../components/ReceiptModal';
import { VariantModal, type ProductItem } from '../components/VariantModal';
import { ShiftModal } from '../components/ShiftModal';

// Kategori Diko dengan icon resmi lucide-react
const DUMMY_CATEGORIES = [
  { id: 'all', nama: 'Semua Menu', icon: LayoutGrid },
  { id: 'cat-1', nama: 'Kopi', icon: Coffee },
  { id: 'cat-2', nama: 'Non-Kopi', icon: CupSoda },
  { id: 'cat-3', nama: 'Makanan', icon: UtensilsCrossed },
  { id: 'cat-4', nama: 'Snack', icon: Cookie },
];

const DUMMY_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    kategori_id: 'cat-1',
    nama: 'Espresso',
    harga: 15000,
    variants: [
      { id: 'v1', nama: 'Single', selisih_harga: 0 },
      { id: 'v2', nama: 'Double Shot', selisih_harga: 5000 },
    ],
  },
  {
    id: 'p2',
    kategori_id: 'cat-1',
    nama: 'Americano',
    harga: 18000,
    variants: [
      { id: 'v3', nama: 'Panas', selisih_harga: 0 },
      { id: 'v4', nama: 'Dingin (Iced)', selisih_harga: 2000 },
    ],
  },
  {
    id: 'p3',
    kategori_id: 'cat-1',
    nama: 'Kopi Susu Diko',
    harga: 22000,
    variants: [
      { id: 'v5', nama: 'Reguler (Dingin)', selisih_harga: 0 },
      { id: 'v6', nama: 'Large (Dingin)', selisih_harga: 5000 },
      { id: 'v7', nama: 'Panas (Hot)', selisih_harga: 0 },
    ],
  },
  {
    id: 'p4',
    kategori_id: 'cat-1',
    nama: 'Cappuccino',
    harga: 25000,
    variants: [
      { id: 'v8', nama: 'Panas', selisih_harga: 0 },
      { id: 'v9', nama: 'Dingin', selisih_harga: 2000 },
    ],
  },
  {
    id: 'p5',
    kategori_id: 'cat-1',
    nama: 'Caramel Latte',
    harga: 28000,
    variants: [
      { id: 'v10', nama: 'Reguler', selisih_harga: 0 },
      { id: 'v11', nama: 'Large', selisih_harga: 6000 },
    ],
  },
  {
    id: 'p6',
    kategori_id: 'cat-2',
    nama: 'Matcha Latte',
    harga: 27000,
    variants: [
      { id: 'v12', nama: 'Dingin', selisih_harga: 0 },
      { id: 'v13', nama: 'Panas', selisih_harga: 0 },
    ],
  },
  {
    id: 'p7',
    kategori_id: 'cat-2',
    nama: 'Coklat Belgia',
    harga: 24000,
    variants: [
      { id: 'v14', nama: 'Dingin', selisih_harga: 0 },
      { id: 'v15', nama: 'Panas', selisih_harga: 0 },
    ],
  },
  {
    id: 'p8',
    kategori_id: 'cat-2',
    nama: 'Es Teh Manis',
    harga: 8000,
  },
  {
    id: 'p9',
    kategori_id: 'cat-2',
    nama: 'Lemon Tea Segar',
    harga: 14000,
  },
  {
    id: 'p10',
    kategori_id: 'cat-3',
    nama: 'Roti Bakar Coklat Keju',
    harga: 18000,
  },
  {
    id: 'p11',
    kategori_id: 'cat-3',
    nama: 'Nasi Goreng Diko Spesial',
    harga: 28000,
  },
  {
    id: 'p12',
    kategori_id: 'cat-3',
    nama: 'Mie Goreng Telur',
    harga: 22000,
  },
  {
    id: 'p13',
    kategori_id: 'cat-4',
    nama: 'Kentang Goreng Krispi',
    harga: 18000,
  },
  {
    id: 'p14',
    kategori_id: 'cat-4',
    nama: 'Pisang Goreng Madu',
    harga: 15000,
  },
  {
    id: 'p15',
    kategori_id: 'cat-4',
    nama: 'Croissant Butter',
    harga: 19000,
  },
];

export function CashierPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Modals state
  const [showPayment, setShowPayment] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<ProductItem | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customDiscountInput, setCustomDiscountInput] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  const isShiftOpen = useShiftStore((state) => state.isShiftOpen);
  const syncStatus = useShiftStore((state) => state.syncStatus);
  const pendingOutboxCount = useShiftStore((state) => state.pendingOutboxCount);
  const setSyncStatus = useShiftStore((state) => state.setSyncStatus);

  const items = useCartStore((state) => state.items);
  const diskonTransaksi = useCartStore((state) => state.diskonTransaksi);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const setDiskonTransaksi = useCartStore((state) => state.setDiskonTransaksi);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);

  // Update jam digital
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts untuk Laptop / Komputer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === '/' || e.key === 'F2') {
        if (!isInput) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        }
      } else if (
        e.code === 'Space' &&
        !isInput &&
        items.length > 0 &&
        !showPayment &&
        !showShift &&
        !selectedProductForVariant &&
        !receiptData
      ) {
        e.preventDefault();
        setShowPayment(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, items.length, showPayment, showShift, selectedProductForVariant, receiptData]);

  // Tutup menu profil saat klik di luar atau tekan Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  // Filter produk
  const filteredProducts = useMemo(() => {
    let list = DUMMY_PRODUCTS;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.kategori_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.nama.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, searchQuery]);

  // Dapatkan icon kategori untuk produk
  const getProductCategoryIcon = useCallback((catId: string) => {
    switch (catId) {
      case 'cat-1':
        return <Coffee size={14} />;
      case 'cat-2':
        return <CupSoda size={14} />;
      case 'cat-3':
        return <UtensilsCrossed size={14} />;
      case 'cat-4':
        return <Cookie size={14} />;
      default:
        return <LayoutGrid size={14} />;
    }
  }, []);

  // Handle klik produk
  const handleProductClick = useCallback(
    (product: ProductItem) => {
      if (product.variants && product.variants.length > 0) {
        setSelectedProductForVariant(product);
      } else {
        addItem({
          produk_id: product.id,
          varian_id: null,
          nama_produk: product.nama,
          harga_satuan: product.harga,
        });
      }
    },
    [addItem]
  );

  const handlePaymentSuccess = (receipt: ReceiptData) => {
    setShowPayment(false);
    setIsMobileCartOpen(false);
    setReceiptData(receipt);
  };

  const handleNewTransaction = () => {
    setReceiptData(null);
    clearCart();
  };

  const handleToggleSyncSimulation = () => {
    if (syncStatus === 'ok') {
      setSyncStatus('pending', 3);
    } else if (syncStatus === 'pending') {
      setSyncStatus('error', 3);
    } else {
      setSyncStatus('ok', 0);
    }
  };

  const subtotal = getSubtotal();
  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <>
      <div className="app-shell">
        {/* Sidebar Navigasi Desktop / Tablet Landscape */}
        <aside className="sidebar" aria-label="Navigasi Diko">
          <div className="sidebar-logo" title="Diko — Digital Toko">
            D
          </div>

          <button
            type="button"
            className="sidebar-btn active"
            title="Kasir POS"
            aria-label="Halaman kasir"
            aria-current="page"
          >
            <LayoutGrid size={22} />
          </button>

          <button
            type="button"
            className="sidebar-btn"
            title="Kelola Shift Kasir"
            onClick={() => setShowShift(true)}
            aria-label="Shift Kasir"
          >
            <Clock size={22} />
          </button>

          <div className="sidebar-spacer" />

          <button
            type="button"
            className="sidebar-btn"
            title="Ganti Kasir / Keluar"
            onClick={logout}
            aria-label="Keluar"
          >
            <LogOut size={20} />
          </button>
        </aside>

        {/* Area Konten Utama */}
        <div className="main-content">
          {/* Header Bar Diko */}
          <header className="header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>Diko</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', fontWeight: 500 }}>
                  POS
                </span>
              </span>
            </div>

            <div className="header-spacer" />

            {/* Jam Digital */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-muted-foreground)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Clock size={13} />
              <span>{currentTime}</span>
            </div>

            {/* Tombol Status Shift */}
            <button
              type="button"
              onClick={() => setShowShift(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: isShiftOpen ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                color: isShiftOpen ? 'var(--color-success)' : 'var(--color-destructive)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
              <span>{isShiftOpen ? 'Shift Aktif' : 'Shift Tutup'}</span>
            </button>

            {/* Indikator Status Sync Outbox */}
            <button
              type="button"
              onClick={handleToggleSyncSimulation}
              title="Klik untuk simulasi status sync offline/online"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background:
                  syncStatus === 'ok'
                    ? 'rgba(5, 150, 105, 0.08)'
                    : syncStatus === 'pending'
                    ? 'rgba(217, 119, 6, 0.1)'
                    : 'rgba(220, 38, 38, 0.1)',
                color:
                  syncStatus === 'ok'
                    ? 'var(--color-sync-ok)'
                    : syncStatus === 'pending'
                    ? 'var(--color-sync-pending)'
                    : 'var(--color-sync-error)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {syncStatus === 'ok' ? (
                <CheckCircle2 size={13} />
              ) : (
                <AlertTriangle size={13} />
              )}
              <span>
                {syncStatus === 'ok'
                  ? 'Online'
                  : syncStatus === 'pending'
                  ? `${pendingOutboxCount} Pending`
                  : 'Sync Error'}
              </span>
            </button>

            {/* Profil Akun Kasir & Menu Dropdown Logout */}
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                type="button"
                className={`profile-btn ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu((prev) => !prev)}
                aria-label="Menu Akun Kasir"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <div className="profile-avatar">
                  {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : <User size={13} />}
                </div>
                <span className="profile-name">{currentUser?.nama || 'Kasir'}</span>
                <ChevronDown size={14} className="profile-chevron" />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown" role="menu" aria-label="Menu Akun Kasir">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-user">{currentUser?.nama || 'Kasir'}</div>
                    <div className="profile-dropdown-role">
                      <span>{currentUser?.peran === 'owner' ? 'Owner / Admin' : 'Kasir Toko'}</span>
                      <span>•</span>
                      <span style={{ color: isShiftOpen ? 'var(--color-success)' : 'var(--color-destructive)', fontWeight: 600 }}>
                        {isShiftOpen ? 'Shift Aktif' : 'Shift Tutup'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowShift(true);
                    }}
                  >
                    <Clock size={16} />
                    <span>Kelola Shift Kasir</span>
                  </button>

                  <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

                  <button
                    type="button"
                    className="profile-dropdown-item profile-dropdown-item--danger"
                    role="menuitem"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Keluar / Logout</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Dua Kolom POS: Katalog Kiri + Keranjang Kanan */}
          <div className="cashier-layout">
            {/* Sisi Kiri: Pencarian, Kategori, Grid Produk */}
            <main className="catalog-panel">
              {/* Search bar & filter kategori */}
              <div className="catalog-search" style={{ padding: '8px 14px' }}>
                <div className="search-input-wrapper">
                  <span className="search-icon" aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                    <Search size={16} />
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="Cari produk atau SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Cari produk"
                    style={{ height: 40, borderRadius: 'var(--radius-lg)' }}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <span className="kbd-hint" style={{ position: 'absolute', right: 10 }}>
                      /
                    </span>
                  )}
                </div>
              </div>

              {/* Kategori Pills dengan Lucide Icons */}
              <div className="category-tabs" role="tablist" aria-label="Kategori produk">
                {DUMMY_CATEGORIES.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === cat.id}
                      className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <IconComp size={15} />
                      <span>{cat.nama}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grid Produk — presisi 2 kolom di mobile, 3-5 kolom di tablet/laptop */}
              <div className="catalog-grid-wrapper">
                {filteredProducts.length === 0 ? (
                  <div className="catalog-empty" style={{ textAlign: 'center', padding: 'var(--space-3xl) 0' }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>Produk tidak ditemukan</p>
                    <p style={{ color: 'var(--color-muted-foreground)', marginTop: 4, fontSize: 'var(--text-sm)' }}>
                      Coba gunakan kata kunci pencarian yang berbeda
                    </p>
                  </div>
                ) : (
                  <div className="catalog-grid">
                    {filteredProducts.map((product) => {
                      const hasVariants = product.variants && product.variants.length > 0;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          className="product-card"
                          onClick={() => handleProductClick(product)}
                          aria-label={`${product.nama}, ${formatRupiah(product.harga)}`}
                        >
                          <div className="product-card-top">
                            <div className="product-cat-icon">
                              {getProductCategoryIcon(product.kategori_id)}
                            </div>
                            {hasVariants && (
                              <span className="product-variant-badge">
                                Varian
                              </span>
                            )}
                          </div>
                          <span className="product-card-name">{product.nama}</span>
                          <div className="product-card-price">
                            <span>{formatRupiah(product.harga)}</span>
                            <span style={{ color: 'var(--color-accent)' }}>
                              <Plus size={14} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>

            {/* Overlay Mobile saat Drawer Keranjang Terbuka */}
            {isMobileCartOpen && (
              <div
                className="mobile-cart-overlay"
                onClick={() => setIsMobileCartOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Sisi Kanan: Panel Keranjang Belanja (Desktop & Drawer Mobile) */}
            <aside className={`cart-panel ${isMobileCartOpen ? 'mobile-open' : ''}`} aria-label="Keranjang belanja">
              {/* Header khusus mobile drawer */}
              <div className="mobile-drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-md)' }}>Keranjang Belanja</span>
                  <span className="cart-badge">{itemCount}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-muted-foreground)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  aria-label="Tutup keranjang"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Header Desktop */}
              <div className="cart-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <h2 className="cart-title">Pesanan</h2>
                  <span className="cart-badge">{itemCount}</span>
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={clearCart}
                    aria-label="Kosongkan keranjang pesanan"
                  >
                    <Trash2 size={13} />
                    <span>Kosongkan</span>
                  </button>
                )}
              </div>

              {/* Daftar Item di Keranjang */}
              <div className="cart-items">
                {items.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingBag className="cart-empty-icon" strokeWidth={1.5} />
                    <p className="cart-empty-title">Keranjang Masih Kosong</p>
                    <p className="cart-empty-text">
                      Pilih menu di katalog untuk menambahkan ke pesanan
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={`${item.produk_id}-${item.varian_id || index}`} className="cart-item">
                      {/* Baris Atas: Nama Produk & Subtotal Baris */}
                      <div className="cart-item-row-top">
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.nama_produk}</span>
                          {item.varian_id && (
                            <span className="cart-item-variant">Varian</span>
                          )}
                        </div>
                        <span className="cart-item-total">
                          {formatRupiah(item.qty * item.harga_satuan - item.diskon * item.qty)}
                        </span>
                      </div>

                      {/* Baris Bawah: Harga Satuan & Kontrol Stepper + Hapus */}
                      <div className="cart-item-row-bottom">
                        <span className="cart-item-unit-price">
                          @ {formatRupiah(item.harga_satuan)}
                          {item.diskon > 0 && (
                            <span style={{ color: 'var(--color-destructive)', marginLeft: 4 }}>
                              (-{formatRupiah(item.diskon)})
                            </span>
                          )}
                        </span>

                        <div className="cart-item-controls">
                          {/* Stepper Pill Capsule */}
                          <div className="cart-stepper">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => updateQty(item.produk_id, item.varian_id, item.qty - 1)}
                              aria-label="Kurangi kuantitas"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="stepper-qty">{item.qty}</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={() => updateQty(item.produk_id, item.varian_id, item.qty + 1)}
                              aria-label="Tambah kuantitas"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {/* Tombol Hapus Baris */}
                          <button
                            type="button"
                            className="cart-item-delete"
                            onClick={() => removeItem(item.produk_id, item.varian_id)}
                            aria-label={`Hapus ${item.nama_produk}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Ringkasan & Tombol Pembayaran */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">{formatRupiah(subtotal)}</span>
                </div>

                <div className="summary-row">
                  <button
                    type="button"
                    className="summary-discount-btn"
                    onClick={() => setShowDiscountModal(true)}
                  >
                    <SlidersHorizontal size={13} />
                    <span>{diskonTransaksi > 0 ? 'Ubah Diskon' : '+ Diskon Transaksi'}</span>
                  </button>
                  {diskonTransaksi > 0 && (
                    <span className="summary-value" style={{ color: 'var(--color-destructive)' }}>
                      -{formatRupiah(diskonTransaksi)}
                    </span>
                  )}
                </div>

                <div className="summary-total">
                  <span className="summary-total-label">TOTAL</span>
                  <span className="total-amount">{formatRupiah(total)}</span>
                </div>

                {/* Tombol Bayar Sekarang */}
                <button
                  type="button"
                  className="pay-btn"
                  disabled={items.length === 0}
                  onClick={() => {
                    setIsMobileCartOpen(false);
                    setShowPayment(true);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    <span>Bayar Sekarang</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiah(total)}</span>
                    <span className="kbd-hint">Space</span>
                  </span>
                </button>
              </div>
            </aside>
          </div>

          {/* Floating Cart Bar di Mobile (< 960px) */}
          {items.length > 0 && (
            <div
              className="mobile-cart-bar"
              onClick={() => setIsMobileCartOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Buka Keranjang Pesanan"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ShoppingBag size={22} />
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -8,
                      background: 'var(--color-accent)',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: '50%',
                      width: 17,
                      height: 17,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {itemCount}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>{itemCount} Menu Dipesan</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                    {formatRupiah(total)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
                <span>Lihat Pesanan</span>
                <ChevronRight size={18} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Pemilihan Varian */}
      {selectedProductForVariant && (
        <VariantModal
          product={selectedProductForVariant}
          onClose={() => setSelectedProductForVariant(null)}
          onConfirm={(itemData) => {
            addItem({
              produk_id: itemData.produk_id,
              varian_id: itemData.varian_id,
              nama_produk: itemData.nama_produk,
              harga_satuan: itemData.harga_satuan,
            });
            if (itemData.qty > 1) {
              updateQty(itemData.produk_id, itemData.varian_id, itemData.qty);
            }
          }}
        />
      )}

      {/* Modal Pembayaran Cepat */}
      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal Preview Struk 58mm Thermal */}
      {receiptData && (
        <ReceiptModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
          onNewTransaction={handleNewTransaction}
        />
      )}

      {/* Modal Shift Kasir */}
      {showShift && <ShiftModal onClose={() => setShowShift(false)} />}

      {/* Modal Diskon Transaksi */}
      {showDiscountModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowDiscountModal(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Diskon Transaksi</h3>
              <button type="button" className="modal-close" onClick={() => setShowDiscountModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {[5000, 10000, 15000, 20000].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setDiskonTransaksi(d);
                      setShowDiscountModal(false);
                    }}
                  >
                    Potongan {formatRupiah(d)}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Atau Nominal Kustom (Rp):</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 7500"
                  value={customDiscountInput}
                  onChange={(e) => setCustomDiscountInput(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDiskonTransaksi(0);
                  setShowDiscountModal(false);
                }}
              >
                Hapus Diskon
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const val = parseInt(customDiscountInput, 10) || 0;
                  setDiskonTransaksi(val);
                  setShowDiscountModal(false);
                }}
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
