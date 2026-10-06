# Previare — Plataforma de Planejamento Previdenciário & Aposentadoria Estratégica

Plataforma corporativa fullstack da marca **Previare**, especializada em planejamento previdenciário, auditoria de vínculos no extrato CNIS, aposentadoria especial e revisão de benefícios.

---

## 🏛️ Diretrizes de Design & Benchmark
- **Marca:** Previare
- **Referência de Conteúdo / Negócio:** `PrevFacil.com.br` (benchmark para estrutura de serviços, tom consultivo técnico, simplificação de regras previdenciárias e rigor atuarial).
- **Referência Visual / UI:** `iwcglobal.net` (estética editorial corporativa premium, tipografia refinada com serifas de alto contraste, grids estruturados, generoso respiro de espaço negativo e microinterações de scroll).
- **Paleta de Cores Oficial:**
  - `brand-light`: `#6FB370`
  - `brand-medium`: `#5FA361`
  - `brand-base`: `#4F9352`
  - `brand-dark`: `#3F8344`
  - `brand-deep`: `#2F7335`
  - `neutral-offwhite`: `#F9FAF9` / `#F4F6F4`
  - `neutral-graphite`: `#0D150E` / `#121A13`

---

## 📂 Arquitetura do Repositório

```text
previare/
├── docker-compose.yml         # Orquestração de containers (PostgreSQL, NestJS, Next.js)
├── .gitignore                 # Regras globais de exclusão do Git
├── .env.example               # Template centralizado de variáveis de ambiente
├── README.md                  # Documentação técnica do projeto
├── frontend/                  # Aplicação Next.js (App Router, Tailwind, GSAP, Framer Motion)
│   ├── .env.example
│   ├── next.config.ts         # Hardening de segurança (CSP, HSTS, X-Frame-Options)
│   ├── tailwind.config.ts     # Configuração de temas e cores da Previare
│   ├── public/images/logos/   # Vetores oficiais da marca (SVG)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx     # Tipografia editorial, SEO dinâmico e Schema.org JSON-LD
│       │   ├── page.tsx       # Landing page (Header + Hero Section)
│       │   ├── sitemap.ts     # Gerador de sitemap dinâmico
│       │   ├── robots.ts      # Controle de indexação
│       │   └── api/health/    # Health check do frontend
│       ├── components/
│       │   ├── layout/Header.tsx
│       │   └── sections/HeroSection.tsx
│       └── lib/
│           ├── utils.ts       # Helper cn (clsx + tailwind-merge)
│           └── gsap.ts        # Registro e setup SSR-safe do GSAP e ScrollTrigger
└── backend/                   # API NestJS (TypeScript estrito, Prisma ORM, Terminus)
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma      # Entidade PreviareContact / Lead e enums
    └── src/
        ├── main.ts            # Helmet, CORS estrito, ValidationPipe e prefixo /api
        ├── app.module.ts      # ConfigModule, ThrottlerModule, Prisma, Health, Leads
        ├── config/            # Validação tipada de variáveis de ambiente
        ├── prisma/            # Serviço e ciclo de vida do Prisma Client
        ├── health/            # Observabilidade (GET /api/health) com PostgreSQL e memória
        └── leads/             # Endpoint e serviço para recebimento de solicitações
```

---

## 🚀 Inicialização Rápida

### 1. Pré-requisitos
- **Node.js**: v20+ ou v24+
- **npm**: v10+ ou v11+
- **Docker & Docker Compose** (para banco de dados PostgreSQL e ambiente conteinerizado)

### 2. Configurar Variáveis de Ambiente
Copie os arquivos de exemplo para seus respectivos ambientes:
```bash
# Na raiz
cp .env.example .env

# No frontend
cp frontend/.env.example frontend/.env.local

# No backend
cp backend/.env.example backend/.env
```

### 3. Subir Banco de Dados via Docker
```bash
docker compose up -d postgres
```

### 4. Executar Migrações do Prisma no Backend
```bash
cd backend
npm install
npx prisma generate
# Para aplicar migrações no banco ativo:
# npx prisma migrate dev --name init
```

### 5. Iniciar Backend em Desenvolvimento
```bash
cd backend
npm run start:dev
# A API estará ativa em http://localhost:3001
# Health check disponível em http://localhost:3001/api/health
```

### 6. Iniciar Frontend em Desenvolvimento
```bash
cd frontend
npm install
npm run dev
# O portal estará disponível em http://localhost:3000
```

---

## 🔒 Segurança, Hardening & SEO Implementados

1. **Cabeçalhos HTTP Seguros:**
   - Next.js configurado com `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
   - NestJS configurado globalmente com `helmet()`.
2. **CORS Restrito:**
   - NestJS autoriza exclusivamente o domínio do frontend configurado em `FRONTEND_URL`.
3. **Rate Limiting & Anti-Spam:**
   - `@nestjs/throttler` aplicado globalmente com limite estrito de requisições por IP na rota de leads.
4. **Sanitização de Entradas:**
   - `ValidationPipe` ativado com `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
5. **SEO & Indexação Estruturada:**
   - Metadados completos com OpenGraph e Twitter Cards.
   - `sitemap.ts` dinâmico e `robots.ts` liberando indexação pública para `/` e bloqueando `/api/`.
   - Schema.org estruturado em JSON-LD (`FinancialService` e `WebSite`).

---

## 📊 Endpoints Principais da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Relatório de integridade do sistema (PostgreSQL + uso de memória heap/rss) |
| `POST` | `/api/leads` | Cadastro de solicitação de diagnóstico preliminar de aposentadoria |
| `GET` | `/api/leads` | Listagem administrativa de contatos recebidos |

---

## 🎨 Próximos Passos de Desenvolvimento
1. **Hero Section Avançada:** Interações de scroll com pinning via GSAP ScrollTrigger.
2. **Calculadora Interativa de Transição:** Simulador comparativo de regras da EC 103/2019.
3. **Seção de Auditoria de CNIS:** Interface demonstrando resolução de pendências e retificação de vínculos.
