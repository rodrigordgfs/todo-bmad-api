import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskContract } from './contracts/task.contract';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TaskMapper } from './mappers/task.mapper';
import { TasksRepository } from './repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  private static readonly taskStatusByFilter: Record<
    NonNullable<ListTasksQueryDto['status']>,
    TaskStatus | undefined
  > = {
    all: undefined,
    open: TaskStatus.OPEN,
    completed: TaskStatus.COMPLETED,
  };

  private static readonly taskPriorityRank: Record<TaskPriority, number> = {
    [TaskPriority.HIGH]: 0,
    [TaskPriority.MEDIUM]: 1,
    [TaskPriority.LOW]: 2,
  };

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await this.tasksRepository.delete(userId, id);

    if (!deleted) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      });
    }
  }

  async findAll(
    userId: string,
    query?: ListTasksQueryDto,
  ): Promise<TaskContract[]> {
    const statusFilteredTasks = await this.tasksRepository.findAll(
      userId,
      TasksService.mapStatusFilter(query),
    );
    const searchedTasks = TasksService.applySearchFilter(
      statusFilteredTasks,
      query?.search,
    );

    return searchedTasks
      .toSorted((leftTask, rightTask) =>
        TasksService.compareTaskListOrder(leftTask, rightTask),
      )
      .map((task) => TaskMapper.toContract(task));
  }

  async findById(userId: string, id: string): Promise<TaskContract> {
    const task = await this.tasksRepository.findById(userId, id);

    if (!task) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      });
    }

    return TaskMapper.toContract(task);
  }

  async update(
    userId: string,
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskContract> {
    const updatedTask = await this.tasksRepository.update(userId, id, {
      title: updateTaskDto.title,
      description:
        updateTaskDto.description !== undefined
          ? (updateTaskDto.description ?? null)
          : undefined,
      dueDate:
        updateTaskDto.dueDate !== undefined
          ? updateTaskDto.dueDate
            ? new Date(updateTaskDto.dueDate)
            : null
          : undefined,
      priority: updateTaskDto.priority,
      tags: updateTaskDto.tags,
    });

    if (!updatedTask) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      });
    }

    return TaskMapper.toContract(updatedTask);
  }

  async updateStatus(
    userId: string,
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskContract> {
    const updatedTask = await this.tasksRepository.updateStatus(
      userId,
      id,
      updateTaskStatusDto.status,
    );

    if (!updatedTask) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      });
    }

    return TaskMapper.toContract(updatedTask);
  }

  async create(
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskContract> {
    const createdTask = await this.tasksRepository.create({
      userId,
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      priority: createTaskDto.priority ?? TaskPriority.MEDIUM,
      tags: createTaskDto.tags ?? [],
      status: TaskStatus.OPEN,
    });

    return TaskMapper.toContract(createdTask);
  }

  private static compareTaskListOrder(
    leftTask: Awaited<ReturnType<TasksRepository['findAll']>>[number],
    rightTask: Awaited<ReturnType<TasksRepository['findAll']>>[number],
  ): number {
    const priorityComparison =
      TasksService.taskPriorityRank[leftTask.priority] -
      TasksService.taskPriorityRank[rightTask.priority];

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    if (leftTask.dueDate && rightTask.dueDate) {
      const dueDateComparison =
        leftTask.dueDate.getTime() - rightTask.dueDate.getTime();

      if (dueDateComparison !== 0) {
        return dueDateComparison;
      }
    } else if (leftTask.dueDate) {
      return -1;
    } else if (rightTask.dueDate) {
      return 1;
    }

    const createdAtComparison =
      leftTask.createdAt.getTime() - rightTask.createdAt.getTime();

    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }

    return leftTask.id.localeCompare(rightTask.id);
  }

  private static matchesSearchTerm(
    task: Awaited<ReturnType<TasksRepository['findAll']>>[number],
    searchTerm: string,
  ): boolean {
    const normalizedTitle = task.title.toLocaleLowerCase();
    const normalizedDescription = task.description?.toLocaleLowerCase();
    const normalizedTags = task.tags.map((tag) => tag.toLocaleLowerCase());

    return (
      normalizedTitle.includes(searchTerm) ||
      normalizedDescription?.includes(searchTerm) === true ||
      normalizedTags.some((tag) => tag.includes(searchTerm))
    );
  }

  private static mapStatusFilter(
    query?: ListTasksQueryDto,
  ): TaskStatus | undefined {
    return query?.status
      ? TasksService.taskStatusByFilter[query.status]
      : undefined;
  }

  private static applySearchFilter(
    tasks: Awaited<ReturnType<TasksRepository['findAll']>>,
    rawSearch?: string,
  ): Awaited<ReturnType<TasksRepository['findAll']>> {
    const normalizedSearch = rawSearch?.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return tasks;
    }

    return tasks.filter((task) =>
      TasksService.matchesSearchTerm(task, normalizedSearch),
    );
  }
}
