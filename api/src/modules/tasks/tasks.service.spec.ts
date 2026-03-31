import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  it('applies domain defaults when optional fields are omitted', async () => {
    const tasksRepository = {
      create: jest.fn().mockResolvedValue({
        id: '4df7cd8d-7dd3-4d3f-a9d0-8fa5c2fdbd18',
        title: 'Comprar cafe',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<TasksRepository, 'create'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    const result = await service.create({
      title: 'Comprar cafe',
    });

    expect(tasksRepository.create).toHaveBeenCalledWith({
      title: 'Comprar cafe',
      description: null,
      dueDate: null,
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
    });
    expect(result).toEqual({
      id: '4df7cd8d-7dd3-4d3f-a9d0-8fa5c2fdbd18',
      title: 'Comprar cafe',
      description: null,
      dueDate: null,
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
      createdAt: '2026-03-31T10:00:00.000Z',
      updatedAt: '2026-03-31T10:00:00.000Z',
    });
  });

  it('normalizes dueDate to Date before persistence', async () => {
    const tasksRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'f3987c8f-7d31-45da-a448-9812b20e5226',
        title: 'Pagar conta',
        description: 'Energia',
        dueDate: new Date('2026-04-05T15:30:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: ['financeiro'],
        status: TaskStatus.OPEN,
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<TasksRepository, 'create'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await service.create({
      title: 'Pagar conta',
      description: 'Energia',
      dueDate: '2026-04-05T15:30:00.000Z',
      priority: TaskPriority.HIGH,
      tags: ['financeiro'],
    });

    expect(tasksRepository.create).toHaveBeenCalledWith({
      title: 'Pagar conta',
      description: 'Energia',
      dueDate: new Date('2026-04-05T15:30:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: ['financeiro'],
      status: TaskStatus.OPEN,
    });
  });
});
