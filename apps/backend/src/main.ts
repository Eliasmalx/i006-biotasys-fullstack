import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { morganConfig } from './config/morgan.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useLogger(logger);

  // Configurar Morgan
  app.use(morganConfig);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
  });

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar prefijo global de rutas
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Biotasys CDSS API')
    .setDescription(
      'Servicio de soporte a la decisión clínica basado en microbiota intestinal',
    )
    .setVersion('1.0')
    .addBearerAuth() // Esto permite que el front pegue el JWT para probar los endpoints protegidos
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    console.log(`🚀 Servidor funcionando en el puerto: ${port}`);
  });
}

void bootstrap();
