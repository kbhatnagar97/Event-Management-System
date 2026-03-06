/* ── Shared Types ── */

export type GuestStatus = 'pending' | 'checked_in' | 'cancelled';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  code: string;
  adults: number;
  kids: number;
  seniors: number;
  status: GuestStatus;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}
