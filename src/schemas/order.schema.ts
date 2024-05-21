import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from "./user.schema";
import { Category } from "./category.schema";
import { BuyingOption, OrderStatus } from "src/order/dto/create-order.dto";

@Schema()
export class Order extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user_id: User;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];

  @Prop()
  total_amount: number

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  order_status: OrderStatus;

  @Prop({ type: String, enum: BuyingOption })
  buying_option: BuyingOption;

  @Prop({ default: Date.now })
  created_at: Date

  @Prop({ default: Date.now })
  updated_at: Date
}

export const OrderSchema = SchemaFactory.createForClass(Order);