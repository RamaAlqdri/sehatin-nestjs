import { Injectable } from '@nestjs/common';
import { Food } from '../entity/food.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateFoodDto } from '../dto/create-food.dto';
import { UpdateFoodDto } from '../dto/update-food.dto';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
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

  async filterFoods(name: string, limit: number): Promise<Food[]> {
    try {
      return await this.foodRepository.find({
        where: name ? { name: Like(`%${name}%`) } : {}, // If name is empty, return all foods
        take: limit,
      });
    } catch (error) {
      throw error;
    }
  }
}
