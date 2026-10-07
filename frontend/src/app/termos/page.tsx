import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import { SITE_CONFIG } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Condições de uso do site da Previare, natureza informativa do conteúdo e do simulador, e diretrizes éticas da advocacia observadas.',
  alternates: { canonical: '/termos' },
};

export default function TermosPage() {
  return (
    <LegalPage eyebrow="Condições de uso" title="Termos de Uso" updatedAt="7 de outubro de 2026">
      <p>
        Ao navegar por este site você concorda com as condições abaixo. Elas existem para deixar claro o que o site
        oferece e o que depende de uma análise individual do seu caso.
      </p>

      <h2>1. Natureza informativa do conteúdo</h2>
      <p>
        Os textos deste site têm caráter exclusivamente informativo e educativo. Eles não substituem a consulta
        jurídica individual: cada histórico contributivo tem particularidades que só aparecem na análise dos documentos.
      </p>

      <h2>2. O simulador</h2>
      <p>
        O simulador produz <strong>estimativas ilustrativas</strong> a partir dos dados que você digita, com regras
        simplificadas da Emenda Constitucional nº 103/2019. Ele <strong>não é um cálculo oficial</strong>, não
        considera todas as variáveis do seu histórico e <strong>não representa promessa ou garantia de resultado</strong>.
        O valor real de um benefício só pode ser apurado com a análise completa do seu CNIS e da documentação.
      </p>
      <p>
        Os &ldquo;cenários ilustrativos&rdquo; exibidos junto ao simulador são situações hipotéticas, criadas para fins
        didáticos. Eles não se referem a clientes reais.
      </p>

      <h2>3. Contato pelo site</h2>
      <p>
        O envio de uma mensagem pelo site não cria, por si só, relação de prestação de serviços. A contratação ocorre
        somente por contrato escrito, com escopo e honorários definidos previamente. O tratamento dos dados enviados
        segue a nossa <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>

      <h2 id="etica-oab">4. Diretrizes éticas da advocacia</h2>
      <p>
        A comunicação deste site observa o Estatuto da Advocacia (Lei nº 8.906/1994), o Código de Ética e Disciplina
        da OAB e o Provimento nº 205/2021 do Conselho Federal da OAB. Por isso:
      </p>
      <ul>
        <li>não prometemos resultados nem divulgamos valores obtidos em casos concretos;</li>
        <li>não divulgamos nomes de clientes nem detalhes de processos;</li>
        <li>não oferecemos produtos financeiros, crédito ou qualquer atividade estranha à advocacia;</li>
        <li>não fazemos captação de clientela nem comparações com outros profissionais;</li>
        <li>todas as informações recebidas são protegidas pelo sigilo profissional.</li>
      </ul>

      <h2>5. Propriedade intelectual</h2>
      <p>
        Textos, marca, identidade visual e código deste site pertencem à {SITE_CONFIG.legalName || SITE_CONFIG.brandName}{' '}
        e não podem ser reproduzidos sem autorização.
      </p>

      <h2>6. Alterações</h2>
      <p>
        Estes termos podem ser atualizados a qualquer tempo. A data da última atualização aparece no topo desta página.
      </p>
    </LegalPage>
  );
}
