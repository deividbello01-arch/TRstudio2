import React, { useState, useEffect, useMemo } from 'react';
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
  Filter,
  RotateCcw,
  Radio,
  Ban,
  Crosshair,
  Calculator,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  TRADING_STRATEGIES,
  FINANCIAL_WEB_SOURCES,
  SCHEDULE_BLOCKS,
  StrategyPlaybook,
  isStrategyActiveAtHourNY,
  isHourInWindowNY,
  calculateStrategyMathExpectancy,
} from '../lib/strategiesData';
import { AppLanguage } from '../types/trading';

interface StrategiesPlaybookProps {
  language?: AppLanguage;
  onUseStrategyForEntry?: (asset: string, strategy: StrategyPlaybook) => void;
}

function getNYTimeInfo(now: Date): { formatted: string; decimalHour: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const s = Number(parts.find((p) => p.type === 'second')?.value ?? '0');
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      formatted: `${pad(h)}:${pad(m)}:${pad(s)} NY`,
      decimalHour: h + m / 60,
    };
  } catch {
    const h = now.getHours();
    const m = now.getMinutes();
    return {
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} NY`,
      decimalHour: h + m / 60,
    };
  }
}

export const StrategiesPlaybook: React.FC<StrategiesPlaybookProps> = ({
  language = 'es',
  onUseStrategyForEntry,
}) => {
  const isEn = language === 'en';
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(TRADING_STRATEGIES[0].id);
  const [scheduleFilter, setScheduleFilter] = useState<string>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWebCategory, setActiveWebCategory] = useState<string>('ALL');
  const [checkedByStrategy, setCheckedByStrategy] = useState<Record<string, Record<number, boolean>>>({});
  const [simBalance, setSimBalance] = useState<number>(25000);
  const [simRiskPct, setSimRiskPct] = useState<number>(0.5);
  const [simTradesWeek, setSimTradesWeek] = useState<number>(5);
  const [nyClock, setNyClock] = useState<{ formatted: string; decimalHour: number }>(() =>
    getNYTimeInfo(new Date())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNyClock(getNYTimeInfo(new Date()));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const filteredStrategies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TRADING_STRATEGIES.filter((st) => {
      if (scheduleFilter === 'LIVE_NOW') {
        if (!isStrategyActiveAtHourNY(st, nyClock.decimalHour)) return false;
      } else if (scheduleFilter !== 'ALL') {
        if (st.scheduleBlock !== scheduleFilter) return false;
      }
      if (assetFilter !== 'ALL' && !st.bestAssets.includes(assetFilter)) {
        return false;
      }
      if (categoryFilter !== 'ALL' && st.category !== categoryFilter) {
        return false;
      }
      if (q) {
        const hay = `${st.code} ${st.nameEs} ${st.nameEn} ${st.subtitleEs} ${st.subtitleEn} ${st.bestAssets.join(' ')} ${st.bestSessionEs}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [scheduleFilter, assetFilter, categoryFilter, searchQuery, nyClock.decimalHour]);

  const activeStrategy =
    TRADING_STRATEGIES.find((s) => s.id === selectedStrategyId) ||
    filteredStrategies[0] ||
    TRADING_STRATEGIES[0];

  const expectancyStats = useMemo(
    () => calculateStrategyMathExpectancy(activeStrategy, simBalance, simRiskPct, simTradesWeek),
    [activeStrategy, simBalance, simRiskPct, simTradesWeek]
  );

  const allAssets = [
    'ALL',
    'NAS100',
    'US30',
    'US500',
    'US2000',
    'XAUUSD',
    'GER40',
    'UK100',
    'EU50',
    'JP225',
    'HK50',
    'EURUSD',
  ];

  const strategyCategories = [
    { id: 'ALL', labelEs: 'Todas las Categorías', labelEn: 'All Categories' },
    { id: 'ict_smc', labelEs: 'ICT / Smart Money', labelEn: 'ICT / Smart Money' },
    { id: 'killzone', labelEs: 'Killzones & ORB', labelEn: 'Killzones & ORB' },
    { id: 'intermarket', labelEs: 'SMT & Intermercado', labelEn: 'SMT & Intermarket' },
    { id: 'mean_reversion', labelEs: 'Reversión & Liquidez', labelEn: 'Mean Reversion & Liquidity' },
    { id: 'prop_risk', labelEs: 'Noticias 8:30 & Fondeo', labelEn: '8:30 News & Prop Risk' },
  ];

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

  const activeChecklist = isEn ? activeStrategy.entryChecklistEn : activeStrategy.entryChecklistEs;
  const currentChecks = checkedByStrategy[activeStrategy.id] || {};
  const checkedCount = activeChecklist.reduce((acc, _, idx) => acc + (currentChecks[idx] ? 1 : 0), 0);
  const readinessPct =
    activeChecklist.length > 0 ? Math.round((checkedCount / activeChecklist.length) * 100) : 0;

  const toggleCheckItem = (idx: number) => {
    setCheckedByStrategy((prev) => {
      const stratChecks = prev[activeStrategy.id] || {};
      return {
        ...prev,
        [activeStrategy.id]: {
          ...stratChecks,
          [idx]: !stratChecks[idx],
        },
      };
    });
  };

  const resetChecklist = () => {
    setCheckedByStrategy((prev) => ({
      ...prev,
      [activeStrategy.id]: {},
    }));
  };

  const liveStrategiesNowCount = TRADING_STRATEGIES.filter((s) =>
    isStrategyActiveAtHourNY(s, nyClock.decimalHour)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner + 24H NY Master Schedule Timeline */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                {isEn
                  ? 'Institutional Trading Strategies & 24H Master Schedule (18 Playbooks)'
                  : 'Estrategias Operativas Institucionales & Cronograma Maestro 24H (18 Playbooks)'}
              </h2>
              <p className="text-xs text-amber-200/70 mt-0.5">
                {isEn
                  ? '18 institutional playbooks (3 per session block) covering Asia/Tokyo, Frankfurt/London, 8:30 NY Pre-Market, Wall Street Open, London Close, and PM Power Hour.'
                  : 'Las 18 estrategias institucionales (3 por cada bloque horario) cubriendo Asia/Tokio, Londres/DAX, Pre-Mercado 8:30 AM, Apertura Wall Street 9:30 AM, Cierre Europeo y PM Power Hour.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search 18 playbooks...' : 'Buscar en 18 estrategias...'}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#120c08] border border-[#3b271a] focus:border-amber-500 text-white text-xs font-mono w-48 sm:w-56 outline-none"
              />
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{nyClock.formatted}</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#120c08] border border-[#3b271a] text-amber-300 font-bold">
              {TRADING_STRATEGIES.length} Playbooks • 6 Horarios • 19 Webs
            </span>
          </div>
        </div>

        {/* Live 6-Block Schedule Timeline (NY Time) */}
        <div className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isEn
                  ? '24-Hour Institutional Schedule by New York Time (Click a block to filter)'
                  : 'Cronograma Institucional 24H en Hora Nueva York (Haz clic en un bloque para filtrar)'}
              </span>
            </div>
            {scheduleFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setScheduleFilter('ALL')}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
              >
                {isEn
                  ? `Show all 6 blocks (${TRADING_STRATEGIES.length} strategies)`
                  : `Ver los 6 horarios (${TRADING_STRATEGIES.length} estrategias)`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            {SCHEDULE_BLOCKS.map((blk) => {
              const isCurrentTimeBlock = isHourInWindowNY(
                blk.startHourNY,
                blk.endHourNY,
                nyClock.decimalHour
              );
              const isFilterSelected = scheduleFilter === blk.id;
              const blockStrategies = TRADING_STRATEGIES.filter((s) => s.scheduleBlock === blk.id);

              return (
                <button
                  key={blk.id}
                  type="button"
                  onClick={() => {
                    const nextFilter = scheduleFilter === blk.id ? 'ALL' : blk.id;
                    setScheduleFilter(nextFilter);
                    if (nextFilter !== 'ALL' && blockStrategies.length > 0) {
                      setSelectedStrategyId(blockStrategies[0].id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                    isFilterSelected
                      ? 'bg-[#2b1c13] border-amber-400 ring-1 ring-amber-400/50'
                      : isCurrentTimeBlock
                      ? 'bg-emerald-950/30 border-emerald-500/70 hover:border-emerald-400'
                      : 'bg-[#18110b] border-[#3b271a] hover:border-amber-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                      <span className="font-bold text-amber-300">{blk.timeRangeNY}</span>
                      {isCurrentTimeBlock && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold">
                          {isEn ? 'LIVE' : 'ACTIVO'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-white font-mono mt-0.5 line-clamp-1">
                      {isEn ? blk.shortEn : blk.shortEs}
                    </div>
                    <p className="text-[10px] text-amber-200/60 mt-0.5 line-clamp-2">
                      {isEn ? blk.focusEn : blk.focusEs}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-[#3b271a]/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-300/90 font-bold">
                      {blockStrategies.map((s) => s.code).join(' • ')}
                    </span>
                    <span className="text-amber-200/50">
                      {blockStrategies.length} {isEn ? 'strats' : 'estr.'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Filter Bar: Schedule + Asset + Technical Category */}
        <div className="pt-2 border-t border-[#3b271a] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-300/70 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'Schedule:' : 'Horario:'}</span>
              </span>
              <button
                type="button"
                onClick={() => setScheduleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                  scheduleFilter === 'ALL'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                }`}
              >
                {isEn ? `All (${TRADING_STRATEGIES.length})` : `Todos (${TRADING_STRATEGIES.length})`}
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilter(scheduleFilter === 'LIVE_NOW' ? 'ALL' : 'LIVE_NOW')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition flex items-center gap-1 ${
                  scheduleFilter === 'LIVE_NOW'
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                    : 'bg-[#120c08] text-emerald-300 border-emerald-800/60 hover:border-emerald-500'
                }`}
              >
                <span>🟢 {isEn ? 'Active Window Now' : 'En Ventana Ahora'}</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                  {liveStrategiesNowCount}
                </span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {strategyCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition ${
                    categoryFilter === cat.id
                      ? 'bg-amber-700 text-white border-amber-400 font-bold'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                  }`}
                >
                  {isEn ? cat.labelEn : cat.labelEs}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-amber-300/70 mr-1">
              {isEn ? 'Filter by Asset:' : 'Filtrar por Activo:'}
            </span>
            {allAssets.map((ast) => (
              <button
                key={ast}
                type="button"
                onClick={() => setAssetFilter(ast)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition ${
                  assetFilter === ast
                    ? 'bg-amber-500 text-black border-amber-300 font-bold'
                    : 'bg-[#120c08] text-amber-200/75 border-[#3b271a] hover:border-amber-700'
                }`}
              >
                {ast === 'ALL' ? (isEn ? 'All Assets' : 'Todos') : ast}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Selector Cards */}
        {filteredStrategies.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#120c08] border border-[#3b271a] text-center space-y-2">
            <p className="text-xs font-mono text-amber-200/80">
              {isEn
                ? 'No strategies match the current filter combination.'
                : 'Ninguna estrategia coincide con la combinación de filtros seleccionada.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setScheduleFilter('ALL');
                setAssetFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-mono font-bold"
            >
              {isEn ? 'Reset Filters' : 'Restablecer Filtros'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-[#3b271a]">
            {filteredStrategies.map((st) => {
              const isSelected = st.id === activeStrategy.id;
              const isLiveNow = isStrategyActiveAtHourNY(st, nyClock.decimalHour);
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
                      <div className="flex items-center gap-1.5">
                        {isLiveNow && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/60 font-bold">
                            🟢 {isEn ? 'NOW' : 'AHORA'}
                          </span>
                        )}
                        <span className="text-emerald-400 font-bold">Win: {st.winRateEstimate}</span>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white mt-2 font-mono">
                      {isEn ? st.nameEn : st.nameEs}
                    </h3>
                    {(st.scheduleLabelEs || st.scheduleLabelEn) && (
                      <div className="text-[10px] font-mono text-amber-400/90 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {isEn ? st.scheduleLabelEn : st.scheduleLabelEs}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-amber-200/60 mt-1 line-clamp-2">
                      {isEn ? st.subtitleEn : st.subtitleEs}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#3b271a]/70 flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                    <span>R:R {st.riskRewardTarget}</span>
                    <span className="truncate max-w-[165px]">{st.bestAssets.join(', ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
              {(activeStrategy.scheduleLabelEs || activeStrategy.scheduleLabelEn) && (
                <>
                  <span className="text-amber-200/40">•</span>
                  <span className="px-2 py-0.5 rounded bg-[#120c08] border border-amber-700/60 text-amber-300">
                    {isEn ? activeStrategy.scheduleLabelEn : activeStrategy.scheduleLabelEs}
                  </span>
                </>
              )}
              <span className="text-amber-200/40">•</span>
              <span className="text-emerald-400 font-bold">
                {isEn ? 'Estimated Win Rate:' : 'Acierto Estimado:'} {activeStrategy.winRateEstimate}
              </span>
              <span className="text-amber-200/40">•</span>
              <span className="text-amber-200">
                R:R {activeStrategy.riskRewardTarget}
              </span>
              {isStrategyActiveAtHourNY(activeStrategy, nyClock.decimalHour) && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
                  🟢 {isEn ? 'IN TRADING WINDOW NOW' : 'EN VENTANA OPERATIVA AHORA'}
                </span>
              )}
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

        {/* Step-by-Step Execution & Interactive Checklist */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <div className="space-y-4">
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

            {/* Key Institutional Levels to Plot */}
            {(activeStrategy.keyLevelsEs || activeStrategy.keyLevelsEn) && (
              <div className="p-4 rounded-xl bg-[#120c08] border border-amber-800/50 space-y-2">
                <h5 className="font-mono font-bold uppercase text-amber-300 flex items-center gap-2 text-xs">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span>
                    {isEn
                      ? 'Key Institutional Levels to Mark on Chart'
                      : 'Niveles Institucionales Clave a Marcar en el Gráfico'}
                  </span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {((isEn ? activeStrategy.keyLevelsEn : activeStrategy.keyLevelsEs) || []).map(
                    (lvl, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1.5 rounded-lg bg-[#18110b] border border-[#3b271a] text-amber-100 font-mono text-[11px] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{lvl}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Interactive Checkable Pre-Entry Checklist */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-mono font-bold uppercase text-emerald-400 flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isEn
                      ? 'Interactive Pre-Entry Checklist (Click to Verify)'
                      : 'Checklist Interactivo Antes de Entrar (Haz clic para marcar)'}
                  </span>
                </h4>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded font-bold border ${
                      readinessPct === 100
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-[#120c08] text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {checkedCount}/{activeChecklist.length} ({readinessPct}%)
                  </span>
                  {checkedCount > 0 && (
                    <button
                      type="button"
                      onClick={resetChecklist}
                      title={isEn ? 'Reset checklist' : 'Reiniciar checklist'}
                      className="p-1 rounded bg-[#120c08] border border-[#3b271a] text-amber-300 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#120c08] border border-emerald-900/50 space-y-2.5">
                {/* Readiness Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#18110b] border border-[#3b271a] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      readinessPct === 100
                        ? 'bg-emerald-500'
                        : readinessPct >= 60
                        ? 'bg-amber-500'
                        : 'bg-amber-700'
                    }`}
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>

                {activeChecklist.map((chk, i) => {
                  const isChecked = !!currentChecks[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleCheckItem(i)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-100'
                          : 'bg-[#18110b] border-[#3b271a] hover:border-emerald-700/60 text-amber-100/90'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isChecked ? 'text-emerald-400' : 'text-amber-500/40'
                        }`}
                      />
                      <span className={isChecked ? 'font-bold' : ''}>{chk}</span>
                    </button>
                  );
                })}

                {readinessPct === 100 && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/70 text-emerald-300 font-mono font-bold text-center text-[11px]">
                    ✅{' '}
                    {isEn
                      ? '100% INSTITUTIONAL CONFLUENCE VERIFIED — READY FOR LOT CALCULATOR'
                      : '100% CONFLUENCIA INSTITUCIONAL VERIFICADA — LISTO PARA CALCULADORA DE LOTAJE'}
                  </div>
                )}
              </div>
            </div>

            {(activeStrategy.avoidConditionsEs || activeStrategy.avoidConditionsEn) && (
              <div className="p-4 rounded-xl bg-[#120c08] border border-orange-900/50">
                <h5 className="font-mono font-bold uppercase text-orange-400 flex items-center gap-2 text-xs mb-1.5">
                  <Ban className="w-4 h-4" />
                  <span>
                    {isEn
                      ? 'When NOT to Trade This Setup (Avoid Conditions)'
                      : 'Cuándo NO Operar esta Estrategia (Filtro de Protección)'}
                  </span>
                </h5>
                <p className="text-amber-100/90 leading-relaxed">
                  {isEn ? activeStrategy.avoidConditionsEn : activeStrategy.avoidConditionsEs}
                </p>
              </div>
            )}

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

      {/* Strategy Mathematical Expectancy Simulator & Session Routine Planner */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                {isEn
                  ? `Mathematical Expectancy Simulator & Routine Planner — [${activeStrategy.code}]`
                  : `Simulador de Esperanza Matemática & Rutina por Horario — [${activeStrategy.code}]`}
              </h3>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Quantitative projection using the historical Win Rate and R:R of the selected strategy plus its minute-by-minute NY execution protocol.'
                  : 'Proyección cuantitativa real basada en el Win Rate, Profit Factor y Ratio R:R de la estrategia seleccionada junto con su protocolo minuto a minuto.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {[10000, 25000, 50000, 100000, 200000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSimBalance(preset)}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  simBalance === preset
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                }`}
              >
                ${(preset / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-[#3b271a]">
          {/* Inputs & Quantitative Expectancy Outputs */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <label className="text-[10px] uppercase text-amber-300/70 block">
                  {isEn ? 'Account Balance ($ USD)' : 'Capital de Cuenta ($ USD)'}
                </label>
                <input
                  type="number"
                  min={500}
                  step={1000}
                  value={simBalance}
                  onChange={(e) => setSimBalance(Math.max(100, Number(e.target.value) || 0))}
                  className="mt-1 w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <label className="text-[10px] uppercase text-amber-300/70 block">
                  {isEn ? 'Risk per Trade (%)' : 'Riesgo por Operación (%)'}
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  {[0.25, 0.5, 1.0].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSimRiskPct(r)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition ${
                        simRiskPct === r
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-[#18110b] text-amber-200/80 border-[#3b271a]'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <label className="text-[10px] uppercase text-amber-300/70 block">
                  {isEn ? 'Setups Executed / Week' : 'Operaciones / Semana'}
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  {[3, 5, 8, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSimTradesWeek(n)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition ${
                        simTradesWeek === n
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-[#18110b] text-amber-200/80 border-[#3b271a]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <div className="text-[10px] text-amber-300/70 uppercase">
                  {isEn ? '1R Monetary Risk' : 'Riesgo 1R en USD'}
                </div>
                <div className="text-sm sm:text-base font-black text-rose-400 mt-0.5">
                  -${expectancyStats.riskUsdPerTrade.toFixed(0)}
                </div>
                <div className="text-[10px] text-amber-200/60 mt-0.5">
                  TP Prom.: +${expectancyStats.expectedWinUsd.toFixed(0)} (1:{expectancyStats.avgRewardRatio})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <div className="text-[10px] text-amber-300/70 uppercase">
                  {isEn ? 'Math Expectancy / Trade' : 'Esperanza Mat. / Trade'}
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                  +{expectancyStats.expectancyR}R (+${expectancyStats.expectancyUsdPerTrade.toFixed(0)})
                </div>
                <div className="text-[10px] text-amber-200/60 mt-0.5">
                  Win Est.: {expectancyStats.avgWinRatePct}% • PF {expectancyStats.profitFactorEstimate}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <div className="text-[10px] text-amber-300/70 uppercase">
                  {isEn ? 'Weekly Projection' : 'Proyección Semanal'}
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                  +${expectancyStats.weeklyExpectedUsd.toFixed(0)} USD
                </div>
                <div className="text-[10px] text-amber-200/60 mt-0.5">
                  {simTradesWeek} {isEn ? 'trades/week' : 'trades/semana'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/50">
                <div className="text-[10px] text-emerald-300 uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isEn ? 'Monthly Est. Return' : 'Proyección Mensual'}</span>
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                  +${expectancyStats.monthlyExpectedUsd.toFixed(0)} (+{expectancyStats.monthlyExpectedPct}%)
                </div>
                <div className="text-[10px] text-emerald-200/70 mt-0.5">
                  {expectancyStats.monthlyExpectedPct >= 10
                    ? isEn
                      ? 'Passes Phase 1 (10%)'
                      : 'Supera Fase 1 Fondeo (10%)'
                    : isEn
                    ? 'Steady Funded Growth'
                    : 'Crecimiento Institucional'}
                </div>
              </div>
            </div>
          </div>

          {/* Minute-by-Minute Session Execution Routine */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-2 text-xs font-mono">
            <div className="text-[11px] font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isEn
                  ? `Session Execution Protocol (${activeStrategy.code})`
                  : `Protocolo de Rutina por Horario (${activeStrategy.code})`}
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-[#18110b] border border-[#3b271a] flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold shrink-0">
                  T-15m
                </span>
                <span className="text-amber-100/90">
                  {isEn
                    ? 'Check ForexFactory Red-Folder Calendar, DXY/US10Y macro alignment, and plot key liquidity levels.'
                    : 'Revisar Calendario Carpeta Roja, dirección de DXY/US10Y y trazar niveles clave de liquidez.'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#18110b] border border-[#3b271a] flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold shrink-0">
                  {isEn ? 'Trigger' : 'Gatillo'}
                </span>
                <span className="text-amber-100/90">
                  {isEn ? activeStrategy.bestSessionEn : activeStrategy.bestSessionEs}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#18110b] border border-[#3b271a] flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold shrink-0">
                  TP1 / BE
                </span>
                <span className="text-amber-100/90">
                  {isEn
                    ? 'Take 50% partial at 1:1.8 R:R and move Stop Loss to Break-Even (+2 pips/pts).'
                    : 'Cerrar 50% de la posición en 1:1.8 R:R y mover Stop Loss a Break-Even (+2 pts/pips).'}
                </span>
              </div>
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
