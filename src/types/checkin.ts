import type { Guest } from './common';

export type CheckInMethod = 'qr_scan' | 'manual_code' | 'manual_search';

export type OverlayType = 'success' | 'duplicate' | 'not_found' | null;

export interface CheckInPayload {
  guestId: string;
  adults: number;
  kids: number;
  seniors: number;
  method: CheckInMethod;
}

export interface CheckInStats {
  total: number;
  checkedIn: number;
  pending: number;
  percentage: number;
}

export interface GuestSearchParams {
  q?: string;
  filter?: 'all' | 'pending' | 'checked_in';
  page?: number;
  limit?: number;
}

export interface GuestSearchResponse {
  guests: Guest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
