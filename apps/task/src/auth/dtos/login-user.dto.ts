import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginUserDto {
  @ApiProperty({ example: LoginUserDto.example().email })
  @IsEmail()
  email: string

  @ApiProperty({ example: LoginUserDto.example().password, minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

  static example(): LoginUserDto {
    return {
      email: 'example@email.com',
      password: 'password'
    }
  }
}
