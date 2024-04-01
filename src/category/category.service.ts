import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Category } from 'src/schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/schemas/user.schema';
import { Link } from 'src/schemas/link.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Link.name) private readonly linkModel: Model<Link>,
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
      const newCategory = await this.categoryModel.create({ ...createCategoryDto, user: existingUser._id, link_count:createCategoryDto.links.length });
      // const linksDto= createCategoryDto.links.map(link=>({...(link as any),category:newCategory._id}))
      // const createLinks= await this.linkModel.create(linksDto);
      // const updateCategoryLinks= await this.categoryModel.findByIdAndUpdate({_id:newCategory._id},{links:createLinks},{new:true});
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
      const updatedCategory = await this.categoryModel.findByIdAndUpdate({ _id: id }, {...updateCategoryDto,link_count:updateCategoryDto.links.length,updated_at:Date.now()}, { new: true }).exec();
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
