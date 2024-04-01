import { Type } from 'class-transformer';
import { IsString, IsUrl, IsNotEmpty, IsArray, IsNumber, IsBoolean, IsMongoId, IsOptional, IsObject, ValidateNested } from 'class-validator';

class LinkDto{
  @IsUrl()
  url:string

  @IsString()
  type:string

  @IsBoolean()
  is_Live: boolean;
}


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
  @ValidateNested({each:true})
  @Type(()=>LinkDto)
  @IsOptional()
  links: Object[];

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
