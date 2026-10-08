import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum LeadSource {
  Footer = 'footer',
  SpecialistModal = 'specialist_modal',
  Simulator = 'simulator',
}

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Remove quebras de linha: campos curtos acabam no assunto/cabeçalhos do e-mail. */
const singleLine = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim() : value;

export class CreateLeadDto {
  @IsEnum(LeadSource, { message: 'Origem do contato inválida.' })
  source!: LeadSource;

  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MinLength(3, { message: 'Informe seu nome completo.' })
  @MaxLength(120)
  @Transform(singleLine)
  name!: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  // Telefone brasileiro com DDD: 10 ou 11 dígitos, com ou sem máscara
  @IsString()
  @MaxLength(20)
  @Matches(/^\D*(\d\D*){10,11}$/, { message: 'Informe um telefone válido com DDD.' })
  @Transform(trim)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(singleLine)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(singleLine)
  careerStage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  services?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(singleLine)
  referralSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  @Transform(trim)
  message?: string;

  /** Ponto exato do site, ex.: "Simulador Atuarial · Exportar cálculo". */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(singleLine)
  origin?: string;

  @IsOptional()
  @IsBoolean()
  scheduleSession?: boolean;

  /** Aceite explícito da Política de Privacidade (checkbox do formulário). */
  @IsOptional()
  @IsBoolean()
  privacyConsent?: boolean;

  /** Honeypot anti-spam: deve chegar sempre vazio. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
