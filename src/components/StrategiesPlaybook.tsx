import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Target,
  Sparkles,
  Globe,
  ExternalLink,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react';
import { TRADING_STRATEGIES, FINANCIAL_WEB_SOURCES, StrategyPlaybook } from '../lib/strategiesData';
import { AppLanguage } from '../types/trading';

interface StrategiesPlaybookProps {
  language?: AppLanguage;
  onUseStrategyForEntry?: (asset: string, strategy: StrategyPlaybook) => void;
}

export const StrategiesPlaybook: React.FC<StrategiesPlaybookProps> = ({
  language = 'es',
  onUseStrategyForEntry,
}) => {
  const isEn = language === 'en';
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(TRADING_STRATEGIES[0].id);
  const [activeWebCategory, setActiveWebCategory] = useState<string>('ALL');

  const activeStrategy =
    TRADING_STRATEGIES.find((s) => s.id === selectedStrategyId) || TRADING_STRATEGIES[0];

  const webCategories = [
    { id: 'ALL', labelEs: 'Todas las Webs (19)', labelEn: 'All Websites (19)' },
    { id: 'macro', labelEs: 'Macro & Flujo en Vivo', labelEn: 'Macro & Live Flow' },
    { id: 'calendar', labelEs: 'Calendario Carpeta Roja', labelEn: 'Red-Folder Calendar' },
    { id: 'central_banks', labelEs: 'Tasas Fed & Bonos', labelEn: 'Fed Rates & Bonds' },
    { id: 'indices', labelEs: 'Índices CFD & Wall St', labelEn: 'CFD Indices & Wall St' },
    { id: 'quant', labelEs: 'Mapas de Calor & COT', labelEn: 'Heatmaps & COT' },
    { id: 'commodities', labelEs: 'Oro & Metales (XAUUSD)', labelEn: 'Gold & Metals (XAUUSD)' },
  ];

  const filteredWebs =
    activeWebCategory === 'ALL'
      ? FINANCIAL_WEB_SOURCES
      : FINANCIAL_WEB_SOURCES.filter((w) => w.category === activeWebCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                {isEn
                  ? 'Institutional Trading Strategies & Playbooks'
                  : 'Apartado de Estrategias Operativas & Playbooks Institucionales'}
              </h2>
              <p className="text-xs text-amber-200/70 mt-0.5">
                {isEn
                  ? 'Complete step-by-step explanation of all 6 institutional strategies built into TRstudio, including entry checklists, invalidation rules, and official research websites.'
                  : 'Explicación paso a paso de las 6 estrategias institucionales integradas en TRstudio: horarios exactos, reglas de entrada, invalidación, consejos de fondeo y directorio de webs de investigación.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#120c08] border border-[#3b271a] text-amber-300 font-bold">
              6 Playbooks • 19 Webs Oficiales
            </span>
          </div>
        </div>

        {/* Strategy Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#3b271a]">
          {TRADING_STRATEGIES.map((st) => {
            const isSelected = st.id === activeStrategy.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStrategyId(st.id)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#2b1c13] border-amber-500 shadow-lg ring-1 ring-amber-500/40'
                    : 'bg-[#120c08] border-[#3b271a] hover:border-amber-700/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                      {st.code} • {isEn ? st.categoryLabelEn : st.categoryLabelEs}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Win: {st.winRateEstimate}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-2 font-mono">
                    {isEn ? st.nameEn : st.nameEs}
                  </h3>
                  <p className="text-[11px] text-amber-200/60 mt-1 line-clamp-2">
                    {isEn ? st.subtitleEn : st.subtitleEs}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#3b271a]/70 flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                  <span>R:R {st.riskRewardTarget}</span>
                  <span className="truncate max-w-[150px]">{st.bestAssets.join(', ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Strategy Detailed Breakdown */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 bg-gradient-to-r from-[#24170f] to-[#18110b] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded bg-amber-600 text-white font-bold">
                {activeStrategy.code}
              </span>
              <span className="text-amber-300 font-bold">
                {isEn ? activeStrategy.categoryLabelEn : activeStrategy.categoryLabelEs}
              </span>
              <span className="text-amber-200/40">•</span>
              <span className="text-emerald-400 font-bold">
                {isEn ? 'Estimated Win Rate:' : 'Acierto Estimado:'} {activeStrategy.winRateEstimate}
              </span>
              <span className="text-amber-200/40">•</span>
              <span className="text-amber-200">
                R:R {activeStrategy.riskRewardTarget}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono mt-1.5">
              {isEn ? activeStrategy.nameEn : activeStrategy.nameEs}
            </h3>
            <p className="text-xs text-amber-200/80 mt-1 max-w-3xl leading-relaxed">
              {isEn ? activeStrategy.summaryEn : activeStrategy.summaryEs}
            </p>
          </div>

          {onUseStrategyForEntry && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeStrategy.bestAssets.slice(0, 4).map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onUseStrategyForEntry(sym, activeStrategy)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isEn ? `Apply on ${sym}` : `Calcular en ${sym}`}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metadata Bar */}
        <div className="p-4 bg-[#120c08] border-b border-[#3b271a] grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#18110b] border border-[#3b271a]">
            <div className="text-[10px] uppercase text-amber-300/70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Optimal Trading Window (NY Time)' : 'Mejor Horario Operativo (Hora NY)'}</span>
            </div>
            <div className="font-bold text-white mt-1">
              {isEn ? activeStrategy.bestSessionEn : activeStrategy.bestSessionEs}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#18110b] border border-[#3b271a]">
            <div className="text-[10px] uppercase text-amber-300/70 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Timeframe Alignment' : 'Secuencia de Temporalidades'}</span>
            </div>
            <div className="font-bold text-white mt-1">{activeStrategy.timeframes}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#18110b] border border-[#3b271a]">
            <div className="text-[10px] uppercase text-amber-300/70 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Recommended CFD Assets' : 'Índices y Activos Recomendados'}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {activeStrategy.bestAssets.map((ast) => (
                <span
                  key={ast}
                  className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/60 text-[10px] font-bold"
                >
                  {ast}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-Step Execution & Checklist */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase text-amber-300 flex items-center gap-2 text-xs sm:text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                {isEn
                  ? 'Step-by-Step Execution Rules'
                  : 'Reglas de Ejecución Paso a Paso'}
              </span>
            </h4>
            <div className="space-y-2">
              {(isEn ? activeStrategy.stepsEn : activeStrategy.stepsEs).map((step, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-300 border border-amber-700/60 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-amber-100/90 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-mono font-bold uppercase text-emerald-400 flex items-center gap-2 text-xs sm:text-sm mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isEn
                    ? 'Mandatory Pre-Entry Checklist'
                    : 'Checklist Obligatorio Antes de Entrar'}
                </span>
              </h4>
              <div className="p-4 rounded-xl bg-[#120c08] border border-emerald-900/50 space-y-2.5">
                {(isEn ? activeStrategy.entryChecklistEn : activeStrategy.entryChecklistEs).map(
                  (chk, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-amber-100/90">{chk}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#120c08] border border-rose-900/50">
              <h5 className="font-mono font-bold uppercase text-rose-400 flex items-center gap-2 text-xs mb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {isEn
                    ? 'When to Cancel / Invalidation Criteria'
                    : 'Cuándo Cancelar / Criterio de Invalidación'}
                </span>
              </h5>
              <p className="text-amber-100/90 leading-relaxed">
                {isEn ? activeStrategy.invalidationEn : activeStrategy.invalidationEs}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/50">
              <h5 className="font-mono font-bold uppercase text-amber-300 flex items-center gap-2 text-xs mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isEn
                    ? 'Prop Firm Account Tip (FTMO / FundedNext / Apex)'
                    : 'Consejo Clave para Cuenta de Fondeo (FTMO / FundedNext / Apex)'}
                </span>
              </h5>
              <p className="text-amber-100/90 leading-relaxed">
                {isEn ? activeStrategy.propFirmTipEn : activeStrategy.propFirmTipEs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Directory of 19 Official Financial Research Websites */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                {isEn
                  ? 'Institutional Financial Research Websites Directory (19 Portals)'
                  : 'Directorio de Webs Financieras para Investigar Operaciones (19 Portales)'}
              </h3>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Direct links to the specialized portals TRstudio cross-references for macro news, red-folder calendars, Fed rates, heatmaps, and CFD indices.'
                  : ' Portales oficiales que TRstudio cruza en tiempo real para investigar noticias macro, calendario de carpeta roja, tasas Fed, mapas de calor e índices CFD.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#3b271a]">
          {webCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveWebCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                activeWebCategory === cat.id
                  ? 'bg-amber-600 text-white border-amber-400 font-bold'
                  : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
              }`}
            >
              {isEn ? cat.labelEn : cat.labelEs}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredWebs.map((web) => (
            <a
              key={web.id}
              href={web.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[#120c08] hover:bg-[#1e140d] border border-[#3b271a] hover:border-amber-500/70 transition flex flex-col justify-between gap-2 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition">
                    {web.name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400 opacity-75 group-hover:opacity-100 shrink-0" />
                </div>
                <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18110b] text-amber-300/80 border border-[#3b271a] mt-1">
                  {isEn ? web.categoryLabelEn : web.categoryLabelEs}
                </span>
                <p className="text-[11px] text-amber-200/70 mt-1.5 leading-relaxed">
                  {isEn ? web.descriptionEn : web.descriptionEs}
                </p>
              </div>

              <div className="pt-2 border-t border-[#3b271a]/60 flex flex-wrap gap-1">
                {web.bestForAssets.map((sym) => (
                  <span
                    key={sym}
                    className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
