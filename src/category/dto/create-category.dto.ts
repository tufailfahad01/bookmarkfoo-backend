import { IsString, IsUrl, IsNotEmpty, IsArray, IsNumber, IsBoolean, IsMongoId, IsOptional, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUrl()
  image_url: string;

  @IsString()
  roleover: string;

  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  links: string[];

  @IsNumber()
  price: number;

  @IsNumber()
  link_count: number;

  @IsBoolean()
  is_active: boolean;

  @IsBoolean()
  is_Published: boolean;

  @IsNumber()
  popularity_count: number;
}
