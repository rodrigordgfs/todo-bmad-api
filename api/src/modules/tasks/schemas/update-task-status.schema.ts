import { z } from 'zod';
import { TaskStatus } from '../enums/task-status.enum';

export const updateTaskStatusSchema = z.object({
  status: z
    .string()
    .refine(
      (value): value is TaskStatus =>
        Object.values(TaskStatus).includes(value as TaskStatus),
      {
        message: 'status must be one of: OPEN, COMPLETED',
      },
    )
    .transform((value) => value as TaskStatus),
});

export type UpdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>;
