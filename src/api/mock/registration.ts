/**
 * ── Mock Registration API ──
 * In-memory guest store for local development without a backend.
 */
import type { Guest } from '@/types/common';
import type { RegistrationPayload, RegistrationResponse, VerifyEmailResponse } from '@/types/registration';
import { generateCode } from '@/lib/helpers';

/* Seed a pre-registered dummy user for testing */
const mockGuests: Guest[] = [
  {
    id: crypto.randomUUID(),
    firstName: 'Aman',
    lastName: 'Sharma',
    email: 'asd@deloitte.com',
    code: '482916',
    adults: 2,
    kids: 1,
    seniors: 1,
    status: 'pending',
    createdAt: new Date('2026-02-20').toISOString(),
  },
];

export async function verifyEmail(email: string): Promise<VerifyEmailResponse> {
  await delay(600);
  const existing = mockGuests.find((g) => g.email === email);
  return {
    valid: /@deloitte\.com$/i.test(email),
    registered: !!existing,
    employeeName: existing ? `${existing.firstName} ${existing.lastName}` : undefined,
    guest: existing ?? undefined,
  };
}

export async function register(payload: RegistrationPayload): Promise<RegistrationResponse> {
  await delay(800);

  // Upsert — if email exists, update in place and keep same code
  const idx = mockGuests.findIndex((g) => g.email === payload.email);

  if (idx !== -1) {
    const existing = mockGuests[idx];
    const updated: Guest = {
      ...existing,
      firstName: payload.firstName,
      lastName: payload.lastName,
      adults: payload.adults,
      kids: payload.kids,
      seniors: payload.seniors,
    };
    mockGuests[idx] = updated;
    return { guest: updated, code: updated.code };
  }

  // New user — generate a unique code
  const code = generateCode();
  const guest: Guest = {
    id: crypto.randomUUID(),
    ...payload,
    code,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  mockGuests.push(guest);
  return { guest, code };
}

/** Expose mock store so check-in mock can share the same data */
export function getMockGuests(): Guest[] {
  return mockGuests;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
