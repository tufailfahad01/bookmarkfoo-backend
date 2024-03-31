import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

enum Role{
    Admin = 'Admin',
    User = 'User'
}

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(16)
    password: string;

    @IsString()
    @IsOptional()
    @IsEnum(Role)
    role: string;
}
