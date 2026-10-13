import type { Article } from '@/types/blog';

/**
 * Fonte única das publicações do acervo.
 *
 * Ainda não há API/CMS conectado: retorna lista vazia de propósito (sem conteúdo fictício).
 * Ao integrar, substitua o corpo por uma chamada ao endpoint/CMS que devolva `Article[]`.
 */
export async function getArticles(): Promise<Article[]> {
  return [];
}
