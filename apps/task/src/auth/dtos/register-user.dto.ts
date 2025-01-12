import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterUserDto {
  @ApiProperty({ example: RegisterUserDto.example().email })
  @IsEmail()
  email: string

  @ApiProperty({ example: RegisterUserDto.example().name })
  @IsString()
  name: string

  @ApiProperty({ example: RegisterUserDto.example().password, minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

  static example(): RegisterUserDto {
    return {
      email: 'example@email.com',
      name: 'Nick',
      password: 'password'
    }
  }
}
