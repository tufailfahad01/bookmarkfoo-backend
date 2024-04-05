import { IsNotEmpty, IsArray, IsNumber, IsMongoId, IsEnum, IsOptional } from 'class-validator';

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
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status: PaymentStatus;
}

