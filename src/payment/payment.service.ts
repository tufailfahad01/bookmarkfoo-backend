import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from 'src/schemas/payment.schema';
import { Order } from 'src/schemas/order.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
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

  async confirmPayment(clientSecret: string) {
    try {
      const payment = await this.paymentModel.findOne({ client_secret: clientSecret })
      await this.paymentModel.updateOne({ _id: payment._id }, { status: PaymentStatus.Succeeded });

      return {
        message: "Payment succedded"
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error confirming payment: ${error.message}`);
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
