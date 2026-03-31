import { TaskMapper } from './task.mapper';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

describe('TaskMapper', () => {
  it('maps persistence shape to transport contract with ISO dates', () => {
    const createdAt = new Date('2026-03-30T12:00:00.000Z');
    const updatedAt = new Date('2026-03-30T13:00:00.000Z');
    const dueDate = new Date('2026-04-01T09:30:00.000Z');

    expect(
      TaskMapper.toContract({
        id: 'task-1',
        title: 'Comprar leite',
        description: 'Integral',
        dueDate,
        priority: TaskPriority.HIGH,
        tags: ['mercado'],
        status: TaskStatus.OPEN,
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: 'task-1',
      title: 'Comprar leite',
      description: 'Integral',
      dueDate: '2026-04-01T09:30:00.000Z',
      priority: TaskPriority.HIGH,
      tags: ['mercado'],
      status: TaskStatus.OPEN,
      createdAt: '2026-03-30T12:00:00.000Z',
      updatedAt: '2026-03-30T13:00:00.000Z',
    });
  });

  it('keeps optional fields as null when absent', () => {
    const createdAt = new Date('2026-03-30T12:00:00.000Z');
    const updatedAt = new Date('2026-03-30T13:00:00.000Z');

    expect(
      TaskMapper.toContract({
        id: 'task-2',
        title: 'Ler arquitetura',
        description: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.COMPLETED,
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: 'task-2',
      title: 'Ler arquitetura',
      description: null,
      dueDate: null,
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.COMPLETED,
      createdAt: '2026-03-30T12:00:00.000Z',
      updatedAt: '2026-03-30T13:00:00.000Z',
    });
  });
});
