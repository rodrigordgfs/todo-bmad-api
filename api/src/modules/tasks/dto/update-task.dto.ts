import { TaskPriority } from '../enums/task-priority.enum';

export type UpdateTaskDto = {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  tags?: string[];
};
