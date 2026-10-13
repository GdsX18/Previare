import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleExplorer from '@/components/blog/ArticleExplorer';
import NewsletterBriefing from '@/components/blog/NewsletterBriefing';
import { getArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Artigos, jurisprudência e inteligência para o planejamento previdenciário e patrimonial.',
  alternates: { canonical: '/blog' },
  openGraph: {
    url: '/blog',
    title: 'Blog | Previare',
    description:
      'Artigos, jurisprudência e inteligência para o planejamento previdenciário e patrimonial.',
  },
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="relative min-h-[100dvh] bg-[#020B07] text-white">
      <Navbar />

      <main id="main-content" className="relative z-10">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-[#05180F] to-[#020B07] px-5 pb-12 pt-40 text-center sm:px-10 sm:pt-48 md:pb-16 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(14,124,90,0.16)_0%,transparent_65%)] blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl">
            <h1 className="font-serif font-light leading-none tracking-tight text-white text-[clamp(3.25rem,9vw,6.5rem)]">
              Blog
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-[clamp(1rem,1.6vw,1.25rem)] font-light leading-relaxed text-white/60">
              Artigos, jurisprudência e inteligência para o planejamento do seu patrimônio.
            </p>
          </div>
        </header>

        <ArticleExplorer articles={articles} />

        <NewsletterBriefing />

        <Footer />
      </main>
    </div>
  );
}
