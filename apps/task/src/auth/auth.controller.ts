import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CookieService } from './services/cookie.service';
import { UUID } from 'crypto';
import { LoginUserDto } from './dtos/login-user.dto';
import { Response } from 'express';
import { REFRESH_COOKIE_TOKEN } from './auth.constants';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './guards/auth-type.enum';
import { AlsService } from '../als/als.service';
import { PasswordResetRequestDto } from './dtos/password-reset-request.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginAndRefreshResponseDto } from './dtos/login-and-refresh.response.dto';
import { RegisterUserResponseDto } from './dtos/register-user.response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private als: AlsService,
  ) {}

  @Auth(AuthType.None)
  @Post('register')
  @ApiCreatedResponse({
    type: RegisterUserResponseDto,
    example: {
      email: 'example@email.com',
      name: 'Nick',
      isEmailConfirmed: false,
    },
  })
  @ApiConflictResponse({
    description: 'The user with the provided email is already registered',
  })
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    return await this.authService.register(dto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('confirmation_email')
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'No token provided or there is no user with provided token',
  })
  async confirmEmail(@Query('token') token: UUID) {
    if (!token) {
      throw new BadRequestException('No token provided');
    }
    await this.authService.confirmEmail(token);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({
    type: LoginAndRefreshResponseDto,
    description: 'Sets the refresh token in an HTTP-only cookie',
  })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials were provided' })
  @ApiForbiddenResponse({
    description: 'Need confirm the email before accessing the route',
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserDto: LoginUserDto,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    this.cookieService.setCookie(res, REFRESH_COOKIE_TOKEN, refreshToken);
    return { accessToken };
  }

  @ApiCookieAuth()
  @Auth(AuthType.RefreshToken)
  @Post('refresh')
  @ApiOkResponse({
    type: LoginAndRefreshResponseDto,
    description: 'Sets the refresh token in an HTTP-only cookie',
  })
  @ApiForbiddenResponse({
    description:
      'Reuse of refresh token was detected and all sessions are cleared',
  })
  async refresh(@Res({ passthrough: true }) res: Response) {
    const userId = this.als.getValue('userId');
    const jti = this.als.getValue('jti');
    const { accessToken, refreshToken } = await this.authService.refresh(
      userId,
      jti,
    );
    this.cookieService.setCookie(res, REFRESH_COOKIE_TOKEN, refreshToken);
    return { accessToken };
  }

  @ApiCookieAuth()
  @Auth(AuthType.RefreshToken)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiNoContentResponse()
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    const jti = this.als.getValue('jti');
    await this.authService.logout(jti);
    this.cookieService.clearCookie(res, REFRESH_COOKIE_TOKEN);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset_password_request')
  @ApiNoContentResponse()
  async passwordResetRequest(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
  ) {
    return await this.authService.processPasswordResetRequest(
      passwordResetRequestDto.email,
    );
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('reset_password')
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'No token provided or token has been expired',
  })
  async resetPassword(
    @Body() passwordResetDto: PasswordResetDto,
    @Query('token') token: UUID,
  ) {
    if (!token) {
      throw new BadRequestException('No token provided');
    }
    await this.authService.resetPassword(token, passwordResetDto.password);
  }
}
