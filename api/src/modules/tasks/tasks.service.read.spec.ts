import { NotFoundException } from '@nestjs/common';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService reads', () => {
  const userId = '7fb4ef56-4a6d-4d1a-a75e-f1f1b0d9c06d';

  it('returns mapped tasks in deterministic priority and dueDate order', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '9b58b351-c76f-4f02-9f38-cc2f0d0ffc8c',
          title: 'Low sem prazo',
          description: null,
          dueDate: null,
          priority: TaskPriority.LOW,
          tags: [],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T14:00:00.000Z'),
          updatedAt: new Date('2026-03-31T14:00:00.000Z'),
        },
        {
          id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
          title: 'High com prazo distante',
          description: 'Detalhe',
          dueDate: new Date('2026-04-10T09:00:00.000Z'),
          priority: TaskPriority.HIGH,
          tags: ['importante'],
          status: TaskStatus.COMPLETED,
          createdAt: new Date('2026-03-31T11:00:00.000Z'),
          updatedAt: new Date('2026-03-31T11:00:00.000Z'),
        },
        {
          id: '0fb56e9-eb59-4666-a696-eb9b8274bdb0a',
          title: 'High com prazo proximo',
          description: null,
          dueDate: new Date('2026-04-01T09:00:00.000Z'),
          priority: TaskPriority.HIGH,
          tags: ['urgente'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T12:00:00.000Z'),
          updatedAt: new Date('2026-03-31T12:00:00.000Z'),
        },
        {
          id: '1fb56e9-eb59-4666-a696-eb9b8274bdb0b',
          title: 'Medium sem prazo',
          description: null,
          dueDate: null,
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T09:00:00.000Z'),
          updatedAt: new Date('2026-03-31T09:00:00.000Z'),
        },
        {
          id: '2fb56e9-eb59-4666-a696-eb9b8274bdb0c',
          title: 'Medium com prazo',
          description: null,
          dueDate: new Date('2026-04-05T09:00:00.000Z'),
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T10:00:00.000Z'),
          updatedAt: new Date('2026-03-31T10:00:00.000Z'),
        },
      ]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId)).resolves.toEqual([
      {
        id: '0fb56e9-eb59-4666-a696-eb9b8274bdb0a',
        title: 'High com prazo proximo',
        description: null,
        dueDate: '2026-04-01T09:00:00.000Z',
        priority: TaskPriority.HIGH,
        tags: ['urgente'],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T12:00:00.000Z',
        updatedAt: '2026-03-31T12:00:00.000Z',
      },
      {
        id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
        title: 'High com prazo distante',
        description: 'Detalhe',
        dueDate: '2026-04-10T09:00:00.000Z',
        priority: TaskPriority.HIGH,
        tags: ['importante'],
        status: TaskStatus.COMPLETED,
        createdAt: '2026-03-31T11:00:00.000Z',
        updatedAt: '2026-03-31T11:00:00.000Z',
      },
      {
        id: '2fb56e9-eb59-4666-a696-eb9b8274bdb0c',
        title: 'Medium com prazo',
        description: null,
        dueDate: '2026-04-05T09:00:00.000Z',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T10:00:00.000Z',
        updatedAt: '2026-03-31T10:00:00.000Z',
      },
      {
        id: '1fb56e9-eb59-4666-a696-eb9b8274bdb0b',
        title: 'Medium sem prazo',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T09:00:00.000Z',
        updatedAt: '2026-03-31T09:00:00.000Z',
      },
      {
        id: '9b58b351-c76f-4f02-9f38-cc2f0d0ffc8c',
        title: 'Low sem prazo',
        description: null,
        dueDate: null,
        priority: TaskPriority.LOW,
        tags: [],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T14:00:00.000Z',
        updatedAt: '2026-03-31T14:00:00.000Z',
      },
    ]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(userId, undefined);
  });

  it('maps lowercase open filter to TaskStatus.OPEN', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId, { status: 'open' })).resolves.toEqual(
      [],
    );
    expect(tasksRepository.findAll).toHaveBeenCalledWith(
      userId,
      TaskStatus.OPEN,
    );
  });

  it('filters tasks by search term in description case-insensitively', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '9b58b351-c76f-4f02-9f38-cc2f0d0ffc8c',
          title: 'Comprar cafe',
          description: null,
          dueDate: null,
          priority: TaskPriority.LOW,
          tags: ['cozinha'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T14:00:00.000Z'),
          updatedAt: new Date('2026-03-31T14:00:00.000Z'),
        },
        {
          id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
          title: 'Pagar boleto',
          description: 'Conta de Internet',
          dueDate: null,
          priority: TaskPriority.HIGH,
          tags: ['financeiro'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T11:00:00.000Z'),
          updatedAt: new Date('2026-03-31T11:00:00.000Z'),
        },
        {
          id: '0fb56e9-eb59-4666-a696-eb9b8274bdb0a',
          title: 'Estudar Nest',
          description: null,
          dueDate: null,
          priority: TaskPriority.MEDIUM,
          tags: ['Backend'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T12:00:00.000Z'),
          updatedAt: new Date('2026-03-31T12:00:00.000Z'),
        },
      ]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId, { search: 'int' })).resolves.toEqual([
      {
        id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
        title: 'Pagar boleto',
        description: 'Conta de Internet',
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['financeiro'],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T11:00:00.000Z',
        updatedAt: '2026-03-31T11:00:00.000Z',
      },
    ]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(userId, undefined);
  });

  it('filters tasks by search term in tags case-insensitively', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '9b58b351-c76f-4f02-9f38-cc2f0d0ffc8c',
          title: 'Comprar cafe',
          description: null,
          dueDate: null,
          priority: TaskPriority.LOW,
          tags: ['cozinha'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T14:00:00.000Z'),
          updatedAt: new Date('2026-03-31T14:00:00.000Z'),
        },
        {
          id: '0fb56e9-eb59-4666-a696-eb9b8274bdb0a',
          title: 'Estudar Nest',
          description: null,
          dueDate: null,
          priority: TaskPriority.MEDIUM,
          tags: ['Backend'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T12:00:00.000Z'),
          updatedAt: new Date('2026-03-31T12:00:00.000Z'),
        },
      ]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId, { search: 'back' })).resolves.toEqual([
      {
        id: '0fb56e9-eb59-4666-a696-eb9b8274bdb0a',
        title: 'Estudar Nest',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        tags: ['Backend'],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T12:00:00.000Z',
        updatedAt: '2026-03-31T12:00:00.000Z',
      },
    ]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(userId, undefined);
  });

  it('treats blank search as absence of search', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId, { search: '   ' })).resolves.toEqual(
      [],
    );
    expect(tasksRepository.findAll).toHaveBeenCalledWith(userId, undefined);
  });

  it('applies search only after filtering the subset by status', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
          title: 'Pagar boleto',
          description: 'Conta de Internet',
          dueDate: null,
          priority: TaskPriority.HIGH,
          tags: ['financeiro'],
          status: TaskStatus.OPEN,
          createdAt: new Date('2026-03-31T11:00:00.000Z'),
          updatedAt: new Date('2026-03-31T11:00:00.000Z'),
        },
      ]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.findAll(userId, { status: 'open', search: 'internet' }),
    ).resolves.toEqual([
      {
        id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
        title: 'Pagar boleto',
        description: 'Conta de Internet',
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['financeiro'],
        status: TaskStatus.OPEN,
        createdAt: '2026-03-31T11:00:00.000Z',
        updatedAt: '2026-03-31T11:00:00.000Z',
      },
    ]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(
      userId,
      TaskStatus.OPEN,
    );
  });

  it('returns empty list when combined status and search have no matches', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: '10fb56e9-eb59-4666-a696-eb9b8274bdb0',
          title: 'Pagar boleto',
          description: 'Conta de Internet',
          dueDate: null,
          priority: TaskPriority.HIGH,
          tags: ['financeiro'],
          status: TaskStatus.COMPLETED,
          createdAt: new Date('2026-03-31T11:00:00.000Z'),
          updatedAt: new Date('2026-03-31T11:00:00.000Z'),
        },
      ]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.findAll(userId, { status: 'completed', search: 'backend' }),
    ).resolves.toEqual([]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(
      userId,
      TaskStatus.COMPLETED,
    );
  });

  it('maps lowercase completed filter to TaskStatus.COMPLETED', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.findAll(userId, { status: 'completed' }),
    ).resolves.toEqual([]);
    expect(tasksRepository.findAll).toHaveBeenCalledWith(
      userId,
      TaskStatus.COMPLETED,
    );
  });

  it('treats all filter as unfiltered list', async () => {
    const tasksRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } satisfies Pick<TasksRepository, 'findAll'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findAll(userId, { status: 'all' })).resolves.toEqual(
      [],
    );
    expect(tasksRepository.findAll).toHaveBeenCalledWith(userId, undefined);
  });

  it('returns mapped task by id', async () => {
    const tasksRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'c6df04df-e76a-4661-b10c-62efe032e8c7',
        title: 'Task unica',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        tags: ['unica'],
        status: TaskStatus.OPEN,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
        updatedAt: new Date('2026-03-31T12:00:00.000Z'),
      }),
    } satisfies Pick<TasksRepository, 'findById'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(
      service.findById(userId, 'c6df04df-e76a-4661-b10c-62efe032e8c7'),
    ).resolves.toEqual({
      id: 'c6df04df-e76a-4661-b10c-62efe032e8c7',
      title: 'Task unica',
      description: null,
      dueDate: null,
      priority: TaskPriority.MEDIUM,
      tags: ['unica'],
      status: TaskStatus.OPEN,
      createdAt: '2026-03-31T12:00:00.000Z',
      updatedAt: '2026-03-31T12:00:00.000Z',
    });
    expect(tasksRepository.findById).toHaveBeenCalledWith(
      userId,
      'c6df04df-e76a-4661-b10c-62efe032e8c7',
    );
  });

  it('throws NOT_FOUND when task does not exist', async () => {
    const tasksRepository = {
      findById: jest.fn().mockResolvedValue(null),
    } satisfies Pick<TasksRepository, 'findById'>;

    const service = new TasksService(tasksRepository as TasksRepository);

    await expect(service.findById(userId, 'missing-id')).rejects.toEqual(
      new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      }),
    );
  });
});
