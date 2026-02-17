import { ERROR_CODES, type ErrorCode } from './codes';

/**
 * Base application error class.
 * All API errors extend this so we can catch and format them uniformly.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown> | null;
  public readonly isOperational: boolean;

  constructor(
    errorCode: ErrorCode,
    options?: {
      message?: string;
      details?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    const errorDef = ERROR_CODES[errorCode];
    const message = options?.message || errorDef.message;

    super(message, { cause: options?.cause });

    this.code = errorDef.code;
    this.statusCode = errorDef.status;
    this.details = options?.details || null;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Format an AppError (or unknown error) into a safe JSON response.
 * In production, internal errors never leak stack traces or system details.
 */
export function formatErrorResponse(
  error: unknown,
  requestId?: string
): {
  status: number;
  body: {
    success: false;
    error: {
      code: string;
      message: string;
      requestId?: string;
      details?: Record<string, unknown> | null;
    };
  };
} {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          requestId,
          details: error.details,
        },
      },
    };
  }

  // Unknown / unexpected error — never leak internals
  const isDev = process.env.NODE_ENV === 'development';

  console.error('[SRV_001] Unhandled error:', error);

  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'SRV_001',
        message: isDev && error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again later.',
        requestId,
      },
    },
  };
}
