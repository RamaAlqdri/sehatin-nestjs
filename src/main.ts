import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { AdminSeeder } from './admin/seed/admin.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(3000);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  // console.log(process.env.PORT);
  await app.listen(process.env.PORT);

  const adminSeeder = app.get(AdminSeeder);
  await adminSeeder.seed();

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
