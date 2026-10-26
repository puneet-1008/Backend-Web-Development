const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
if (!Number.isSafeInteger(sessionTtlMs) || sessionTtlMs <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const secret = process.env.COOKIE_SECRET;
if (!secret) throw new Error('COOKIE_SECRET is required');

const secure = process.env.NODE_ENV === 'production'
  || process.env.COOKIE_SECURE === 'true';

module.exports = {
  secret,
  sessionTtlMs,
  options: {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge: sessionTtlMs,
  },
};
