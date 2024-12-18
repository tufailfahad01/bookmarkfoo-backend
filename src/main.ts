import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe)
  const PORT = Number(process.env.PORT) || 3002;
  console.log('port=', PORT)
  await app.listen(PORT);
}

bootstrap();
