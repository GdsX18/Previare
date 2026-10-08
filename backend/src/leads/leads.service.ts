import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { BenefitType } from '@prisma/client';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

// Assuntos do site (frontend/src/lib/specialistContact.ts) → tipo de benefício
const BENEFIT_BY_SUBJECT: Record<string, BenefitType> = {
  'Planejamento Previdenciário': BenefitType.PLANEJAMENTO_PREVIDENCIARIO,
  'Auditoria de CNIS e Vínculos': BenefitType.DIAGNOSTICO_CNIS,
  'Tempo Especial & Insalubridade (PPP)': BenefitType.APOSENTADORIA_ESPECIAL,
  'Revisão de Aposentadoria Concedida': BenefitType.REVISAO_BENEFICIO,
  'Benefício por Incapacidade ou BPC / LOAS': BenefitType.AUXILIO_INCAPACIDADE,
};

export interface CreateLeadResult {
  ok: true;
  id?: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateLeadDto): Promise<CreateLeadResult> {
    // Honeypot preenchido: responde sucesso sem gravar nem enviar (não sinaliza ao robô)
    if (dto.website) return { ok: true };

    let lead;
    try {
      lead = await this.prisma.previareContact.create({
        data: {
          nome: dto.name,
          email: dto.email,
          telefone: dto.phone,
          tipoBeneficio: (dto.subject && BENEFIT_BY_SUBJECT[dto.subject]) || BenefitType.OUTRO,
          assunto: dto.subject,
          mensagem: dto.message || null,
          origem: dto.source,
          origemDetalhe: dto.origin,
          momentoProfissional: dto.careerStage,
          servicosInteresse: dto.services ?? [],
          comoConheceu: dto.referralSource,
          desejaAgendamento: dto.scheduleSession ?? false,
          consentimentoLgpd: dto.privacyConsent ?? false,
        },
      });
    } catch (error: unknown) {
      this.logger.error('Falha ao salvar lead', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Não foi possível processar a solicitação.');
    }

    // Disparo assíncrono: o lead já está salvo, então uma oscilação do SMTP
    // não pode atrasar nem derrubar a resposta ao cliente
    this.mail.sendLeadNotification(lead).catch((error: unknown) => {
      this.logger.error(
        `Falha ao enviar e-mail do lead ${lead.id} (lead salvo no banco)`,
        error instanceof Error ? error.stack : error,
      );
    });

    return { ok: true, id: lead.id };
  }
}
