import { UUID } from 'crypto'
import { Roles } from '../../users/enums/roles.enum'
import { A } from '@faker-js/faker/dist/airline-BnpeTvY9'

export type AccessTokenType = { sub: number; role: Roles }
export type RefreshTokenType = AccessTokenType & { jti: UUID }

export type SignedTokenPair = { accessToken: string; refreshToken: string }
