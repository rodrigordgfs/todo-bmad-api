import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ErrorResponseSwagger } from '../../shared/contracts/error-response.swagger';
import {
  RegisterResponseSwagger,
  RegisterSwaggerDto,
} from './dto/auth.swagger';
import { LoginResponseSwagger, LoginSwaggerDto } from './dto/auth.swagger';
import type { LoginResponseContract } from './contracts/login-response.contract';
import type { LoginDto } from './dto/login.dto';
import type { RegisterResponseContract } from './contracts/register-response.contract';
import type { RegisterDto } from './dto/register.dto';
import { loginSchema } from './schemas/login.schema';
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

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: 'Autentica usuario com email e senha' })
  @ApiBody({
    type: LoginSwaggerDto,
  })
  @ApiOkResponse({
    type: LoginResponseSwagger,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseSwagger,
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseSwagger,
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseSwagger,
  })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseContract> {
    return this.authService.login(loginDto);
  }
}
