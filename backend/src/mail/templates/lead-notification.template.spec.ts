import type { PreviareContact } from '@prisma/client';
import { buildLeadNotificationEmail, whatsappUrl } from './lead-notification.template.js';

const lead: PreviareContact = {
  id: 'clx123',
  nome: 'João <script>alert(1)</script> Souza',
  email: 'joao@example.com',
  telefone: '(21) 91234-5678',
  tipoBeneficio: 'PLANEJAMENTO_PREVIDENCIARIO',
  status: 'PENDING',
  tempoContribuicaoAnos: null,
  mensagem: 'Linha 1\nLinha 2 & <b>negrito</b>',
  origem: 'simulator',
  origemDetalhe: 'Simulador Atuarial · Exportar cálculo',
  assunto: 'Planejamento Previdenciário',
  momentoProfissional: null,
  servicosInteresse: ['Planejamento Previdenciário', 'Simulações Matemáticas'],
  comoConheceu: null,
  desejaAgendamento: false,
  consentimentoLgpd: true,
  ipOrigem: null,
  createdAt: new Date('2026-10-08T15:30:00Z'),
  updatedAt: new Date('2026-10-08T15:30:00Z'),
};

describe('buildLeadNotificationEmail', () => {
  const email = buildLeadNotificationEmail(lead);

  it('identifica a origem do lead no assunto e no corpo', () => {
    expect(email.subject).toContain('[Simulador Atuarial]');
    expect(email.html).toContain('Simulador Atuarial');
    expect(email.text).toContain('Origem do lead: Simulador Atuarial (Simulador Atuarial · Exportar cálculo)');
  });

  it('escapa HTML vindo do usuário', () => {
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('&amp; &lt;b&gt;negrito&lt;/b&gt;');
  });

  it('inclui link clicável do WhatsApp com DDI 55', () => {
    expect(email.html).toContain('https://wa.me/5521912345678?text=');
  });

  it('lista serviços, consentimento LGPD e data/hora em Brasília', () => {
    expect(email.text).toContain('Serviços de interesse: Planejamento Previdenciário, Simulações Matemáticas');
    expect(email.text).toContain('Consentimento LGPD: Sim');
    expect(email.text).toContain('12:30');
  });
});

describe('whatsappUrl', () => {
  it('não duplica o DDI quando já presente', () => {
    expect(whatsappUrl('5521912345678', 'Ana')).toMatch(/^https:\/\/wa\.me\/5521912345678\?/);
  });
});
