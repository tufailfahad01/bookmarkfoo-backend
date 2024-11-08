import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Order } from './order.schema';

@Schema()
export class PaypalPayment extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: Order;

    @Prop()
    paymentId: string;

    @Prop()
    amount: number;

    @Prop()
    payerId: string;

    @Prop({ default: 'pending' })
    status: string;

    @Prop({ default: Date.now })
    created_at: Date;

    @Prop({ default: Date.now })
    updated_at: Date;
}

export const PaypalPaymentSchema = SchemaFactory.createForClass(PaypalPayment);
