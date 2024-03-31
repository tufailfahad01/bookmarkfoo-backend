import { IsBoolean, IsMongoId, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateLinkDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  category: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  is_Published: boolean;

}
