import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskSwagger {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({
    nullable: true,
    example: 'Conta de internet',
  })
  description!: string | null;

  @ApiProperty({
    nullable: true,
    format: 'date-time',
    example: '2026-04-05T15:30:00.000Z',
  })
  dueDate!: string | null;

  @ApiProperty({
    enum: TaskPriority,
    enumName: 'TaskPriority',
  })
  priority!: TaskPriority;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  tags!: string[];

  @ApiProperty({
    enum: TaskStatus,
    enumName: 'TaskStatus',
  })
  status!: TaskStatus;

  @ApiProperty({
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    format: 'date-time',
  })
  updatedAt!: string;
}
