import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginGoogleDto } from '../dto/login-google.dto';
import { LoginAuthDto } from '../dto/login-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject('JwtLoginService') private jwtLoginService: JwtService,
    @Inject('JwtForgotService') private jwtForgotService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginAuthDto): Promise<any> {
    const findUser = await this.userRepository.findOne({
      where: { email },
    });
    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong Password');
    }
    console.log('User found and validated:', findUser.email);
    return findUser;
  }
  async login(user: any): Promise<string> {
    const payload = { id: user.id, email: user.email, role: 'user' };
    // console.log('Payload:', payload);
    return this.jwtLoginService.sign(payload);
  }

  async validateGoogleUser(details: LoginGoogleDto): Promise<string> {
    try {
      let user = await this.userRepository.findOneBy({ email: details.email });
      if (user) {
        user.verified_at = new Date();
        await this.userRepository.save(user);
        console.log('User found and verified:', user.email);
      } else {
        console.log('User not found. Creating new user...');
        // console.log('Details:', details);
        user = this.userRepository.create({
          email: details.email,
          name: details.name,
          verified_at: new Date(),
        });
        console.log(user);
        user = await this.userRepository.save(user);
        console.log('New user created and verified:', user.email);
      }
      const access_token = this.jwtLoginService.sign({
        id: user.id,
        email: user.email,
        role: 'buyer',
      });
      return access_token;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to validate Google user');
    }
  }
}
