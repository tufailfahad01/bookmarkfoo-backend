import { IsOptional, IsString } from "class-validator";
export class GetCategoriesDto {
    @IsOptional()
    @IsString()
    type: string; // Optional type parameter
  }