import { IsNotEmpty, IsString } from "class-validator";

export class ContactUsDto {
    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsString()
    @IsNotEmpty()
    body: string;

}
