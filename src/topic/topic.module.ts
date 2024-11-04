import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicSchema } from 'src/schemas/topic.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { OrderSchema } from 'src/schemas/order.schema';
import { CategorySchema } from 'src/schemas/category.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Topic', schema: TopicSchema }]),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    UsersModule,
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule { }
