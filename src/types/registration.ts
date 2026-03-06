export interface RegistrationPayload {
  email: string;
  firstName: string;
  lastName: string;
  adults: number;
  kids: number;
  seniors: number;
}

export interface VerifyEmailResponse {
  valid: boolean;
  registered: boolean;
  employeeName?: string;
  guest?: import('./common').Guest;
}

export interface RegistrationResponse {
  guest: import('./common').Guest;
  code: string;
}
