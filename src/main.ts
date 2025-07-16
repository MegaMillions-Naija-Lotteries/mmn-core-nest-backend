import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI, // Enables /v1/ routes
  });
  const configDoc = new DocumentBuilder()
    .setTitle('MMN Radio Raffle API Documentation')
    .setDescription('MMN Radio Raffle API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const port = process.env.PORT ?? 3333;
  const document = SwaggerModule.createDocument(app, configDoc);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running on port: ${port}`);
}
bootstrap();
