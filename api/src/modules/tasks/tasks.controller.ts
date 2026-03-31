import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { TaskContract } from './contracts/task.contract';
import { TaskSwagger } from './contracts/task.swagger';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import type { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import {
  CreateTaskSwaggerDto,
  UpdateTaskStatusSwaggerDto,
  UpdateTaskSwaggerDto,
} from './dto/tasks.swagger';
import { createTaskSchema } from './schemas/create-task.schema';
import { listTasksQuerySchema } from './schemas/list-tasks-query.schema';
import { updateTaskStatusSchema } from './schemas/update-task-status.schema';
import { updateTaskSchema } from './schemas/update-task.schema';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ErrorResponseSwagger } from '../../shared/contracts/error-response.swagger';

@ApiTags('tasks')
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private static readonly taskIdPipe = new ParseUUIDPipe({
    exceptionFactory: () =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          {
            field: 'id',
            message: 'id must be a valid UUID',
            code: 'invalid_string',
          },
        ],
      }),
  });

  @Get()
  @ApiOperation({ summary: 'Lista tarefas do MVP' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['all', 'open', 'completed'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiOkResponse({
    type: TaskSwagger,
    isArray: true,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  findAll(
    @Query(new ZodValidationPipe(listTasksQuerySchema))
    query: ListTasksQueryDto,
  ): Promise<TaskContract[]> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta tarefa por id' })
  @ApiOkResponse({
    type: TaskSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  findById(
    @Param('id', TasksController.taskIdPipe) id: string,
  ): Promise<TaskContract> {
    return this.tasksService.findById(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  @ApiOperation({ summary: 'Cria tarefa' })
  @ApiBody({
    type: CreateTaskSwaggerDto,
  })
  @ApiCreatedResponse({
    type: TaskSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  create(@Body() createTaskDto: CreateTaskDto): Promise<TaskContract> {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza campos editáveis da tarefa' })
  @ApiBody({
    type: UpdateTaskSwaggerDto,
  })
  @ApiOkResponse({
    type: TaskSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  update(
    @Param('id', TasksController.taskIdPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) updateTaskDto: UpdateTaskDto,
  ): Promise<TaskContract> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Conclui ou reabre tarefa por endpoint explícito de estado',
  })
  @ApiBody({
    type: UpdateTaskStatusSwaggerDto,
  })
  @ApiOkResponse({
    type: TaskSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  updateStatus(
    @Param('id', TasksController.taskIdPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskStatusSchema))
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskContract> {
    return this.tasksService.updateStatus(id, updateTaskStatusDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui tarefa' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  async delete(
    @Param('id', TasksController.taskIdPipe) id: string,
  ): Promise<void> {
    await this.tasksService.delete(id);
  }
}
