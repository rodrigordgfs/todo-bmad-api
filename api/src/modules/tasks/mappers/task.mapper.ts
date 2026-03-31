import { TaskContract } from '../contracts/task.contract';
import { TaskPersistence } from '../types/task-persistence.type';

export class TaskMapper {
  static toContract(task: TaskPersistence): TaskContract {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate?.toISOString() ?? null,
      priority: task.priority,
      tags: task.tags,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
