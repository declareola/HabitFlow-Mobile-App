import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global prefix for routing standards
  app.setGlobalPrefix("api/v1");
  
  // Enable query/body transformation and validation rules
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Configuration setup for CORS mapping matching front-ends
  app.enableCors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`[HabitFlow Server] Architectural pipeline active on port ${port}`);
}

bootstrap();
