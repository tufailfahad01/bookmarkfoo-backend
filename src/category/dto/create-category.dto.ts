import { Type } from 'class-transformer';
import { IsString, IsUrl, IsNotEmpty, IsArray, IsNumber, IsBoolean, IsMongoId, IsOptional, IsObject, ValidateNested } from 'class-validator';

class LinkDto {
  @IsUrl()
  url: string

  @IsString()
  type: string

  @IsString()
  description: string

  @IsBoolean()
  is_Live: boolean;
}


export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUrl()
  image_url: string;

  @IsUrl()
  @IsOptional()
  excel_file: string;

  @IsString()
  roleover: string;

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @IsOptional()
  links: Object[];

  @IsNumber()
  @IsOptional()
  price: number;

  @IsBoolean()
  is_Published: boolean;

}
