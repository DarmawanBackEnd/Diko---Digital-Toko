// Komponen Navigasi Header untuk Halaman Manajemen Menu & Warehouse di Kasir SPA
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Package, ArrowLeft, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function AdminNavbar({ title }: { title: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);

  return (
    <header className="bo-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-kertas)', borderBottom: '1px solid var(--color-garis)', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Tombol Cepat Kembali ke Layar Kasir */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bo-btn bo-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-latar)', border: '1px solid var(--color-garis)', color: 'var(--color-enamel-900)' }}
          title="Kembali ke Layar Kasir POS"
        >
          <ArrowLeft size={16} />
          <span>Layar Kasir</span>
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--color-garis)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'var(--color-enamel-600)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
            D
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-enamel-900)', lineHeight: 1.2 }}>
              Diko <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--color-teks-2)' }}>Toko</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-teks-2)', fontWeight: 600 }}>{title}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigasi Tengah */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-latar)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-garis)' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: location.pathname === '/' ? 'var(--color-kertas)' : 'transparent',
            color: location.pathname === '/' ? 'var(--color-enamel-600)' : 'var(--color-teks-2)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: location.pathname === '/' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <ShoppingCart size={15} />
          <span>Kasir POS</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/produk')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: location.pathname === '/produk' ? 'var(--color-kertas)' : 'transparent',
            color: location.pathname === '/produk' ? 'var(--color-enamel-600)' : 'var(--color-teks-2)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: location.pathname === '/produk' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <UtensilsCrossed size={15} />
          <span>Kelola Menu</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/warehouse')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: location.pathname === '/warehouse' ? 'var(--color-kertas)' : 'transparent',
            color: location.pathname === '/warehouse' ? 'var(--color-enamel-600)' : 'var(--color-teks-2)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: location.pathname === '/warehouse' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Package size={15} />
          <span>Gudang & Stok</span>
        </button>
      </div>

      {/* Profil Akun di Kanan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--color-latar)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-garis)' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-enamel-100)', color: 'var(--color-enamel-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
            {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : <User size={12} />}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-enamel-900)' }}>
            {currentUser?.nama || 'Owner'}
          </span>
        </div>
      </div>
    </header>
  );
}
