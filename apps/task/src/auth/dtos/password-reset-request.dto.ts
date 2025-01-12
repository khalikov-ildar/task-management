import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'
import { P } from 'pino'

export class PasswordResetRequestDto {
  @ApiProperty({ example: PasswordResetRequestDto.example().email })
  @IsEmail()
  email: string

  static example(): PasswordResetRequestDto {
    return {
      email: 'example@email.com'
    }
  }
}
