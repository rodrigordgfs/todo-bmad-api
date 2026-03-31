import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/config/app.config';
import { PrismaService } from './../src/infra/database/prisma/prisma.service';
import { FoundationModule } from './../src/modules/foundation/foundation.module';
import { TaskPriority } from './../src/modules/tasks/enums/task-priority.enum';
import { TaskStatus } from './../src/modules/tasks/enums/task-status.enum';

type SwaggerDocumentResponse = {
  info: {
    title: string;
  };
  openapi: string;
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
  };
};

type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
  details: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  stack?: string;
};

type TaskResponseBody = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, FoundationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    await prismaService.task.deleteMany();
  });

  afterEach(async () => {
    await prismaService.task.deleteMany();
    await app.close();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/docs-json (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    const document = response.body as SwaggerDocumentResponse;

    expect(document.openapi).toBeDefined();
    expect(document.info.title).toBe('todo-bmad-api');
    expect(document.paths['/api/v1/tasks']).toBeDefined();
    expect(document.paths['/api/v1/tasks/{id}']).toBeDefined();
    expect(document.paths['/api/v1/tasks/{id}/status']).toBeDefined();
    expect(document.components.schemas.TaskSwagger).toBeDefined();
    expect(document.components.schemas.ErrorResponseSwagger).toBeDefined();
    expect(
      document.components.schemas.ErrorResponseDetailSwagger,
    ).toBeDefined();
  });

  it('/api/v1/foundation/validation (POST) returns normalized validation error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/foundation/validation')
      .send({ title: '' })
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'title',
          message: 'title is required',
          code: 'too_small',
        },
      ],
    });
  });

  it('/api/v1/foundation/error (GET) returns normalized internal error', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/foundation/error')
      .expect(500);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: [],
    });
    expect(errorResponse.stack).toBeUndefined();
  });

  it('/api/v1/tasks (POST) creates a task with domain defaults', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({ title: 'Comprar cafe' })
      .expect(201);

    const task = response.body as TaskResponseBody;

    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(task).toMatchObject({
      title: 'Comprar cafe',
      description: null,
      dueDate: null,
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
    });
    expect(task.createdAt).toEqual(expect.any(String));
    expect(task.updatedAt).toEqual(expect.any(String));

    const persistedTask = await prismaService.task.findUniqueOrThrow({
      where: { id: task.id },
    });

    expect(persistedTask.title).toBe('Comprar cafe');
    expect(persistedTask.priority).toBe(TaskPriority.MEDIUM);
    expect(persistedTask.tags).toEqual([]);
    expect(persistedTask.status).toBe(TaskStatus.OPEN);
  });

  it('/api/v1/tasks (POST) creates a task with complete payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({
        title: 'Pagar boleto',
        description: 'Conta de internet',
        dueDate: '2026-04-05T15:30:00.000Z',
        priority: TaskPriority.HIGH,
        tags: ['financeiro', 'mensal'],
      })
      .expect(201);

    const task = response.body as TaskResponseBody;

    expect(task).toMatchObject({
      title: 'Pagar boleto',
      description: 'Conta de internet',
      dueDate: '2026-04-05T15:30:00.000Z',
      priority: TaskPriority.HIGH,
      tags: ['financeiro', 'mensal'],
      status: TaskStatus.OPEN,
    });
  });

  it('/api/v1/tasks (POST) normalizes empty description to null', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({
        title: 'Estudar Nest',
        description: '   ',
      })
      .expect(201);

    const task = response.body as TaskResponseBody;

    expect(task.description).toBeNull();

    const persistedTask = await prismaService.task.findUniqueOrThrow({
      where: { id: task.id },
    });

    expect(persistedTask.description).toBeNull();
  });

  it('/api/v1/tasks (POST) rejects invalid title and dueDate', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({
        title: '',
        dueDate: '',
      })
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse.statusCode).toBe(400);
    expect(errorResponse.code).toBe('VALIDATION_ERROR');
    expect(errorResponse.message).toBe('Validation failed');
    expect(errorResponse.details).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: 'title is required',
          code: 'too_small',
        },
        {
          field: 'dueDate',
          message: 'dueDate must be a valid ISO 8601 datetime',
          code: 'invalid_format',
        },
      ]),
    );
  });

  it('/api/v1/tasks (GET) returns persisted tasks as direct array in domain order', async () => {
    const createdOne = await prismaService.task.create({
      data: {
        title: 'Task recente',
        priority: TaskPriority.HIGH,
        tags: ['recente'],
        status: TaskStatus.OPEN,
      },
    });
    const createdTwo = await prismaService.task.create({
      data: {
        title: 'Task antiga',
        priority: TaskPriority.LOW,
        tags: [],
        status: TaskStatus.COMPLETED,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({
      id: createdOne.id,
      title: 'Task recente',
      priority: TaskPriority.HIGH,
      tags: ['recente'],
      status: TaskStatus.OPEN,
    });
    expect(tasks[1]).toMatchObject({
      id: createdTwo.id,
      title: 'Task antiga',
      priority: TaskPriority.LOW,
      tags: [],
      status: TaskStatus.COMPLETED,
    });
  });

  it('/api/v1/tasks?status=all (GET) returns the same set as unfiltered list', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Aberta',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Concluida',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const [unfilteredResponse, allResponse] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/tasks').expect(200),
      request(app.getHttpServer()).get('/api/v1/tasks?status=all').expect(200),
    ]);

    expect(allResponse.body).toEqual(unfilteredResponse.body);
  });

  it('/api/v1/tasks (GET) orders tasks by priority and then dueDate deterministically', async () => {
    const lowTask = await prismaService.task.create({
      data: {
        title: 'Low sem prazo',
        priority: TaskPriority.LOW,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });
    const highLaterDueDateTask = await prismaService.task.create({
      data: {
        title: 'High prazo distante',
        dueDate: new Date('2026-04-10T09:00:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });
    const highSoonerDueDateTask = await prismaService.task.create({
      data: {
        title: 'High prazo proximo',
        dueDate: new Date('2026-04-01T09:00:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });
    const mediumNoDueDateTask = await prismaService.task.create({
      data: {
        title: 'Medium sem prazo',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });
    const mediumWithDueDateTask = await prismaService.task.create({
      data: {
        title: 'Medium com prazo',
        dueDate: new Date('2026-04-05T09:00:00.000Z'),
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks.map((task) => task.id)).toEqual([
      highSoonerDueDateTask.id,
      highLaterDueDateTask.id,
      mediumWithDueDateTask.id,
      mediumNoDueDateTask.id,
      lowTask.id,
    ]);
  });

  it('/api/v1/tasks?status=open (GET) returns only open tasks', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Task aberta',
          priority: TaskPriority.HIGH,
          tags: ['aberta'],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Task concluida',
          priority: TaskPriority.LOW,
          tags: ['concluida'],
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=open')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Task aberta',
      status: TaskStatus.OPEN,
    });
  });

  it('/api/v1/tasks?status=completed (GET) returns only completed tasks', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Task aberta',
          priority: TaskPriority.HIGH,
          tags: ['aberta'],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Task concluida',
          priority: TaskPriority.LOW,
          tags: ['concluida'],
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=completed')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Task concluida',
      status: TaskStatus.COMPLETED,
    });
  });

  it('/api/v1/tasks?status=open (GET) preserves filtered subset and deterministic ordering', async () => {
    const highOpenTask = await prismaService.task.create({
      data: {
        title: 'High aberta',
        dueDate: new Date('2026-04-03T09:00:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });
    await prismaService.task.create({
      data: {
        title: 'High concluida',
        dueDate: new Date('2026-04-01T09:00:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: [],
        status: TaskStatus.COMPLETED,
      },
    });
    const mediumOpenTask = await prismaService.task.create({
      data: {
        title: 'Medium aberta',
        dueDate: new Date('2026-04-02T09:00:00.000Z'),
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=open')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks.map((task) => task.id)).toEqual([
      highOpenTask.id,
      mediumOpenTask.id,
    ]);
  });

  it('/api/v1/tasks?status=invalid (GET) rejects invalid filter value', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=invalid')
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'status',
          message: 'Invalid option: expected one of "all"|"open"|"completed"',
          code: 'invalid_value',
        },
      ],
    });
  });

  it('/api/v1/tasks?search=mercado (GET) rejects unsupported query params', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?sortBy=priority')
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'query',
          message: 'Unrecognized key: "sortBy"',
          code: 'unrecognized_keys',
        },
      ],
    });
  });

  it('/api/v1/tasks?search=caFe (GET) finds tasks by title case-insensitively', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Comprar cafe',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Pagar boleto',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=caFe')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Comprar cafe');
  });

  it('/api/v1/tasks?search=internet (GET) finds tasks by description case-insensitively', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Pagar boleto',
          description: 'Conta de Internet',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Estudar Nest',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=internet')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Pagar boleto');
  });

  it('/api/v1/tasks?search=back (GET) finds tasks by tags case-insensitively', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Estudar Nest',
          priority: TaskPriority.MEDIUM,
          tags: ['Backend'],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Comprar cafe',
          priority: TaskPriority.MEDIUM,
          tags: ['cozinha'],
          status: TaskStatus.OPEN,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=back')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Estudar Nest');
  });

  it('/api/v1/tasks?search=semresultado (GET) returns empty array when nothing matches', async () => {
    await prismaService.task.create({
      data: {
        title: 'Comprar cafe',
        priority: TaskPriority.MEDIUM,
        tags: ['cozinha'],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=semresultado')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('/api/v1/tasks?search=%20%20%20 (GET) treats blank search as absence of search', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Comprar cafe',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Pagar boleto',
          priority: TaskPriority.LOW,
          tags: [],
          status: TaskStatus.OPEN,
        },
      ],
    });

    const [unfilteredResponse, blankSearchResponse] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/tasks').expect(200),
      request(app.getHttpServer())
        .get('/api/v1/tasks?search=%20%20%20')
        .expect(200),
    ]);

    expect(blankSearchResponse.body).toEqual(unfilteredResponse.body);
  });

  it('/api/v1/tasks?status=open&search=internet (GET) searches only within open tasks', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Aberta com match',
          description: 'Conta de Internet',
          priority: TaskPriority.HIGH,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Concluida com match',
          description: 'Conta de Internet',
          priority: TaskPriority.HIGH,
          tags: [],
          status: TaskStatus.COMPLETED,
        },
        {
          title: 'Aberta sem match',
          description: 'Conta de agua',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=open&search=internet')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Aberta com match',
      status: TaskStatus.OPEN,
    });
  });

  it('/api/v1/tasks?status=completed&search=internet (GET) searches only within completed tasks', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Aberta com match',
          description: 'Conta de Internet',
          priority: TaskPriority.HIGH,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Concluida com match',
          description: 'Conta de Internet',
          priority: TaskPriority.HIGH,
          tags: [],
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=completed&search=internet')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: 'Concluida com match',
      status: TaskStatus.COMPLETED,
    });
  });

  it('/api/v1/tasks?status=open&search=semresultado (GET) returns empty array when combined filters have no matches', async () => {
    await prismaService.task.createMany({
      data: [
        {
          title: 'Aberta sem match',
          description: 'Conta de agua',
          priority: TaskPriority.MEDIUM,
          tags: [],
          status: TaskStatus.OPEN,
        },
        {
          title: 'Concluida com match',
          description: 'Conta de Internet',
          priority: TaskPriority.HIGH,
          tags: [],
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=open&search=internet')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('/api/v1/tasks/:id (GET) returns persisted task by id', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Detalhe task',
        description: 'Descricao completa',
        dueDate: new Date('2026-05-01T10:00:00.000Z'),
        priority: TaskPriority.HIGH,
        tags: ['detalhe'],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/tasks/${createdTask.id}`)
      .expect(200);

    const task = response.body as TaskResponseBody;

    expect(task).toMatchObject({
      id: createdTask.id,
      title: 'Detalhe task',
      description: 'Descricao completa',
      dueDate: '2026-05-01T10:00:00.000Z',
      priority: TaskPriority.HIGH,
      tags: ['detalhe'],
      status: TaskStatus.OPEN,
    });
  });

  it('/api/v1/tasks/:id (GET) returns NOT_FOUND for missing task', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks/84a87d85-feb4-4586-b4f3-f15f7d5d4644')
      .expect(404);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Task not found',
      details: [],
    });
  });

  it('/api/v1/tasks/:id (GET) rejects malformed id before reaching persistence', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks/abc')
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'id',
          message: 'id must be a valid UUID',
          code: 'invalid_string',
        },
      ],
    });
  });

  it('/api/v1/tasks/:id (PATCH) updates editable fields and returns task', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Original',
        description: 'Descricao inicial',
        dueDate: new Date('2026-04-01T12:00:00.000Z'),
        priority: TaskPriority.LOW,
        tags: ['inicial'],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${createdTask.id}`)
      .send({
        title: 'Atualizada',
        description: '   ',
        dueDate: null,
        priority: TaskPriority.HIGH,
        tags: ['refinada'],
      })
      .expect(200);

    const task = response.body as TaskResponseBody;

    expect(task).toMatchObject({
      id: createdTask.id,
      title: 'Atualizada',
      description: null,
      dueDate: null,
      priority: TaskPriority.HIGH,
      tags: ['refinada'],
      status: TaskStatus.OPEN,
    });
  });

  it('/api/v1/tasks/:id (PATCH) rejects empty payload', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Mantida',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${createdTask.id}`)
      .send({})
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse.statusCode).toBe(400);
    expect(errorResponse.code).toBe('VALIDATION_ERROR');
    expect(errorResponse.message).toBe('Validation failed');
    expect(errorResponse.details).toEqual([
      {
        field: 'body',
        message: 'At least one editable field must be provided',
        code: 'custom',
      },
    ]);
  });

  it('/api/v1/tasks/:id (PATCH) returns NOT_FOUND for missing task', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/v1/tasks/84a87d85-feb4-4586-b4f3-f15f7d5d4644')
      .send({ title: 'Nao existe' })
      .expect(404);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Task not found',
      details: [],
    });
  });

  it('/api/v1/tasks/:id/status (PATCH) completes an open task', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Concluir',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${createdTask.id}/status`)
      .send({ status: TaskStatus.COMPLETED })
      .expect(200);

    const task = response.body as TaskResponseBody;

    expect(task).toMatchObject({
      id: createdTask.id,
      status: TaskStatus.COMPLETED,
      title: 'Concluir',
    });

    const persistedTask = await prismaService.task.findUniqueOrThrow({
      where: { id: createdTask.id },
    });

    expect(persistedTask.status).toBe(TaskStatus.COMPLETED);
  });

  it('/api/v1/tasks/:id/status (PATCH) reopens a completed task', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Reabrir',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.COMPLETED,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${createdTask.id}/status`)
      .send({ status: TaskStatus.OPEN })
      .expect(200);

    const task = response.body as TaskResponseBody;

    expect(task).toMatchObject({
      id: createdTask.id,
      status: TaskStatus.OPEN,
      title: 'Reabrir',
    });
  });

  it('/api/v1/tasks/:id/status (PATCH) rejects invalid payload', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Payload invalido',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/tasks/${createdTask.id}/status`)
      .send({ status: 'DONE' })
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'status',
          message: 'status must be one of: OPEN, COMPLETED',
          code: 'custom',
        },
      ],
    });
  });

  it('/api/v1/tasks/:id/status (PATCH) returns NOT_FOUND for missing task', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/v1/tasks/84a87d85-feb4-4586-b4f3-f15f7d5d4644/status')
      .send({ status: TaskStatus.COMPLETED })
      .expect(404);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Task not found',
      details: [],
    });
  });

  it('/api/v1/tasks/:id (DELETE) returns 204 and removes task', async () => {
    const createdTask = await prismaService.task.create({
      data: {
        title: 'Excluir',
        priority: TaskPriority.MEDIUM,
        tags: [],
        status: TaskStatus.OPEN,
      },
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/tasks/${createdTask.id}`)
      .expect(204);

    const deletedTask = await prismaService.task.findUnique({
      where: { id: createdTask.id },
    });

    expect(deletedTask).toBeNull();
  });

  it('/api/v1/tasks/:id (DELETE) returns NOT_FOUND for missing task', async () => {
    const response = await request(app.getHttpServer())
      .delete('/api/v1/tasks/84a87d85-feb4-4586-b4f3-f15f7d5d4644')
      .expect(404);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Task not found',
      details: [],
    });
  });
});
