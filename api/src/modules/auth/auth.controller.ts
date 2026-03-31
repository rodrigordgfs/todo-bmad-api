import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ErrorResponseSwagger } from '../../shared/contracts/error-response.swagger';
import {
  RegisterResponseSwagger,
  RegisterSwaggerDto,
} from './dto/auth.swagger';
import type { RegisterResponseContract } from './contracts/register-response.contract';
import type { RegisterDto } from './dto/register.dto';
import { registerSchema } from './schemas/register.schema';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: 'Cria conta com email e senha' })
  @ApiBody({
    type: RegisterSwaggerDto,
  })
  @ApiCreatedResponse({
    type: RegisterResponseSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiConflictResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseContract> {
    return this.authService.register(registerDto);
  }
}
