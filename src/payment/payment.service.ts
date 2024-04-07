import { name } from './../../node_modules/@types/ejs/index.d';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { MailerService } from '@nestjs-modules/mailer';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs/promises'

import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from 'src/schemas/payment.schema';
import { Order } from 'src/schemas/order.schema';
import { OrderStatus } from 'src/order/dto/create-order.dto';
import { Category } from 'src/schemas/category.schema';
import { User } from 'src/schemas/user.schema';
import { emailTemplate } from './getEmailTemplate';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly mailerService: MailerService
  ) { }

  async create(createPaymentDto: CreatePaymentDto): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    try {
      const stripe = new Stripe(process.env.StripeSecretKey, {
        apiVersion: "2023-10-16"
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: createPaymentDto.amount * 100, // convert dollars into cents
        currency: createPaymentDto.currency,
      });

      const payment = new this.paymentModel({
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        orderId: createPaymentDto.orderId
      });

      await payment.save();

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException(`Error creating payment: ${error.message}`);
    }
  }

  async confirmPayment(clientSecret: string, user: User) {
    const payment = await this.paymentModel.findOne({ client_secret: clientSecret })
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      await this.paymentModel.updateOne({ _id: payment._id }, { status: PaymentStatus.Succeeded });
      await this.orderModel.updateOne({ _id: order._id }, { order_status: OrderStatus.COMPLETED });

      const categories = await Promise.all(order.categories.map(categoryId =>
        this.categoryModel.findById(categoryId).exec()
      ));

      const attachmentsPromises = categories.map(async category => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(category.name);
        worksheet.addRow(['Your Links']);
        worksheet.addRow(['']);
        category.links.forEach((link: any) => {
          worksheet.addRow([link.url, link.type]);
        })
        const filename = `${category.name}-${new Date().toISOString()}.xlsx`;
        await workbook.xlsx.writeFile(filename);
        const fileContent = await fs.readFile(filename);
        return { filename, content: fileContent };
      });

      const attachments = await Promise.all(attachmentsPromises);
      await this.sendEmail(attachments, user)

      // Delete generated files after sending email
      await Promise.all(attachments.map(async attachment => {
        await fs.unlink(attachment.filename);
      }));

      return {
        message: "Your links have beent sent to your email",
      };
    } catch (error) {
      throw new BadRequestException(`Error confirming payment: ${error.message}`);
    }
  }

  async sendEmail(attachments: { filename: string, content: Buffer }[], user: any) {
    try {
      if (!Array.isArray(attachments)) {
        throw new BadRequestException('Attachments must be an array');
      }

      await this.mailerService.sendMail({
        to: 'marsad11223.us@gmail.com', // Replace with recipient's email address
        subject: 'New Order Email',
        html: emailTemplate(user.name),
        attachments: attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
        })),
      });

      return {
        message: "Email sent successfully"
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error sending email: ${error.message}`);
    }
  }

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

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    try {
      const updatedPayment = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec();
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
      const deletedPayment = await this.paymentModel.findByIdAndDelete(id).exec();
      if (!deletedPayment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }
      return deletedPayment;
    } catch (error) {
      throw new BadRequestException(`Error deleting payment: ${error.message}`);
    }
  }
}