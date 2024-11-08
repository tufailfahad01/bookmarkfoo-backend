import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TopicModule } from './topic/topic.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CategoryModule } from './category/category.module';
import { PaypalModule } from './paypal/paypal.module';

@Module({
  imports: [
    TopicModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    OrderModule,
    PaymentModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'sales@bookmarkfu.com',
          pass: 'assq uzre auik jyqn',
        },
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongouri = configService.get<string>('MONGO_URI');
        return {
          uri: mongouri,
        };
      },
      inject: [ConfigService],
    }),
    CategoryModule,
    PaypalModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule { }
