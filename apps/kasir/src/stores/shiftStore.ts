// Store Shift Kasir & Status Sinkronisasi Diko
// Mengelola status buka/tutup kasir dan indikator offline outbox

import { create } from 'zustand';

export interface ShiftState {
  isShiftOpen: boolean;
  shiftId: string | null;
  kasAwal: number;
  dibukaPada: string | null;
  totalTunai: number;
  totalQris: number;
  jumlahTransaksi: number;
  
  // Status koneksi & outbox sync
  syncStatus: 'ok' | 'pending' | 'error';
  pendingOutboxCount: number;

  // Actions
  openShift: (kasAwal: number) => void;
  closeShift: (kasAkhir: number) => {
    kasAwal: number;
    totalTunai: number;
    totalQris: number;
    totalEkspektasi: number;
    kasAkhir: number;
    selisih: number;
    jumlahTransaksi: number;
  };
  recordTransaction: (total: number, metode: 'tunai' | 'qris') => void;
  setSyncStatus: (status: 'ok' | 'pending' | 'error', count?: number) => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  isShiftOpen: true, // Default buka untuk kemudahan pengujian UX awal
  shiftId: 'shift-' + Date.now(),
  kasAwal: 150000, // Rp 150.000 modal awal default
  dibukaPada: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  totalTunai: 0,
  totalQris: 0,
  jumlahTransaksi: 0,

  syncStatus: 'ok',
  pendingOutboxCount: 0,

  openShift: (kasAwal) =>
    set({
      isShiftOpen: true,
      shiftId: 'shift-' + Date.now(),
      kasAwal,
      dibukaPada: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      totalTunai: 0,
      totalQris: 0,
      jumlahTransaksi: 0,
    }),

  closeShift: (kasAkhir) => {
    const { kasAwal, totalTunai, totalQris, jumlahTransaksi } = get();
    const totalEkspektasi = kasAwal + totalTunai;
    const selisih = kasAkhir - totalEkspektasi;

    set({
      isShiftOpen: false,
      shiftId: null,
    });

    return {
      kasAwal,
      totalTunai,
      totalQris,
      totalEkspektasi,
      kasAkhir,
      selisih,
      jumlahTransaksi,
    };
  },

  recordTransaction: (total, metode) =>
    set((state) => ({
      totalTunai: metode === 'tunai' ? state.totalTunai + total : state.totalTunai,
      totalQris: metode === 'qris' ? state.totalQris + total : state.totalQris,
      jumlahTransaksi: state.jumlahTransaksi + 1,
      // Simulasikan outbox pending jika offline
      pendingOutboxCount: state.syncStatus === 'pending' ? state.pendingOutboxCount + 1 : 0,
    })),

  setSyncStatus: (status, count = 0) =>
    set({
      syncStatus: status,
      pendingOutboxCount: count,
    }),
}));
