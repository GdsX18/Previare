'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import ArticleCard from './ArticleCard';
import ArticlesEmptyState from './ArticlesEmptyState';
import { ALL_CATEGORIES_ID, ARTICLE_CATEGORIES, type Article } from '@/types/blog';

interface ArticleExplorerProps {
  articles: Article[];
}

/** Normaliza para busca sem acentos e sem diferença de caixa ("Tema 1102" ≈ "tema 1.102"). */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.\-/]/g, '')
    .toLowerCase();
}

export default function ArticleExplorer({ articles }: ArticleExplorerProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES_ID);
  const deferredQuery = useDeferredValue(query);

  const visibleArticles = useMemo(() => {
    const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean);
    return articles.filter((article) => {
      if (activeCategory !== ALL_CATEGORIES_ID && article.category !== activeCategory) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(`${article.title} ${article.summary} ${article.author.name}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [articles, activeCategory, deferredQuery]);

  const isFiltering = query.trim() !== '' || activeCategory !== ALL_CATEGORIES_ID;

  const resetFilters = () => {
    setQuery('');
    setActiveCategory(ALL_CATEGORIES_ID);
  };

  return (
    <section aria-label="Artigos" className="px-5 pb-20 sm:px-10 md:pb-28 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        {/* Busca e categorias, centralizadas */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-full max-w-md">
            <label htmlFor="blog-search" className="sr-only">
              Buscar artigos
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/40"
            />
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar artigos..."
              autoComplete="off"
              className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 pl-11 pr-10 text-sm text-white placeholder-white/35 outline-none backdrop-blur-xl transition-[border-color,background-color] duration-300 focus:border-white/25 focus:bg-white/[0.05] [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Categorias"
            className="-mx-5 flex max-w-[calc(100%+2.5rem)] snap-x scroll-px-5 gap-1 overflow-x-auto scroll-smooth px-5 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {ARTICLE_CATEGORIES.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                    isActive
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listagem / Empty State */}
        <div className="pt-20 md:pt-28" aria-live="polite">
          {visibleArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <ArticlesEmptyState
              filtered={articles.length > 0 && isFiltering}
              onReset={resetFilters}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export { ArticleExplorer };
