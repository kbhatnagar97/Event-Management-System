import { create } from 'zustand';
import type { Guest } from '@/types/common';
import type { OverlayType } from '@/types/checkin';

type CheckInScreen = 'pin' | 'scanner' | 'search';

interface CheckInState {
  screen: CheckInScreen;
  authenticated: boolean;
  currentGuest: Guest | null;
  overlay: OverlayType;
  editAdults: number;
  editKids: number;
  editSeniors: number;
  searchQuery: string;
  searchFilter: 'all' | 'pending' | 'checked_in';
  setScreen: (s: CheckInScreen) => void;
  authenticate: () => void;
  showOverlay: (type: OverlayType, guest: Guest) => void;
  dismissOverlay: () => void;
  setEditAdults: (n: number) => void;
  setEditKids: (n: number) => void;
  setEditSeniors: (n: number) => void;
  setSearchQuery: (q: string) => void;
  setSearchFilter: (f: 'all' | 'pending' | 'checked_in') => void;
  reset: () => void;
}

export const useCheckInStore = create<CheckInState>((set) => ({
  screen: 'pin',
  authenticated: false,
  currentGuest: null,
  overlay: null,
  editAdults: 0,
  editKids: 0,
  editSeniors: 0,
  searchQuery: '',

  searchFilter: 'all',
  setScreen: (screen) => set({ screen }),
  authenticate: () => set({ authenticated: true, screen: 'scanner' }),
  showOverlay: (overlay, guest) =>
    set({ overlay, currentGuest: guest, editAdults: guest.adults, editKids: guest.kids, editSeniors: guest.seniors }),
  dismissOverlay: () => set({ overlay: null, currentGuest: null }),
  setEditAdults: (editAdults) => set({ editAdults: Math.max(0, editAdults) }),
  setEditKids: (editKids) => set({ editKids: Math.max(0, editKids) }),
  setEditSeniors: (editSeniors) => set({ editSeniors: Math.max(0, editSeniors) }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  reset: () =>
    set({
      screen: 'pin',
      authenticated: false,
      currentGuest: null,
      overlay: null,
      editAdults: 0,
      editKids: 0,
      editSeniors: 0,
      searchQuery: '',
      searchFilter: 'all',
    }),
}));
