import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Topic } from 'src/schemas/topic.schema';
import { Order } from 'src/schemas/order.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { User } from 'src/schemas/user.schema';
import { ReportQueryParams } from './dto/report-query-params.dto';
import { OrderStatus } from 'src/order/dto/create-order.dto';
import { GetTopicsDto } from './dto/get-topics.dto';
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private readonly topicModel: Model<Topic>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createTopicDto: CreateTopicDto, user: User): Promise<Topic> {
    // Find the existing user
    const existingUser = await this.userModel.findOne({ email: user.email }).lean();
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
  
    // Validate if category exists using the provided categoryId
    const existingCategory = await this.categoryModel.findById(createTopicDto.categoryId);
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
  
    try {
      // Create the new topic and associate the user and category
      const newTopic :any = await this.topicModel.create({
        ...createTopicDto,
        user: existingUser._id,
        link_count: createTopicDto.links.length,
        popularity_count: 0,
        category: createTopicDto.categoryId, // Associate the categoryId
      });
  
      // Update the category to include the new topic in its topics array
      existingCategory.topics.push(newTopic._id); // Push the new topic's ID to the array
      existingCategory.updated_at = new Date(); // Update the category's timestamp
      await existingCategory.save(); // Save the changes to the category
  
      return newTopic;
    } catch (error) {
      throw new BadRequestException('Failed to create topic', error);
    }
  }
  

  async getUniqueTypes(): Promise<{ array: string[] }> {
    try {
      const result = await this.topicModel.aggregate([
        { $match: { type: { $ne: null } } },
        { $group: { _id: '$type' } },
        { $project: { _id: 1 } }
      ]);
      const types = result.map(item => item._id);
      return { "array": types };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching unique types.');
    }
  }
  async findAll(filterDto: { categoryId?: string }): Promise<Topic[]> {
    const query = { isDeleted: false };

    if (filterDto.categoryId) {
      query['category'] = filterDto.categoryId;
    }
    return await this.topicModel.find(query).exec();
  }
  
  
  async getCategories(getTopicsDto: GetTopicsDto): Promise<Topic[]> {
    const { type } = getTopicsDto;
    try {
      const filter = type ? { type } : {};
      const categories = await this.topicModel.find(filter).exec();
      if (!categories.length) {
        throw new NotFoundException('No categories found for the specified type.');
      }
      return categories;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while fetching categories.');
    }
  }

  async getReport(queryParams: ReportQueryParams): Promise<{
    categories: Topic[];
    linksDownloaded: number;
    categoryPurchased: number;
    totalOrders: number;
    orders: Order[];
  }> {
    try {
      const sortOptions: { [key: string]: 1 | -1 } = {};
      const categoryQuery: any = {};
      const orderQuery: any = { order_status: OrderStatus.COMPLETED };
      let linksDownloaded = 0;
      let categoryPurchased = 0;
  
      // Configure sorting options
      if (queryParams?.sortBy) {
        const sortOrder: 1 | -1 = queryParams?.order
          ? (parseInt(queryParams.order) as 1 | -1)
          : 1;
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
        categoryQuery.last_purchase_at = {
          ...categoryQuery.last_purchase_at,
          $lte: endDate,
        };
        orderQuery.created_at = { ...orderQuery.created_at, $lte: endDate };
      }
  
      // Fetch categories and orders
      const [categories, orders] = await Promise.all([
        this.topicModel.find(categoryQuery).sort(sortOptions).exec(),
        this.orderModel.find(orderQuery).sort({ created_at: -1 }).exec(),
      ]);
  
      // Filter categories that were purchased and fetch related category details
      const filteredCategories: Topic[] = [];
      const purchasedTrack: Record<string, number> = {};
  
      await Promise.all(
        orders.map(async (order: Order) => {
          order.email = order.email || '';
          order.username = order.username || '';
  
          // Fetch full category details based on the IDs in the order
          const fullCategories = await this.topicModel
            .find({ _id: { $in: order.categories } }) // Get full category objects
            .exec();
          
          // Replace category IDs with full category objects in the order
          order.categories = fullCategories;
  
          // Process each category for download links and purchase count
          fullCategories.forEach((category) => {
            categoryPurchased += 1;
            linksDownloaded += category?.links?.length ?? 0;
  
            // Track unique categories and their purchase count
            if (!purchasedTrack[category?.id]) {
              filteredCategories.push(category);
              purchasedTrack[category?.id] = 1;
            } else {
              purchasedTrack[category?.id] += 1;
            }
          });
        }),
      );
  
      // Add popularity count to each unique category
      filteredCategories.forEach((category) => {
        category.popularity_count = purchasedTrack[category?.id] ?? 0;
      });
  
      return {
        categories: filteredCategories,
        linksDownloaded,
        categoryPurchased,
        orders,
        totalOrders: orders?.length ?? 0,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch report: ${error.message}`);
    }
  }
  
  

  async findOne(id: string): Promise<Topic> {
    const category = await this.topicModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found or has been deleted');
    }
    return category;
  }

  async update(
    id: string,
    updateTopicDto: UpdateTopicDto,
  ): Promise<Topic> {
    try {
      // Fetch the current topic by its ID
      const existingTopic = await this.topicModel.findById(id).exec();
      
      if (!existingTopic) {
        throw new NotFoundException('Topic not found');
      }
  
      // If the topic already has a category, remove it from that category's topics array
      if (existingTopic.category) {
        await this.categoryModel.updateOne(
          { _id: existingTopic.category },
          { $pull: { topics: existingTopic._id } }
        ).exec();
      }
  
      // If a new categoryId is provided, add the topic to the new category's topics array
      if (updateTopicDto.categoryId) {
        await this.categoryModel.updateOne(
          { _id: updateTopicDto.categoryId },
          { $addToSet: { topics: existingTopic._id } }
        ).exec();
      }
  
      // Update the topic with the new information
      const updatedTopic = await this.topicModel
        .findByIdAndUpdate(
          { _id: id },
          {
            ...updateTopicDto,
            link_count: updateTopicDto.links.length,
            updated_at: Date.now(),
            category: updateTopicDto.categoryId || existingTopic.category, // Set new category or retain the existing one
          },
          { new: true },
        )
        .exec();
  
      if (!updatedTopic) {
        throw new NotFoundException('Topic not found after update');
      }
  
      return updatedTopic;
    } catch (error) {
      throw new BadRequestException('Failed to update topic', error.message);
    }
  }
  

  async remove(id: string): Promise<void> {
    try {
      // Fetch the current topic by its ID
      const existingTopic = await this.topicModel.findById(id).exec();
  
      if (!existingTopic) {
        throw new NotFoundException('Topic not found');
      }
  
      // If the topic has a category, remove it from the category's topics array
      if (existingTopic.category) {
        await this.categoryModel.updateOne(
          { _id: existingTopic.category },
          { $pull: { topics: existingTopic._id } }
        ).exec();
      }
  
      // Mark the topic as deleted
      const deletedTopic = await this.topicModel
        .findByIdAndUpdate(
          { _id: id },
          {
            updated_at: Date.now(),
            isDeleted: true,
            is_Published: false,
            deleted_at: Date.now(),
          },
          { new: true },
        )
        .exec();
  
      if (!deletedTopic) {
        throw new NotFoundException('Topic not found after deletion');
      }
    } catch (error) {
      throw new BadRequestException('Failed to remove topic', error.message);
    }
  }
  
}
