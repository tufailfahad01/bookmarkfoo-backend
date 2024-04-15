import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

import { OrderSchema } from 'src/schemas/order.schema';
import { PaymentSchema } from 'src/schemas/payment.schema';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'tufailfahad01@gmail.com',
          pass: 'sruw jmsy burs ycxg',
        },
      },
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
