import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_UI_PATH = 'api/docs';
export const SWAGGER_JSON_PATH = 'api/docs-json';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('todo-bmad-api')
    .setDescription('Documentacao inicial da API do MVP')
    .setVersion('1.0.0')
    .build();
}
