import { ApiProperty } from '@nestjs/swagger';

export class RegisterSwaggerDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    minLength: 6,
    example: 'plain-password',
  })
  password!: string;
}

export class RegisterResponseSwagger {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    format: 'date-time',
  })
  updatedAt!: string;
}
