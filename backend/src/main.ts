import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv');
  const port = configService.get<number>('app.port') || 3000;

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  app.enableCors({
    origin:
      nodeEnv === 'production'
        ? ['https://edumatch.vn', 'https://admin.edumatch.vn']
        : ['http://localhost:3001', 'https://edumatch.vn', 'https://admin.edumatch.vn'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global pipes / filters / interceptors ─────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Swagger ───────────────────────────────────────────────────────────────
  // Only expose Swagger in non-production environments
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('EduMatch API')
      .setDescription(
        'REST API for the EduMatch tutoring platform.\n\n' +
          // '**Rate limits (per IP / 60 s):**\n' +
          // '- Default endpoints: 100 req\n' +
          // '- Login / OAuth: 10 req\n' +
          // '- Register: 5 req\n' +
          // '- Forgot-password: 3 req\n\n' +
          // '**Auth:** use the `Authorize` button and paste a Bearer access token.\n' +
          // 'Get one from `POST /auth/login` or `POST /auth/register`.' + 
          ' ',
      )
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your access token here (without "Bearer " prefix)',
      })
      .addTag('Auth', 'Register, login, OAuth, token rotation, password reset')
      .addTag('Users', 'Profile management, password change, account deletion')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'list',
        filter: true,
      },
      customSiteTitle: 'EduMatch API Docs',
    });

    console.log(`Swagger docs → http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`API running    → http://localhost:${port}`);
}

bootstrap();
