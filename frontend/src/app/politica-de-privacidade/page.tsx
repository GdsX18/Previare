import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Previare coleta, utiliza, protege e armazena os seus dados pessoais e documentos previdenciários, conforme a LGPD e o sigilo profissional da advocacia.',
  alternates: { canonical: '/politica-de-privacidade' },
};

export default function PoliticaDePrivacidadePage() {
  const controller = SITE_CONFIG.legalName || SITE_CONFIG.brandName;

  return (
    <LegalPage eyebrow="LGPD · Lei nº 13.709/2018" title="Política de Privacidade" updatedAt="7 de outubro de 2026">
      <p>
        Esta política explica, em linguagem direta, quais dados pessoais a <strong>{controller}</strong> recebe por
        meio deste site, para que eles são usados e como você pode exercer os seus direitos. Ela vale para o
        formulário de contato, para a janela &ldquo;Falar com Especialista&rdquo; e para o simulador.
      </p>

      <h2>1. Quem é responsável pelos seus dados</h2>
      <p>
        O controlador dos dados é a {controller}
        {SITE_CONFIG.cnpj ? `, inscrita no CNPJ sob o nº ${SITE_CONFIG.cnpj}` : ''}
        {SITE_CONFIG.oabRegistration ? ` e registrada na ${SITE_CONFIG.oabRegistration}` : ''}, com atuação a partir
        de {SITE_CONFIG.city}/{SITE_CONFIG.state}. Para qualquer assunto relacionado a esta política, inclusive
        contato com o encarregado pelo tratamento de dados, escreva para{' '}
        <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.
      </p>

      <h2>2. Quais dados recebemos</h2>
      <ul>
        <li>
          <strong>Dados de identificação e contato</strong> que você mesmo informa: nome, e-mail e telefone/WhatsApp.
        </li>
        <li>
          <strong>Informações sobre o seu caso</strong> que você decide nos contar: relato, assunto de interesse,
          momento profissional e, se você exportar o simulador, o resumo da simulação.
        </li>
        <li>
          <strong>Dados técnicos mínimos</strong> necessários ao funcionamento e à segurança do site, como endereço IP,
          usados para impedir envios automatizados em massa.
        </li>
      </ul>
      <p>
        Os valores digitados no simulador são calculados <strong>no seu próprio navegador</strong> e não são enviados a
        nós, a menos que você clique para encaminhar o cálculo a um especialista.
      </p>
      <p>
        Este site não utiliza cookies de publicidade nem ferramentas de rastreamento de terceiros.
      </p>

      <h2>3. Para que usamos os seus dados</h2>
      <ul>
        <li>Retornar o seu contato e entender, de forma preliminar, a sua necessidade previdenciária;</li>
        <li>Preparar a primeira conversa com o especialista e, se você decidir contratar, a prestação do serviço;</li>
        <li>Cumprir obrigações legais e regulatórias, inclusive as da advocacia.</li>
      </ul>
      <p>
        O tratamento se apoia, conforme o caso, na execução de procedimentos preliminares a um contrato a seu pedido,
        no cumprimento de obrigação legal e no exercício regular de direitos (art. 7º, incisos II, V e VI, da LGPD).
        Não usamos seus dados para envio de publicidade.
      </p>

      <h2>4. Documentos previdenciários e dados de saúde</h2>
      <p>
        Extratos do CNIS, carteiras de trabalho, PPP, laudos e documentos médicos são tratados sob{' '}
        <strong>sigilo profissional da advocacia</strong> (Lei nº 8.906/1994 e Código de Ética e Disciplina da OAB) e
        usados exclusivamente no seu caso. Dados de saúde, considerados sensíveis pela LGPD, são tratados apenas
        quando necessários à defesa do seu direito (art. 11, inciso II, alínea &ldquo;d&rdquo;).
      </p>
      <p>
        <strong>Nunca pedimos a sua senha do gov.br por e-mail, telefone ou mensagem.</strong> Sempre que possível,
        orientamos você a baixar os documentos diretamente no Meu INSS ou atuamos por meio de procuração formal.
      </p>

      <h2>5. Com quem os dados podem ser compartilhados</h2>
      <p>
        Não vendemos nem cedemos seus dados. O compartilhamento ocorre somente com fornecedores indispensáveis à
        operação (como hospedagem do site e serviço de e-mail), que têm acesso limitado ao necessário, e com órgãos
        públicos (como o INSS e o Poder Judiciário) quando isso for parte do serviço contratado por você ou exigido
        por lei.
      </p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Mensagens de contato que não resultem em contratação são mantidas pelo tempo necessário ao atendimento e
        depois eliminadas. Documentos de clientes são mantidos pelo prazo exigido pelas normas da advocacia e pelos
        prazos legais aplicáveis, sempre sob sigilo.
      </p>

      <h2>7. Seus direitos</h2>
      <p>A qualquer momento, você pode pedir, sem custo (art. 18 da LGPD):</p>
      <ul>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos ou desatualizados;</li>
        <li>eliminação dos dados, quando não houver obrigação legal de guarda;</li>
        <li>informação sobre com quem os dados foram compartilhados;</li>
        <li>revogação de consentimento, quando ele for a base do tratamento.</li>
      </ul>
      <p>
        Basta escrever para <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
        {SITE_CONFIG.phoneDisplay && SITE_CONFIG.phoneE164 ? (
          <>
            {' '}ou ligar para <a href={`tel:+${SITE_CONFIG.phoneE164}`}>{SITE_CONFIG.phoneDisplay}</a>
          </>
        ) : null}
        . Você também pode
        apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>8. Segurança</h2>
      <p>
        O site trafega dados de forma criptografada (HTTPS), aplica limites contra envios automatizados e restringe o
        acesso às mensagens à equipe responsável pelo atendimento.
      </p>

      <h2>9. Alterações desta política</h2>
      <p>
        Esta política pode ser atualizada para refletir mudanças legais ou no site. A data da última atualização
        aparece no topo desta página.
      </p>
    </LegalPage>
  );
}
