import { TaskPriority } from '../enums/task-priority.enum';

export type CreateTaskDto = {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  tags?: string[];
};
