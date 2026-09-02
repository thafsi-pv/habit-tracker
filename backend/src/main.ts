import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const normalizeOrigin = (origin: string) =>
    origin.trim().replace(/\/$/, '');

  const appUrl = normalizeOrigin(
    process.env.APP_URL ?? 'http://localhost:5173'
  );

  const additionalOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const allowedOrigins = [appUrl, ...additionalOrigins];

  app.enableCors({
    origin: (origin) => {
      if (!origin) return true;

      return allowedOrigins.includes(normalizeOrigin(origin));
    },
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT) || 10000;

  await app.listen(port);

  console.log(`API listening on ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
