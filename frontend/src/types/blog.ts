export interface Author {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  readTimeMinutes: number;
  author: Author;
  publishedAt: string;
}

export interface ArticleCategory {
  id: string;
  label: string;
}

/** Valor reservado para o filtro "Todos os Tópicos". */
export const ALL_CATEGORIES_ID = 'todos';

export const ARTICLE_CATEGORIES: readonly ArticleCategory[] = [
  { id: ALL_CATEGORIES_ID, label: 'Todos os Tópicos' },
  { id: 'reforma-transicao', label: 'Reforma & Transição' },
  { id: 'auditoria-cnis', label: 'Auditoria de CNIS' },
  { id: 'aposentadoria-especial-medicos', label: 'Aposentadoria Especial & Médicos' },
  { id: 'calculos-atuariais', label: 'Cálculos Atuariais' },
  { id: 'decisoes-precedentes', label: 'Decisões Judiciais & Precedentes' },
];
