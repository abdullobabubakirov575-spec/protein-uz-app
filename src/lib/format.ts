const NBSP = ' ';

export function formatAmount(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return rounded < 0 ? `−${grouped}` : grouped;
}

export function formatPrice(value: number, currency: string): string {
  return `${formatAmount(value)}${NBSP}${currency}`;
}

export const PHONE_PREFIX = '+998';
export const PHONE_DIGITS = 9;
const PHONE_GROUPS = [2, 3, 2, 2];

export function normalizePhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > PHONE_DIGITS) digits = digits.slice(3);
  return digits.slice(0, PHONE_DIGITS);
}

export function formatPhoneDigits(digits: string): string {
  const parts: string[] = [];
  let offset = 0;
  for (const size of PHONE_GROUPS) {
    if (offset >= digits.length) break;
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }
  return parts.join(' ');
}

export function fullPhone(digits: string): string {
  return `${PHONE_PREFIX} ${formatPhoneDigits(digits)}`;
}

export function formatDate(timestamp: number, locale: string): string {
  const date = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return locale === 'en' ? `${day}, ${time}` : `${day} ${time}`;
}
