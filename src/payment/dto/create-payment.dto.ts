import { IsNotEmpty, IsArray, IsNumber, IsMongoId, IsEnum, IsOptional, IsEmail, IsString } from 'class-validator';
import { BuyingOption, OrderStatus } from 'src/order/dto/create-order.dto';

export enum PaymentStatus {
  RequiresPaymentMethod = 'requires_payment_method',
  RequiresConfirmation = 'requires_confirmation',
  RequiresAction = 'requires_action',
  Processing = 'processing',
  RequiresCapture = 'requires_capture',
  Canceled = 'canceled',
  Succeeded = 'succeeded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
}

export enum Currency {
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp',
}

export class CreatePaymentDto {

  @IsMongoId()
  @IsOptional()
  orderId: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsEnum(Currency)
  @IsOptional()
  currency: Currency;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsNumber()
  @IsOptional()
  total_amount: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories: string[];

  @IsEnum(BuyingOption)
  @IsOptional()
  buying_option: BuyingOption;

  @IsEnum(OrderStatus)
  @IsOptional()
  order_status: OrderStatus;
}

