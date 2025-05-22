import { Injectable } from '@nestjs/common';
import { Food } from '../entity/food.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateFoodDto } from '../dto/create-food.dto';
import { UpdateFoodDto } from '../dto/update-food.dto';
import { FoodHistory, MealType } from '../entity/food_history.entity';
import { Schedule } from 'src/schedule/entity/schedule.entity';
import { format, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(FoodHistory)
    private readonly foodHistoryRepository: Repository<FoodHistory>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async createFood(food: CreateFoodDto): Promise<Food> {
    try {
      const newFood = this.foodRepository.create(food);
      await this.foodRepository.save(newFood);
      return newFood;
    } catch (error) {
      throw error;
    }
  }

  async addFoodToFoodHistory(
    userId: string,
    foodId: string,
    serving_amount: number,
    meal_type: MealType,
    date: Date,
  ): Promise<FoodHistory> {
    try {
      // Cari makanan berdasarkan ID
      const food = await this.foodRepository.findOne({ where: { id: foodId } });
      if (!food) {
        throw new Error('Food not found');
      }

      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Periksa apakah foodHistory dengan userId, foodId, dan meal_type sudah ada pada hari yang sama
      const existingFoodHistory = await this.foodHistoryRepository.findOne({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          food: { id: foodId }, // Pastikan foodId cocok
          meal_type,
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
      });

      if (existingFoodHistory) {
        // Jika data sudah ada, perbarui jumlah porsi dan kalori
        existingFoodHistory.serving_amount = serving_amount;
        existingFoodHistory.calories =
          (food.calories / food.serving_amount) * serving_amount;

        // Simpan perubahan ke database
        await this.foodHistoryRepository.save(existingFoodHistory);

        return existingFoodHistory;
      }

      // Jika data belum ada, buat entri baru
      const foodHistory = this.foodHistoryRepository.create({
        user: { id: userId }, // Hubungkan dengan user
        food,
        serving_amount,
        serving_unit: food.serving_unit,
        meal_type,
        // createdAt: date,
        calories: (food.calories / food.serving_amount) * serving_amount, // Hitung kalori berdasarkan jumlah porsi
      });

      // Cari schedule yang terkait dengan makanan ini pada hari yang sama
      const schedule = await this.scheduleRepository.findOne({
        where: {
          user: { id: userId },
          food: { id: foodId },
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
      });

      // Jika schedule ditemukan, ubah is_completed menjadi false
      if (schedule) {
        schedule.is_completed = true;
        await this.scheduleRepository.save(schedule);
      }

      // Simpan entri riwayat makanan ke database
      await this.foodHistoryRepository.save(foodHistory);

      return foodHistory;
    } catch (error) {
      console.error('Error adding or updating food history:', error);
      throw new Error('Failed to add or update food history');
    }
  }

  async getFoodHistoryByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      // Ambil riwayat makanan berdasarkan userId dan rentang tanggal
      const foodHistory = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
        relations: ['food'],
      });

      // Ambil jadwal berdasarkan userId dan rentang tanggal
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
      });

      const totalCalories = this.getTotalCalories(foodHistory);
      const totalTargetCalories = this.getTotalTargetCalories(schedules);
      const averageCalories = this.getAverageCalories(foodHistory);
      const caloriesPerMealType = {
        breakfast: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(
            2,
          ),
        ),

        lunch: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
        ),

        dinner: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
        ),
        other: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
        ),
      };

      // console.log('Total Calories:', totalCalories);
      // console.log('Total Target Calories:', totalTargetCalories);
      // console.log('Average Calories:', averageCalories);
      // console.log('Calories per Meal Type:', caloriesPerMealType);

      return {
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
        averageCalories: parseFloat(averageCalories.toFixed(2)),
        caloriesPerMealType,
        foodHistory,
      };
      // Gabungkan riwayat makanan dan jadwal berdasarkan tanggal
    } catch (error) {
      console.error('Error fetching food history by date range:', error);
      throw new Error('Failed to fetch food history by date range');
    }
  }

  async getFoodHistoryByADate(userId: string, date: Date): Promise<any> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      // Ambil riwayat makanan berdasarkan userId dan rentang tanggal
      const foodHistory = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
        relations: ['food'],
      });

      // Ambil jadwal berdasarkan userId dan rentang tanggal
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
      });

      const totalCalories = this.getTotalCalories(foodHistory);
      const totalTargetCalories = this.getTotalTargetCalories(schedules);
      const averageCalories = this.getAverageCalories(foodHistory);
      const caloriesPerMealType = {
        breakfast: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(
            2,
          ),
        ),

        lunch: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
        ),

        dinner: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
        ),
        other: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
        ),
      };

      // console.log('Total Calories:', totalCalories);
      // console.log('Total Target Calories:', totalTargetCalories);
      // console.log('Average Calories:', averageCalories);
      // console.log('Calories per Meal Type:', caloriesPerMealType);

      return {
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
        averageCalories: parseFloat(averageCalories.toFixed(2)),
        caloriesPerMealType,
        foodHistory,
      };
      // Gabungkan riwayat makanan dan jadwal berdasarkan tanggal
    } catch (error) {
      console.error('Error fetching food history by date range:', error);
      throw new Error('Failed to fetch food history by date range');
    }
  }

  async getLast7DaysFoodHistoryByADate(
    userId: string,
    date: Date,
  ): Promise<any> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      // Hitung tanggal 7 hari terakhir berdasarkan parameter date
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(endDate.getDate() - 7);

      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Ambil riwayat makanan berdasarkan userId dan rentang tanggal
      const foodHistory = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
        relations: ['food'],
      });

      // Ambil jadwal berdasarkan userId dan rentang tanggal
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
      });

      const totalCalories = this.getTotalCalories(foodHistory);
      const totalTargetCalories = this.getTotalTargetCalories(schedules);
      const averageCalories = this.getAverageCalories(foodHistory);
      const caloriesPerMealType = {
        breakfast: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(
            2,
          ),
        ),

        lunch: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
        ),

        dinner: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
        ),
        other: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
        ),
      };

      // console.log('Total Calories:', totalCalories);
      // console.log('Total Target Calories:', totalTargetCalories);
      // console.log('Average Calories:', averageCalories);
      // console.log('Calories per Meal Type:', caloriesPerMealType);

      return {
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
        averageCalories: parseFloat(averageCalories.toFixed(2)),
        caloriesPerMealType,
        foodHistory,
      };
      // Gabungkan riwayat makanan dan jadwal berdasarkan tanggal
    } catch (error) {
      console.error('Error fetching food history by date range:', error);
      throw new Error('Failed to fetch food history by date range');
    }
  }

  async getLast30DaysFoodHistoryByADate(
    userId: string,
    date: Date,
  ): Promise<any> {
    try {
      // Hitung awal dan akhir hari dalam UTC
      // Hitung tanggal 7 hari terakhir berdasarkan parameter date
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(endDate.getDate() - 30);

      // Hitung awal dan akhir hari dalam UTC
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Ambil riwayat makanan berdasarkan userId dan rentang tanggal
      const foodHistory = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
        relations: ['food'],
      });

      // Ambil jadwal berdasarkan userId dan rentang tanggal
      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId }, // Pastikan userId cocok
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan rentang tanggal
        },
      });

      const totalCalories = this.getTotalCalories(foodHistory);
      const totalTargetCalories = this.getTotalTargetCalories(schedules);
      const averageCalories = this.getAverageCalories(foodHistory);
      const caloriesPerMealType = {
        breakfast: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(
            2,
          ),
        ),

        lunch: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
        ),

        dinner: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
        ),
        other: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
        ),
      };

      // console.log('Total Calories:', totalCalories);
      // console.log('Total Target Calories:', totalTargetCalories);
      // console.log('Average Calories:', averageCalories);
      // console.log('Calories per Meal Type:', caloriesPerMealType);

      return {
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
        averageCalories: parseFloat(averageCalories.toFixed(2)),
        caloriesPerMealType,
        foodHistory,
      };
      // Gabungkan riwayat makanan dan jadwal berdasarkan tanggal
    } catch (error) {
      console.error('Error fetching food history by date range:', error);
      throw new Error('Failed to fetch food history by date range');
    }
  }

  private getAverageCalories(foodHistory: FoodHistory[]): number {
    try {
      // Hitung total kalori dari semua riwayat makanan
      const totalCalories = foodHistory.reduce(
        (total, item) => total + parseFloat(item.calories as any),
        0,
      );
      // Hitung rata-rata kalori
      const averageCalories =
        foodHistory.length > 0 ? totalCalories / foodHistory.length : 0;
      return averageCalories;
    } catch (error) {
      console.error('Error calculating average calories:', error);
      throw new Error('Failed to calculate average calories');
    }
  }

  private getTotalCalories(foodHistory: FoodHistory[]): number {
    try {
      // Hitung total kalori dari semua riwayat makanan
      const totalCalories = foodHistory.reduce(
        (total, item) => total + parseFloat(item.calories as any),
        0,
      );
      return totalCalories;
    } catch (error) {
      console.error('Error calculating total calories:', error);
      throw new Error('Failed to calculate total calories');
    }
  }

  private getCaloriesPerMealType(
    foodHistory: FoodHistory[],
    mealType: MealType,
  ): number {
    try {
      // Hitung total kalori berdasarkan jenis makanan
      const totalCalories = foodHistory
        .filter((item) => item.meal_type === mealType)
        .reduce((total, item) => total + parseFloat(item.calories as any), 0);
      return totalCalories;
    } catch (error) {
      console.error('Error calculating calories per meal type:', error);
      throw new Error('Failed to calculate calories per meal type');
    }
  }

  private getTotalTargetCalories(schedule: Schedule[]): number {
    try {
      // Hitung total target kalori dari semua jadwal
      const totalTargetCalories = schedule.reduce(
        (total, item) => total + parseFloat(item.calories_target as any),
        0,
      );
      return totalTargetCalories;
    } catch (error) {
      console.error('Error calculating total target calories:', error);
      throw new Error('Failed to calculate total target calories');
    }
  }

  async getFoodHistorySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const foodHistory = await this.foodHistoryRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDate, endDate),
      },
      relations: ['food'],
    });

    const schedules = await this.scheduleRepository.find({
      where: {
        user: { id: userId },
        scheduled_at: Between(startDate, endDate),
      },
    });

    const totalCalories = this.getTotalCalories(foodHistory);
    const totalTargetCalories = this.getTotalTargetCalories(schedules);
    const averageCalories = this.getAverageCalories(foodHistory);
    const caloriesPerMealType = {
      breakfast: parseFloat(
        this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(2),
      ),
      lunch: parseFloat(
        this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
      ),
      dinner: parseFloat(
        this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
      ),
      other: parseFloat(
        this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
      ),
    };

    return {
      totalCalories: parseFloat(totalCalories.toFixed(2)),
      totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
      averageCalories: parseFloat(averageCalories.toFixed(2)),
      caloriesPerMealType,
      foodHistory,
    };
  }

  async getFoodHistorySummaryAdv(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      const foodHistory = await this.foodHistoryRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startDate, endDate),
        },
        relations: ['food'],
      });

      // console.log('foodHistory', foodHistory);

      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startDate, endDate),
        },
      });
      // console.log('schedules', schedules);

      const totalCalories = this.getTotalCalories(foodHistory);
      const totalTargetCalories = this.getTotalTargetCalories(schedules);
      const averageCalories = this.getAverageCalories(foodHistory);
      const caloriesPerMealType = {
        breakfast: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.BREAKFAST).toFixed(
            2,
          ),
        ),
        lunch: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.LUNCH).toFixed(2),
        ),
        dinner: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.DINNER).toFixed(2),
        ),
        other: parseFloat(
          this.getCaloriesPerMealType(foodHistory, MealType.OTHER).toFixed(2),
        ),
      };

      // console.log('Total Calories:', totalCalories);
      // console.log('Total Target Calories:', totalTargetCalories);
      // console.log('Average Calories:', averageCalories);
      // console.log('Calories per Meal Type:', caloriesPerMealType);

      // === Grup Dinamis Berdasarkan Tanggal ===
      const dayDiff = differenceInDays(endDate, startDate) + 1;
      const groupedCalories: Record<string, any> = {};

      for (const item of foodHistory) {
        const created = new Date(item.createdAt);
        let label = '';

        const rawType = item.meal_type?.toLowerCase();
        const validTypes = ['breakfast', 'lunch', 'dinner', 'other'];
        const type = validTypes.includes(rawType) ? rawType : 'other';

        if (dayDiff <= 8) {
          const dayLabel = format(created, 'eee dd');
          label = dayLabel
            .toLowerCase()
            .replace('mon', 'sen')
            .replace('tue', 'sel')
            .replace('wed', 'rab')
            .replace('thu', 'kam')
            .replace('fri', 'jum')
            .replace('sat', 'sab')
            .replace('sun', 'min');
        } else {
          const weekNum =
            Math.floor(differenceInDays(created, startDate) / 7) + 1;
          label = `minggu ${weekNum}`;
        }

        if (!groupedCalories[label]) {
          groupedCalories[label] = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            other: 0,
          };
        }

        groupedCalories[label][type] += Number(item.calories) || 0;
      }

      // Bulatkan hasil
      for (const label in groupedCalories) {
        for (const type in groupedCalories[label]) {
          groupedCalories[label][type] = parseFloat(
            groupedCalories[label][type].toFixed(2),
          );
        }
      }
      // console.log('Grouped Calories:', groupedCalories);
      const sortedGroupedCalories = Object.entries(groupedCalories)
        .sort(([labelA], [labelB]) => this.sortLabels(labelA, labelB))
        .reduce(
          (acc, [label, value]) => {
            acc[label] = value;
            return acc;
          },
          {} as Record<string, any>,
        );

      return {
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        totalTargetCalories: parseFloat(totalTargetCalories.toFixed(2)),
        averageCalories: parseFloat(averageCalories.toFixed(2)),
        caloriesPerMealType,
        groupedCalories: sortedGroupedCalories,
        foodHistory,
      };
    } catch (error) {
      console.error('Error fetching food history summary:', error);
      throw new Error('Failed to fetch food history summary');
    }
  }

  sortLabels(a: string, b: string): number {
    const weekMatchA = a.match(/minggu (\d+)/);
    const weekMatchB = b.match(/minggu (\d+)/);

    // Jika label mingguan
    if (weekMatchA && weekMatchB) {
      return parseInt(weekMatchA[1]) - parseInt(weekMatchB[1]);
    }

    // Jika label harian, ambil angka hari-nya (misal 'sen 01' → 01)
    const dayNumA = parseInt(a.split(' ')[1]);
    const dayNumB = parseInt(b.split(' ')[1]);
    return dayNumA - dayNumB;
  }

  async deleteFoodHistory(
    foodId: string,
    userId: string,
    meal_type: MealType,
    date: Date, // Tambahkan parameter date
  ): Promise<void> {
    try {
      console.log('delete food date', date);
      // Hitung awal dan akhir hari berdasarkan parameter date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      console.log('startOfDay', startOfDay);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('endOfDay', endOfDay);

      // Cari foodHistory berdasarkan userId, foodId, meal_type, dan tanggal
      const foodHistory = await this.foodHistoryRepository.findOne({
        where: {
          user: { id: userId },
          food: { id: foodId },
          meal_type,
          createdAt: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
      });

      if (!foodHistory) {
        throw new Error('Food history not found');
      }

      // Cari schedule yang terkait dengan makanan ini pada hari yang sama
      const schedule = await this.scheduleRepository.findOne({
        where: {
          user: { id: userId },
          food: { id: foodId },
          scheduled_at: Between(startOfDay, endOfDay), // Filter berdasarkan hari yang sama
        },
      });

      // Jika schedule ditemukan, ubah is_completed menjadi false
      if (schedule) {
        schedule.is_completed = false;
        await this.scheduleRepository.save(schedule);
      }

      // Hapus foodHistory berdasarkan ID
      await this.foodHistoryRepository.delete(foodHistory.id);
    } catch (error) {
      console.error('Error deleting food history:', error);
      throw new Error('Failed to delete food history');
    }
  }

  async getFoodHistoryByFoodIdMealTypeUserIdDate(
    foodId: string,
    userId: string,
    meal_type: MealType,
    date: Date,
  ): Promise<FoodHistory> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      const result = await this.foodHistoryRepository.findOne({
        where: {
          user: { id: userId },
          food: { id: foodId },
          meal_type,
          createdAt: Between(startOfDay, endOfDay),
        },
        relations: ['food'],
      });
      // if (!result || result.length === 0) {
      //   throw new HttpException('Food history not found', 404); // Tambahkan throw untuk melempar exception
      // }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getFoodHistorys(
    userId: string,
    meal_type: MealType,
    date: Date,
  ): Promise<FoodHistory[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      return await this.foodHistoryRepository.find({
        where: {
          user: { id: userId },
          meal_type,
          createdAt: Between(startOfDay, endOfDay),
        },
        relations: ['food'],
      });
    } catch (error) {
      throw error;
    }
  }

  async getFoodById(id: string): Promise<Food> {
    try {
      return await this.foodRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async getAllFood(): Promise<Food[]> {
    try {
      return await this.foodRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async updateFood(id: string, food: UpdateFoodDto): Promise<Food> {
    try {
      await this.foodRepository.update(id, food);
      return await this.foodRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async getFoodByManyIds(ids: string[]): Promise<Food[]> {
    try {
      return await this.foodRepository.find({
        where: ids.map((id) => ({ id })),
      });
    } catch (error) {
      throw error;
    }
  }

  // async filterFoods(name: string, limit: number): Promise<Food[]> {
  //   try {
  //     return await this.foodRepository.find({
  //       where: name ? { name: Like(`%${name}%`) } : {}, // If name is empty, return all foods
  //       take: limit,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async filterFoods(name: string, limit: number): Promise<Food[]> {
    try {
      const query = this.foodRepository.createQueryBuilder('food');
      if (name) {
        query.where('LOWER(food.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
      }
      query.take(limit);
      return await query.getMany();
    } catch (error) {
      throw error;
    }
  }

  async getRandomListFood(): Promise<Food[]> {
    try {
      const foods = await this.foodRepository.find();
      const randomFoods = [];
      const foodIds = new Set();

      while (randomFoods.length < 6 && randomFoods.length < foods.length) {
        const randomIndex = Math.floor(Math.random() * foods.length);
        const randomFood = foods[randomIndex];

        if (!foodIds.has(randomFood.id)) {
          randomFoods.push(randomFood);
          foodIds.add(randomFood.id);
        }
      }

      return randomFoods;
    } catch (error) {
      throw error;
    }
  }
}
