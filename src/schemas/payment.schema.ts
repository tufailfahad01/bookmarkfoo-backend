import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Order } from './order.schema';
import { Currency, PaymentMethod, PaymentStatus } from 'src/payment/dto/create-payment.dto';

@Schema()
export class Payment extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: Order;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  client_secret: string;

  @Prop({ enum: Currency, default: Currency.USD })
  currency: Currency;

  @Prop({ enum: PaymentMethod, default: PaymentMethod.STRIPE })
  paymentMethod: PaymentMethod;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.Processing })
  status: PaymentStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
