import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ─── Types ────────────────────────────────────────────

export interface AccessTokenPayload extends JWTPayload {
  userId: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JWTPayload {
  userId: string;
  familyId: string;
  type: 'refresh';
}

// ─── Secrets ──────────────────────────────────────────

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

// ─── Token Generation ─────────────────────────────────

/**
 * Generate a short-lived access token (15 min default).
 */
export async function generateAccessToken(
  userId: string,
  role: string
): Promise<string> {
  const expiry = process.env.JWT_ACCESS_EXPIRY || '15m';

  return new SignJWT({ userId, role, type: 'access' } as AccessTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setJti(crypto.randomUUID())
    .sign(getAccessSecret());
}

/**
 * Generate a long-lived refresh token (7 days default).
 */
export async function generateRefreshToken(
  userId: string,
  familyId: string
): Promise<string> {
  const expiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  return new SignJWT({
    userId,
    familyId,
    type: 'refresh',
  } as RefreshTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setJti(crypto.randomUUID())
    .sign(getRefreshSecret());
}

// ─── Token Verification ──────────────────────────────

/**
 * Verify and decode an access token.
 * Throws if expired, invalid, or tampered.
 */
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload as AccessTokenPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify and decode a refresh token.
 * Throws if expired, invalid, or tampered.
 */
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload as RefreshTokenPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Hash a token for storage (we never store raw tokens in the DB).
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
