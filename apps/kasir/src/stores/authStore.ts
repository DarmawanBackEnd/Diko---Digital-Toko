// Store autentikasi kasir — login via PIN
// Menggunakan Zustand sesuai brief §3

import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: {
    id: string;
    nama: string;
    peran: 'owner' | 'kasir';
  } | null;
  merchantId: string | null;
  deviceKode: string;
  login: (user: { id: string; nama: string; peran: 'owner' | 'kasir' }, merchantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  currentUser: null,
  merchantId: null,
  deviceKode: 'K1', // Default device — akan dikonfigurasi saat setup

  login: (user, merchantId) =>
    set({
      isLoggedIn: true,
      currentUser: user,
      merchantId,
    }),

  logout: () =>
    set({
      isLoggedIn: false,
      currentUser: null,
      merchantId: null,
    }),
}));
