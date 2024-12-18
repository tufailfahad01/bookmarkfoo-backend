import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { MailerService } from '@nestjs-modules/mailer';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs/promises';

import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from 'src/schemas/payment.schema';
import { Order } from 'src/schemas/order.schema';
import { OrderStatus } from 'src/order/dto/create-order.dto';
import { Topic } from 'src/schemas/topic.schema';
import { User } from 'src/schemas/user.schema';
import { emailTemplate } from './getEmailTemplate';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Topic.name) private readonly categoryModel: Model<Topic>,
    private readonly mailerService: MailerService,
    private readonly orderService: OrderService
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    try {
      const createOrder = await this.orderService.create(createPaymentDto)
      console.log('createOrder', createOrder)
      const stripe = new Stripe(process.env.StripeSecretKey, {
        apiVersion: '2023-10-16',
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt((createPaymentDto.amount * 100).toFixed(0)), // convert dollars into cents
        currency: createPaymentDto.currency,
      });

      const payment = new this.paymentModel({
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        orderId: createOrder._id,
      });

      await payment.save();

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException(`Error creating payment: ${error.message}`);
    }
  }

  async confirmPayment(clientSecret: string) {
    const payment = await this.paymentModel.findOne({
      client_secret: clientSecret,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      await this.paymentModel.updateOne(
        { _id: payment._id },
        { status: PaymentStatus.Succeeded },
      );
      await this.orderModel.updateOne(
        { _id: order._id },
        { order_status: OrderStatus.COMPLETED },
      );
      const categories = await Promise.all(
        order.categories.map(async (categoryId) => {
          const catagory = await this.categoryModel.findById(categoryId).exec();
          await this.categoryModel.updateOne(
            { _id: categoryId },
            {
              popularity_count: catagory.popularity_count + 1,
              updated_at: Date.now(),
              last_purchase_at: Date.now(),
            },
          );
          return catagory;
        }),
      );
      const attachment = await this.generateExcelAttachment(categories);
      await this.sendEmail(attachment, order);
      await this.deleteGeneratedFiles([attachment]);

      return {
        message: 'Your links have been sent to your email',
      };
    } catch (error) {
      throw new BadRequestException(
        `Error confirming payment: ${error.message}`,
      );
    }
  }

  async generateExcelAttachments(categories: Topic[]) {
    const attachmentsPromises = categories.map(async (category) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(category.name);
      worksheet.addRow(['Your Links', 'Category', 'Description']);
      worksheet.addRow(['']);
      category.links.forEach((link: any) => {
        if (link?.is_Live) {
          worksheet.addRow([
            {
              text: link.url,
              hyperlink: link.url,
              style: { underline: true, color: { argb: 'FF0000FF' } },
            },
            link.type,
          ]);
        }
      });
      const urlColumn = worksheet.getColumn(1);
      urlColumn.width = 50;
      const filename = `${category.name}-${new Date().toISOString()}.xlsx`;
      await workbook.xlsx.writeFile(filename);
      const fileContent = await fs.readFile(filename);
      return { filename, content: fileContent };
    });

    return Promise.all(attachmentsPromises);
  }

  async generateExcelAttachment(categories: Topic[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Links');

    // Initialize the worksheet with headers and make them bold
    const headerRow = worksheet.addRow([
      'Your Links',
      'Category',
      'Description',
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRow(['']);

    categories.forEach((category) => {
      category.links.forEach((link: any) => {
        if (link?.is_Live) {
          worksheet.addRow([
            {
              text: link.url,
              hyperlink: link.url,
              style: { underline: true, color: { argb: 'FF0000FF' } },
            },
            link.type,
            link.description || '', // assuming there might be a description field
          ]);
        }
      });
      // Add two empty rows after each category
      worksheet.addRow(['']);
      worksheet.addRow(['']);
    });

    const urlColumn = worksheet.getColumn(1);
    urlColumn.width = 50;
    const filename = `Bookmark Fu order ${new Date().toISOString()}.xlsx`;
    await workbook.xlsx.writeFile(filename);
    const fileContent = await fs.readFile(filename);
    return { filename, content: fileContent };
  }

  async deleteGeneratedFiles(
    attachments: { filename: string; content: Buffer }[],
  ) {
    await Promise.all(
      attachments.map(async (attachment) => {
        await fs.unlink(attachment.filename);
      }),
    );
  }

  async sendEmail(
    attachment: { filename: string; content: Buffer },
    order: Order,
  ) {
    try {
      await this.mailerService.sendMail({
        to: order?.email ?? '',
        subject: 'New Order Email',
        text: emailTemplate(
          order?.username ?? '',
          order?.categories?.length,
          order?.total_amount,
        ),
        attachments: [attachment],
      });

      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error sending email: ${error.message}`);
    }
  }

  // not required fot now

  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentModel.find().exec();
    } catch (error) {
      throw new BadRequestException(`Error finding payments: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentModel.findById(id).exec();
      if (!payment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }
      return payment;
    } catch (error) {
      throw new BadRequestException(`Error finding payment: ${error.message}`);
    }
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    try {
      const updatedPayment = await this.paymentModel
        .findByIdAndUpdate(id, updatePaymentDto, { new: true })
        .exec();
      if (!updatedPayment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }
      return updatedPayment;
    } catch (error) {
      throw new BadRequestException(`Error updating payment: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Payment> {
    try {
      const deletedPayment = await this.paymentModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedPayment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }
      return deletedPayment;
    } catch (error) {
      throw new BadRequestException(`Error deleting payment: ${error.message}`);
    }
  }
}
