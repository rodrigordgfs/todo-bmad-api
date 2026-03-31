import { TaskStatus } from '../enums/task-status.enum';

export type UpdateTaskStatusDto = {
  status: TaskStatus;
};
