import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthUserService } from 'src/auth/service/auth.user.service';
import { AuthAdminService } from 'src/auth/service/auth.admin.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_USER_SERVICE')
    private readonly authUserService: AuthUserService,
    @Inject('AUTH_ADMIN_SERVICE')
    private readonly authAdminService: AuthAdminService,
  ) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
      passwordField: 'password',
    });
  }
  async validate(req: Request, email: string, password: string): Promise<any> {
    console.log(req.originalUrl);
    if (req.originalUrl.includes('user')) {
      const user = await this.authUserService.validateUser({
        email,
        password,
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials for buyer');
      }
      return { ...user, role: 'user' };
    }

    if (req.originalUrl.includes('admin')) {
      // console.log(email);
      // console.log(password);

      const admin = await this.authAdminService.validateUser({
        email,
        password,
      });
      // console.log(admin);
      if (!admin) {
        throw new UnauthorizedException('Invalid credentials for seller');
      }
      return { ...admin, role: 'admin' };
    }

    throw new UnauthorizedException('Invalid login route');
  }
}
