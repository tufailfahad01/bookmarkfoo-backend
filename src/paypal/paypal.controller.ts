import { Controller, Post, Body } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { create } from 'domain';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paymentService: PaypalService) {}

  // Endpoint to create PayPal payment
  @Post('create-paypal-payment')
  async createPaypalPayment(
    @Body('createOrderDto') createOrderDto: any,
  ) {
    try {
      const paymentId = await this.paymentService.createPaypalPayment(createOrderDto);
      return { paymentId };
    } catch (error) {
      throw new Error('Error creating PayPal payment: ' + error.message);
    }
  }

  // Endpoint to confirm PayPal payment after user approval
  @Post('confirm-paypal-payment')
  async confirmPaypalPayment(
    @Body('orderId') orderId: string,
    @Body('paymentId') paymentId: string,
    @Body('payerId') payerId: string,
  ) {
    try {
      const paymentStatus = await this.paymentService.confirmPayment(orderId, paymentId, payerId);
      return { paymentStatus };
    } catch (error) {
      throw new Error('Error confirming PayPal payment: ' + error.message);
    }
  }
}
