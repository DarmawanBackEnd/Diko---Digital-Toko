import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CashierPage } from './pages/CashierPage';
import { MenuPage } from './pages/MenuPage';
import { WarehousePage } from './pages/WarehousePage';
import { useAuthStore } from './stores/authStore';

export function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={isLoggedIn ? <CashierPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/produk"
          element={isLoggedIn ? <MenuPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/warehouse"
          element={isLoggedIn ? <WarehousePage /> : <Navigate to="/login" replace />}
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
