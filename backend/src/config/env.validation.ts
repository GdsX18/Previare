import { plainToInstance, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT: number = 3001;

  // @IsUrl() only accepts http/https/ftp by default, so it rejects postgresql:// URLs
  @IsString()
  @IsNotEmpty()
  @Matches(/^postgres(ql)?:\/\//, {
    message: 'DATABASE_URL must start with postgresql:// or postgres://',
  })
  DATABASE_URL!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string = 'http://localhost:3000';

  // @nestjs/throttler v6 expects ttl in milliseconds
  @Type(() => Number)
  @IsInt()
  @Min(0)
  THROTTLE_TTL: number = 60000;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  THROTTLE_LIMIT: number = 100;

  // ── E-mail transacional (notificação de novos leads) ──────────────────────
  // Sem MAIL_HOST o lead continua sendo salvo, mas o e-mail não é enviado
  // (em desenvolvimento o conteúdo é apenas registrado no log).

  @IsEmail()
  MAIL_TO: string = 'contato@amoadvogados.com.br';

  @IsOptional()
  @IsString()
  MAIL_HOST?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  MAIL_PORT: number = 587;

  @IsOptional()
  @IsString()
  MAIL_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_PASS?: string;

  // Remetente autorizado no provedor SMTP, ex.: 'Previare Notificações <noreply@amoadvogados.com.br>'
  @IsOptional()
  @IsString()
  MAIL_FROM?: string;
}

export type Env = EnvironmentVariables;

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  // Drop unset/blank values so the class defaults apply instead of being
  // overwritten with undefined (or coerced to 0 / NaN)
  const provided = Object.fromEntries(
    Object.entries(config).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

  const validated = plainToInstance(EnvironmentVariables, provided, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      'Invalid environment variables:\n' +
        errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n'),
    );
  }

  return validated;
}
