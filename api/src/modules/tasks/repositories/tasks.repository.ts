import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPersistence } from '../types/task-persistence.type';

type CreateTaskPersistenceInput = {
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
};

type UpdateTaskPersistenceInput = {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  tags?: string[];
};

@Injectable()
export class TasksRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async delete(id: string): Promise<boolean> {
    const result = await this.prismaService.task.deleteMany({
      where: { id },
    });

    return result.count > 0;
  }

  async findAll(status?: TaskStatus): Promise<TaskPersistence[]> {
    const tasks = await this.prismaService.task.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => ({
      ...task,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
    }));
  }

  async findById(id: string): Promise<TaskPersistence | null> {
    const task = await this.prismaService.task.findUnique({
      where: { id },
    });

    if (!task) {
      return null;
    }

    return {
      ...task,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
    };
  }

  async create(task: CreateTaskPersistenceInput): Promise<TaskPersistence> {
    const createdTask = await this.prismaService.task.create({
      data: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags,
        status: task.status,
      },
    });

    return {
      ...createdTask,
      priority: createdTask.priority as TaskPriority,
      status: createdTask.status as TaskStatus,
    };
  }

  async update(
    id: string,
    task: UpdateTaskPersistenceInput,
  ): Promise<TaskPersistence | null> {
    const updatedTask = await this.prismaService.task.updateManyAndReturn({
      where: { id },
      data: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags,
      },
    });

    const [taskResult] = updatedTask;

    if (!taskResult) {
      return null;
    }

    return {
      ...taskResult,
      priority: taskResult.priority as TaskPriority,
      status: taskResult.status as TaskStatus,
    };
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
  ): Promise<TaskPersistence | null> {
    const updatedTask = await this.prismaService.task.updateManyAndReturn({
      where: { id },
      data: { status },
    });

    const [taskResult] = updatedTask;

    if (!taskResult) {
      return null;
    }

    return {
      ...taskResult,
      priority: taskResult.priority as TaskPriority,
      status: taskResult.status as TaskStatus,
    };
  }
}
