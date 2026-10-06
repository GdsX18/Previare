import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SpecialistModalProvider } from "@/components/contact/SpecialistModalProvider";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const modulusFont = localFont({
  src: [
    {
      path: "../../public/fonts/Modulus-Medium.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Modulus-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Modulus-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Modulus-Bold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://previare.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Previare | Planejamento Previdenciário & Aposentadoria Estratégica",
    template: "%s | Previare",
  },
  description:
    "Consultoria especializada em planejamento previdenciário, diagnóstico de tempo de contribuição, aposentadoria especial e revisão de benefícios. Maximize seus direitos com rigor técnico e segurança jurídica.",
  keywords: [
    "planejamento previdenciário",
    "aposentadoria INSS",
    "revisão da vida toda",
    "aposentadoria especial",
    "cálculo de aposentadoria",
    "simulação previdenciária",
    "advocacia previdenciária",
    "benefício previdenciário",
    "Previare",
  ],
  authors: [{ name: "Previare Consultoria Previdenciária" }],
  creator: "Previare",
  publisher: "Previare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "Previare | Planejamento Previdenciário & Aposentadoria Estratégica",
    description:
      "Assessoria e cálculos de alta precisão para sua aposentadoria com o melhor benefício possível. Diagnóstico individualizado e transparência.",
    siteName: "Previare",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Previare - Planejamento Previdenciário Estratégico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Previare | Planejamento Previdenciário & Aposentadoria Estratégica",
    description:
      "Assessoria e cálculos de alta precisão para sua aposentadoria com o melhor benefício possível.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logos/previare-mark.svg",
    shortcut: "/images/logos/previare-mark.svg",
    apple: "/images/logos/previare-mark.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": `${siteUrl}/#organization`,
      name: "Previare",
      legalName: "Previare Planejamento Previdenciário",
      url: siteUrl,
      logo: `${siteUrl}/images/logos/previare-logo.svg`,
      image: `${siteUrl}/images/logos/previare-logo.svg`,
      description:
        "Assessoria técnica, cálculos atuariais e planejamento personalizado de aposentadorias e benefícios previdenciários no Brasil.",
      telephone: "+55-11-4000-0000",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressCountry: "BR",
      },
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
      serviceType: [
        "Planejamento Previdenciário",
        "Aposentadoria por Tempo de Contribuição",
        "Aposentadoria Especial",
        "Revisão de Benefícios",
        "Diagnóstico de CNIS e Vínculos",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Previare",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${serifFont.variable} ${modulusFont.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-transparent text-white overflow-x-hidden antialiased selection:bg-[#7CE577] selection:text-[#03120E]">
        <SpecialistModalProvider>{children}</SpecialistModalProvider>
      </body>
    </html>
  );
}

