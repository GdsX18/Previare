import Link from 'next/link';
import { ArrowLeft, Feather } from 'lucide-react';

interface ArticlesEmptyStateProps {
  /** Quando há publicações, mas nenhuma corresponde ao filtro ou à busca. */
  filtered?: boolean;
  onReset?: () => void;
}

export default function ArticlesEmptyState({ filtered = false, onReset }: ArticlesEmptyStateProps) {
  return (
    <div
      role="status"
      className="mx-auto max-w-md text-center"
    >
      <Feather aria-hidden="true" className="mx-auto h-6 w-6 text-white/30" strokeWidth={1.25} />

      <h2 className="mt-6 font-serif text-2xl font-light leading-snug tracking-tight text-white/90">
        {filtered
          ? 'Nenhum artigo encontrado'
          : 'Nenhum artigo publicado ainda'}
      </h2>

      <p className="mx-auto mt-3 text-sm leading-relaxed text-white/50">
        {filtered
          ? 'Tente outros termos ou outra categoria.'
          : 'As primeiras publicações estarão disponíveis em breve.'}
      </p>

      <div className="mt-8">
        {filtered && onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm text-[#7CE577]/85 transition-colors duration-300 hover:text-[#7CE577] focus-visible:outline-none focus-visible:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        ) : (
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-[#7CE577]/85 transition-colors duration-300 hover:text-[#7CE577] focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Voltar à página inicial
          </Link>
        )}
      </div>
    </div>
  );
}

export { ArticlesEmptyState };
