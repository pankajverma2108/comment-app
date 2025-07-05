import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that don’t have decorators
      forbidNonWhitelisted: true, // throw if unknown properties are sent
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`App running on http://localhost:${port}`);
}
bootstrap();
