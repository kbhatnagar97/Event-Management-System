/**
 * ── Registration API ──
 * Delegates to mock/ or live/ based on VITE_USE_MOCK env variable.
 *
 * .env toggle:
 *   VITE_USE_MOCK=true   → local in-memory mock (default)
 *   VITE_USE_MOCK=false  → real backend via HTTP client
 */
import { USE_MOCK } from '@/lib/constants';

import * as mock from './mock/registration';
import * as live from './live/registration';

const impl = USE_MOCK ? mock : live;

export const verifyEmail = impl.verifyEmail;
export const register = impl.register;

/** Only available in mock mode — used by check-in mock to share guest data */
export const getMockGuests = USE_MOCK
  ? mock.getMockGuests
  : () => { throw new Error('getMockGuests is only available in mock mode'); };

