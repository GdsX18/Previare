/**
 * Dados institucionais da Previare, centralizados para Footer, páginas legais,
 * JSON-LD e seção da banca técnica.
 *
 * Campos vazios ('') ou listas vazias NÃO são renderizados: preencha apenas com
 * dados reais e verificáveis (Provimento OAB 205/2021 — publicidade informativa).
 */

export const SITE_CONFIG = {
  brandName: 'Previare',
  /** Razão social da sociedade de advogados, ex.: 'Previare Sociedade de Advogados'. */
  legalName: '',
  /** Registro da sociedade na OAB, ex.: 'OAB/RJ nº 0.000'. */
  oabRegistration: '',
  /** CNPJ formatado, ex.: '00.000.000/0001-00'. */
  cnpj: '',
  /** Advogado(a) responsável técnico(a) pelo site, ex.: 'Dra. Nome Sobrenome — OAB/RJ 000.000'. */
  responsibleLawyer: '',

  email: 'contato@previare.com.br',
  /** Telefone exibido, ex.: '(21) 0000-0000'. Vazio = não exibe. */
  phoneDisplay: '(21) 99856-3305',
  /** Telefone em E.164 sem símbolos, ex.: '552100000000'. */
  phoneE164: '5521998563305',

  city: 'Rio de Janeiro',
  state: 'RJ',
  serviceArea: 'Atendimento em todo o Brasil',

  social: {
    /** URL completa do perfil oficial. Vazio = ícone não é exibido. */
    linkedin: '',
    instagram: 'https://www.instagram.com/previarebrasil/',
  },
};

export interface TeamMember {
  name: string;
  /** Ex.: 'OAB/RJ 000.000'. */
  oab: string;
  /** Cargo ou função, ex.: 'Sócia fundadora'. */
  role: string;
  /** Formação acadêmica (títulos permitidos pelo Provimento 205/2021). */
  education: string;
  /** Uma frase de foco técnico, sem autoelogio comparativo. */
  focus: string;
  /** Caminho em /public, ex.: '/images/team/nome.jpg'. */
  photo: string;
}

/**
 * Banca técnica. Enquanto estiver vazia, a seção "Quem conduz o seu caso" não é exibida.
 * Preencha somente com profissionais reais, com OAB ativa.
 */
export const TEAM: TeamMember[] = [];
