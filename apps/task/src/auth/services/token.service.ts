import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { jwtConfiguration } from '../config/jwt.config'
import { RefreshToken } from '../entities/refresh-token'
import { ResetToken } from '../entities/reset-token'
import { randomUUID, UUID } from 'crypto'
import {
  AccessTokenType,
  RefreshTokenType,
  SignedTokenPair
} from '../types/token.types'
import { DateService } from '../../shared/services/date.service'
import { LoggerService } from '../../app/logger/logger.service'

@Injectable()
export class TokenService {
  private logger: Logger = new Logger(TokenService.name)

  constructor(
    private dateService: DateService,
    private jwtService: JwtService,
    @Inject(jwtConfiguration.KEY)
    private jwtConfig: ConfigType<typeof jwtConfiguration>,
    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,
    @InjectRepository(ResetToken) private resetRepo: Repository<ResetToken>
  ) {}

  async refreshTokens({
    sub,
    jti,
    role
  }: RefreshTokenType): Promise<SignedTokenPair> {
    this.logger.log('Refreshing tokens for user with id: ' + sub)
    const storedToken = await this.refreshRepo.findOne({
      where: {
        id: jti
      }
    })
    if (!storedToken) {
      this.logger.fatal('The provided token is not stored: ' + jti)
      throw new InternalServerErrorException('The provided token is not stored')
    }

    if (storedToken.revoked) {
      this.logger.warn(`Token ${jti} was already revoked for user ${sub}`)
      await this.refreshRepo.delete({
        user: {
          id: sub
        }
      })
      throw new ForbiddenException(
        'Token reuse detected. All sessions were revoked'
      )
    }
    this.refreshRepo.update({ id: jti }, { revoked: true })

    return await this.generateAndStoreTokenPair({ sub, role })
  }

  async revokeToken(jti: UUID): Promise<void> {
    this.logger.log('Revoking token with id: ' + jti)
    const storedToken = await this.refreshRepo.findOne({
      where: {
        id: jti
      }
    })
    if (!storedToken) {
      return
    }
    await this.refreshRepo.update({ id: jti }, { revoked: true })
  }

  async generatePasswordToken(userId: number): Promise<UUID> {
    this.logger.log('Generating password token for user with id: ' + userId)
    const passwordToken = this.resetRepo.create()
    passwordToken.id = randomUUID()
    passwordToken.userId = userId
    const expiresAt = this.dateService.getDateOneHourFromNow()
    passwordToken.expiresAt = expiresAt
    await this.resetRepo.save(passwordToken)
    return passwordToken.id
  }

  async getAndVerifyPasswordToken(tokenId: UUID): Promise<ResetToken> {
    const storedToken = await this.resetRepo.findOne({
      where: { id: tokenId }
    })
    if (!this.dateService.isAfterNow(storedToken.expiresAt)) {
      throw new BadRequestException('The token is expired')
    }
    return storedToken
  }

  async generateAndStoreTokenPair({
    role,
    sub
  }: AccessTokenType): Promise<SignedTokenPair> {
    const accessToken = await this.signAccess({ role, sub })
    const refreshToken = await this.signAndStoreRefresh(sub)
    return { accessToken, refreshToken }
  }

  private async signAccess({ role, sub }: AccessTokenType): Promise<string> {
    return await this.jwtService.signAsync(
      { sub, role },
      {
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig.accessTokenTtl
      }
    )
  }

  private async signAndStoreRefresh(sub: number): Promise<string> {
    this.logger.log('Generating refresh token for user with id: ' + sub)
    const jwtid = randomUUID()
    const refreshEntity = this.refreshRepo.create()
    refreshEntity.id = jwtid
    refreshEntity.userId = sub
    await this.refreshRepo.save(refreshEntity)
    return await this.jwtService.signAsync(
      { sub },
      {
        jwtid,
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig.refreshTokenTtl
      }
    )
  }
}
