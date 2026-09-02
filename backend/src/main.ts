import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
  const additionalOrigins = (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const allowedOrigins = [appUrl, ...additionalOrigins];

  app.enableCors({
    origin: (origin) => {
      if (!origin) return true;
      return allowedOrigins.includes(origin);
    },
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
