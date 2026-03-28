import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = Number(process.env.PASSWORD_RESET_OTP_EXPIRY_MINUTES || 10);
const SESSION_EXPIRY_MINUTES = Number(process.env.PASSWORD_RESET_SESSION_EXPIRY_MINUTES || 15);

interface PasswordResetOtpPayload extends JWTPayload {
  type: 'password-reset-otp';
  userId: string;
  email: string;
  otpHash: string;
  passwordFingerprint: string;
}

interface PasswordResetSessionPayload extends JWTPayload {
  type: 'password-reset-session';
  userId: string;
  email: string;
  passwordFingerprint: string;
}

function getPasswordResetSecret(): Uint8Array {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_SECRET (or JWT_ACCESS_SECRET) is not set');
  }
  return new TextEncoder().encode(secret);
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function stableOtpInput(email: string, otp: string, passwordFingerprint: string): string {
  return `${email.toLowerCase().trim()}::${otp.trim()}::${passwordFingerprint}`;
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function generateNumericOtp(): string {
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i += 1) {
    code += String(randomInt(0, 10));
  }
  return code;
}

export function createPasswordFingerprint(passwordHash: string): string {
  return sha256(passwordHash);
}

export async function createPasswordResetOtpToken(input: {
  userId: string;
  email: string;
  otp: string;
  passwordFingerprint: string;
}): Promise<string> {
  const otpHash = sha256(
    stableOtpInput(input.email, input.otp, input.passwordFingerprint)
  );

  return new SignJWT({
    type: 'password-reset-otp',
    userId: input.userId,
    email: input.email.toLowerCase().trim(),
    otpHash,
    passwordFingerprint: input.passwordFingerprint,
  } as PasswordResetOtpPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, OTP_EXPIRY_MINUTES)}m`)
    .setJti(crypto.randomUUID())
    .sign(getPasswordResetSecret());
}

export async function verifyPasswordResetOtpToken(
  token: string
): Promise<PasswordResetOtpPayload> {
  const { payload } = await jwtVerify(token, getPasswordResetSecret());
  if (payload.type !== 'password-reset-otp') {
    throw new Error('Invalid password reset OTP token type');
  }
  return payload as PasswordResetOtpPayload;
}

export function verifyOtpCode(input: {
  payload: PasswordResetOtpPayload;
  email: string;
  otp: string;
  passwordFingerprint: string;
}): boolean {
  const expectedHash = sha256(
    stableOtpInput(input.email, input.otp, input.passwordFingerprint)
  );
  return safeEqualHex(input.payload.otpHash, expectedHash);
}

export async function createPasswordResetSessionToken(input: {
  userId: string;
  email: string;
  passwordFingerprint: string;
}): Promise<string> {
  return new SignJWT({
    type: 'password-reset-session',
    userId: input.userId,
    email: input.email.toLowerCase().trim(),
    passwordFingerprint: input.passwordFingerprint,
  } as PasswordResetSessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, SESSION_EXPIRY_MINUTES)}m`)
    .setJti(crypto.randomUUID())
    .sign(getPasswordResetSecret());
}

export async function verifyPasswordResetSessionToken(
  token: string
): Promise<PasswordResetSessionPayload> {
  const { payload } = await jwtVerify(token, getPasswordResetSecret());
  if (payload.type !== 'password-reset-session') {
    throw new Error('Invalid password reset session token type');
  }
  return payload as PasswordResetSessionPayload;
}

