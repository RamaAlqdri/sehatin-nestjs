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
import { ScheduleService } from 'src/schedule/service/schedule.service';
import { Schedule } from 'src/schedule/entity/schedule.entity';
import { Food } from 'src/food/entity/food.entity';
import { WeightHistory } from '../entity/weight-history.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('JwtLoginService') private jwtLoginService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,

    @InjectRepository(WeightHistory)
    private readonly weightHistoryRepository: Repository<WeightHistory>,

    private scheduleService: ScheduleService,
  ) {}

  async createUser(request: RegisterUserDto): Promise<User> {
    try {
      await this.validateCreateUserRequest(request);
      const user = this.userRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
      });
      const savedUser = await this.userRepository.save(user);

      // Gunakan tanggal saat ini untuk membuat jadwal dummy
      const currentDate = new Date(); // Ambil tanggal saat ini
      await this.scheduleService.createDummySchedule(
        savedUser.id,
        currentDate.getMonth() + 1,
        currentDate.getFullYear(),
      );

      return savedUser;
    } catch (error) {
      console.log('error', error.message);
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new Error(error);
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    try {
      // Cari user berdasarkan ID
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }

      // Verifikasi kata sandi lama
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      // Hash kata sandi baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Simpan perubahan
      await this.userRepository.save(user);

      // Hapus kata sandi dari respons untuk keamanan
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      throw new InternalServerErrorException(error);
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
      // Cari user berdasarkan ID
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }

      // Simpan riwayat berat badan ke weightHistoryRepository
      const weightHistory = this.weightHistoryRepository.create({
        user,
        weight,
      });
      await this.weightHistoryRepository.save(weightHistory);

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCurrentWeight(userId: string): Promise<WeightHistory> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      const currentWeight = await this.weightHistoryRepository.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      // if (!currentWeight) {
      //   return 0;
      // }
      // return currentWeight;
      return currentWeight || null;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getWeightHistory(userId: string): Promise<WeightHistory[]> {
    try {
      const weightHistory = await this.weightHistoryRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: 5,
      });
      if (!weightHistory) {
        throw new UnauthorizedException('Weight not Found');
      }
      return weightHistory.reverse();
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

  async getOneUserById(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User not Found');
      }
      console.log('User:', user);
      // Ambil berat badan terbaru pengguna
      const currentWeight = await this.getCurrentWeight(userId);
      // if(!currentWeight) {

      // Gabungkan data user dengan berat badan terbaru
      return { ...user, weight: currentWeight?.weight || null };

      // return user;
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
