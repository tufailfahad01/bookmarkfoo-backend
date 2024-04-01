import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from "./category.schema"; 
@Schema()
export class Link extends Document {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    category: Category;

    @Prop()
    url: string
    
    @Prop()
    type: string

    @Prop()
    is_Published: boolean

    @Prop({ default: Date.now })
    created_at: Date

    @Prop({ default: Date.now })
    updated_at: Date

}

export const LinkSchema = SchemaFactory.createForClass(Link);