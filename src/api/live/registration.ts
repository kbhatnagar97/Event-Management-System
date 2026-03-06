/**
 * ── Live Registration API ──
 * Real HTTP calls to the backend.
 */
import { api } from '../client';
import type { RegistrationPayload, RegistrationResponse, VerifyEmailResponse } from '@/types/registration';

/** POST /registration/verify-email */
export const verifyEmail = (email: string) =>
  api.post<VerifyEmailResponse>('/registration/verify-email', { email });

/** POST /registration/register (upsert — creates or updates) */
export const register = (payload: RegistrationPayload) =>
  api.post<RegistrationResponse>('/registration/register', payload);
