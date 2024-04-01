import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from 'src/schemas/category.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { LinkSchema } from 'src/schemas/link.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Link', schema: LinkSchema }]),
    UsersModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }
