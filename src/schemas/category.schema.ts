import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from "./user.schema";
@Schema()
export class Category extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  name: string

  @Prop()
  image_url: string

  @Prop()
  roleover: string

  @Prop()
  links: object[]

  @Prop()
  price: number

  @Prop()
  link_count: number

  @Prop()
  is_Published: boolean

  @Prop()
  popularity_count: number

  @Prop({ default: Date.now })
  created_at: Date

  @Prop({ default: Date.now })
  updated_at: Date

  @Prop({ default: null })
  deleted_at: Date

}

export const CategorySchema = SchemaFactory.createForClass(Category);