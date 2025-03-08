import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthUserService } from '../service/auth.user.service';
import { OtpService } from '../service/otp.service';
import { LocalGuard } from '../jwt/guards/local.guard';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';

@Controller('user/auth')
export class AuthUserController {
  constructor(
    @Inject('AUTH_USER_SERVICE')
    private readonly authService: AuthUserService,
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
  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { otp_code: string; email: string },
  ): Promise<ResponseWrapper<any>> {
    try {
      const isValid = await this.otpService.validateOtpVerification(
        body.otp_code,
        body.email,
      );
      if (isValid) {
        return new ResponseWrapper(
          HttpStatus.CREATED,
          'OTP verified successfully. User is now verified.',
        );
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Post('otp/generate')
  async regenerateOtp(@Body() body: { email: string }) {
    try {
      const otp = await this.otpService.generateOtp(body.email);
      if (otp) {
        return new ResponseWrapper(
          HttpStatus.CREATED,
          'OTP has been generated successfully.',
        );
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Post('otp/password/verify')
  async verifyOtpForgot(
    @Body() body: { otp_code: string; email: string },
  ): Promise<ResponseWrapper<any>> {
    try {
      const access_token = await this.otpService.verifyOtpForgot(
        body.otp_code,
        body.email,
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'OTP verification successful',
        {
          access_token,
        },
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
