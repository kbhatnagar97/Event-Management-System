import { create } from 'zustand';
import type { Guest } from '@/types/common';

type Screen = 'email' | 'form' | 'confirm';

interface RegistrationState {
  screen: Screen;
  email: string;
  firstName: string;
  lastName: string;
  adults: number;
  kids: number;
  seniors: number;
  registrationCode: string | null;
  isUpdate: boolean;
  setScreen: (s: Screen) => void;
  setEmail: (e: string) => void;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setAdults: (n: number) => void;
  setKids: (n: number) => void;
  setSeniors: (n: number) => void;
  setRegistrationCode: (code: string) => void;
  setIsUpdate: (v: boolean) => void;
  setFromGuest: (guest: Guest) => void;
  reset: () => void;
}

const initial = {
  screen: 'email' as Screen,
  email: '',
  firstName: '',
  lastName: '',
  adults: 0,
  kids: 0,
  seniors: 0,
  registrationCode: null as string | null,
  isUpdate: false,
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initial,
  setScreen: (screen) => set({ screen }),
  setEmail: (email) => set({ email }),
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setAdults: (adults) => set({ adults: Math.max(0, adults) }),
  setKids: (kids) => set({ kids: Math.max(0, kids) }),
  setSeniors: (seniors) => set({ seniors: Math.max(0, seniors) }),
  setRegistrationCode: (registrationCode) => set({ registrationCode }),
  setIsUpdate: (isUpdate) => set({ isUpdate }),
  setFromGuest: (guest) => set({
    email: guest.email,
    firstName: guest.firstName,
    lastName: guest.lastName,
    adults: guest.adults,
    kids: guest.kids,
    seniors: guest.seniors,
    registrationCode: guest.code,
    isUpdate: true,
  }),
  reset: () => set(initial),
}));
