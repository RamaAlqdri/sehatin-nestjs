import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Schedule } from '../entity/schedule.entity';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Food } from 'src/food/entity/food.entity';
import { User } from 'src/user/entity/user.entity';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

import { WaterHistory } from '../entity/water_history.entity';
import { FoodHistory, MealType } from 'src/food/entity/food_history.entity';
import { WeightHistory } from 'src/user/entity/weight-history.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FoodHistory)
    private readonly foodHistoryRepository: Repository<FoodHistory>,
    @InjectRepository(WaterHistory)
    private readonly waterHistoryRepository: Repository<WaterHistory>,
    @InjectRepository(WeightHistory)
    private readonly wieghtHistoryRepository: Repository<WeightHistory>,
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

  async updateFoodSchedule(
    scheduleId: string,
    foodId: string,
  ): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const food = await this.foodRepository.findOne({
        where: { id: foodId },
      });

      if (!food) {
        throw new Error('Food not found');
      }

      schedule.food = food;
      await this.scheduleRepository.save(schedule);
      return schedule;
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
      // Validasi user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const foods = await this.foodRepository
        .createQueryBuilder('food')
        .orderBy('RANDOM()') // Gunakan RANDOM() untuk memilih secara acak
        .limit(100) // Batasi jumlah makanan yang diambil
        .getMany();

      if (foods.length === 0) {
        throw new HttpException(
          'No foods available in the database',
          HttpStatus.NOT_FOUND,
        );
      }

      // Hitung jumlah hari dalam bulan
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

      // Hapus jadwal yang sudah ada untuk bulan dan tahun yang sama
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      await this.scheduleRepository.delete({
        user: { id: userId },
        scheduled_at: Between(startOfMonth, endOfMonth),
      });

      const schedules = [];

      for (let day = 1; day <= daysInMonth; day++) {
        // Buat tanggal untuk setiap hari dalam UTC
        const scheduledDate = new Date(Date.UTC(year, month - 1, day));

        // Buat 3 jadwal makan per hari
        for (let i = 0; i < 3; i++) {
          const randomFood = foods[Math.floor(Math.random() * foods.length)]; // Pilih makanan secara acak
          const randomWater = Math.floor(Math.random() * (750 - 500 + 1)) + 500; // Nilai acak antara 500 dan 750 mL

          const newSchedule = this.scheduleRepository.create({
            user,
            food: randomFood,
            scheduled_at: new Date(
              scheduledDate.getTime() + i * 14 * 60 * 60 * 1000, // Tambahkan 6 jam untuk setiap jadwal
            ),
            calories_target: randomFood.calories, // Target kalori dari makanan
            water_target: randomWater, // Target air dalam mL
            is_completed: false,
          });
          schedules.push(newSchedule);
        }
      }

      // Simpan semua jadwal dalam satu operasi
      await this.scheduleRepository.save(schedules);
    } catch (error) {
      console.error('Error creating dummy schedules:', error);
      throw new HttpException(
        'Failed to create dummy schedules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

      // if (request.calories_burned) {
      //   schedule.calories_burned = request.calories_burned;
      // }

      if (request.scheduled_at) {
        schedule.scheduled_at = request.scheduled_at;
      }

      // if (request.water_consum) {
      //   schedule.water_consum = request.water_consum;
      // }

      if (request.is_completed !== null) {
        schedule.is_completed = request.is_completed;
      }

      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async getClosestSchedule(
    userId: string,
    date: Date,
  ): Promise<Schedule | undefined> {
    // const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    // console.log('UTC+8 Date:', utc8Date);
    console.log('date android:', date);

    try {
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: MoreThanOrEqual(date), // Ambil semua jadwal setelah waktu ini
        },
        order: { scheduled_at: 'ASC' }, // Urutkan paling awal ke paling akhir
        take: 1, // Cukup ambil satu jadwal terdekat
        relations: ['food'], // Muat relasi food
      });

      return schedules[0]; // Bisa undefined kalau tidak ada
    } catch (error) {
      throw error;
    }
  }

  async getScheduleForUserByDay(
    userId: string,
    date: Date,
  ): Promise<Schedule[]> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // console.log('Start of Day (UTC):', startOfDay);
      // console.log('End of Day (UTC):', endOfDay);

      // Query database dengan rentang waktu UTC
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfDay, endOfDay),
        },
        relations: ['food'],
        order: { scheduled_at: 'ASC' },
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
      // Validasi format tanggal
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      // Hitung awal dan akhir bulan
      const startOfMonth = new Date(
        Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), 1),
      );
      const endOfMonth = new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      );

      // console.log('Start of Month (UTC):', startOfMonth);
      // console.log('End of Month (UTC):', endOfMonth);

      // Query database dengan rentang waktu UTC
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfMonth, endOfMonth),
        },
      });

      return schedules;
    } catch (error) {
      console.error('Error fetching schedules for user by month:', error);
      throw new HttpException(
        'Failed to fetch schedules for the specified month',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async createCaloriesConsumed(
  //   userId: string,
  //   calories: number,
  // ): Promise<CaloriesHistory> {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     const newCaloriesHistory = this.caloriesHistoryRepository.create({
  //       user,
  //       calories,
  //     });

  //     await this.caloriesHistoryRepository.save(newCaloriesHistory);
  //     return newCaloriesHistory;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getCaloriesHistoryForADay(userId: string, date: Date): Promise<any> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Ambil riwayat makanan dari foodHistory berdasarkan userId dan tanggal
      const foodHistories = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
        relations: ['food'], // Muat relasi food untuk mendapatkan informasi makanan
      });

      // Format data menjadi hanya id, calories, dan createdAt
      const data = foodHistories.map((history) => ({
        id: history.id,
        calories: history.calories || '0', // Pastikan kalori berupa angka
        createdAt: history.createdAt,
      }));

      return data;
    } catch (error) {
      console.error('Error fetching calories history for a day:', error);
      throw new Error('Failed to fetch calories history for the specified day');
    }
  }

  async getWaterHistoryForADay(
    userId: string,
    date: Date,
  ): Promise<WaterHistory[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const waterHistories = await this.waterHistoryRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan waktu UTC
        },
      });
      // console.log('Water Histories:', waterHistories);

      return waterHistories;
    } catch (error) {
      throw error;
    }
  }

  async createWaterConsumed(
    userId: string,
    water: number,
  ): Promise<WaterHistory> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Set waktu pencatatan ke UTC+8
      const now = new Date();
      const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      const newWaterHistory = this.waterHistoryRepository.create({
        user,
        water,
        createdAt: utc8Date, // pastikan field createdAt ada di entity WaterHistory
      });

      await this.waterHistoryRepository.save(newWaterHistory);
      return newWaterHistory;
    } catch (error) {
      throw error;
    }
  }
  // async createWaterConsumed(
  //   userId: string,
  //   water: number,
  // ): Promise<WaterHistory> {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     const newWaterHistory = this.waterHistoryRepository.create({
  //       user,
  //       water,
  //     });

  //     await this.waterHistoryRepository.save(newWaterHistory);
  //     return newWaterHistory;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async deleteLatestWaterHistory(userId: string): Promise<void> {
    try {
      // Ambil entri terakhir dari waterHistory berdasarkan userId
      const latestWaterHistory = await this.waterHistoryRepository.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      if (!latestWaterHistory) {
        throw new HttpException(
          'No water history found for this user',
          HttpStatus.NOT_FOUND,
        );
      }

      // Hapus entri terakhir
      await this.waterHistoryRepository.remove(latestWaterHistory);
    } catch (error) {
      throw error;
    }
  }

  async deleteWaterbyId(id: string): Promise<void> {
    try {
      // Ambil entri berdasarkan ID
      const waterHistory = await this.waterHistoryRepository.findOne({
        where: { id },
      });
      if (!waterHistory) {
        throw new HttpException(
          'Water history not found',
          HttpStatus.NOT_FOUND,
        );
      }
      // Hapus entri
      await this.waterHistoryRepository.remove(waterHistory);
    } catch (error) {
      throw error;
    }
  }

  async getUserCaloriesConsumedForDay(
    userId: string,
    date: Date,
  ): Promise<{ calories: number; target: number }> {
    try {
      // Ambil jadwal pengguna untuk hari tertentu
      const schedules = await this.getScheduleForUserByDay(userId, date);

      // Hitung total target kalori dari jadwal
      const targetCalories = schedules.reduce((acc, schedule) => {
        return acc + parseFloat(schedule.calories_target as any);
      }, 0);

      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Ambil riwayat makanan dari foodHistory berdasarkan userId dan tanggal
      const foodHistories = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
        relations: ['food'], // Muat relasi food untuk mendapatkan informasi makanan
      });

      // Hitung total kalori yang dikonsumsi berdasarkan foodHistory
      const consumedCalories = foodHistories.reduce((acc, history) => {
        return acc + parseFloat(history.calories as any); // Kalori sudah dihitung saat entri dibuat
      }, 0);

      // Kembalikan hasil dalam bentuk objek
      return {
        calories: parseFloat(consumedCalories.toFixed(2)), // Batasi hingga 2 angka di belakang koma
        target: parseFloat(targetCalories.toFixed(2)), // Batasi hingga 2 angka di belakang koma
      };
    } catch (error) {
      console.error('Error fetching user calories consumed for a day:', error);
      throw new Error(
        'Failed to fetch user calories consumed for the specified day',
      );
    }
  }

  async getUserWaterConsumedForDay(
    userId: string,
    date: Date,
  ): Promise<{ water: number; target: number }> {
    try {
      const schedules = await this.getScheduleForUserByDay(userId, date);
      // Hitung total target kalori
      const targetWater = parseFloat(
        schedules
          .reduce((acc, schedule) => {
            return acc + parseFloat(schedule.water_target as any);
          }, 0)
          .toFixed(2), // Batasi hingga 2 angka di belakang koma
      );
      // const completedSchedules = schedules.filter(
      //   (schedule) => schedule.is_completed,
      // );

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const waterHistories = await this.waterHistoryRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan waktu UTC
        },
      });

      const waterConsumed = parseFloat(
        waterHistories
          .reduce((acc, history) => {
            return acc + parseFloat(history.water as any);
          }, 0)
          .toFixed(2), // Batasi hingga 2 angka di belakang koma
      );

      return {
        water: waterConsumed,
        target: targetWater,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async setCompleteSchedule(
    scheduleId: string,
    userId: string,
  ): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId, user: { id: userId } },
        relations: ['user', 'food'], // Pastikan relasi user dan food dimuat
      });

      if (!schedule) {
        throw new HttpException(
          'Schedule not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      // Tandai jadwal sebagai selesai
      schedule.is_completed = true;

      // Tentukan meal_type berdasarkan jam dari jadwal
      // console.log('Scheduled At:', schedule.scheduled_at.getUTCHours() + 8);
      const hour = schedule.scheduled_at.getUTCHours() + 8;
      console.log('Hour:', hour);
      let meal_type: MealType;

      if (hour >= 6 && hour < 11) {
        meal_type = MealType.BREAKFAST;
      } else if (hour >= 11 && hour < 17) {
        meal_type = MealType.LUNCH;
      } else {
        meal_type = MealType.DINNER;
      }

      console.log('Meal Type:', meal_type);

      // Periksa apakah foodHistory dengan userId, foodId, dan meal_type sudah ada pada hari yang sama
      const startOfDay = new Date(schedule.scheduled_at);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(schedule.scheduled_at);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existingFoodHistory = await this.foodHistoryRepository.findOne({
        where: {
          user: { id: userId },
          food: { id: schedule.food.id },
          meal_type,
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      if (!existingFoodHistory) {
        // Buat entri di tabel foodHistory berdasarkan jadwal
        const foodHistory = this.foodHistoryRepository.create({
          user: schedule.user,
          food: schedule.food,
          serving_amount: 1, // Default serving amount, bisa disesuaikan
          serving_unit: schedule.food.serving_unit,
          meal_type,
          calories: schedule.food.calories, // Kalori dari makanan
        });

        await this.foodHistoryRepository.save(foodHistory);
      }

      // Simpan perubahan pada jadwal
      await this.scheduleRepository.save(schedule);

      return schedule;
    } catch (error) {
      console.error('Error setting schedule as complete:', error);
      throw new HttpException(
        'Failed to set schedule as complete',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      // const persentase = (completedSchedules.length / schedules.length) * 100;
      const persentase = parseFloat(
        ((completedSchedules.length / schedules.length) * 100).toFixed(2),
      );

      let short_message = '';
      let desc = '';

      if (persentase >= 0 && persentase <= 20) {
        short_message = 'Perlu Usaha';
        desc = 'Tingkatkan penyelesaian jadwal Anda.';
      } else if (persentase > 20 && persentase <= 40) {
        short_message = 'Berproses';
        desc = 'Ada kemajuan, tetap lanjutkan.';
      } else if (persentase > 40 && persentase <= 60) {
        short_message = 'Cukup Baik';
        desc = 'Anda sudah cukup baik.';
      } else if (persentase > 60 && persentase <= 80) {
        short_message = 'Hebat';
        desc = 'Anda berada di jalur yang tepat.';
      } else if (persentase > 80 && persentase <= 100) {
        short_message = 'Luar Biasa';
        desc = 'Anda menyelesaikan sebagian besar jadwal.';
      }

      return { persentase, short_message, desc };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserWeightProgressToTarget(userId: string): Promise<{
    persentase: number;
    target: number;
    short_message: string;
    desc: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['weight_history'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const weightHistories = user.weight_history;

      if (weightHistories.length === 0) {
        return {
          persentase: 0,
          target: user.weight_target,
          short_message: 'Tidak Ada Data',
          desc: 'Tidak ada riwayat berat badan yang ditemukan untuk pengguna ini.',
        };
      }

      const sortedHistories = weightHistories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const firstWeight = sortedHistories[0].weight;
      const currentWeight = sortedHistories[sortedHistories.length - 1].weight;
      const targetWeight = user.weight_target;

      const totalDistance = Math.abs(firstWeight - targetWeight);
      const currentDistance = Math.abs(currentWeight - targetWeight);

      let persentase =
        totalDistance === 0
          ? 100
          : parseFloat(
              ((1 - currentDistance / totalDistance) * 100).toFixed(2),
            );
      persentase = Math.max(0, Math.min(100, persentase));

      const delta = parseFloat(
        Math.abs(currentWeight - firstWeight).toFixed(1),
      );
      const trend =
        currentDistance < Math.abs(firstWeight - targetWeight)
          ? 'Semakin Dekat'
          : currentDistance > Math.abs(firstWeight - targetWeight)
            ? 'Menjauh dari Target'
            : 'Stagnan';

      let short_message = '';
      let desc = '';

      if (persentase < 20) {
        short_message = 'Perlu Usaha';
        desc = `${currentDistance}kg lagi untuk mencapai target anda`;
      } else if (persentase < 40) {
        short_message = 'Berproses';
        desc = `${currentDistance}kg lagi untuk mencapai target anda`;
      } else if (persentase < 60) {
        short_message = 'Cukup Baik';
        desc = `${currentDistance}kg lagi untuk mencapai target anda`;
      } else if (persentase < 80) {
        short_message = 'Hebat';
        desc = `${currentDistance}kg lagi untuk mencapai target anda`;
      } else if (persentase < 100) {
        short_message = 'Luar Biasa';
        desc = `${currentDistance}kg lagi untuk mencapai target anda`;
      } else {
        short_message = 'Target Tercapai!';
        if (currentWeight < targetWeight) {
          // Sudah melewati target, lebih kurus dari target
          desc = `Anda sudah melewati target berat badan. Disarankan naik ke ${targetWeight}kg untuk mencapai berat ideal. Berat saat ini ${currentWeight}kg.`;
        } else {
          desc = `Selamat! Anda sudah mencapai target berat badan anda.`;
        }
      }

      return { persentase, target: targetWeight, short_message, desc };
    } catch (error) {
      throw error;
    }
  }
}
