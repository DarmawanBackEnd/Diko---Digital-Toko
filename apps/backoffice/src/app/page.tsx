// Halaman utama backoffice — dashboard
// Tampilkan statistik ringkasan dan navigasi ke fitur utama

import { formatRupiahFull } from '@kasir-pintar/core';
import { Sidebar } from '../components/Sidebar';

export default function DashboardPage() {
  return (
    <div className="bo-layout">
      {/* Sidebar Universal */}
      <Sidebar />

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
