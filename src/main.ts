import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '@common/filters/prisma-client-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prisma filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // CORS — allow frontend origin
  const rawOrigin = process.env.FRONTEND_URL;
  let formattedOrigin = rawOrigin;
  
  if (formattedOrigin && !formattedOrigin.startsWith('http')) {
    formattedOrigin = `https://${formattedOrigin}`;
  }
  if (formattedOrigin?.endsWith('/')) {
    formattedOrigin = formattedOrigin.slice(0, -1);
  }

  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    formattedOrigin,
  ].filter(Boolean) as string[];

  console.log('📡 Allowed CORS Origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('ZORVYN Finance API')
    .setDescription('Finance Dashboard REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
