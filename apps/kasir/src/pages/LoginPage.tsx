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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <label className="form-label" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>
            Pilih Pengguna:
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {DUMMY_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`btn ${selectedUser === user.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setSelectedUser(user.id);
                  setPin('');
                  setError('');
                }}
                style={{
                  flex: 1,
                  minHeight: 42,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  background: selectedUser === user.id ? 'var(--color-primary)' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <User size={13} />
                <span>{user.nama}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PIN display (4 Dots) */}
        <div className="pin-display">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="pin-input"
              style={{
                borderColor: pin.length > i ? 'var(--color-accent)' : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p style={{ color: 'var(--color-destructive)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            {error}
          </p>
        )}

        {/* Numpad Tablet Touchscreen */}
        <div className="numpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map((key) => (
            <button
              key={key}
              type="button"
              className={`numpad-btn ${key === 'clear' ? 'numpad-btn--danger' : ''}`}
              onClick={() => handleNumpadPress(key)}
              style={{
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {key === 'clear' ? (
                'C'
              ) : key === 'backspace' ? (
                <Delete size={20} />
              ) : (
                key
              )}
            </button>
          ))}
        </div>

        {/* Petunjuk PIN Default */}
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lock size={12} />
          <span>PIN Demo: <strong>1234</strong> (Desia) atau <strong>5678</strong> (Budi)</span>
        </div>
      </div>
    </div>
  );
}
