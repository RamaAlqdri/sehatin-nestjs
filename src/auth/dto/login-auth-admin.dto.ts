import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthAdminDto {
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
