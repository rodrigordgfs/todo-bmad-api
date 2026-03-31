import { z } from 'zod';
import { TaskPriority } from '../enums/task-priority.enum';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  description: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().optional(),
  ),
  dueDate: z
    .union([
      z.string().datetime({
        offset: true,
        message: 'dueDate must be a valid ISO 8601 datetime',
      }),
      z.null(),
    ])
    .optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
