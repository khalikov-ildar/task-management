import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { Roles } from '../../users/enums/roles.enum'

export class RegisterUserDto {
  @ApiProperty({ example: 'example@email.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Nick' })
  @IsString()
  name: string

  @ApiProperty({ example: 'password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string
}
