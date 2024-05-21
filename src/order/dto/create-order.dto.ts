import { IsNotEmpty, IsArray, IsNumber, IsMongoId, IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';

export enum BuyingOption {
  Orange = 'Orange',
  Blue = 'Blue',
  Black = 'Black',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNumber()
  total_amount: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty({ each: true })
  categories: string[];

  @IsEnum(BuyingOption)
  buying_option: BuyingOption;

  @IsEnum(OrderStatus)
  @IsOptional()
  order_status: OrderStatus;
}

