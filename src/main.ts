import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  app.enableVersioning({
    type: VersioningType.URI, // Enables /v1/ routes
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
