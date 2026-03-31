import { z } from 'zod';
import { TaskPriority } from '../enums/task-priority.enum';

const optionalDescriptionSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().nullable().optional(),
);

const optionalDueDateSchema = z
  .union([
    z.string().datetime({
      offset: true,
      message: 'dueDate must be a valid ISO 8601 datetime',
    }),
    z.null(),
  ])
  .optional();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required').optional(),
    description: optionalDescriptionSchema,
    dueDate: optionalDueDateSchema,
    priority: z.nativeEnum(TaskPriority).optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one editable field must be provided',
    path: ['body'],
  });

export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
