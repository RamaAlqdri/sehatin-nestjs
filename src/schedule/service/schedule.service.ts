import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Schedule } from '../entity/schedule.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Food } from 'src/food/entity/food.entity';
import { User } from 'src/user/entity/user.entity';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createSchedule(request: CreateScheduleDto): Promise<Schedule> {
    try {
      const food = await this.foodRepository.findOne({
        where: { id: request.food_id },
      });
      const user = await this.userRepository.findOne({
        where: { id: request.user_id },
      });

      if (!food || !user) {
        throw new Error('Food or User not found');
      }

      const newSchedule = this.scheduleRepository.create({
        ...request,
        food,
        user,
      });

      await this.scheduleRepository.save(newSchedule);
      return newSchedule;
    } catch (error) {
      throw error;
    }
  }

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOne({ where: { id } });

      if (!schedule) {
        throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
      }
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async createDummySchedule(
    userId: string,
    month: number,
    year: number,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const foods = await this.foodRepository.find(); // Ambil semua makanan dari database
      if (foods.length === 0) {
        throw new HttpException(
          'No foods available in the database',
          HttpStatus.NOT_FOUND,
        );
      }

      const daysInMonth = new Date(year, month, 0).getDate(); // Hitung jumlah hari dalam bulan
      const schedules = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const scheduledDate = new Date(year, month - 1, day); // Buat tanggal untuk setiap hari

        // Buat 3 jadwal makan per hari
        for (let i = 0; i < 3; i++) {
          const randomFood = foods[Math.floor(Math.random() * foods.length)]; // Pilih makanan secara acak
          // const randomCalories =
          //   Math.floor(Math.random() * (500 - 200 + 1)) + 200; // Nilai acak antara 200 dan 500
          const randomWater = Math.floor(Math.random() * (750 - 500 + 1)) + 500; // Nilai acak antara 500 dan 750 mL

          const newSchedule = this.scheduleRepository.create({
            user,
            food: randomFood,
            scheduled_at: new Date(
              scheduledDate.getTime() + i * 6 * 60 * 60 * 1000,
            ), // Tambahkan 6 jam untuk setiap jadwal
            calories_burned: 0,
            water_consum: 0, // Default konsumsi air
            calories_target: randomFood.calories, // Nilai acak untuk target kalori
            water_target: randomWater, // Nilai acak untuk target air
            is_completed: false,
          });
          schedules.push(newSchedule);
        }
      }

      await this.scheduleRepository.save(schedules); // Simpan semua jadwal dalam satu operasi
    } catch (error) {
      throw error;
    }
  }

  async getScheduleByUserid(userid: string): Promise<Schedule[]> {
    try {
      return await this.scheduleRepository.find({
        where: { user: { id: userid } },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateSchedule(
    schedule_id: string,
    request: UpdateScheduleDto,
  ): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: schedule_id },
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (request.food_id) {
        const food = await this.foodRepository.findOne({
          where: { id: request.food_id },
        });
        if (!food) {
          throw new Error('Food not found');
        }
        schedule.food = food;
      }

      if (request.calories_burned) {
        schedule.calories_burned = request.calories_burned;
      }

      if (request.scheduled_at) {
        schedule.scheduled_at = request.scheduled_at;
      }

      if (request.water_consum) {
        schedule.water_consum = request.water_consum;
      }

      if (request.is_completed !== null) {
        schedule.is_completed = request.is_completed;
      }

      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async getScheduleForUserByDay(
    userId: string,
    date: Date,
  ): Promise<Schedule[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfDay, endOfDay),
        },
      });

      return schedules;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getScheduleForUserByMonth(
    userId: string,
    date: Date,
  ): Promise<Schedule[]> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const startOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        1,
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth() + 1,
        0,
      );
      endOfMonth.setHours(23, 59, 59, 999);

      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfMonth, endOfMonth),
        },
      });

      return schedules;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserCaloriesConsumedForDay(
    userId: string,
    date: Date,
  ): Promise<{ calories: number; target: number }> {
    try {
      const schedules = await this.getScheduleForUserByDay(userId, date);

      // Hitung total target kalori
      const targetCalories = schedules.reduce((acc, schedule) => {
        return acc + parseFloat(schedule.calories_target as any);
      }, 0);

      // Filter jadwal yang sudah selesai
      const completedSchedules = schedules.filter(
        (schedule) => schedule.is_completed,
      );

      // Hitung total kalori yang dikonsumsi
      const consumedCalories = completedSchedules.reduce((acc, schedule) => {
        return acc + parseFloat(schedule.calories_burned as any);
      }, 0);

      // Kembalikan hasil dalam bentuk objek
      return {
        calories: consumedCalories,
        target: targetCalories,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserWaterConsumedForDay(
    userId: string,
    date: Date,
  ): Promise<{ water: number; target: number }> {
    try {
      const schedules = await this.getScheduleForUserByDay(userId, date);
      // Hitung total target kalori
      const targetWater = schedules.reduce((acc, schedule) => {
        return acc + parseFloat(schedule.water_target as any);
      }, 0);
      // const completedSchedules = schedules.filter(
      //   (schedule) => schedule.is_completed,
      // );
      const water = schedules.reduce((acc, schedule) => {
        return acc + parseFloat(schedule.water_consum as any);
      }, 0);

      return {
        water: water,
        target: targetWater,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserCompletedSchedulePercentage(
    userId: string,
  ): Promise<{ persentase: number; short_message: string; desc: string }> {
    try {
      const schedules = await this.scheduleRepository.find({
        where: { user: { id: userId } },
      });

      if (schedules.length === 0) {
        return {
          persentase: 0,
          short_message: 'Tidak Ada Data',
          desc: 'Tidak ada jadwal yang ditemukan untuk pengguna ini.',
        };
      }

      const completedSchedules = schedules.filter(
        (schedule) => schedule.is_completed,
      );
      const persentase = (completedSchedules.length / schedules.length) * 100;

      let short_message = '';
      let desc = '';

      if (persentase >= 0 && persentase <= 20) {
        short_message = 'Perlu Usaha';
        desc = 'Anda perlu meningkatkan penyelesaian jadwal Anda.';
      } else if (persentase > 20 && persentase <= 40) {
        short_message = 'Sedang Berusaha';
        desc =
          'Anda sedang membuat kemajuan, tetapi masih ada ruang untuk perbaikan.';
      } else if (persentase > 40 && persentase <= 60) {
        short_message = 'Cukup Baik';
        desc = 'Anda sudah cukup baik, teruskan!';
      } else if (persentase > 60 && persentase <= 80) {
        short_message = 'Hebat';
        desc =
          'Kerja bagus! Anda berada di jalur yang tepat untuk mencapai tujuan Anda.';
      } else if (persentase > 80 && persentase <= 100) {
        short_message = 'Luar Biasa';
        desc =
          'Luar biasa! Anda telah menyelesaikan sebagian besar jadwal Anda.';
      }

      console.log(
        'Persentase Penyelesaian Jadwal:',
        persentase,
        'Short Message:',
        short_message,
        'Desc:',
        desc,
      );
      return { persentase, short_message, desc };
    } catch (error) {
      throw new Error(error);
    }
  }
}
