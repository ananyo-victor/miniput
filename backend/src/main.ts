import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';
import { initializeDatabase } from './config/db-init.config';
import { HttpErrorFilter } from './common/filters/http-error.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.setGlobalPrefix('api');

  const clientDistPath = path.join(__dirname, '../client/dist');
  const expressApp = app.getHttpAdapter().getInstance();
  app.use(express.static(clientDistPath));
  expressApp.get(['/', '/admin', '/customer'], (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  const port = process.env.PORT || 5000;

  try {
    await initializeDatabase();
    await app.listen(port);
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message);
    process.exit(1);
  }
}

bootstrap();
