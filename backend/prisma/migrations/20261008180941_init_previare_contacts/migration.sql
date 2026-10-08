-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'IN_ANALYSIS', 'CONTACTED', 'SCHEDULED', 'CONVERTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('PLANEJAMENTO_PREVIDENCIARIO', 'APOSENTADORIA_TEMPO_CONTRIBUICAO', 'APOSENTADORIA_IDADE', 'APOSENTADORIA_ESPECIAL', 'REVISAO_BENEFICIO', 'DIAGNOSTICO_CNIS', 'AUXILIO_INCAPACIDADE', 'OUTRO');

-- CreateTable
CREATE TABLE "previare_contacts" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tipoBeneficio" "BenefitType" NOT NULL DEFAULT 'PLANEJAMENTO_PREVIDENCIARIO',
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "tempoContribuicaoAnos" INTEGER,
    "mensagem" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'landing-page',
    "origemDetalhe" TEXT,
    "assunto" TEXT,
    "momentoProfissional" TEXT,
    "servicosInteresse" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "comoConheceu" TEXT,
    "desejaAgendamento" BOOLEAN NOT NULL DEFAULT false,
    "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
    "ipOrigem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "previare_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "previare_contacts_email_idx" ON "previare_contacts"("email");

-- CreateIndex
CREATE INDEX "previare_contacts_status_idx" ON "previare_contacts"("status");

-- CreateIndex
CREATE INDEX "previare_contacts_origem_idx" ON "previare_contacts"("origem");

-- CreateIndex
CREATE INDEX "previare_contacts_createdAt_idx" ON "previare_contacts"("createdAt");
