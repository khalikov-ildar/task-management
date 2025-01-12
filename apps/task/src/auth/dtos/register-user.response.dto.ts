import { ApiProperty } from '@nestjs/swagger'

export class RegisterUserResponseDto {
  @ApiProperty()
  email: string

  @ApiProperty()
  name: string

  @ApiProperty()
  isEmailConfirmed: false

  static example(): RegisterUserResponseDto {
    return {
      email: 'example@email.com',
      name: 'Nick',
      isEmailConfirmed: false
    }
  }
}
