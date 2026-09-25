/**
 * Error contract — ported from BSC.MobileApp/lib/core/error/failures.dart
 * and failure_codes.dart. This is the single shape every service/repository
 * on the RN side must return instead of throwing, mirroring the Flutter
 * app's `Either<Failure, T>` (dartz) convention.
 *
 * `message` — text the Core (backend) wrote for the client. May be empty;
 *   when empty, the UI layer chooses copy based on `kind`/`code`.
 * `detail` — internal diagnostic only. Never render this to the user.
 *
 * Keeping them apart is what stops a server message with internal details
 * from reaching the screen, and what lets the app localize without touching
 * a single service.
 */
export type FailureKind =
  | 'network'
  | 'server'
  | 'auth'
  | 'validation'
  | 'twoFactor'
  | 'deviceBinding'
  | 'cache';

export interface Failure {
  kind: FailureKind;
  /** Core-authored, user-facing text. May be empty. */
  message: string;
  /** Core's own code, or one of FailureCodes when the app originates it. */
  code?: string;
  /** Internal diagnostic. Never display this. */
  detail?: string;
}

export interface TwoFactorFailure extends Failure {
  kind: 'twoFactor';
  remainingAttempts?: number;
}

/**
 * Stable app-origin failure codes, as opposed to codes relayed verbatim from
 * the Core. Ported from failure_codes.dart — keep in sync with the backend
 * contract, not invented independently.
 */
export const FailureCodes = {
  timeout: 'net.timeout',
  noConnection: 'net.no_connection',
  cancelled: 'net.cancelled',
  badCertificate: 'net.bad_certificate',
  forbidden: 'auth.forbidden',
  notFound: 'server.not_found',
  tooManyRequests: 'server.rate_limited',
  serverError: 'server.internal',
  unreadableResponse: 'server.unreadable',
  biometricNotEnrolled: 'auth.biometric_not_enrolled',
  biometricUnavailable: 'auth.biometric_unavailable',
  biometricFailed: 'auth.biometric_failed',
  sessionExpired: 'auth.session_expired',
  loginFailed: 'auth.login_failed',
  officerNotAssigned: 'officer.not_assigned',
  statementNotFound: 'statement.not_found',
  accountNotFound: 'account.not_found',
  unknown: 'server.unknown',
} as const;

export type FailureCode = (typeof FailureCodes)[keyof typeof FailureCodes];

/** Discriminated result type standing in for dartz's `Either<Failure, T>`. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: Failure };
