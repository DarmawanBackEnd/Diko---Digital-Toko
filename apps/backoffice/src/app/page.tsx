// Halaman utama backoffice — dashboard
// Tampilkan statistik ringkasan dan navigasi ke fitur utama

import { formatRupiahFull } from '@kasir-pintar/core';

export default function DashboardPage() {
  return (
    <div className="bo-layout">
      {/* Sidebar */}
      <aside className="bo-sidebar">
        <div className="bo-sidebar-header">
          <div className="bo-sidebar-logo">D</div>
          <span className="bo-sidebar-brand">Diko (Digital Toko)</span>
        </div>

        <nav className="bo-sidebar-nav">
          <span className="bo-nav-section">Menu</span>

          <a href="/" className="bo-nav-link active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </a>

          <a href="/produk" className="bo-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Produk
          </a>

          <a href="/transaksi" className="bo-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Transaksi
          </a>

          <span className="bo-nav-section">Laporan</span>

          <a href="/laporan" className="bo-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Penjualan Harian
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="bo-main">
        <header className="bo-header">
          <h1 className="bo-header-title">Dashboard</h1>
        </header>

        <div className="bo-content">
          {/* Stats */}
          <div className="bo-stats-grid">
            <div className="bo-stat-card">
              <div className="bo-stat-label">Penjualan Hari Ini</div>
              <div className="bo-stat-value">{formatRupiahFull(1250000)}</div>
              <div className="bo-stat-change bo-stat-change--up">+12% dari kemarin</div>
            </div>
            <div className="bo-stat-card">
              <div className="bo-stat-label">Transaksi</div>
              <div className="bo-stat-value">47</div>
              <div className="bo-stat-change bo-stat-change--up">+8 transaksi</div>
            </div>
            <div className="bo-stat-card">
              <div className="bo-stat-label">Rata-rata Transaksi</div>
              <div className="bo-stat-value">{formatRupiahFull(26596)}</div>
            </div>
            <div className="bo-stat-card">
              <div className="bo-stat-label">Produk Aktif</div>
              <div className="bo-stat-value">20</div>
            </div>
          </div>

          {/* Transaksi terakhir */}
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            Transaksi Terakhir
          </h2>

          <div className="bo-table-wrapper">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>No. Struk</th>
                  <th>Waktu</th>
                  <th>Kasir</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>K1-000047</td>
                  <td>14:32</td>
                  <td>Desia</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiahFull(46000)}</td>
                  <td><span className="bo-badge bo-badge--success">Tunai</span></td>
                  <td><span className="bo-badge bo-badge--success">Selesai</span></td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>K1-000046</td>
                  <td>14:15</td>
                  <td>Desia</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiahFull(25000)}</td>
                  <td><span className="bo-badge bo-badge--neutral">QRIS</span></td>
                  <td><span className="bo-badge bo-badge--success">Selesai</span></td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>K1-000045</td>
                  <td>13:48</td>
                  <td>Ahmad</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatRupiahFull(83000)}</td>
                  <td><span className="bo-badge bo-badge--success">Tunai</span></td>
                  <td><span className="bo-badge bo-badge--success">Selesai</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
