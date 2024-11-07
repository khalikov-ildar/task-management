import { UUID } from 'crypto';
import { Roles } from '../../users/enums/roles.enum';

export type AccessTokenType = { sub: number; role: Roles };
export type RefreshTokenType = { sub: number; jti: UUID };

export type SignedTokenPair = { accessToken: string; refreshToken: string };
