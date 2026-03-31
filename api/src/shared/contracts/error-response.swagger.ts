import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDetailSwagger {
  @ApiProperty({
    example: 'title',
  })
  field!: string;

  @ApiProperty({
    example: 'title is required',
  })
  message!: string;

  @ApiProperty({
    example: 'too_small',
  })
  code!: string;
}

export class ErrorResponseSwagger {
  @ApiProperty({
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    example: 'VALIDATION_ERROR',
  })
  code!: string;

  @ApiProperty({
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    type: ErrorResponseDetailSwagger,
    isArray: true,
  })
  details!: ErrorResponseDetailSwagger[];
}
