import { InternalServerErrorException } from '@nestjs/common';
import type { MailService } from '../mail/mail.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { LeadSource, type CreateLeadDto } from './dto/create-lead.dto.js';
import { LeadsService } from './leads.service.js';

const dto = {
  source: LeadSource.Footer,
  name: 'Maria da Silva',
  email: 'maria@gmail.com',
  phone: '(21) 91234-5678',
  subject: 'Auditoria de CNIS e Vínculos',
  careerStage: 'Próximo à Aposentadoria (50+ anos)',
  services: ['Auditoria de CNIS & Vínculos'],
  referralSource: 'Instagram',
  message: 'Trabalhei 10 anos como enfermeira.',
  origin: 'Footer · Formulário de contato',
  scheduleSession: true,
  privacyConsent: true,
} satisfies CreateLeadDto;

function setup() {
  const saved = { id: 'lead_1', ...dto };
  const create = vi.fn().mockResolvedValue(saved);
  const sendLeadNotification = vi.fn().mockResolvedValue(true);
  const prisma = { previareContact: { create } } as unknown as PrismaService;
  const mail = { sendLeadNotification } as unknown as MailService;
  return { service: new LeadsService(prisma, mail), create, sendLeadNotification, saved };
}

describe('LeadsService', () => {
  it('salva o lead mapeando todos os campos e então envia o e-mail', async () => {
    const { service, create, sendLeadNotification, saved } = setup();

    await expect(service.create(dto)).resolves.toEqual({ ok: true, id: 'lead_1' });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nome: 'Maria da Silva',
        telefone: '(21) 91234-5678',
        tipoBeneficio: 'DIAGNOSTICO_CNIS',
        origem: 'footer',
        origemDetalhe: 'Footer · Formulário de contato',
        momentoProfissional: 'Próximo à Aposentadoria (50+ anos)',
        servicosInteresse: ['Auditoria de CNIS & Vínculos'],
        comoConheceu: 'Instagram',
        desejaAgendamento: true,
        consentimentoLgpd: true,
      }),
    });
    expect(sendLeadNotification).toHaveBeenCalledWith(saved);
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(
      sendLeadNotification.mock.invocationCallOrder[0],
    );
  });

  it('responde sucesso mesmo quando o SMTP falha', async () => {
    const { service, sendLeadNotification } = setup();
    sendLeadNotification.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.create(dto)).resolves.toEqual({ ok: true, id: 'lead_1' });
  });

  it('não envia e-mail se o banco falhar', async () => {
    const { service, create, sendLeadNotification } = setup();
    create.mockRejectedValue(new Error('db down'));

    await expect(service.create(dto)).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(sendLeadNotification).not.toHaveBeenCalled();
  });

  it('ignora silenciosamente envios com honeypot preenchido', async () => {
    const { service, create, sendLeadNotification } = setup();

    await expect(service.create({ ...dto, website: 'spam.com' })).resolves.toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
    expect(sendLeadNotification).not.toHaveBeenCalled();
  });

  it('usa OUTRO quando o assunto não é reconhecido', async () => {
    const { service, create } = setup();

    await service.create({ ...dto, subject: undefined });
    expect(create.mock.calls[0][0].data.tipoBeneficio).toBe('OUTRO');
  });
});
