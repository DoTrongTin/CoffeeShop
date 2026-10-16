import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const getSecret = (name: string, developmentFallback: string): string => {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} must be configured in production`);
  }

  return developmentFallback;
};

export const env = {
  port: Number(process.env.PORT ?? 8080),
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: getSecret('JWT_ACCESS_SECRET', 'local-access-secret-change-me'),
  jwtRefreshSecret: getSecret('JWT_REFRESH_SECRET', 'local-refresh-secret-change-me'),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
};