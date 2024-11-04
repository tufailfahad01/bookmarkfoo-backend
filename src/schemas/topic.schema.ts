import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Category } from './category.schema'; // Import the Category schema
import { IsOptional } from 'class-validator';

@Schema()
export class Topic extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  name: string;

  @Prop()
  image_url: string;

  @Prop()
  @IsOptional()
  excel_file: string;

  @Prop()
  roleover: string;

  @Prop()
  links: object[];

  @Prop({ default: 0 })
  price: number;

  @Prop()
  link_count: number;

  @Prop()
  is_Published: boolean;

  @Prop()
  popularity_count: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ default: null })
  last_purchase_at: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deleted_at: Date;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' }) // Add category reference
  category: Category;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
