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
  LoginResponseSwagger,
  LoginSwaggerDto,
  LogoutResponseSwagger,
  LogoutSwaggerDto,
  RefreshSwaggerDto,
  RegisterResponseSwagger,
  RegisterSwaggerDto,
} from './dto/auth.swagger';
import type { LoginResponseContract } from './contracts/login-response.contract';
import type { LogoutResponseContract } from './contracts/logout-response.contract';
import type { LoginDto } from './dto/login.dto';
import type { LogoutDto } from './dto/logout.dto';
import type { RefreshDto } from './dto/refresh.dto';
import type { RegisterResponseContract } from './contracts/register-response.contract';
import type { RegisterDto } from './dto/register.dto';
import { loginSchema } from './schemas/login.schema';
import { logoutSchema } from './schemas/logout.schema';
import { refreshSchema } from './schemas/refresh.schema';
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

  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(refreshSchema))
  @ApiOperation({ summary: 'Renova sessao autenticada com refresh token' })
  @ApiBody({
    type: RefreshSwaggerDto,
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
  refresh(@Body() refreshDto: RefreshDto): Promise<LoginResponseContract> {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(logoutSchema))
  @ApiOperation({ summary: 'Encerra sessao autenticada com logout seguro' })
  @ApiBody({
    type: LogoutSwaggerDto,
  })
  @ApiOkResponse({
    type: LogoutResponseSwagger,
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
  logout(@Body() logoutDto: LogoutDto): Promise<LogoutResponseContract> {
    return this.authService.logout(logoutDto);
  }
}
