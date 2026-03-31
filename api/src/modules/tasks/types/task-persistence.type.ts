import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export type TaskPersistence = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
};
