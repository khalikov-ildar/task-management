import { registerAs } from '@nestjs/config';

export const jwtConfiguration = registerAs('jwt_config', () => {
  return {
    accessTokenTtl: process.env.JWT_ACCESS_TTL,
    refreshTokenTtl: process.env.JWT_REFRESH_TTL,
    secret: process.env.JWT_SECRET,
  };
});
