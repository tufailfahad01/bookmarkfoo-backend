import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum Role {
    Admin = 'Admin',
    User = 'User'
}

@Schema()
export class User {
    @Prop()
    name: string

    @Prop()
    email: string

    @Prop()
    password: string

    @Prop({ default: Role.User })
    role: Role

    @Prop({ default: Date.now })
    created_at: Date

    @Prop({ default: Date.now })
    updated_at: Date

    @Prop({ default: Date.now })
    deleted_at: Date

}

export const UserSchema = SchemaFactory.createForClass(User);