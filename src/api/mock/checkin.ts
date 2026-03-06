/**
 * ── Mock Check-In API ──
 * Uses the shared in-memory guest store from mock/registration.
 */
import type { Guest } from '@/types/common';
import type { CheckInPayload, CheckInStats, GuestSearchParams, GuestSearchResponse } from '@/types/checkin';
import { getMockGuests } from './registration';

export async function lookupCode(code: string): Promise<{ guest: Guest }> {
  await delay(500);
  const guest = getMockGuests().find((g) => g.code === code);
  if (!guest) throw { error: 'GUEST_NOT_FOUND', message: 'No registration found for this code' };
  return { guest };
}

export async function checkInGuest(payload: CheckInPayload): Promise<{ success: boolean; guest: Guest }> {
  await delay(400);
  const guest = getMockGuests().find((g) => g.id === payload.guestId);
  if (!guest) throw { error: 'GUEST_NOT_FOUND', message: 'Guest not found' };
  guest.status = 'checked_in';
  guest.adults = payload.adults;
  guest.kids = payload.kids;
  guest.seniors = payload.seniors;
  guest.checkedInAt = new Date().toISOString();
  guest.checkedInBy = payload.method;
  return { success: true, guest };
}

export async function undoCheckIn(guestId: string): Promise<{ success: boolean; guest: Guest }> {
  await delay(300);
  const guest = getMockGuests().find((g) => g.id === guestId);
  if (!guest) throw { error: 'GUEST_NOT_FOUND', message: 'Guest not found' };
  guest.status = 'pending';
  guest.checkedInAt = undefined;
  guest.checkedInBy = undefined;
  return { success: true, guest };
}

export async function getStats(): Promise<CheckInStats> {
  await delay(200);
  const guests = getMockGuests();
  const total = guests.length || 350;
  const checkedIn = guests.filter((g) => g.status === 'checked_in').length;
  return {
    total,
    checkedIn,
    pending: total - checkedIn,
    percentage: total ? Math.round((checkedIn / total) * 1000) / 10 : 0,
  };
}

export async function searchGuests(params: GuestSearchParams): Promise<GuestSearchResponse> {
  await delay(300);
  let guests = [...getMockGuests()];

  if (params.filter && params.filter !== 'all') {
    guests = guests.filter((g) => g.status === params.filter);
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    guests = guests.filter(
      (g) =>
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.code.includes(q),
    );
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;

  return {
    guests: guests.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: guests.length,
      totalPages: Math.ceil(guests.length / limit),
    },
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
