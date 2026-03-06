/**
 * ── Live Check-In API ──
 * Real HTTP calls to the backend.
 */
import { api } from '../client';
import type { Guest } from '@/types/common';
import type { CheckInPayload, CheckInStats, GuestSearchParams, GuestSearchResponse } from '@/types/checkin';

/** GET /checkin/lookup/:code */
export const lookupCode = (code: string) =>
  api.get<{ guest: Guest }>(`/checkin/lookup/${code}`);

/** POST /checkin */
export const checkInGuest = (payload: CheckInPayload) =>
  api.post<{ success: boolean; guest: Guest }>('/checkin', payload);

/** POST /checkin/undo */
export const undoCheckIn = (guestId: string) =>
  api.post<{ success: boolean; guest: Guest }>('/checkin/undo', { guestId });

/** GET /checkin/stats */
export const getStats = () =>
  api.get<CheckInStats>('/checkin/stats');

/** GET /checkin/guests?q=&filter=&page=&limit= */
export const searchGuests = (params: GuestSearchParams) => {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.filter) qs.set('filter', params.filter);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return api.get<GuestSearchResponse>(`/checkin/guests?${qs.toString()}`);
};
