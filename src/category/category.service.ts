import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Category } from 'src/schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) { }

  async create(createCategoryDto: CreateCategoryDto, user: User): Promise<Category> {
    const existingUser = await this.userModel.findOne({ email: user.email }).lean();
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name }).lean();

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }
    try {
      const newCategory = await this.categoryModel.create({ ...createCategoryDto, user: existingUser._id });
      return newCategory;
    } catch (error) {
      throw new BadRequestException('Failed to create category', error);
    }
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const updatedCategory = await this.categoryModel.findByIdAndUpdate({ _id: id }, updateCategoryDto, { new: true }).exec();
      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }
      return updatedCategory
    } catch (error) {
      throw new BadRequestException('Failed to create category', error);
    }
  }


  async remove(id: string): Promise<void> {
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
  }

}
