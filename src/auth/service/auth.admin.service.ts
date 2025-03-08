import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from 'src/admin/entity/admin.entity';
import { LoginAuthAdminDto } from '../dto/login-auth-admin.dto';

@Injectable()
export class AuthAdminService {
  constructor(
    @InjectRepository(Admin) private readonly userRepository: Repository<Admin>,
    @Inject('JwtLoginService') private jwtLoginService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginAuthAdminDto): Promise<any> {
    // console.log(name);

    const findUser = await this.userRepository.findOne({
      where: { email },
    });
    // console.log(findUser);
    // console.log(password)
    if (!findUser) {
      throw new UnauthorizedException('Admin not found');
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong Password');
    }
    return findUser;
    // const { id, email: userEmail } = findUser;
    // const accessToken = this.jwtLoginService.sign({ id, email: userEmail, role: 'buyer' });

    // return accessToken;
  }
  async login(user: any): Promise<string> {
    const payload = { id: user.id, email: user.email, role: 'admin' };
    // console.log('Payload:', payload);
    return this.jwtLoginService.sign(payload);
  }
}
