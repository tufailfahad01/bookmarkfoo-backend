import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { OrderSchema } from './../schemas/order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CategorySchema } from 'src/schemas/category.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { TopicSchema } from 'src/schemas/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'Topic', schema: TopicSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule { }
