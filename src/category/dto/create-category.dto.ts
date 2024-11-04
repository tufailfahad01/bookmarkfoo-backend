import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsOptional() // This is optional as it may not always be provided
  topics?: string[]; // Assuming you want to accept an array of topic IDs

  @IsOptional()
  @IsDate()
  @Type(() => Date) // Use class-transformer to handle date conversion
  created_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deleted_at?: Date;
}
