import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/config/app.config';
import { PrismaService } from './../src/infra/database/prisma/prisma.service';
import { FoundationModule } from './../src/modules/foundation/foundation.module';
import { INTERNAL_TASK_OWNER_ID } from './../src/modules/tasks/constants/internal-task-owner';
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

type RegisterResponseBody = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type LoginResponseBody = {
  accessToken: string;
  refreshToken: string;
};

type RefreshRequestBody = {
  refreshToken: string;
};

type LogoutResponseBody = {
  success: true;
};

type RefreshTokenJwtPayload = {
  sid: string;
  exp: number;
  sub: string;
  email: string;
  type: 'refresh';
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  const createOwnedTask = (
    data: Omit<Prisma.TaskUncheckedCreateInput, 'userId'>,
  ) =>
    prismaService.task.create({
      data: {
        userId: INTERNAL_TASK_OWNER_ID,
        ...data,
      },
    });

  const createManyOwnedTasks = (
    data: Array<Omit<Prisma.TaskUncheckedCreateManyInput, 'userId'>>,
  ) =>
    prismaService.task.createMany({
      data: data.map((task) => ({
        userId: INTERNAL_TASK_OWNER_ID,
        ...task,
      })),
    });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, FoundationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prismaService = app.get(PrismaService);
    await prismaService.task.deleteMany();
    await prismaService.refreshToken.deleteMany();
    await prismaService.user.deleteMany({
      where: {
        id: {
          not: INTERNAL_TASK_OWNER_ID,
        },
      },
    });
  });

  afterEach(async () => {
    await prismaService.task.deleteMany();
    await prismaService.refreshToken.deleteMany();
    await prismaService.user.deleteMany({
      where: {
        id: {
          not: INTERNAL_TASK_OWNER_ID,
        },
      },
    });
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
    expect(document.paths['/api/v1/auth/register']).toBeDefined();
    expect(document.paths['/api/v1/auth/refresh']).toBeDefined();
    expect(document.paths['/api/v1/auth/logout']).toBeDefined();
    expect(document.paths['/api/v1/tasks']).toBeDefined();
    expect(document.paths['/api/v1/tasks/{id}']).toBeDefined();
    expect(document.paths['/api/v1/tasks/{id}/status']).toBeDefined();
    expect(document.components.schemas.TaskSwagger).toBeDefined();
    expect(document.components.schemas.RegisterSwaggerDto).toBeDefined();
    expect(document.components.schemas.RegisterResponseSwagger).toBeDefined();
    expect(document.components.schemas.RefreshSwaggerDto).toBeDefined();
    expect(document.components.schemas.LogoutSwaggerDto).toBeDefined();
    expect(document.components.schemas.LogoutResponseSwagger).toBeDefined();
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

  it('/api/v1/auth/register (POST) creates an account without returning password data', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: ' User@Example.com ',
        password: 'plain-password',
      })
      .expect(201);

    const user = response.body as RegisterResponseBody & {
      password?: unknown;
      passwordHash?: unknown;
    };

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe('user@example.com');
    expect(user.createdAt).toEqual(expect.any(String));
    expect(user.updatedAt).toEqual(expect.any(String));
    expect(user.password).toBeUndefined();
    expect(user.passwordHash).toBeUndefined();

    const persistedUser = await prismaService.user.findUniqueOrThrow({
      where: { email: 'user@example.com' },
    });

    expect(persistedUser.passwordHash).not.toBe('plain-password');
    expect(persistedUser.passwordHash.length).toBeGreaterThan(20);
  });

  it('/api/v1/auth/register (POST) rejects invalid payload with normalized validation error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'email',
          message: 'email must be a valid email',
          code: 'invalid_format',
        },
        {
          field: 'password',
          message: 'password must contain at least 6 characters',
          code: 'too_small',
        },
      ],
    });
  });

  it('/api/v1/auth/register (POST) rejects duplicated email with conflict error', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'USER@example.com',
        password: 'plain-password',
      })
      .expect(409);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 409,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already exists',
      details: [],
    });
  });

  it('/api/v1/auth/login (POST) authenticates a valid account and returns tokens only', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: ' USER@example.com ',
        password: 'plain-password',
      })
      .expect(200);

    const body = response.body as LoginResponseBody & {
      id?: unknown;
      email?: unknown;
      passwordHash?: unknown;
    };

    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.refreshToken).toEqual(expect.any(String));
    expect(body.id).toBeUndefined();
    expect(body.email).toBeUndefined();
    expect(body.passwordHash).toBeUndefined();

    const refreshPayload = JSON.parse(
      Buffer.from(body.refreshToken.split('.')[1] ?? '', 'base64url').toString(
        'utf8',
      ),
    ) as RefreshTokenJwtPayload;

    expect(refreshPayload.sid).toEqual(expect.any(String));
    expect(refreshPayload.type).toBe('refresh');

    const persistedSession = await prismaService.refreshToken.findUniqueOrThrow(
      {
        where: { id: refreshPayload.sid },
      },
    );

    expect(persistedSession.userId).toEqual(expect.any(String));
    expect(persistedSession.revokedAt).toBeNull();
    expect(persistedSession.tokenHash).not.toBe(body.refreshToken);
    expect(persistedSession.tokenHash.length).toBeGreaterThan(20);
    expect(persistedSession.expiresAt.toISOString()).toBe(
      new Date(refreshPayload.exp * 1000).toISOString(),
    );
  });

  it('/api/v1/auth/login (POST) revokes previous active session when a new one is created', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const firstLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const firstPayload = JSON.parse(
      Buffer.from(
        (firstLoginResponse.body as LoginResponseBody).refreshToken.split(
          '.',
        )[1] ?? '',
        'base64url',
      ).toString('utf8'),
    ) as RefreshTokenJwtPayload;
    const secondPayload = JSON.parse(
      Buffer.from(
        (secondLoginResponse.body as LoginResponseBody).refreshToken.split(
          '.',
        )[1] ?? '',
        'base64url',
      ).toString('utf8'),
    ) as RefreshTokenJwtPayload;

    const persistedSessions = await prismaService.refreshToken.findMany({
      orderBy: { createdAt: 'asc' },
    });

    expect(persistedSessions).toHaveLength(2);
    expect(persistedSessions[0]?.id).toBe(firstPayload.sid);
    expect(persistedSessions[1]?.id).toBe(secondPayload.sid);
    expect(persistedSessions[0]?.revokedAt).toEqual(expect.any(Date));
    expect(persistedSessions[1]?.revokedAt).toBeNull();
  });

  it('/api/v1/auth/refresh (POST) rotates session and returns the login response contract', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: (loginResponse.body as LoginResponseBody).refreshToken,
      } satisfies RefreshRequestBody)
      .expect(200);

    const responseBody = refreshResponse.body as LoginResponseBody;
    const oldPayload = JSON.parse(
      Buffer.from(
        (loginResponse.body as LoginResponseBody).refreshToken.split('.')[1] ??
          '',
        'base64url',
      ).toString('utf8'),
    ) as RefreshTokenJwtPayload;
    const newPayload = JSON.parse(
      Buffer.from(
        responseBody.refreshToken.split('.')[1] ?? '',
        'base64url',
      ).toString('utf8'),
    ) as RefreshTokenJwtPayload;

    expect(responseBody.accessToken).toEqual(expect.any(String));
    expect(responseBody.refreshToken).toEqual(expect.any(String));
    expect(newPayload.sid).not.toBe(oldPayload.sid);

    const persistedSessions = await prismaService.refreshToken.findMany({
      orderBy: { createdAt: 'asc' },
    });

    expect(persistedSessions).toHaveLength(2);
    expect(persistedSessions[0]?.id).toBe(oldPayload.sid);
    expect(persistedSessions[0]?.revokedAt).toEqual(expect.any(Date));
    expect(persistedSessions[1]?.id).toBe(newPayload.sid);
    expect(persistedSessions[1]?.revokedAt).toBeNull();
  });

  it('/api/v1/auth/refresh (POST) rejects reused refresh token after rotation', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const firstRefreshToken = (loginResponse.body as LoginResponseBody)
      .refreshToken;

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: firstRefreshToken,
      } satisfies RefreshRequestBody)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: firstRefreshToken,
      } satisfies RefreshRequestBody)
      .expect(401);

    expect((response.body as ErrorResponseBody).code).toBe(
      'INVALID_REFRESH_TOKEN',
    );
  });

  it('/api/v1/auth/refresh (POST) rejects invalid refresh token with unauthorized error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: 'invalid-refresh-token',
      } satisfies RefreshRequestBody)
      .expect(401);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
      details: [],
    });
  });

  it('/api/v1/auth/refresh (POST) rejects expired persisted session', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const refreshToken = (loginResponse.body as LoginResponseBody).refreshToken;
    const payload = JSON.parse(
      Buffer.from(refreshToken.split('.')[1] ?? '', 'base64url').toString(
        'utf8',
      ),
    ) as RefreshTokenJwtPayload;

    await prismaService.refreshToken.update({
      where: { id: payload.sid },
      data: {
        expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      },
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken,
      } satisfies RefreshRequestBody)
      .expect(401);

    expect((response.body as ErrorResponseBody).code).toBe(
      'INVALID_REFRESH_TOKEN',
    );
  });

  it('/api/v1/auth/logout (POST) revokes the presented session and returns success', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'plain-password',
      })
      .expect(200);

    const refreshToken = (loginResponse.body as LoginResponseBody).refreshToken;
    const payload = JSON.parse(
      Buffer.from(refreshToken.split('.')[1] ?? '', 'base64url').toString(
        'utf8',
      ),
    ) as RefreshTokenJwtPayload;

    const logoutResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({
        refreshToken,
      } satisfies RefreshRequestBody)
      .expect(200);

    expect(logoutResponse.body as LogoutResponseBody).toEqual({
      success: true,
    });

    const persistedSession = await prismaService.refreshToken.findUniqueOrThrow(
      {
        where: { id: payload.sid },
      },
    );

    expect(persistedSession.revokedAt).toEqual(expect.any(Date));

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken,
      } satisfies RefreshRequestBody)
      .expect(401);

    expect((refreshResponse.body as ErrorResponseBody).code).toBe(
      'INVALID_REFRESH_TOKEN',
    );
  });

  it('/api/v1/auth/logout (POST) rejects invalid refresh token with unauthorized error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({
        refreshToken: 'invalid-refresh-token',
      } satisfies RefreshRequestBody)
      .expect(401);

    expect(response.body as ErrorResponseBody).toEqual({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
      details: [],
    });
  });

  it('/api/v1/auth/login (POST) rejects invalid payload with normalized validation error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'email',
          message: 'email must be a valid email',
          code: 'invalid_format',
        },
        {
          field: 'password',
          message: 'password must contain at least 6 characters',
          code: 'too_small',
        },
      ],
    });
  });

  it('/api/v1/auth/login (POST) rejects invalid credentials with unauthorized error', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'plain-password',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    const errorResponse = response.body as ErrorResponseBody;

    expect(errorResponse).toEqual({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
      details: [],
    });
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
    const createdOne = await createOwnedTask({
      title: 'Task recente',
      priority: TaskPriority.HIGH,
      tags: ['recente'],
      status: TaskStatus.OPEN,
    });
    const createdTwo = await createOwnedTask({
      title: 'Task antiga',
      priority: TaskPriority.LOW,
      tags: [],
      status: TaskStatus.COMPLETED,
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
    await createManyOwnedTasks([
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
    ]);

    const [unfilteredResponse, allResponse] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/tasks').expect(200),
      request(app.getHttpServer()).get('/api/v1/tasks?status=all').expect(200),
    ]);

    expect(allResponse.body).toEqual(unfilteredResponse.body);
  });

  it('/api/v1/tasks (GET) orders tasks by priority and then dueDate deterministically', async () => {
    const lowTask = await createOwnedTask({
      title: 'Low sem prazo',
      priority: TaskPriority.LOW,
      tags: [],
      status: TaskStatus.OPEN,
    });
    const highLaterDueDateTask = await createOwnedTask({
      title: 'High prazo distante',
      dueDate: new Date('2026-04-10T09:00:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: [],
      status: TaskStatus.OPEN,
    });
    const highSoonerDueDateTask = await createOwnedTask({
      title: 'High prazo proximo',
      dueDate: new Date('2026-04-01T09:00:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: [],
      status: TaskStatus.OPEN,
    });
    const mediumNoDueDateTask = await createOwnedTask({
      title: 'Medium sem prazo',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
    });
    const mediumWithDueDateTask = await createOwnedTask({
      title: 'Medium com prazo',
      dueDate: new Date('2026-04-05T09:00:00.000Z'),
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
    await createManyOwnedTasks([
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
    ]);

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
    await createManyOwnedTasks([
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
    ]);

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
    const highOpenTask = await createOwnedTask({
      title: 'High aberta',
      dueDate: new Date('2026-04-03T09:00:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: [],
      status: TaskStatus.OPEN,
    });
    await createOwnedTask({
      title: 'High concluida',
      dueDate: new Date('2026-04-01T09:00:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: [],
      status: TaskStatus.COMPLETED,
    });
    const mediumOpenTask = await createOwnedTask({
      title: 'Medium aberta',
      dueDate: new Date('2026-04-02T09:00:00.000Z'),
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
    await createManyOwnedTasks([
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
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=caFe')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Comprar cafe');
  });

  it('/api/v1/tasks?search=internet (GET) finds tasks by description case-insensitively', async () => {
    await createManyOwnedTasks([
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
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=internet')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Pagar boleto');
  });

  it('/api/v1/tasks?search=back (GET) finds tasks by tags case-insensitively', async () => {
    await createManyOwnedTasks([
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
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=back')
      .expect(200);

    const tasks = response.body as TaskResponseBody[];

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Estudar Nest');
  });

  it('/api/v1/tasks?search=semresultado (GET) returns empty array when nothing matches', async () => {
    await createOwnedTask({
      title: 'Comprar cafe',
      priority: TaskPriority.MEDIUM,
      tags: ['cozinha'],
      status: TaskStatus.OPEN,
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?search=semresultado')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('/api/v1/tasks?search=%20%20%20 (GET) treats blank search as absence of search', async () => {
    await createManyOwnedTasks([
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
    ]);

    const [unfilteredResponse, blankSearchResponse] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/tasks').expect(200),
      request(app.getHttpServer())
        .get('/api/v1/tasks?search=%20%20%20')
        .expect(200),
    ]);

    expect(blankSearchResponse.body).toEqual(unfilteredResponse.body);
  });

  it('/api/v1/tasks?status=open&search=internet (GET) searches only within open tasks', async () => {
    await createManyOwnedTasks([
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
    ]);

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
    await createManyOwnedTasks([
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
    ]);

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
    await createManyOwnedTasks([
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
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/tasks?status=open&search=internet')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('/api/v1/tasks/:id (GET) returns persisted task by id', async () => {
    const createdTask = await createOwnedTask({
      title: 'Detalhe task',
      description: 'Descricao completa',
      dueDate: new Date('2026-05-01T10:00:00.000Z'),
      priority: TaskPriority.HIGH,
      tags: ['detalhe'],
      status: TaskStatus.OPEN,
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
    const createdTask = await createOwnedTask({
      title: 'Original',
      description: 'Descricao inicial',
      dueDate: new Date('2026-04-01T12:00:00.000Z'),
      priority: TaskPriority.LOW,
      tags: ['inicial'],
      status: TaskStatus.OPEN,
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
    const createdTask = await createOwnedTask({
      title: 'Mantida',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
    const createdTask = await createOwnedTask({
      title: 'Concluir',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
    const createdTask = await createOwnedTask({
      title: 'Reabrir',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.COMPLETED,
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
    const createdTask = await createOwnedTask({
      title: 'Payload invalido',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
    const createdTask = await createOwnedTask({
      title: 'Excluir',
      priority: TaskPriority.MEDIUM,
      tags: [],
      status: TaskStatus.OPEN,
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
