import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from "./user.schema";
@Schema()
export class Cart  extends Document {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop()
    category:object[]

    @Prop({ default: Date.now })
    created_at: Date

    @Prop({ default: Date.now })
    updated_at: Date
}

export const CartSchema = SchemaFactory.createForClass(Cart);