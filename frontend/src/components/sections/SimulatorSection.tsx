'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import type { ContactSubject } from '@/lib/specialistContact';

type Mode = 'aposentadoria' | 'especial' | 'revisao' | 'amparo';

const SUBJECT_BY_MODE: Record<Mode, ContactSubject> = {
  aposentadoria: 'Planejamento Previdenciário',
  especial: 'Tempo Especial & Insalubridade (PPP)',
  revisao: 'Revisão de Aposentadoria Concedida',
  amparo: 'Benefício por Incapacidade ou BPC / LOAS',
};

// Cenários ilustrativos (hipotéticos, sem relação com clientes reais): cada cartão
// preenche o simulador para mostrar, na prática, onde a análise faz diferença.
type ScenarioId = 'engenheiro' | 'medica' | 'empresario' | 'servidor';

const SCENARIOS: { id: ScenarioId; profile: string; title: string; insight: string }[] = [
  {
    id: 'engenheiro',
    profile: 'Engenheiro, 58 anos',
    title: '5 anos de PPP não averbados',
    insight: 'Tempo especial até 13/11/2019, convertido pelo fator 1,4, pode somar cerca de 2 anos de contribuição.',
  },
  {
    id: 'medica',
    profile: 'Médica, 57 anos',
    title: 'Hospital e consultório ao mesmo tempo',
    insight: 'Contribuições simultâneas se somam até o teto (Tema 1070/STJ) e podem elevar a média do benefício.',
  },
  {
    id: 'empresario',
    profile: 'Empresário, 60 anos',
    title: 'Pró-labore baixo e meses em aberto',
    insight: 'Recolhimentos abaixo do mínimo após a Reforma só contam se forem complementados ou agrupados.',
  },
  {
    id: 'servidor',
    profile: 'Servidor público, 59 anos',
    title: 'Tempo celetista antes do concurso',
    insight: 'Averbação por CTC e contagem recíproca entre regimes exigem análise individual (RPPS).',
  },
];

export default function SimulatorSection() {
  const [mode, setMode] = useState<Mode>('aposentadoria');
  const { openSpecialistModal } = useSpecialistModal();

  // -------------------------------------------------------------
  // ESTADOS - MODO 1: APOSENTADORIA & TRANSIÇÃO (EC 103/19)
  // -------------------------------------------------------------
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [age, setAge] = useState<number>(56);
  const [contributionYears, setContributionYears] = useState<number>(32);
  const [averageSalary, setAverageSalary] = useState<number>(5400);
  const [hasSpecialTime, setHasSpecialTime] = useState<boolean>(false);
  const [specialYears, setSpecialYears] = useState<number>(6);
  const [hasPendingCnis, setHasPendingCnis] = useState<boolean>(false);
  const [pendingMonths, setPendingMonths] = useState<number>(18);

  // -------------------------------------------------------------
  // ESTADOS - MODO 2: CONVERSÃO DE TEMPO ESPECIAL
  // -------------------------------------------------------------
  const [specGender, setSpecGender] = useState<'M' | 'F'>('M');
  const [specCommonYears, setSpecCommonYears] = useState<number>(22);
  const [specExposedYears, setSpecExposedYears] = useState<number>(10);
  const [specSalary, setSpecSalary] = useState<number>(5800);

  // -------------------------------------------------------------
  // ESTADOS - MODO 3: AUDITORIA DE REVISÃO DE BENEFÍCIO
  // -------------------------------------------------------------
  const [revConcessionYear, setRevConcessionYear] = useState<number>(2020);
  const [revCurrentBenefit, setRevCurrentBenefit] = useState<number>(4300);
  const [revOmittedMonths, setRevOmittedMonths] = useState<number>(24);
  const [revType, setRevType] = useState<'cnis' | 'concomitante' | 'teto'>('cnis');

  // -------------------------------------------------------------
  // ESTADOS - MODO 4: AMPARO SOCIAL & INCAPACIDADE
  // -------------------------------------------------------------
  const [ampModalidade, setAmpModalidade] = useState<'loas_idoso' | 'loas_pcd' | 'incapacidade'>('loas_idoso');
  const [ampAge, setAmpAge] = useState<number>(66);
  const [ampPerCapita, setAmpPerCapita] = useState<number>(340);
  const [ampLastSalary, setAmpLastSalary] = useState<number>(3200);

  // Estado de feedback de exportação
  const [exportedStatus, setExportedStatus] = useState<boolean>(false);

  // Formatador de Moeda BRL
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(val);

  // Constantes Previdenciárias Oficiais Vigentes
  const INSS_CEILING = 8157.41;
  const SALARIO_MINIMO = 1518.0;

  // =============================================================
  // MOTOR ATUARIAL - MODO 1: APOSENTADORIA & TRANSIÇÃO
  // =============================================================
  const aposentadoriaCalc = useMemo(() => {
    const specialBonus = hasSpecialTime ? (gender === 'M' ? specialYears * 0.4 : specialYears * 0.2) : 0;
    const cnisBonus = hasPendingCnis ? pendingMonths / 12 : 0;
    const totalEffectiveTime = contributionYears + specialBonus + cnisBonus;

    const baseYears = gender === 'M' ? 20 : 15;
    const extraYears = Math.max(0, totalEffectiveTime - baseYears);
    const coefficient = Math.min(110, Math.round(60 + extraYears * 2));

    const validSalary = Math.min(averageSalary, INSS_CEILING);
    const immediateValue = Math.max(SALARIO_MINIMO, (validSalary * coefficient) / 100);

    const optimizedValue = Math.min(INSS_CEILING, Math.max(immediateValue * 1.18, validSalary));
    const gainPercent = Math.max(6, Math.round(((optimizedValue - immediateValue) / immediateValue) * 100));

    const currentPoints = Math.floor(age + totalEffectiveTime);
    const targetPoints = gender === 'M' ? 102 : 92;

    return {
      totalTime: totalEffectiveTime.toFixed(1),
      coefficient,
      immediateValue,
      optimizedValue,
      gainPercent,
      currentPoints,
      targetPoints,
      specialBonus: specialBonus.toFixed(1),
      cnisBonus: cnisBonus.toFixed(1),
    };
  }, [gender, age, contributionYears, averageSalary, hasSpecialTime, specialYears, hasPendingCnis, pendingMonths]);

  // =============================================================
  // MOTOR ATUARIAL - MODO 2: CONVERSÃO DE TEMPO ESPECIAL
  // =============================================================
  const especialCalc = useMemo(() => {
    const bonusFactor = specGender === 'M' ? 0.4 : 0.2;
    const addedTime = specExposedYears * bonusFactor;
    const totalWithout = specCommonYears + specExposedYears;
    const totalWith = totalWithout + addedTime;

    const baseYears = specGender === 'M' ? 20 : 15;
    const coefWithout = Math.min(100, Math.round(60 + Math.max(0, totalWithout - baseYears) * 2));
    const coefWith = Math.min(108, Math.round(60 + Math.max(0, totalWith - baseYears) * 2));

    const validSalary = Math.min(specSalary, INSS_CEILING);
    const valueWithout = Math.max(SALARIO_MINIMO, (validSalary * coefWithout) / 100);
    const valueWith = Math.max(SALARIO_MINIMO, (validSalary * coefWith) / 100);
    const monthlyGain = valueWith - valueWithout;
    const gainPercent = valueWithout > 0 ? Math.round((monthlyGain / valueWithout) * 100) : 0;

    return {
      addedTime: addedTime.toFixed(1),
      totalWithout: totalWithout.toFixed(1),
      totalWith: totalWith.toFixed(1),
      coefWithout,
      coefWith,
      valueWithout,
      valueWith,
      monthlyGain,
      gainPercent,
    };
  }, [specGender, specCommonYears, specExposedYears, specSalary]);

  // =============================================================
  // MOTOR ATUARIAL - MODO 3: AUDITORIA DE REVISÃO
  // =============================================================
  const revisaoCalc = useMemo(() => {
    const baseFactor = revType === 'teto' ? 22 : revType === 'concomitante' ? 17 : 13;
    const omittedImpact = (revOmittedMonths / 12) * 3.8;
    const totalPercentIncrease = Math.min(48, Math.round(baseFactor + omittedImpact));

    const projectedBenefit = Math.min(INSS_CEILING, revCurrentBenefit * (1 + totalPercentIncrease / 100));
    const monthlyDiff = projectedBenefit - revCurrentBenefit;

    const currentYear = 2026;
    const yearsGranted = Math.min(5, Math.max(1, currentYear - revConcessionYear));
    const totalMonthsRetro = yearsGranted * 13;
    const estimatedRetroactives = monthlyDiff * totalMonthsRetro * 1.08;

    return {
      totalPercentIncrease,
      projectedBenefit,
      monthlyDiff,
      yearsGranted,
      estimatedRetroactives,
    };
  }, [revConcessionYear, revCurrentBenefit, revOmittedMonths, revType]);

  // =============================================================
  // MOTOR ATUARIAL - MODO 4: AMPARO & INCAPACIDADE
  // =============================================================
  const amparoCalc = useMemo(() => {
    const quartoSM = SALARIO_MINIMO / 4;
    const meioSM = SALARIO_MINIMO / 2;

    if (ampModalidade === 'incapacidade') {
      const estimatedValue = Math.max(SALARIO_MINIMO, Math.min(INSS_CEILING, ampLastSalary * 0.91));
      return {
        benefitValue: estimatedValue,
        statusTitle: 'Incapacidade Laboral (Auxílio Temporário)',
        eligibilityStatus:
          'Estimativa de benefício temporário por incapacidade de ' + formatCurrency(estimatedValue) + ' por mês (91% da média de recolhimentos).',
        isOptimal: true,
        baselineValue: SALARIO_MINIMO,
      };
    }

    const isAgeEligible = ampModalidade === 'loas_idoso' ? ampAge >= 65 : true;
    let isOptimal = false;

    if (ampPerCapita <= quartoSM) {
      isOptimal = true;
    } else if (ampPerCapita <= meioSM) {
      isOptimal = true;
    } else {
      isOptimal = false;
    }

    return {
      benefitValue: SALARIO_MINIMO,
      statusTitle:
        ampModalidade === 'loas_idoso'
          ? isAgeEligible
            ? 'BPC Idoso — Idade Mínima Preenchida (65+ anos)'
            : 'Idade Inferior a 65 anos'
          : 'BPC PcD — Avaliação Biopsicossocial',
      eligibilityStatus:
        ampModalidade === 'loas_idoso'
          ? isAgeEligible
            ? 'Pelos dados informados, você pode ter direito a 1 salário mínimo mensal (R$ 1.518,00): o critério de idade mínima (65 anos) está atendido. A renda familiar é confirmada na análise.'
            : `O BPC para idosos exige 65 anos completos. Faltam ${65 - ampAge} anos para requerer.`
          : 'Pelos dados informados, você pode ter direito a 1 salário mínimo mensal (R$ 1.518,00), condicionado à avaliação médica e social do INSS.',
      isOptimal: isAgeEligible && isOptimal,
      baselineValue: quartoSM,
    };
  }, [ampModalidade, ampAge, ampPerCapita, ampLastSalary]);

  // Resumo do Dossiê para exportação
  const dossierSummary = useMemo(() => {
    if (mode === 'aposentadoria') {
      return `Simulação Aposentadoria Previare: Idade ${age} anos, Tempo ${aposentadoriaCalc.totalTime} anos, Coeficiente ${aposentadoriaCalc.coefficient}%, RMI Estimada ${formatCurrency(aposentadoriaCalc.immediateValue)}/mês, Cenário Estratégico ${formatCurrency(aposentadoriaCalc.optimizedValue)}/mês.`;
    }
    if (mode === 'especial') {
      return `Simulação Conversão Especial Previare: Tempo Especial ${specExposedYears} anos, Bônus Ficto +${especialCalc.addedTime} anos, Coeficiente saltou para ${especialCalc.coefWith}%, Ganho Mensal +${formatCurrency(especialCalc.monthlyGain)}.`;
    }
    if (mode === 'revisao') {
      return `Simulação Auditoria Revisão Previare: DIB ${revConcessionYear}, Renda Atual ${formatCurrency(revCurrentBenefit)}, Nova Renda ${formatCurrency(revisaoCalc.projectedBenefit)}, Saldo Retroativo Estimado ${formatCurrency(revisaoCalc.estimatedRetroactives)}.`;
    }
    return `Simulação Amparo/Incapacidade Previare: Modalidade ${ampModalidade}, Projeção ${formatCurrency(amparoCalc.benefitValue)}, Status: ${amparoCalc.statusTitle}.`;
  }, [mode, age, aposentadoriaCalc, specExposedYears, especialCalc, revConcessionYear, revCurrentBenefit, revisaoCalc, ampModalidade, amparoCalc]);

  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);

  const applyScenario = (id: ScenarioId) => {
    if (id === 'servidor') {
      // O simulador cobre apenas o RGPS: servidores seguem direto para o especialista
      openSpecialistModal({
        subject: 'Planejamento Previdenciário',
        message: 'Sou servidor(a) público(a) e tenho tempo de contribuição anterior ao concurso (CLT/INSS).',
        origin: 'Simulador · Cenário servidor público',
      });
      return;
    }
    setActiveScenario(id);
    if (id === 'engenheiro') {
      setMode('especial');
      setSpecGender('M');
      setSpecCommonYears(27);
      setSpecExposedYears(5);
      setSpecSalary(7800);
      return;
    }
    setMode('aposentadoria');
    setHasSpecialTime(false);
    if (id === 'medica') {
      setGender('F');
      setAge(57);
      setContributionYears(28);
      setAverageSalary(7900);
      setHasPendingCnis(false);
    } else {
      setGender('M');
      setAge(60);
      setContributionYears(30);
      setAverageSalary(3200);
      setHasPendingCnis(true);
      setPendingMonths(36);
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    setExportedStatus(true);
    navigator.clipboard?.writeText(dossierSummary);
    setTimeout(() => {
      setExportedStatus(false);
      openSpecialistModal({
        subject: SUBJECT_BY_MODE[mode],
        message: dossierSummary,
        origin: 'Simulador Atuarial · Exportar cálculo',
      });
    }, 900);
  };

  return (
    <section
      id="simulador"
      data-theme="light"
      aria-label="Simulador Atuarial e Previdenciário"
      className="relative w-full min-h-screen pt-28 sm:pt-36 pb-28 sm:pb-36 px-4 sm:px-8 md:px-12 lg:px-20 bg-[#EAF2EB] text-[#0B1A0F] flex flex-col justify-center items-center overflow-hidden scroll-mt-24 select-none"
    >
      {/* Estilos Estritos de Acessibilidade & Sliders Grandes */}
      <style jsx>{`
        /* Força tipografia de sistema limpa em todo o simulador, sem caracteres decorativos */
        .simulator-accessible-root,
        .simulator-accessible-root * {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 9999px;
          background: #e5e7eb;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #0e7c5a;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          margin-top: -9px;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.12);
          background: #0b6549;
        }
        input[type='range']::-moz-range-track {
          height: 10px;
          border-radius: 9999px;
          background: #e5e7eb;
        }
        input[type='range']::-moz-range-thumb {
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #0e7c5a;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
      `}</style>

      {/* Cabeçalho Editorial Totalmente Clean */}
      <div className="text-center max-w-3xl mb-12 sm:mb-16 z-10">
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#0B1A0F] leading-tight tracking-tight">
          Calcule seu cenário antes de tomar decisões definitivas.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#1F3325]/85 font-normal leading-relaxed max-w-xl mx-auto">
          Um modelo de cálculo matemático e preditivo para estimar coeficientes, impacto de tempo especial e retorno real sobre suas contribuições.
        </p>
      </div>

      {/* Cenários ilustrativos: atalhos que preenchem o simulador */}
      <div className="w-full max-w-5xl mb-8 sm:mb-10 z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <h3 className="font-sans text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-[#2F7335]">
            Situações que encontramos com frequência
          </h3>
          <p className="text-sm text-[#1F3325]/75">Toque em um cenário para preencher o simulador.</p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((scenario) => {
            const isActive = activeScenario === scenario.id;
            return (
              <li key={scenario.id} className="flex">
                <button
                  type="button"
                  onClick={() => applyScenario(scenario.id)}
                  aria-pressed={scenario.id === 'servidor' ? undefined : isActive}
                  {...(scenario.id === 'servidor' ? { 'data-specialist-cta': true } : {})}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAF2EB] ${
                    isActive
                      ? 'border-[#0E7C5A] bg-white shadow-md'
                      : 'border-[#2F7335]/15 bg-white/60 hover:bg-white hover:border-[#2F7335]/40'
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#0E7C5A]">
                    {scenario.profile}
                  </span>
                  <span className="mt-2 block font-serif text-xl font-light leading-snug text-[#0B1A0F]">
                    {scenario.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#1F3325]/85">{scenario.insight}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E7C5A]">
                    {scenario.id === 'servidor' ? 'Falar com especialista' : 'Simular este cenário'}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-[#1F3325]/70">
          Cenários ilustrativos e hipotéticos. Não representam clientes reais nem promessa de resultado.
        </p>
      </div>

      {/* Janela Central Estilo MacBook App com Alta Acessibilidade */}
      <div className="w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white/95 border border-neutral-200/80 shadow-2xl p-6 sm:p-10 tracking-normal select-none simulator-accessible-root">
        {/* macOS Title Bar Acessível */}
        <div className="px-5 py-3.5 border-b border-neutral-200 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-6 sm:mb-8 flex items-center bg-neutral-50/90 rounded-t-2xl sm:rounded-t-3xl select-none">
          {/* Três botões clássicos macOS */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] inline-block border border-black/10" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] inline-block border border-black/10" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] inline-block border border-black/10" />
          </div>
        </div>

        {/* Botões de Modo (Abas do Topo) com Alta Área de Toque & Contraste */}
        <div className="p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200 mb-8 sm:mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'aposentadoria', label: 'Aposentadoria & Regras' },
              { id: 'especial', label: 'Tempo Especial' },
              { id: 'revisao', label: 'Auditoria de Revisão' },
              { id: 'amparo', label: 'BPC & Incapacidade' },
            ].map((tab) => {
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id as Mode);
                    setActiveScenario(null);
                  }}
                  className={`py-3.5 px-4 text-sm sm:text-base font-semibold rounded-xl transition-all text-center flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                    isActive
                      ? 'bg-[#0E7C5A] text-white shadow-md'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Principal Dividido em 2 Painéis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ============================================================ */}
          {/* PAINEL ESQUERDO: CONTROLES E ENTRADAS INTERATIVAS (7 cols)    */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-7">
            <AnimatePresence mode="wait">
              {/* MODO 1: APOSENTADORIA & REGRAS */}
              {mode === 'aposentadoria' && (
                <motion.div
                  key="mode-aposentadoria"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Seletor de Gênero Legal em Cards Grandes */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-[#0B1A0F]">Gênero Legal</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('M')}
                        className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                          gender === 'M'
                            ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-sm sm:text-base font-semibold">Masculino</p>
                        <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">Base de 20 anos contributivos</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('F')}
                        className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                          gender === 'F'
                            ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-sm sm:text-base font-semibold">Feminino</p>
                        <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">Base de 15 anos contributivos</p>
                      </button>
                    </div>
                  </div>

                  {/* Slider com Botões Stepper: Idade Atual */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Sua Idade Atual</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {age} anos
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAge(Math.max(25, age - 1))}
                        disabled={age <= 25}
                        aria-label="Diminuir idade em 1 ano"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="25"
                        max="75"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setAge(Math.min(75, age + 1))}
                        disabled={age >= 75}
                        aria-label="Aumentar idade em 1 ano"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>Mínimo: 25 anos</span>
                      <span>Máximo: 75 anos</span>
                    </div>
                  </div>

                  {/* Slider com Botões Stepper: Tempo de Contribuição */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Tempo Contributivo Atual</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {contributionYears} anos
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setContributionYears(Math.max(5, contributionYears - 1))}
                        disabled={contributionYears <= 5}
                        aria-label="Diminuir tempo em 1 ano"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="5"
                        max="45"
                        value={contributionYears}
                        onChange={(e) => setContributionYears(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setContributionYears(Math.min(45, contributionYears + 1))}
                        disabled={contributionYears >= 45}
                        aria-label="Aumentar tempo em 1 ano"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>Mínimo: 5 anos</span>
                      <span>Máximo: 45 anos</span>
                    </div>
                  </div>

                  {/* Slider com Botões Stepper: Média Salarial Bruta */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Média Salarial Histórica</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {formatCurrency(averageSalary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAverageSalary(Math.max(1518, averageSalary - 100))}
                        disabled={averageSalary <= 1518}
                        aria-label="Diminuir salário em 100 reais"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1518"
                        max="8157"
                        step="50"
                        value={averageSalary}
                        onChange={(e) => setAverageSalary(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setAverageSalary(Math.min(8157, averageSalary + 100))}
                        disabled={averageSalary >= 8157}
                        aria-label="Aumentar salário em 100 reais"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>Piso Nacional: R$ 1.518</span>
                      <span>Teto INSS: R$ 8.157</span>
                    </div>
                  </div>

                  {/* Toggles Estilo iOS Grandes */}
                  <div className="pt-4 border-t border-neutral-200 space-y-5">
                    {/* Toggle: Tempo Especial */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-[#0B1A0F]">
                          Trabalhou com insalubridade ou periculosidade?
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                          Atividades com laudo (PPP/LTCAT) antes de Novembro/2019
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHasSpecialTime(!hasSpecialTime)}
                        aria-pressed={hasSpecialTime}
                        className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 ${
                          hasSpecialTime ? 'bg-[#0E7C5A]' : 'bg-neutral-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                            hasSpecialTime ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {hasSpecialTime && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col gap-2.5 pl-4 sm:pl-5 border-l-4 border-[#0E7C5A]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-[#0E7C5A]">Anos em Atividade Especial</span>
                          <span className="text-sm sm:text-base font-bold text-[#0B1A0F] bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
                            {specialYears} anos (+{gender === 'M' ? (specialYears * 0.4).toFixed(1) : (specialYears * 0.2).toFixed(1)} anos bônus)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSpecialYears(Math.max(1, specialYears - 1))}
                            disabled={specialYears <= 1}
                            aria-label="Diminuir anos especiais"
                            className="w-9 h-9 shrink-0 rounded-lg bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            min="1"
                            max="25"
                            value={specialYears}
                            onChange={(e) => setSpecialYears(Number(e.target.value))}
                            className="w-full h-2.5 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setSpecialYears(Math.min(25, specialYears + 1))}
                            disabled={specialYears >= 25}
                            aria-label="Aumentar anos especiais"
                            className="w-9 h-9 shrink-0 rounded-lg bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Toggle: Períodos CNIS Pendentes */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-[#0B1A0F]">
                          Possui vínculos informais ou pendências no CNIS?
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                          Períodos sem recolhimento regularizáveis via averbação probatória
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHasPendingCnis(!hasPendingCnis)}
                        aria-pressed={hasPendingCnis}
                        className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 ${
                          hasPendingCnis ? 'bg-[#0E7C5A]' : 'bg-neutral-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                            hasPendingCnis ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {hasPendingCnis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col gap-2.5 pl-4 sm:pl-5 border-l-4 border-[#0E7C5A]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-[#0E7C5A]">Meses Recuperáveis no CNIS</span>
                          <span className="text-sm sm:text-base font-bold text-[#0B1A0F] bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
                            {pendingMonths} meses (+{(pendingMonths / 12).toFixed(1)} anos)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPendingMonths(Math.max(6, pendingMonths - 6))}
                            disabled={pendingMonths <= 6}
                            aria-label="Diminuir meses no CNIS"
                            className="w-9 h-9 shrink-0 rounded-lg bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            min="6"
                            max="48"
                            step="6"
                            value={pendingMonths}
                            onChange={(e) => setPendingMonths(Number(e.target.value))}
                            className="w-full h-2.5 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setPendingMonths(Math.min(48, pendingMonths + 6))}
                            disabled={pendingMonths >= 48}
                            aria-label="Aumentar meses no CNIS"
                            className="w-9 h-9 shrink-0 rounded-lg bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODO 2: CONVERSÃO DE TEMPO ESPECIAL */}
              {mode === 'especial' && (
                <motion.div
                  key="mode-especial"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-[#0B1A0F]">Gênero do Segurado</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSpecGender('M')}
                        className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                          specGender === 'M'
                            ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-sm sm:text-base font-semibold">Homem</p>
                        <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">Fator 1.40x (+40% de tempo ganho)</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpecGender('F')}
                        className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                          specGender === 'F'
                            ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <p className="text-sm sm:text-base font-semibold">Mulher</p>
                        <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">Fator 1.20x (+20% de tempo ganho)</p>
                      </button>
                    </div>
                  </div>

                  {/* Anos de Exposição Especial */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Tempo Especial Até Nov/2019</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {specExposedYears} anos expostos
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSpecExposedYears(Math.max(1, specExposedYears - 1))}
                        disabled={specExposedYears <= 1}
                        aria-label="Diminuir tempo especial"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        value={specExposedYears}
                        onChange={(e) => setSpecExposedYears(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecExposedYears(Math.min(25, specExposedYears + 1))}
                        disabled={specExposedYears >= 25}
                        aria-label="Aumentar tempo especial"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>Mínimo: 1 ano</span>
                      <span>Máximo: 25 anos</span>
                    </div>
                  </div>

                  {/* Tempo Comum Adicional */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Tempo Comum Contribuído</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {specCommonYears} anos comuns
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSpecCommonYears(Math.max(1, specCommonYears - 1))}
                        disabled={specCommonYears <= 1}
                        aria-label="Diminuir tempo comum"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="35"
                        value={specCommonYears}
                        onChange={(e) => setSpecCommonYears(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecCommonYears(Math.min(35, specCommonYears + 1))}
                        disabled={specCommonYears >= 35}
                        aria-label="Aumentar tempo comum"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 active:scale-95 text-neutral-800 hover:text-[#0E7C5A] border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Média Salarial */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Média Salarial Histórica</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {formatCurrency(specSalary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSpecSalary(Math.max(1518, specSalary - 100))}
                        disabled={specSalary <= 1518}
                        aria-label="Diminuir média salarial"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1518"
                        max="8157"
                        step="50"
                        value={specSalary}
                        onChange={(e) => setSpecSalary(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecSalary(Math.min(8157, specSalary + 100))}
                        disabled={specSalary >= 8157}
                        aria-label="Aumentar média salarial"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 space-y-1">
                    <div className="flex items-center gap-2 text-[#0E7C5A] font-semibold text-sm">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <span>Artigo 70 do Decreto 3.048/99 e Tema 545 STJ</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      A conversão do tempo trabalhado em condições insalubres até 13/11/2019 é direito adquirido protegido pela Constituição.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* MODO 3: AUDITORIA DE REVISÃO */}
              {mode === 'revisao' && (
                <motion.div
                  key="mode-revisao"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Seletor de Tese em Cards Grandes */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-[#0B1A0F]">Tese de Revisão</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'cnis', title: 'Averbação CNIS', desc: 'Salários e Vínculos omitidos' },
                        { id: 'concomitante', title: 'Concomitância', desc: 'Dois empregos simultâneos' },
                        { id: 'teto', title: 'Readequação', desc: 'Tetos das EC 20 e 41' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setRevType(t.id as typeof revType)}
                          className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                            revType === t.id
                              ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                          }`}
                        >
                          <p className="text-base font-semibold text-[#0B1A0F]">{t.title}</p>
                          <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ano de Concessão (DIB) */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Ano de Início do Benefício</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        Ano {revConcessionYear}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRevConcessionYear(Math.max(2016, revConcessionYear - 1))}
                        disabled={revConcessionYear <= 2016}
                        aria-label="Diminuir ano de início"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="2016"
                        max="2025"
                        value={revConcessionYear}
                        onChange={(e) => setRevConcessionYear(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setRevConcessionYear(Math.min(2025, revConcessionYear + 1))}
                        disabled={revConcessionYear >= 2025}
                        aria-label="Aumentar ano de início"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                      <span>2016 (Limite de 5 anos de atrasados)</span>
                      <span>2025</span>
                    </div>
                  </div>

                  {/* Valor Atual Recebido */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Valor Atual Recebido em Folha</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {formatCurrency(revCurrentBenefit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRevCurrentBenefit(Math.max(1518, revCurrentBenefit - 100))}
                        disabled={revCurrentBenefit <= 1518}
                        aria-label="Diminuir valor atual"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="1518"
                        max="8157"
                        step="50"
                        value={revCurrentBenefit}
                        onChange={(e) => setRevCurrentBenefit(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setRevCurrentBenefit(Math.min(8157, revCurrentBenefit + 100))}
                        disabled={revCurrentBenefit >= 8157}
                        aria-label="Aumentar valor atual"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Meses omitidos */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Meses Omitidos pelo INSS</span>
                      <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {revOmittedMonths} meses desconsiderados
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRevOmittedMonths(Math.max(0, revOmittedMonths - 6))}
                        disabled={revOmittedMonths <= 0}
                        aria-label="Diminuir meses omitidos"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        step="6"
                        value={revOmittedMonths}
                        onChange={(e) => setRevOmittedMonths(Number(e.target.value))}
                        className="w-full h-3 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setRevOmittedMonths(Math.min(60, revOmittedMonths + 6))}
                        disabled={revOmittedMonths >= 60}
                        aria-label="Aumentar meses omitidos"
                        className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MODO 4: BPC / BENEFÍCIOS */}
              {mode === 'amparo' && (
                <motion.div
                  key="mode-amparo"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-[#0B1A0F]">Modalidade de Benefício</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'loas_idoso', title: 'BPC Idoso', desc: 'Para quem tem 65 anos ou mais' },
                        { id: 'loas_pcd', title: 'BPC PcD', desc: 'Pessoa com Deficiência' },
                        { id: 'incapacidade', title: 'Incapacidade', desc: 'Auxílio por incapacidade temporária' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAmpModalidade(item.id as typeof ampModalidade)}
                          className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] ${
                            ampModalidade === item.id
                              ? 'border-[#0E7C5A] bg-[#0E7C5A]/10 text-[#0B1A0F] shadow-sm'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                          }`}
                        >
                          <p className="text-base font-semibold text-[#0B1A0F]">{item.title}</p>
                          <p className="text-xs text-[#1F3325]/75 mt-0.5 font-normal">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {ampModalidade === 'loas_idoso' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Idade do Requerente</span>
                        <span
                          className={`text-base sm:text-lg font-bold px-3 py-1 rounded-lg border shadow-2xs ${
                            ampAge >= 65
                              ? 'text-[#0E7C5A] border-neutral-200 bg-neutral-50'
                              : 'text-amber-800 border-amber-300 bg-amber-50'
                          }`}
                        >
                          {ampAge} anos {ampAge < 65 && '(Mínimo exigido: 65 anos)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAmpAge(Math.max(55, ampAge - 1))}
                          disabled={ampAge <= 55}
                          aria-label="Diminuir idade"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="55"
                          max="85"
                          value={ampAge}
                          onChange={(e) => setAmpAge(Number(e.target.value))}
                          className="w-full h-3 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAmpAge(Math.min(85, ampAge + 1))}
                          disabled={ampAge >= 85}
                          aria-label="Aumentar idade"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {ampModalidade !== 'incapacidade' ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Renda por Pessoa da Família</span>
                        <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                          {formatCurrency(ampPerCapita)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAmpPerCapita(Math.max(0, ampPerCapita - 20))}
                          disabled={ampPerCapita <= 0}
                          aria-label="Diminuir renda por pessoa"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1200"
                          step="20"
                          value={ampPerCapita}
                          onChange={(e) => setAmpPerCapita(Number(e.target.value))}
                          className="w-full h-3 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAmpPerCapita(Math.min(1200, ampPerCapita + 20))}
                          disabled={ampPerCapita >= 1200}
                          aria-label="Aumentar renda por pessoa"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500 font-medium px-1">
                        <span>R$ 0,00</span>
                        <span>1/4 do salário mínimo (R$ 379,50)</span>
                        <span>1/2 SM (R$ 759,00)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-semibold text-[#0B1A0F]">Média dos 12 Últimos Salários</span>
                        <span className="text-base sm:text-lg font-bold text-[#0E7C5A] bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                          {formatCurrency(ampLastSalary)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAmpLastSalary(Math.max(1518, ampLastSalary - 100))}
                          disabled={ampLastSalary <= 1518}
                          aria-label="Diminuir média salarial"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="1518"
                          max="8157"
                          step="50"
                          value={ampLastSalary}
                          onChange={(e) => setAmpLastSalary(Number(e.target.value))}
                          className="w-full h-3 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAmpLastSalary(Math.min(8157, ampLastSalary + 100))}
                          disabled={ampLastSalary >= 8157}
                          aria-label="Aumentar média salarial"
                          className="w-10 h-10 shrink-0 rounded-xl bg-neutral-100 hover:bg-[#0E7C5A]/15 text-neutral-800 border border-neutral-300 flex items-center justify-center font-bold text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rodapé informativo discreto do painel esquerdo */}
            <div className="text-xs text-neutral-600 flex items-center gap-2 pt-3 border-t border-neutral-200">
              <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>Cálculos baseados na Emenda Constitucional 103 e Portarias Oficiais do Ministério da Previdência.</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PAINEL DIREITO: DASHBOARD DE RESULTADOS (5 cols)             */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-neutral-50/90 border border-neutral-200 p-6 sm:p-8 relative overflow-hidden shadow-xs">
            <div className="space-y-6 relative z-10">
              {/* Valor Mensal em Grande Destaque */}
              <div>
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#0E7C5A] uppercase block">
                  {mode === 'aposentadoria' && 'Renda Mensal Estimada'}
                  {mode === 'especial' && 'Renda Mensal com Conversão'}
                  {mode === 'revisao' && 'Nova Renda Projetada'}
                  {mode === 'amparo' && 'Benefício Mensal Estimado'}
                </span>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-[#0E7C5A] tracking-tight leading-none">
                    {mode === 'aposentadoria' && formatCurrency(aposentadoriaCalc.immediateValue)}
                    {mode === 'especial' && formatCurrency(especialCalc.valueWith)}
                    {mode === 'revisao' && formatCurrency(revisaoCalc.projectedBenefit)}
                    {mode === 'amparo' && formatCurrency(amparoCalc.benefitValue)}
                  </span>
                  <span className="text-sm font-semibold text-neutral-600">/ mês</span>
                </div>
              </div>

              {/* Gráfico Comparativo de Fácil Leitura */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-neutral-700 font-semibold">Comparativo de Ganho</span>
                  <span className="text-[#0E7C5A] font-bold">
                    {mode === 'aposentadoria' && `+${aposentadoriaCalc.gainPercent}% no cenário ótimo`}
                    {mode === 'especial' && `+${especialCalc.gainPercent}% ganho mensal`}
                    {mode === 'revisao' && `+${revisaoCalc.totalPercentIncrease}% de aumento`}
                    {mode === 'amparo' && (amparoCalc.isOptimal ? 'Indícios de Enquadramento' : 'Requer Análise')}
                  </span>
                </div>

                {/* Barras Comparativas */}
                <div className="space-y-2">
                  {/* Cenário Base */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-600 font-medium mb-1">
                      <span>{mode === 'revisao' ? 'Valor Atual sem Revisão' : mode === 'especial' ? 'Sem Conversão Especial' : 'Requerimento Imediato'}</span>
                      <span className="font-semibold">
                        {mode === 'aposentadoria' && formatCurrency(aposentadoriaCalc.immediateValue)}
                        {mode === 'especial' && formatCurrency(especialCalc.valueWithout)}
                        {mode === 'revisao' && formatCurrency(revCurrentBenefit)}
                        {mode === 'amparo' && formatCurrency(amparoCalc.baselineValue)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            mode === 'aposentadoria'
                              ? Math.max(35, Math.min(85, (aposentadoriaCalc.immediateValue / aposentadoriaCalc.optimizedValue) * 100))
                              : mode === 'especial'
                              ? Math.max(35, Math.min(85, (especialCalc.valueWithout / especialCalc.valueWith) * 100))
                              : mode === 'revisao'
                              ? Math.max(35, Math.min(80, (revCurrentBenefit / revisaoCalc.projectedBenefit) * 100))
                              : 50
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cenário Otimizado */}
                  <div>
                    <div className="flex justify-between text-xs text-[#0E7C5A] font-bold mb-1">
                      <span>{mode === 'revisao' ? 'Cenário Após Revisão' : mode === 'especial' ? 'Com Conversão de Tempo Especial' : 'Cenário Estratégico Otimizado'}</span>
                      <span>
                        {mode === 'aposentadoria' && formatCurrency(aposentadoriaCalc.optimizedValue)}
                        {mode === 'especial' && formatCurrency(especialCalc.valueWith)}
                        {mode === 'revisao' && formatCurrency(revisaoCalc.projectedBenefit)}
                        {mode === 'amparo' && formatCurrency(amparoCalc.benefitValue)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0E7C5A] rounded-full transition-all duration-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicadores Rápidos em Cards Grandes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {mode === 'aposentadoria' && (
                  <>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Porcentagem Legal</p>
                      <p className="text-xl font-bold text-[#0B1A0F] mt-1">
                        {aposentadoriaCalc.coefficient}%
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Tempo Total</p>
                      <p className="text-xl font-bold text-[#0E7C5A] mt-1">
                        {aposentadoriaCalc.totalTime} anos
                      </p>
                    </div>
                  </>
                )}

                {mode === 'especial' && (
                  <>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Tempo Adicional</p>
                      <p className="text-xl font-bold text-[#0E7C5A] mt-1">
                        +{especialCalc.addedTime} anos
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Aumento Mensal</p>
                      <p className="text-xl font-bold text-[#0B1A0F] mt-1">
                        +{formatCurrency(especialCalc.monthlyGain)}
                      </p>
                    </div>
                  </>
                )}

                {mode === 'revisao' && (
                  <>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Aumento Mensal</p>
                      <p className="text-xl font-bold text-[#0E7C5A] mt-1">
                        +{formatCurrency(revisaoCalc.monthlyDiff)}
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Atrasados (5 Anos)</p>
                      <p className="text-xl font-bold text-[#0E7C5A] mt-1">
                        ~{formatCurrency(revisaoCalc.estimatedRetroactives)}
                      </p>
                    </div>
                  </>
                )}

                {mode === 'amparo' && (
                  <>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Piso Nacional</p>
                      <p className="text-xl font-bold text-[#0B1A0F] mt-1">
                        {formatCurrency(SALARIO_MINIMO)}
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <p className="text-xs uppercase text-neutral-600 font-semibold tracking-wide">Critério de Renda</p>
                      <p className={`text-sm font-bold mt-1 ${amparoCalc.isOptimal ? 'text-[#0E7C5A]' : 'text-amber-800'}`}>
                        {ampPerCapita <= SALARIO_MINIMO / 4 ? '1/4 SM (Atendido)' : 'Flexibilizado (Via Judicial)'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Explicação Clara e Humana */}
              <div className="bg-white border-2 border-neutral-200 p-4 rounded-xl flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[#0E7C5A] shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                  {mode === 'aposentadoria' && (
                    <>
                      Com os dados informados, sua renda mensal estimada é de <strong>{formatCurrency(aposentadoriaCalc.immediateValue)}</strong>. Aguardar a regra com 100% da média pode elevar seu benefício para <strong>{formatCurrency(aposentadoriaCalc.optimizedValue)} por mês</strong>.
                    </>
                  )}
                  {mode === 'especial' && (
                    <>
                      A conversão do tempo especial adiciona <strong>+{especialCalc.addedTime} anos adicionais</strong> ao seu histórico, gerando um ganho de <strong>+{formatCurrency(especialCalc.monthlyGain)} por mês</strong> e antecipando sua aposentadoria.
                    </>
                  )}
                  {mode === 'revisao' && (
                    <>
                      A revisão do seu cálculo pode aumentar seu benefício em <strong>+{formatCurrency(revisaoCalc.monthlyDiff)} por mês</strong> ({revisaoCalc.totalPercentIncrease}% de aumento) e gerar cerca de <strong>{formatCurrency(revisaoCalc.estimatedRetroactives)} em atrasados</strong> dos últimos 5 anos, se a revisão for reconhecida.
                    </>
                  )}
                  {mode === 'amparo' && (
                    <>
                      {amparoCalc.eligibilityStatus}
                    </>
                  )}
                </p>
              </div>

              {/* A lacuna que só a auditoria revela: ponte entre a estimativa e o atendimento */}
              <p className="text-sm text-neutral-700 leading-relaxed">
                <strong className="text-[#0B1A0F]">Este número parte só do que você informou.</strong> Vínculos que não
                aparecem no CNIS, períodos especiais não reconhecidos e salários fora do cálculo só são encontrados na
                análise do seu histórico completo — e podem mudar este resultado.
              </p>
            </div>

            {/* Botão Final Amplo e Acessível */}
            <div className="pt-6 mt-6 border-t border-neutral-200 relative z-10">
              <button
                type="button"
                onClick={handleExport}
                data-specialist-cta
                className="w-full py-4 px-6 text-base font-semibold text-white bg-[#0E7C5A] hover:bg-[#0B6549] rounded-xl flex items-center justify-center gap-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:ring-offset-2 cursor-pointer active:scale-[0.99] text-center"
              >
                <span>
                  {exportedStatus ? 'Abrindo atendimento com o seu cálculo...' : 'Quero que um especialista confira este cálculo'}
                </span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
              <p className="flex items-start justify-center gap-2 text-sm text-center text-neutral-600 mt-3 font-medium">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#0E7C5A]" aria-hidden="true" />
                <span>Seus dados ficam sob sigilo profissional e não são compartilhados com terceiros.</span>
              </p>
              <p className="text-xs text-center text-neutral-500 mt-2 leading-relaxed">
                Estimativa ilustrativa com regras simplificadas da EC 103/2019. Não é cálculo oficial nem promessa de
                resultado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { SimulatorSection };
