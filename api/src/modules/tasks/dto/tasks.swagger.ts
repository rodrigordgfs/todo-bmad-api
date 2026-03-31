import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskSwaggerDto {
  @ApiProperty({
    example: 'Comprar cafe',
  })
  title!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Conta de internet',
  })
  description?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    format: 'date-time',
    example: '2026-04-05T15:30:00.000Z',
  })
  dueDate?: string | null;

  @ApiPropertyOptional({
    enum: TaskPriority,
    enumName: 'TaskPriority',
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
  })
  tags?: string[];
}

export class UpdateTaskSwaggerDto {
  @ApiPropertyOptional({
    example: 'Comprar cafe',
  })
  title?: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Conta de internet',
  })
  description?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    format: 'date-time',
    example: '2026-04-05T15:30:00.000Z',
  })
  dueDate?: string | null;

  @ApiPropertyOptional({
    enum: TaskPriority,
    enumName: 'TaskPriority',
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
  })
  tags?: string[];
}

export class UpdateTaskStatusSwaggerDto {
  @ApiProperty({
    enum: TaskStatus,
    enumName: 'TaskStatus',
  })
  status!: TaskStatus;
}
