import { INestApplication, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import {
  createSwaggerConfig,
  SWAGGER_JSON_PATH,
  SWAGGER_UI_PATH,
} from './swagger.config';

const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

export function configureApp(app: INestApplication) {
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? DEFAULT_FRONTEND_ORIGIN;

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  const document = SwaggerModule.createDocument(app, createSwaggerConfig());

  SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
    jsonDocumentUrl: `/${SWAGGER_JSON_PATH}`,
  });
}
