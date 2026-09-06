import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// Environment configuration:
// 1. ADMIN_PASSWORD_HASH: Bcrypt hash of admin password (e.g. from `bcrypt.hashSync('yourpassword', 10)`)
// 2. ADMIN_PASSWORD: Can be a bcrypt hash (starts with $2a$, $2b$, $2y$) or plaintext string fallback
// 3. DEFAULT_HASH: Pre-computed bcrypt hash for 'edward303'
const DEFAULT_HASH = '$2b$10$vh7LD0qHecCY0nsfNdmKAuARhB/6fJQzIb0G.9o2Y2S24NulvkS7G';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || 'edward-portfolio-secret-2025-secure';

export const ADMIN_COOKIE_NAME = 'edward_admin_session';

/**
 * Creates a deterministic HMAC signature for the admin session token
 * uses SESSION_SECRET and fixed salt to avoid exposing password material
 */
export function createSessionToken(): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update('edward-portfolio-admin-authenticated-session');
  return hmac.digest('hex');
}

/**
 * Generates a bcrypt hash for any password (10 salt rounds)
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password.trim(), 10);
}

/**
 * Validates the provided password using bcrypt:
 * 1. Against ADMIN_PASSWORD_HASH (if set)
 * 2. Against ADMIN_PASSWORD (if set as a bcrypt hash or plaintext fallback)
 * 3. Against DEFAULT_HASH (bcrypt hash of 'edward303')
 */
export function validateAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const cleaned = password.trim();
  if (!cleaned) return false;

  // 1. If ADMIN_PASSWORD_HASH is set in environment, compare against it using bcrypt
  if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH.trim()) {
    try {
      if (bcrypt.compareSync(cleaned, ADMIN_PASSWORD_HASH.trim())) {
        return true;
      }
    } catch {
      // Invalid hash in env, fall through
    }
  }

  // 2. If ADMIN_PASSWORD is set in environment
  if (ADMIN_PASSWORD && ADMIN_PASSWORD.trim()) {
    const envPass = ADMIN_PASSWORD.trim();
    // If ADMIN_PASSWORD is a bcrypt hash ($2a$, $2b$, or $2y$)
    if (envPass.startsWith('$2a$') || envPass.startsWith('$2b$') || envPass.startsWith('$2y$')) {
      try {
        if (bcrypt.compareSync(cleaned, envPass)) {
          return true;
        }
      } catch {
        // Invalid hash format, fall through
      }
    } else {
      // If ADMIN_PASSWORD is provided in plaintext in env, compare securely using timingSafeEqual
      try {
        const cleanedBuf = Buffer.from(cleaned);
        const envBuf = Buffer.from(envPass);
        if (cleanedBuf.length === envBuf.length && crypto.timingSafeEqual(cleanedBuf, envBuf)) {
          return true;
        }
      } catch {
        // Fall through
      }
    }
  }

  // 3. Default fallback: verify against precomputed bcrypt hash of default password
  try {
    if (bcrypt.compareSync(cleaned, DEFAULT_HASH)) {
      return true;
    }
  } catch {
    // Fall through
  }

  return false;
}

/**
 * Validates session token using constant-time comparison to prevent timing attacks
 */
function isTokenValid(token: string, expectedToken: string): boolean {
  if (!token) return false;
  const tokenBuf = Buffer.from(token.trim());
  const expectedBuf = Buffer.from(expectedToken);
  if (tokenBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, expectedBuf);
}

/**
 * Checks if the incoming request has a valid admin cookie or Bearer authorization header
 */
export async function isRequestAuthorized(req?: Request): Promise<boolean> {
  const expectedToken = createSessionToken();

  // Check header authorization first (useful for API calls / curl)
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (isTokenValid(token, expectedToken)) return true;
    }

    // Check direct Cookie header on Request
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookiesList = cookieHeader.split(';');
      for (const item of cookiesList) {
        const [name, ...valParts] = item.trim().split('=');
        if (name === ADMIN_COOKIE_NAME && isTokenValid(valParts.join('='), expectedToken)) {
          return true;
        }
      }
    }
  }

  // Check next/headers cookies
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (sessionCookie && isTokenValid(sessionCookie.value, expectedToken)) {
      return true;
    }
  } catch {
    // If called outside Next request context
  }

  return false;
}
