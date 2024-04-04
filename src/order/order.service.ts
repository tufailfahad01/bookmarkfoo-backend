import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BuyingOption, CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from 'src/schemas/order.schema';
import { Category } from 'src/schemas/category.schema';

const maxCategoriesAllowed = {
  [BuyingOption.Orange]: 3,
  [BuyingOption.Blue]: 5,
  [BuyingOption.Black]: 7,
};

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const { buying_option, categories } = createOrderDto;

    if (!Object.values(BuyingOption).includes(buying_option)) {
      throw new BadRequestException('Invalid or missing buying option');
    }

    if (!buying_option || !maxCategoriesAllowed[buying_option]) {
      throw new BadRequestException('Invalid or missing buying option');
    }

    const maxCategories = maxCategoriesAllowed[buying_option];
    if (!categories || categories.length !== maxCategories) {
      throw new BadRequestException(`Please select ${maxCategories} categories for ${buying_option} option`);
    }

    const existingCategories = await Promise.all(categories.map(categoryId =>
      this.categoryModel.findById(categoryId).exec()
    ));

    if (existingCategories.some(category => !category)) {
      throw new NotFoundException('One or more categories not found');
    }

    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      throw new BadRequestException('Duplicate categories are not allowed');
    }

    try {
      const createdOrder = new this.orderModel(createOrderDto);
      return await createdOrder.save();
    } catch (error) {
      throw new BadRequestException(`Error creating order: ${error.message}`);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { buying_option, categories } = updateOrderDto;
    if (!Object.values(BuyingOption).includes(buying_option)) {
      throw new BadRequestException('Invalid or missing buying option');
    }

    const maxCategories = maxCategoriesAllowed[buying_option];
    if (!categories || categories.length !== maxCategories) {
      throw new BadRequestException(`Please select ${maxCategories} categories for ${buying_option} option`);
    }

    const existingCategories = await Promise.all(categories.map(categoryId =>
      this.categoryModel.findById(categoryId).exec()
    ));

    if (existingCategories.some(category => !category)) {
      throw new NotFoundException('One or more categories not found');
    }

    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      throw new BadRequestException('Duplicate categories are not allowed');
    }

    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true }).exec();
      if (!updatedOrder) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }
      return updatedOrder;
    } catch (error) {
      throw new BadRequestException(`Error updating order: ${error.message}`);
    }
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {
    const { order_status } = updateOrderDto;
    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { order_status }, { new: true }).exec();
      if (!updatedOrder) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }
      return updatedOrder;
    } catch (error) {
      throw new BadRequestException(`Error updating order: ${error.message}`);
    }
  }


  async findAll() {
    try {
      return await this.orderModel.find().exec();
    } catch (error) {
      throw new BadRequestException(`Error fetching orders: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderModel.findById(id).exec();
      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }
      return order;
    } catch (error) {
      throw new BadRequestException(`Error fetching order: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
      if (!deletedOrder) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }
      return `Order with id ${id} has been successfully deleted`;
    } catch (error) {
      throw new BadRequestException(`Error deleting order: ${error.message}`);
    }
  }
}
