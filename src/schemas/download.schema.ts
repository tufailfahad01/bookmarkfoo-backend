import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Topic } from "./topic.schema"; 
import { User } from "./user.schema";
@Schema()
export class Download extends Document {

    @Prop({type:MongooseSchema.Types.ObjectId, ref:'User'})
    user: User

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    category: Topic;
    
    @Prop({ default: Date.now })
    downloaded_at: Date

}

export const DownloadSchema = SchemaFactory.createForClass(Download);