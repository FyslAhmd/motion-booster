/**
 * Centralized error code catalog.
 * Every API error returns one of these codes so the frontend
 * can provide user-friendly messages and the support team
 * can quickly identify issues.
 */

export const ERROR_CODES = {
  // ─── Authentication ─────────────────────────────────
  AUTH_001: {
    code: 'AUTH_001',
    status: 401,
    message: 'Invalid email or password',
  },
  AUTH_002: {
    code: 'AUTH_002',
    status: 403,
    message: 'Please verify your email address before logging in',
  },
  AUTH_003: {
    code: 'AUTH_003',
    status: 403,
    message: 'Your account has been suspended. Please contact support.',
  },
  AUTH_004: {
    code: 'AUTH_004',
    status: 401,
    message: 'Your session has expired. Please log in again.',
  },
  AUTH_005: {
    code: 'AUTH_005',
    status: 401,
    message: 'Invalid authentication token',
  },
  AUTH_006: {
    code: 'AUTH_006',
    status: 422,
    message: 'Password does not meet the security requirements',
  },
  AUTH_007: {
    code: 'AUTH_007',
    status: 409,
    message: 'An account with this email already exists',
  },
  AUTH_008: {
    code: 'AUTH_008',
    status: 409,
    message: 'This username is already taken',
  },

  // ─── Validation ─────────────────────────────────────
  VAL_001: {
    code: 'VAL_001',
    status: 422,
    message: 'Validation failed',
  },
  VAL_002: {
    code: 'VAL_002',
    status: 400,
    message: 'Invalid request format',
  },

  // ─── Permission ─────────────────────────────────────
  PERM_001: {
    code: 'PERM_001',
    status: 403,
    message: 'You do not have permission to perform this action',
  },

  // ─── Rate Limiting ──────────────────────────────────
  RATE_001: {
    code: 'RATE_001',
    status: 429,
    message: 'Too many requests. Please try again later.',
  },

  // ─── Server ─────────────────────────────────────────
  SRV_001: {
    code: 'SRV_001',
    status: 500,
    message: 'An unexpected error occurred. Please try again later.',
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
