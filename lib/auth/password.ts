import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with 12 salt rounds.
 * Higher rounds = more secure but slower.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 * Uses timing-safe comparison internally.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * A dummy hash used for timing-safe comparison when user doesn't exist.
 * This prevents timing attacks that reveal whether an email is registered.
 */
export const DUMMY_HASH =
  '$2a$12$LJ3m4ys3ez8Bn5A5sYy0/u0gHlP2nFAKnMOyVZ3J8bQdHlqWYqxC';
