/**
 * ── Check-In API ──
 * Delegates to mock/ or live/ based on VITE_USE_MOCK env variable.
 *
 * .env toggle:
 *   VITE_USE_MOCK=true   → local in-memory mock (default)
 *   VITE_USE_MOCK=false  → real backend via HTTP client
 */
import { USE_MOCK } from '@/lib/constants';

import * as mock from './mock/checkin';
import * as live from './live/checkin';

const impl = USE_MOCK ? mock : live;

export const lookupCode = impl.lookupCode;
export const checkInGuest = impl.checkInGuest;
export const undoCheckIn = impl.undoCheckIn;
export const getStats = impl.getStats;
export const searchGuests = impl.searchGuests;

