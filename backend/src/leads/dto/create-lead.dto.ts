import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLeadDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254)
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Transform(({ value }: { value: string }) => value?.trim())
  phone?: string;
}
