import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Comment } from './comments/comment.entity';
import { User } from './users/user.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend running on port 5001
  app.enableCors({
    origin: 'http://localhost:5001',
    credentials: true,
  });

  const dataSource = app.get(DataSource);
  const commentRepo = dataSource.getRepository(Comment);
  const userRepo = dataSource.getRepository(User);

  // Global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const count = await commentRepo.count();
  if (count === 0) {
    const user = await userRepo.findOne({ where: { username: 'gon' } });
    if (user) {
      const comment = commentRepo.create({
        content: 'Welcome! Reply here to test the comment system.',
        author: user,
      });
      await commentRepo.save(comment);
      console.log('✅ Dummy comment seeded');
    } else {
      console.warn('⚠️ No user "gon" found to seed a comment');
    }
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(`App running on http://localhost:${port}`);
}
bootstrap();
