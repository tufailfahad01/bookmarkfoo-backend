import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { OrderModule } from 'src/order/order.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from 'src/schemas/category.schema';
import { OrderSchema } from 'src/schemas/order.schema';
import { PaypalPaymentSchema } from 'src/schemas/paypal.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
  MongooseModule.forFeature([{ name: 'PaypalPayment', schema: PaypalPaymentSchema }]),
  OrderModule],
  controllers: [PaypalController],
  providers: [PaypalService],
})
export class PaypalModule {}
