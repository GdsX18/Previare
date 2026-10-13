import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/types/blog';
import { ARTICLE_CATEGORIES } from '@/types/blog';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

function categoryLabel(id: string): string {
  return ARTICLE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { slug, title, summary, category, publishedAt, readTimeMinutes, author } = article;

  return (
    <article className="group relative h-full">
      <Link
        href={`/blog/${slug}`}
        className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 backdrop-blur-sm transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CE577]/60"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#7CE577]/85">
            {categoryLabel(category)}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-white/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7CE577]"
          />
        </div>

        <h3 className="mt-5 font-serif text-2xl font-light leading-snug tracking-tight text-white/95">
          {title}
        </h3>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">{summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.08] pt-6 text-[11px] tracking-wide text-white/45">
          <span className="text-white/75">{author.name}</span>
          <span aria-hidden="true" className="text-white/20">•</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          <span aria-hidden="true" className="text-white/20">•</span>
          <span>{readTimeMinutes} min de leitura</span>
        </div>
      </Link>
    </article>
  );
}

export { ArticleCard };
