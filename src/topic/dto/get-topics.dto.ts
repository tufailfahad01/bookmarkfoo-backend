import { IsOptional, IsString } from "class-validator";
export class GetTopicsDto {
    @IsOptional()
    @IsString()
    type: string; // Optional type parameter
  }