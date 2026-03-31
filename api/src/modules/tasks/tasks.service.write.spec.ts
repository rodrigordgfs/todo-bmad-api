import { NotFoundException } from '@nestjs/common';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService writes', () => {
  const userId = 'ebb5e651-12f7-4d02-b2a8-8de630ae642d';

  it('updates task with normalized nullables', async () => {
    const tasksRepository = {
      update: jest.fn().mockResolvedValue({
        id: 'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
        title: 'Atualizada',
        description: null,
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['refinada'],
        status: TaskStatus.OPEN,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
        updatedAt: new Date('2026-03-31T13:00:00.000Z'),
      }),
    } satisfies Pick<TasksRepository, 'update'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    const result = await service.update(
      userId,
      'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      {
        title: 'Atualizada',
        description: null,
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['refinada'],
      },
    );

    expect(tasksRepository.update).toHaveBeenCalledWith(
      userId,
      'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      {
        title: 'Atualizada',
        description: null,
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['refinada'],
      },
    );
    expect(result).toMatchObject({
      id: 'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      title: 'Atualizada',
      description: null,
      dueDate: null,
      priority: TaskPriority.HIGH,
      tags: ['refinada'],
      status: TaskStatus.OPEN,
    });
  });

  it('throws NOT_FOUND when update target does not exist', async () => {
    const tasksRepository = {
      update: jest.fn().mockResolvedValue(null),
    } satisfies Pick<TasksRepository, 'update'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.update(userId, 'missing-id', { title: 'Nova' }),
    ).rejects.toEqual(
      new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      }),
    );
  });

  it('updates task status through dedicated transition flow', async () => {
    const tasksRepository = {
      updateStatus: jest.fn().mockResolvedValue({
        id: 'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
        title: 'Atualizada',
        description: null,
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['refinada'],
        status: TaskStatus.COMPLETED,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
        updatedAt: new Date('2026-03-31T14:00:00.000Z'),
      }),
    } satisfies Pick<TasksRepository, 'updateStatus'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    const result = await service.updateStatus(
      userId,
      'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      {
        status: TaskStatus.COMPLETED,
      },
    );

    expect(tasksRepository.updateStatus).toHaveBeenCalledWith(
      userId,
      'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      TaskStatus.COMPLETED,
    );
    expect(result).toMatchObject({
      id: 'ef5ea70a-ae4d-4d72-bf1c-3c89ab11d7f5',
      status: TaskStatus.COMPLETED,
    });
  });

  it('throws NOT_FOUND when status update target does not exist', async () => {
    const tasksRepository = {
      updateStatus: jest.fn().mockResolvedValue(null),
    } satisfies Pick<TasksRepository, 'updateStatus'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.updateStatus(userId, 'missing-id', { status: TaskStatus.OPEN }),
    ).rejects.toEqual(
      new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      }),
    );
  });

  it('throws NOT_FOUND when delete target does not exist', async () => {
    const tasksRepository = {
      delete: jest.fn().mockResolvedValue(false),
    } satisfies Pick<TasksRepository, 'delete'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.delete(userId, 'missing-id')).rejects.toEqual(
      new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      }),
    );
  });
});
