import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { IHashingService } from './services/hashing/i-hashing.service'
import { RegisterUserDto } from './dtos/register-user.dto'
import { randomUUID, UUID } from 'crypto'
import { RabbitmqService } from '@app/rabbitmq'
import { EMAIL_CONFIRMATION_EVENT, PASSWORD_RESET_EVENT } from '@app/contracts'
import type {
  EmailConfirmationPayload,
  PasswordResetPayload
} from '@app/contracts'
import { LoginUserDto } from './dtos/login-user.dto'
import { SignedTokenPair } from './types/token.types'
import { UsersService } from '../users/users.service'
import { RegisterUserResponseDto } from './dtos/register-user.response.dto'
import { TokenService } from './services/token.service'
import { Roles } from '../users/enums/roles.enum'
import { maskEmail } from '../shared/utils/mask-email'

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name)

  constructor(
    private usersService: UsersService,
    private hashingService: IHashingService,
    private tokenService: TokenService,
    private rmqService: RabbitmqService
  ) {}

  async register({
    email,
    name,
    password
  }: RegisterUserDto): Promise<RegisterUserResponseDto> {
    const userExists = await this.usersService.existsByEmail(email)
    if (userExists) {
      throw new ConflictException()
    }

    const hashedPassword = await this.hashingService.hash(password)
    const emailToken = this.createEmailTokenAndEmitEvent(email)
    await this.usersService.create({
      email,
      name,
      password: hashedPassword,
      emailToken,
      role: Roles.User
    })

    return { email, name, isEmailConfirmed: false }
  }

  async confirmEmail(token: UUID): Promise<void> {
    const user = await this.usersService.findOneBy({
      emailConfirmationToken: token
    })
    if (!user) {
      throw new BadRequestException()
    }
    user.emailConfirmationToken = null
    user.isEmailConfirmed = true
    this.usersService.updateBy({ id: user.id }, user)
  }

  async login({ email, password }: LoginUserDto): Promise<SignedTokenPair> {
    const existingUser = await this.usersService.findOneBy({ email })
    if (!existingUser) {
      throw new UnauthorizedException('Wrong credentials were provided')
    }
    if (!existingUser.isEmailConfirmed) {
      throw new ForbiddenException('The email is not confirmed')
    }
    const passwordMatches = await this.hashingService.compare(
      password,
      existingUser.password
    )
    if (!passwordMatches) {
      throw new UnauthorizedException('Wrong credentials were provided')
    }

    return await this.tokenService.generateAndStoreTokenPair({
      sub: existingUser.id,
      role: existingUser.role
    })
  }

  async refresh(
    userId: number,
    jti: UUID,
    role: Roles
  ): Promise<SignedTokenPair> {
    return await this.tokenService.refreshTokens({ sub: userId, jti, role })
  }

  async logout(jti: UUID): Promise<void> {
    return await this.tokenService.revokeToken(jti)
  }

  async processPasswordResetRequest(email: string): Promise<void> {
    const user = await this.usersService.findOneBy({ email })
    if (!user) {
      return
    }

    const passwordTokenId = await this.tokenService.generatePasswordToken(
      user.id
    )

    this.rmqService.emit(PASSWORD_RESET_EVENT, {
      email: email,
      token: passwordTokenId
    } satisfies PasswordResetPayload)
    this.logger.log('Password reset sent to' + maskEmail(email))
  }

  async resetPassword(token: UUID, password: string): Promise<void> {
    const storedToken = await this.tokenService.getAndVerifyPasswordToken(token)
    const newPassword = await this.hashingService.hash(password)
    await this.usersService.updateBy(
      { id: storedToken.userId },
      { password: newPassword }
    )
  }

  private createEmailTokenAndEmitEvent(email: string): UUID {
    const emailToken = randomUUID()
    this.rmqService.emit(EMAIL_CONFIRMATION_EVENT, {
      email,
      token: emailToken
    } satisfies EmailConfirmationPayload)
    this.logger.log('Email confirmation sent to ' + maskEmail(email))
    return emailToken
  }
}
