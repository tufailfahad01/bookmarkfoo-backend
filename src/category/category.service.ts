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
    queryParams: ReportQueryParams,
    user: User
  ): Promise<{
    categories: Category[],
    linksDownloaded: number,
    categoryPurchased: number,
    totalOrders: number,
    orders: Order[],
  }> {
    try {
      const sortOptions: { [key: string]: 1 | -1 } = {};
      const categoryQuery: any = {};
      const orderQuery: any = {};
      let linksDownloaded = 0;
      let categoryPurchased = 0;

      // Configure sorting options
      if (queryParams?.sortBy) {
        const sortOrder: 1 | -1 = queryParams?.order ? parseInt(queryParams.order) as 1 | -1 : 1;
        sortOptions[queryParams.sortBy] = sortOrder;
      }

      // Configure date filters
      if (queryParams?.startDate) {
        const startDate = new Date(queryParams.startDate);
        categoryQuery.last_purchase_at = { $gte: startDate };
        orderQuery.created_at = { $gte: startDate };
      }
      if (queryParams?.endDate) {
        const endDate = new Date(queryParams.endDate);
        categoryQuery.last_purchase_at = { ...categoryQuery.last_purchase_at, $lte: endDate };
        orderQuery.created_at = { ...orderQuery.created_at, $lte: endDate };
      }

      // Fetch categories and orders
      const [categories, orders, totalOrders] = await Promise.all([
        this.categoryModel.find(categoryQuery).sort(sortOptions).exec(),
        this.orderModel.find(orderQuery).exec(),
        this.orderModel.countDocuments().exec(),
      ]);

      // Calculate linksDownloaded and categoryPurchased
      categories.forEach(category => {
        if (category.popularity_count > 0) {
          categoryPurchased += category.popularity_count;
          linksDownloaded += (category.links.length * category.popularity_count);
        }
      });

      // Update orders with user information and fetch related categories
      await Promise.all(orders.map(async (order: Order) => {
        order.email = order.email || user.email;
        order.username = order.username || user.name;
        order.categories = await this.categoryModel.find({ _id: { $in: order.categories } }).exec();
      }));

      return {
        categories,
        linksDownloaded,
        categoryPurchased,
        orders,
        totalOrders,
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
