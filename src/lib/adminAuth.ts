import crypto from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'edward2025';
const SESSION_SECRET = process.env.SESSION_SECRET || 'edward-portfolio-secret-2025-secure';
export const ADMIN_COOKIE_NAME = 'edward_admin_session';

/**
 * Creates a deterministic HMAC signature for the admin session token
 */
export function createSessionToken(): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(`admin:${ADMIN_PASSWORD}`);
  return hmac.digest('hex');
}

/**
 * Validates the provided password against the configured admin password
 */
export function validateAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD.trim();
}

/**
 * Checks if the incoming request has a valid admin cookie or header
 */
export async function isRequestAuthorized(req?: Request): Promise<boolean> {
  const expectedToken = createSessionToken();

  // Check header authorization first (useful for API calls / curl)
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token === expectedToken) return true;
    }
  }

  // Check next/headers cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (sessionCookie && sessionCookie.value === expectedToken) {
      return true;
    }
  } catch (err) {
    // If called outside Next request context
  }

  return false;
}
