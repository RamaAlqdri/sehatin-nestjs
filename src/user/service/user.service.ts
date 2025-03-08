import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Activity, Gender, Goal, User } from '../entity/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('JwtLoginService') private jwtLoginService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(request: RegisterUserDto): Promise<User> {
    try {
      await this.validateCreateUserRequest(request);
      const user = this.userRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
      });
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      console.log('error', error.message);
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new Error(error);
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    try {
      const users = await this.userRepository.find();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserName(userId: string, name: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.name = name;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserHeight(userId: string, height: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.height = height;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserWeight(userId: string, weight: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.weight = weight;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserBMI(userId: string, bmi: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.bmi = bmi;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserBMR(userId: string, bmr: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.bmr = bmr;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserGender(userId: string, gender: Gender): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.gender = gender;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserActivity(userId: string, activity: Activity): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.activity = activity;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUserGoal(userId: string, goal: Goal): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.goal = goal;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserBirthDay(userId: string, birthday: Date): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      user.birthday = birthday;
      await this.userRepository.save(user);
      //   console.log('User:', user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getOneUserById(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getAllUser(): Promise<User[]> {
    try {
      const user = await this.userRepository.find();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async validateCreateUserRequest(request: RegisterUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: request.email },
      });

      if (user) {
        console.log('error');
        throw new UnprocessableEntityException('Email already exists.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      if (err instanceof UnprocessableEntityException) {
        throw err;
      }

      console.log('error: Unexpected error');
      throw new Error('Error validating user request.');
    }
  }
  async resetPassword(userId, newPassword): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
