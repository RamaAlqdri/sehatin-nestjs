import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OtpService } from '../service/otp.service';
import { LocalGuard } from '../jwt/guards/local.guard';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { AuthAdminService } from '../service/auth.admin.service';

@Controller('admin/auth')
export class AuthAdminController {
  constructor(
    @Inject('AUTH_ADMIN_SERVICE')
    private readonly authService: AuthAdminService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const access_token = await this.authService.login(req.user);
      return new ResponseWrapper(HttpStatus.CREATED, 'Login Successful', {
        access_token,
      });
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
