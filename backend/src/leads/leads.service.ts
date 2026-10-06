import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (this.prisma as any).lead.create({ data: createLeadDto });
    } catch (error: unknown) {
      // Prisma unique constraint violation (e.g. duplicate email)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Este e-mail já está cadastrado.');
      }
      throw new InternalServerErrorException(
        'Não foi possível processar a solicitação.',
      );
    }
  }
}
