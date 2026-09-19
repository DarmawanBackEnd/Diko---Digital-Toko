// Halaman login kasir Diko (Digital Toko) — Input PIN
// Mendukung sentuhan tablet (numpad visual) dan keyboard laptop/komputer
// Menggunakan icon murni dari lucide-react (Bebas Emoticon)

import { useState, useCallback, useEffect } from 'react';
import { User, Lock, Delete } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const DUMMY_USERS = [
  { id: '1', nama: 'Desia (Kasir)', pin: '1234', peran: 'kasir' as const },
  { id: '2', nama: 'Budi (Owner)', pin: '5678', peran: 'owner' as const },
];

const MERCHANT_ID = 'demo-diko-001';

export function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('1'); // Default ke Desia
  const login = useAuthStore((state) => state.login);

  const handleNumpadPress = useCallback(
    (digit: string) => {
      setError('');
      if (digit === 'clear') {
        setPin('');
        return;
      }
      if (digit === 'backspace') {
        setPin((prev) => prev.slice(0, -1));
        return;
      }
      if (pin.length >= 4) return;
      setPin((prev) => prev + digit);
    },
    [pin.length]
  );

  const handleLogin = useCallback(() => {
    if (!selectedUser) {
      setError('Pilih kasir terlebih dahulu');
      return;
    }
    const user = DUMMY_USERS.find((u) => u.id === selectedUser);
    if (!user) return;

    if (pin === user.pin) {
      login({ id: user.id, nama: user.nama.split(' ')[0] || user.nama, peran: user.peran }, MERCHANT_ID);
    } else {
      setError('PIN salah (Gunakan 1234)');
      setPin('');
    }
  }, [selectedUser, pin, login]);

  // Support input keyboard fisik untuk laptop / komputer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumpadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleNumpadPress('backspace');
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleNumpadPress('clear');
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleLogin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumpadPress, handleLogin, pin.length]);

  // Auto-submit saat 4 digit terisi
  useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin, handleLogin]);

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo Diko */}
        <div className="login-logo" style={{ background: 'var(--color-primary)', width: 60, height: 60, fontSize: 30 }}>
          D
        </div>
        <div>
          <h1 className="login-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
            Diko POS
          </h1>
          <p className="login-subtitle" style={{ marginTop: 2 }}>
            Digital Toko • Masuk Kasir
          </p>
        </div>

        {/* Pilih user */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="form-label" style={{ fontSize: 12, color: 'var(--color-teks-2)', fontWeight: 600 }}>
            Pilih Pengguna:
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {DUMMY_USERS.map((user) => {
              const isSelected = selectedUser === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setSelectedUser(user.id);
                    setPin('');
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    minHeight: 46,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: isSelected ? 'var(--color-primary)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--color-teks)',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-garis)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(22, 52, 58, 0.2)' : 'none',
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <User size={15} strokeWidth={2.2} />
                  <span>{user.nama}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN display (4 Slot Indikator) */}
        <div className="pin-display">
          {[0, 1, 2, 3].map((i) => {
            const isFilled = pin.length > i;
            return (
              <div
                key={i}
                className={`pin-slot ${isFilled ? 'filled' : ''}`}
                aria-label={`Digit PIN ${i + 1}`}
              >
                {isFilled && <div className="pin-dot" />}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              color: 'var(--color-destructive)',
              fontSize: 12.5,
              fontWeight: 700,
              background: 'rgba(184, 80, 75, 0.08)',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(184, 80, 75, 0.2)',
              marginTop: -6,
            }}
          >
            {error}
          </div>
        )}

        {/* Numpad Tablet Touchscreen — Ukuran Besar & Pas di Jari Kasir */}
        <div className="numpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map((key) => (
            <button
              key={key}
              type="button"
              className={`numpad-btn ${key === 'clear' ? 'numpad-btn--danger' : key === 'backspace' ? 'numpad-btn--action' : ''}`}
              onClick={() => handleNumpadPress(key)}
              aria-label={key === 'clear' ? 'Hapus semua' : key === 'backspace' ? 'Hapus digit terakhir' : `Angka ${key}`}
            >
              {key === 'clear' ? (
                'C'
              ) : key === 'backspace' ? (
                <Delete size={22} strokeWidth={2.2} />
              ) : (
                key
              )}
            </button>
          ))}
        </div>

        {/* Petunjuk PIN Default */}
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-teks-2)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-latar)',
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid var(--color-garis)',
          }}
        >
          <Lock size={13} />
          <span>PIN Demo: <strong>1234</strong> (Desia) atau <strong>5678</strong> (Budi)</span>
        </div>
      </div>
    </div>
  );
}
