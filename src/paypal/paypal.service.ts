import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import * as dotenv from 'dotenv';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaypalPayment } from 'src/schemas/paypal.schema';
import { Order } from 'src/schemas/order.schema';
import { OrderService } from 'src/order/order.service';
dotenv.config();

@Injectable()
export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(
    @InjectModel(PaypalPayment.name)
    private paypalPaymentModel: Model<PaypalPayment>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private orderService: OrderService,
  ) {
    // Initialize the PayPal client with the sandbox environment
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  // Create PayPal payment
  async createPaypalPayment(createOrderDto: any) {
    console.log('createOrderDto', createOrderDto);
    const order = await this.orderService.create(createOrderDto);
    console.log('order', order);
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: createOrderDto.amount.toString(),
          },
        },
      ],
      application_context: {
        return_url: `http://localhost:3000/payment/success/?orderId=${order._id}`,
        cancel_url: 'http://localhost:3000/paypal/cancel',
      },
    });

    try {
      const order = await this.client.execute(request);
      return order.result; // Return the order result (includes approval_url)
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      throw new Error('PayPal order creation failed');
    }
  }

  // Store payment details in MongoDB
  async storePayment(
    orderId: string,
    paymentId: string,
    amount: number,
    payerId: string,
  ) {
    const payment = new this.paypalPaymentModel({
      orderId,
      paymentId,
      amount,
      payerId,
    });
    return payment.save();
  }

  // Confirm payment after user approval
  async confirmPayment(orderId: string, paymentId: string, payerId: string) {
    console.log('Confirming PayPal payment for order:', paymentId);
    const request = new paypal.orders.OrdersCaptureRequest(paymentId);
    try {
      const capture = await this.client.execute(request);
      const paymentStatus = capture.result.status;
      console.log('Payment status:', paymentStatus);
      const order: any = await this.orderModel.findById(orderId);
      if (paymentStatus === 'COMPLETED') {
        await this.storePayment(
          orderId,
          paymentId,
          order.amount, // Set the amount as needed
          payerId,
        );

        // Update payment status in the database
        await this.paypalPaymentModel.findOneAndUpdate(
          { paymentId },
          { status: paymentStatus },
        );
      }

      // Update order status in the database
      await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        {
          order_status:
            paymentStatus === 'COMPLETED' ? 'Completed' : 'Cancelled',
        },
      );
      console.log('Order status:', capture.result);
      return capture.result; // Return the captured payment result
    } catch (err) {
      console.error('Error capturing PayPal order:', err);
      throw new Error('PayPal payment capture failed');
    }
  }
}
