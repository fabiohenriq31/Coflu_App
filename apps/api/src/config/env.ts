import 'dotenv/config';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 3333),
  apiVersion: process.env.API_VERSION ?? '0.1.0',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jwtSecret:
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'development-only-change-this-secret-before-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
};

if (env.nodeEnv === 'production' && !env.jwtSecret) {
  throw new Error('JWT_SECRET must be set in production');
}
