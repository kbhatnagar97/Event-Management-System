/** Generate a random 6-digit code */
export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Format guest name */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/** Pad number with leading zero */
export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Pluralize a word */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

/** Validate Deloitte email */
export function isDeloitteEmail(email: string): boolean {
  return /^[^\s@]+@deloitte\.com$/i.test(email);
}
