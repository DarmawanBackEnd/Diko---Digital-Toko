'use client';

// Navigasi Sidebar universal Backoffice Diko (Digital Toko)
// Menggunakan icon murni lucide-react (Bebas Emoji)

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Warehouse,
  Receipt,
  BarChart3,
  Store,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Manajemen Menu',
      href: '/produk',
      icon: UtensilsCrossed,
      active: pathname.startsWith('/produk'),
    },
    {
      label: 'Warehouse & Stok',
      href: '/warehouse',
      icon: Warehouse,
      active: pathname.startsWith('/warehouse'),
    },
    {
      label: 'Transaksi',
      href: '/transaksi',
      icon: Receipt,
      active: pathname.startsWith('/transaksi'),
    },
    {
      label: 'Laporan Penjualan',
      href: '/laporan',
      icon: BarChart3,
      active: pathname.startsWith('/laporan'),
    },
  ];

  return (
    <aside className="bo-sidebar" aria-label="Navigasi Utama Backoffice">
      <div className="bo-sidebar-header">
        <div className="bo-sidebar-logo" title="Diko Backoffice">
          D
        </div>
        <div>
          <div className="bo-sidebar-brand">Diko Backoffice</div>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Digital Toko • Admin</div>
        </div>
      </div>

      <nav className="bo-sidebar-nav">
        <span className="bo-nav-section">Katalog & Operasional</span>

        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bo-nav-link ${item.active ? 'active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <span className="bo-nav-section">Audit & Laporan</span>

        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bo-nav-link ${item.active ? 'active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Info Toko Kasir Aktif */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <Store size={16} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>Diko Coffee & Eatery</div>
          <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>Outlet Utama (K1)</div>
        </div>
      </div>
    </aside>
  );
}
