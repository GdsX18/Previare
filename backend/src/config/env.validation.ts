import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
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

  @IsNumber()
  @Min(1)
  PORT: number = 3001;

  @IsUrl({ require_tld: false })
  DATABASE_URL!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsNumber()
  @Min(0)
  THROTTLE_TTL: number = 60000;

  @IsNumber()
  @Min(0)
  THROTTLE_LIMIT: number = 100;
}

export type Env = EnvironmentVariables;

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  // Coerce numeric strings to numbers before validation
  const coerced = {
    ...config,
    PORT: config['PORT'] !== undefined ? Number(config['PORT']) : undefined,
    THROTTLE_TTL:
      config['THROTTLE_TTL'] !== undefined
        ? Number(config['THROTTLE_TTL'])
        : undefined,
    THROTTLE_LIMIT:
      config['THROTTLE_LIMIT'] !== undefined
        ? Number(config['THROTTLE_LIMIT'])
        : undefined,
  };

  const validated = plainToInstance(EnvironmentVariables, coerced, {
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
