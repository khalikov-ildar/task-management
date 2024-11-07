import { ApiProperty } from '@nestjs/swagger';

export class LoginAndRefreshResponseDto {
  @ApiProperty()
  accessToken: string;
}
