import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from 'src/schemas/category.schema';
import { Order } from 'src/schemas/order.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/schemas/user.schema';
import { ReportQueryParams } from './dto/report-query-params.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
      const newCategory = await this.categoryModel.create({
        ...createCategoryDto,
        user: existingUser._id,
        link_count: createCategoryDto.links.length,
        popularity_count: 0
      });
      return newCategory;
    } catch (error) {
      throw new BadRequestException('Failed to create category', error);
    }
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryModel.find().exec();
  }

  async getReport(
    queryParams: ReportQueryParams):
    Promise<{
      categories: Category[],
      linksDownloaded: number,
      categoryPurchased: number,
      totalOrders: number,
      orders: Order[],
    }
    > {
    try {
      let categories: Category[] = [];
      let orders: Order[] = [];

      const sortOptions: { [key: string]: 1 | -1 } = {};
      const query: any = {};
      const ordeQuery: any = {};
      let linksDownloaded = 0;
      let categoryPurchased = 0;

      if (queryParams?.sortBy) {
        const sortOrder: 1 | -1 = queryParams?.order ? parseInt(queryParams.order) as 1 | -1 : 1;
        sortOptions[queryParams.sortBy] = sortOrder;
      }

      if (queryParams?.startDate) {
        query.last_purchase_at = { $gte: new Date(queryParams.startDate) };
        ordeQuery.created_at = { $gte: new Date(queryParams.startDate) };
      }
      if (queryParams?.endDate) {
        query.last_purchase_at = { ...query.last_purchase_at, $lte: new Date(queryParams.endDate) };
        ordeQuery.created_at = { ...query.last_purchase_at, $lte: new Date(queryParams.endDate) };
      }

      if (Object.keys(sortOptions).length > 0) {
        categories = await this.categoryModel.find(query).sort(sortOptions).exec();
      } else {
        categories = await this.categoryModel.find(query).exec();
      }
      orders = await this.orderModel.find(ordeQuery).exec();
      console.log(orders, 'orders')

      categories.forEach(category => {
        if (category.popularity_count > 0) {
          categoryPurchased = categoryPurchased + category.popularity_count;
          linksDownloaded += (category.links.length * category.popularity_count);
        }
      });

      return {
        categories,
        linksDownloaded,
        categoryPurchased,
        orders,
        totalOrders: orders?.length ?? 0
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch report: ${error.message}`);
    }
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
      const updatedCategory = await this.categoryModel.findByIdAndUpdate({ _id: id }, { ...updateCategoryDto, link_count: updateCategoryDto.links.length, updated_at: Date.now() }, { new: true }).exec();
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
