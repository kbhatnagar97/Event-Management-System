export const EVENT = {
  name: 'Family Day 2026',
  date: 'March 28, 2026',
  time: '11:00 AM – 5:00 PM',
  venue: 'Ecoworld, Block 4D, Bellandur',
  venueDetail: 'Bellandur, Outer Ring Road, Bengaluru',
  targetDate: new Date('March 28, 2026 11:00:00'),
  demoPin: '2026',
} as const;

export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

/** true = use in-memory mocks, false = call real backend */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const QUERY_KEYS = {
  guests: 'guests',
  stats: 'stats',
} as const;

export const UNDO_TIMEOUT_MS = 3000;
export const OVERLAY_DISMISS_MS = 3000;
