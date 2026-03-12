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
    type: VersioningType.URI,
  });

  const allowedOrigins = new Set<string>([
    'http://localhost:4200',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://mmnraffle.com',
    'https://dev.megamillionsnaija.com',
    'https://admin.megamillionsnaija.com',
    'https://mmn-admin-radio-dashboard.azurewebsites.net',
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 204,
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
