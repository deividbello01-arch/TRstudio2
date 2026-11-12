import React, { useState } from 'react';
import {
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  PauseCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Calculator,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileCheck,
  Globe,
  Database,
  Newspaper,
  Plus,
  Target,
  BookOpen,
  LineChart,
  X,
  Trophy,
} from 'lucide-react';
import { TradeSetup, KillzoneSession, CustomDocument, AppLanguage, InstrumentMarketMode, MT5SessionState } from '../types/trading';
import { getEnabledTradeableInstruments, FUTURES_CONTRACT_MAP } from '../lib/instruments';
import {
  TRADING_STRATEGIES,
  SCHEDULE_BLOCKS,
  isStrategyActiveAtHourNY,
  isHourInWindowNY,
} from '../lib/strategiesData';
import { MT5OneClickBar } from './MT5OneClickBar';

interface TradeSetupEngineProps {
  initialAsset?: string;
  initialStrategyId?: string;
  session: KillzoneSession | null;
  documents: CustomDocument[];
  onAddCustomDoc?: (name: string, content: string, description: string) => void;
  onOpenKnowledgeTab?: () => void;
  onSelectAssetInChart?: (symbol: string) => void;
  defaultBalance?: number;
  defaultRisk?: number;
  language?: AppLanguage;
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
  mt5State?: MT5SessionState | null;
  onRefreshMt5?: () => Promise<void>;
  onOpenMt5Hub?: () => void;
  showMt5?: boolean;
}

export const TradeSetupEngine: React.FC<TradeSetupEngineProps> = ({
  initialAsset = 'NAS100',
  initialStrategyId = 'AUTO',
  session,
  documents,
  onAddCustomDoc,
  onOpenKnowledgeTab,
  onSelectAssetInChart,
  defaultBalance = 6000,
  defaultRisk = 0.50,
  language = 'es',
  marketMode = 'all_programmed',
  enabledSymbols,
  mt5State = null,
  onRefreshMt5 = async () => {},
  onOpenMt5Hub,
  showMt5 = false,
}) => {
  const isEn = language === 'en';
  const currentDecimalHourNY = React.useMemo(() => {
    const ny24 = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [h, m] = ny24.split(':');
    return (parseInt(h, 10) % 24) + parseInt(m, 10) / 60;
  }, [session?.nyTime]);
  const visibleInstruments = getEnabledTradeableInstruments(enabledSymbols, marketMode);
  const [selectedAsset, setSelectedAsset] = useState<string>(initialAsset);
  const [accountBalance, setAccountBalance] = useState<number>(defaultBalance);
  const [riskPercentage, setRiskPercentage] = useState<number>(defaultRisk);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(initialStrategyId || 'AUTO');
  const [preferredDirection, setPreferredDirection] = useState<'AUTO' | 'BUY' | 'SELL'>('AUTO');

  // Inline Quick-Add Base state
  const [showQuickAddBase, setShowQuickAddBase] = useState<boolean>(false);
  const [quickBaseName, setQuickBaseName] = useState<string>('');
  const [quickBaseContent, setQuickBaseContent] = useState<string>('');

  React.useEffect(() => {
    setAccountBalance(defaultBalance);
  }, [defaultBalance]);

  React.useEffect(() => {
    setRiskPercentage(defaultRisk);
  }, [defaultRisk]);

  React.useEffect(() => {
    if (initialStrategyId) {
      setSelectedStrategyId(initialStrategyId);
    }
  }, [initialStrategyId]);

  const [sourceMode, setSourceMode] = useState<'online' | 'custom_base'>('online');
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    const customDocs = documents.filter((d) => d.type === 'custom');
    return customDocs[0]?.id || documents[0]?.id || '';
  });
  const [includeNews, setIncludeNews] = useState<boolean>(true);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanningBest, setIsScanningBest] = useState<boolean>(false);
  const [tradeSetup, setTradeSetup] = useState<TradeSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const customDocs = documents.filter((d) => d.type === 'custom');
  const chosenDoc =
    documents.find((d) => d.id === selectedDocId) || customDocs[0] || documents[0];

  React.useEffect(() => {
    if (initialAsset) {
      setSelectedAsset(initialAsset);
    }
  }, [initialAsset]);

  React.useEffect(() => {
    if (
      visibleInstruments.length > 0 &&
      !visibleInstruments.some((i) => i.symbol === selectedAsset)
    ) {
      setSelectedAsset(visibleInstruments[0].symbol);
    }
  }, [enabledSymbols]);

  const assets = visibleInstruments.map((inst) => {
    const fut = FUTURES_CONTRACT_MAP[inst.symbol];
    const baseName = isEn ? inst.nameEn : inst.nameEs;
    return {
      symbol: inst.symbol,
      name:
        marketMode === 'futures_only' && fut
          ? `${fut.futuresTicker} • ${isEn ? fut.nameEn : fut.nameEs}`
          : baseName,
    };
  });

  const handleSaveQuickBase = () => {
    if (!quickBaseName.trim() || !quickBaseContent.trim() || !onAddCustomDoc) return;
    onAddCustomDoc(
      quickBaseName.trim(),
      quickBaseContent.trim(),
      isEn ? 'Created from Entry Generator' : 'Creado desde Generador de Entradas'
    );
    setQuickBaseName('');
    setQuickBaseContent('');
    setShowQuickAddBase(false);
    setSourceMode('custom_base');
  };

  // Auto-select newest custom doc when documents list grows
  React.useEffect(() => {
    if (documents.length > 0 && documents[0].type === 'custom') {
      setSelectedDocId(documents[0].id);
    }
  }, [documents.length]);

  const handleRequestTradeSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-trade-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: selectedAsset,
          accountBalance: Number(accountBalance) || 10000,
          riskPercentage: Number(riskPercentage) || 0.50,
          sourceMode,
          includeNews,
          customDocument: sourceMode === 'custom_base' ? chosenDoc?.content || '' : '',
          selectedDocName: sourceMode === 'custom_base' ? chosenDoc?.name || '' : '',
          strategyId: selectedStrategyId,
          preferredDirection,
          marketMode,
          specificNotes: userNotes,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            (isEn ? 'Failed to calculate trading entry' : 'Fallo al calcular entrada de trading')
        );
      }

      const data = await res.json();
      setTradeSetup(data.setup);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          (isEn ? 'Error connecting to server.' : 'Error al conectar con el servidor.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Scan all enabled indices and load the #1 highest win-probability & confluence setup
  const handleFindBestSetupAcrossIndices = async () => {
    setIsScanningBest(true);
    setError(null);
    try {
      const res = await fetch('/api/scan-best-setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountBalance: Number(accountBalance) || 10000,
          riskPercentage: Number(riskPercentage) || 0.50,
          includeNews,
          strategyId: selectedStrategyId,
          preferredDirection,
          marketMode,
          enabledSymbols,
          language,
        }),
      });
      if (!res.ok) {
        throw new Error(
          isEn
            ? 'Failed to scan indices for #1 best entry'
            : 'Fallo al escanear índices para la #1 Mejor Entrada'
        );
      }
      const data = await res.json();
      const best: TradeSetup | null = data.bestSetup || (data.rankedSetups && data.rankedSetups[0]) || null;
      if (best) {
        setSelectedAsset(best.asset);
        setTradeSetup(best);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          (isEn ? 'Error scanning best entry.' : 'Error al buscar la mejor entrada.')
      );
    } finally {
      setIsScanningBest(false);
    }
  };

  // Helper to evaluate color and recommendation tier dynamically on the client
  const getSetupMetrics = (setup: TradeSetup) => {
    const bd = setup.confluenceBreakdown;
    const sumFromPillars = bd
      ? Math.min(
          100,
          Math.max(
            20,
            Math.round(
              (Number(bd.killzoneFilterScore) || 0) +
                (Number(bd.structureScore) || 0) +
                (Number(bd.liquiditySweepScore) || 0) +
                (Number(bd.intermarketScore) || 0) +
                (Number(bd.triggerScore) || 0)
            )
          )
        )
      : null;

    const score = sumFromPillars ?? setup.totalConfluenceScore ?? 50;
    const winProb =
      setup.winProbability ?? Math.min(93, Math.max(36, Math.round(score * 0.94)));

    let verdict: 'TAKE' | 'CAUTION' | 'AVOID' = setup.recommendationVerdict || 'TAKE';
    if (!setup.recommendationVerdict) {
      if (score >= 72 && winProb >= 68) verdict = 'TAKE';
      else if (score >= 55 && winProb >= 55) verdict = 'CAUTION';
      else verdict = 'AVOID';
    }

    const isHigh = verdict === 'TAKE';
    const isMed = verdict === 'CAUTION';

    const badgeColorClass = isHigh
      ? 'text-emerald-400 border-emerald-700/60 bg-emerald-950/60'
      : isMed
      ? 'text-yellow-400 border-yellow-700/60 bg-yellow-950/60'
      : 'text-rose-400 border-rose-700/60 bg-rose-950/60';

    const textColorClass = isHigh
      ? 'text-emerald-400'
      : isMed
      ? 'text-yellow-400'
      : 'text-rose-400';

    const barColorClass = isHigh
      ? 'bg-emerald-500'
      : isMed
      ? 'bg-yellow-500'
      : 'bg-rose-500';

    const defaultLabel = isHigh
      ? isEn
        ? 'RECOMMENDED TO TAKE TRADE'
        : 'SÍ SE RECOMIENDA TOMAR LA ENTRADA'
      : isMed
      ? isEn
        ? 'TRADE WITH CAUTION (WAIT CONFIRMATION OR HALF RISK)'
        : 'PRECAUCIÓN: ESPERAR CONFIRMACIÓN O USAR MITAD DE RIESGO'
      : isEn
      ? 'DO NOT TAKE THIS TRADE RIGHT NOW'
      : 'NO SE RECOMIENDA TOMAR ESTA ENTRADA AHORA';

    const defaultReason = isHigh
      ? isEn
        ? `High win probability (${winProb}%). Structure, session liquidity, and intermarket flow are aligned (${score}/100 pts).`
        : `Alta probabilidad de acierto (${winProb}%). La estructura, liquidez de sesión y flujo intermercado están alineados (${score}/100 pts).`
      : isMed
      ? isEn
        ? `Moderate win probability (${winProb}%). Wait for a clear 5M/15M candle confirmation or reduce lot size by 50%.`
        : `Probabilidad moderada (${winProb}%). Espera confirmación de vela en 5M/15M o entra con la mitad del lotaje.`
      : isEn
      ? `Low win probability (${winProb}%). Low liquidity or unfavorable structure increases Stop Loss risk. Better to wait.`
      : `Baja probabilidad de acierto (${winProb}%). Baja liquidez o estructura desfavorable aumentan el riesgo de tocar Stop Loss. Mejor esperar.`;

    return {
      score,
      winProb,
      verdict,
      badgeColorClass,
      textColorClass,
      barColorClass,
      label: setup.recommendationLabel || defaultLabel,
      reason: setup.recommendationReason || defaultReason,
    };
  };

  const copySetupToClipboard = () => {
    if (!tradeSetup) return;
    const metrics = getSetupMetrics(tradeSetup);
    const text = `
TRstudio — ${isEn ? 'TRADING ENTRY' : 'ENTRADA OPERATIVA'}
${isEn ? 'Asset' : 'Activo'}: ${tradeSetup.asset} | ${isEn ? 'Action' : 'Acción'}: ${tradeSetup.action}
${isEn ? 'Strategy' : 'Estrategia'}: ${tradeSetup.playbookName} (${tradeSetup.tier})
${isEn ? 'Confluence' : 'Confluencia'}: ${metrics.score}/100 | ${isEn ? 'Win Probability' : 'Probabilidad de Acierto'}: ${metrics.winProb}%
${isEn ? 'Recommendation' : 'Recomendación'}: ${metrics.label}

${isEn ? 'ENTRY' : 'ENTRADA'}: ${tradeSetup.prices.entryPrice} (${tradeSetup.prices.entryType})
STOP LOSS: ${tradeSetup.prices.stopLoss} (${tradeSetup.prices.stopLossDistance})
TP 1: ${tradeSetup.prices.takeProfit1}
TP 2: ${tradeSetup.prices.takeProfit2}
R:R: ${tradeSetup.prices.riskRewardRatio}

${
  marketMode === 'futures_only'
    ? isEn
      ? 'RECOMMENDED CONTRACTS'
      : 'CONTRATOS RECOMENDADOS'
    : isEn
    ? 'RECOMMENDED LOTS'
    : 'LOTES RECOMENDADOS'
}: ${tradeSetup.propFirmRiskCalculation.recommendedLots} ${
      marketMode === 'futures_only'
        ? isEn
          ? 'Contracts'
          : 'Contratos'
        : isEn
        ? 'Lots'
        : 'Lotes'
    } (${tradeSetup.propFirmRiskCalculation.riskPercentage}% = -$${(
      tradeSetup.propFirmRiskCalculation.actualRiskAtStopUsd ??
      tradeSetup.propFirmRiskCalculation.monetaryRiskUsd
    ).toFixed(2)} USD)
${isEn ? 'Rationale' : 'Explicación'}: ${tradeSetup.thesisRationale}
${isEn ? 'Invalidation' : 'Invalidación'}: ${tradeSetup.invalidationCriteria}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = tradeSetup ? getSetupMetrics(tradeSetup) : null;

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEn ? 'Tactical Trade Entry Generator' : 'Generador de Entradas Operativas'}
              </h2>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Choose whether to calculate the entry from top financial websites or from a custom analysis in Bases.'
                  : 'Elige si deseas calcular la entrada investigando en las mejores webs financieras o usando un análisis agregado en Bases.'}
              </p>
            </div>
          </div>

          {/* News Toggle Switch */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#120c08] border border-[#3b271a]">
            <Newspaper className={`w-4 h-4 ${includeNews ? 'text-amber-400' : 'text-amber-200/40'}`} />
            <div className="text-xs">
              <span className="font-mono font-bold text-white block">
                {isEn ? 'Factor in News' : 'Tomar en cuenta Noticias'}
              </span>
              <span className="text-[10px] text-amber-200/60">
                {includeNews
                  ? isEn
                    ? 'Enabled (Macro, Fed, CPI, Bonds)'
                    : 'Activado (Macro, Fed, CPI, Bonos)'
                  : isEn
                  ? 'Disabled (Pure Price Action)'
                  : 'Desactivado (Solo Acción del Precio)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIncludeNews(!includeNews)}
              className={`relative w-12 h-6 rounded-full transition-colors p-0.5 ${
                includeNews ? 'bg-emerald-600' : 'bg-[#2d1c12]'
              }`}
              title={
                isEn
                  ? 'Toggle whether to include or ignore macroeconomic news'
                  : 'Interruptor para tomar en cuenta o ignorar las noticias'
              }
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  includeNews ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mode Selector: Online Best Webs vs Custom Analysis from Bases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#3b271a]">
          <button
            type="button"
            onClick={() => setSourceMode('online')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              sourceMode === 'online'
                ? 'bg-[#2b1c13] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                : 'bg-[#120c08] border-[#3b271a] hover:border-[#573926]'
            }`}
          >
            <Globe className={`w-5 h-5 mt-0.5 shrink-0 ${sourceMode === 'online' ? 'text-amber-400' : 'text-amber-200/50'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-white">
                  {isEn
                    ? '1. Online (Top Financial Websites)'
                    : '1. Online (Mejores Webs Financieras)'}
                </span>
                {sourceMode === 'online' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                    {isEn ? 'ACTIVE' : 'ACTIVO'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-200/60 mt-1">
                {isEn
                  ? 'Cross-references live TradingView data with Reuters, Bloomberg, ForexLive, Investing, Kitco & CNBC.'
                  : 'Investiga y saca la entrada cruzando TradingView en vivo con Reuters, Bloomberg, ForexLive, Investing, Kitco y CNBC.'}
              </p>
            </div>
          </button>

          <div
            onClick={() => setSourceMode('custom_base')}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
              sourceMode === 'custom_base'
                ? 'bg-[#2b1c13] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                : 'bg-[#120c08] border-[#3b271a] hover:border-[#573926]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <Database className={`w-5 h-5 mt-0.5 shrink-0 ${sourceMode === 'custom_base' ? 'text-amber-400' : 'text-amber-200/50'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-white">
                      {isEn
                        ? '2. Based on Custom Analysis (Bases Tab)'
                        : '2. A Base de un Análisis (Apartado de Bases)'}
                    </span>
                    {sourceMode === 'custom_base' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                        {isEn ? 'ACTIVE' : 'ACTIVO'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-200/60 mt-1">
                    {isEn
                      ? 'Calculates the entry following the analysis or strategy you added in the Bases tab.'
                      : 'Calcula la entrada siguiendo el análisis o estrategia que agregues en el apartado de Bases.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {onAddCustomDoc && (
                  <button
                    type="button"
                    onClick={() => {
                      setSourceMode('custom_base');
                      setShowQuickAddBase(!showQuickAddBase);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isEn ? 'New Analysis' : 'Crear Análisis'}</span>
                  </button>
                )}
                {onOpenKnowledgeTab && (
                  <button
                    type="button"
                    onClick={() => onOpenKnowledgeTab()}
                    className="px-2.5 py-1 rounded-lg bg-[#24170f] hover:bg-amber-700 text-amber-200 hover:text-white border border-[#4d3221] text-[11px] font-mono flex items-center gap-1 transition"
                  >
                    <span>{isEn ? 'Bases Tab' : 'Ver Bases'}</span>
                  </button>
                )}
              </div>
            </div>

            {sourceMode === 'custom_base' && (
              <div className="pt-2 border-t border-[#3b271a]/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[11px] font-mono text-amber-200/70 shrink-0">
                    {isEn ? 'Selected analysis:' : 'Análisis seleccionado:'}
                  </span>
                  <select
                    value={chosenDoc?.id || ''}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="flex-1 bg-[#100b07] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.type === 'custom' ? `★ ${doc.name}` : doc.name}
                      </option>
                    ))}
                  </select>
                </div>
                {chosenDoc && (
                  <div className="text-[10px] font-mono text-amber-300/80 bg-[#100b07] px-2.5 py-1.5 rounded-lg border border-[#3b271a]/70 line-clamp-2">
                    {chosenDoc.description || chosenDoc.content.slice(0, 140)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inline Quick-Add Base Form */}
        {showQuickAddBase && onAddCustomDoc && (
          <div className="p-4 rounded-xl bg-[#120c08] border border-amber-500/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                {isEn
                  ? 'Add Custom Analysis / Trading Rule right here'
                  : 'Agregar Análisis o Regla Propia aquí mismo'}
              </span>
              <button
                type="button"
                onClick={() => setShowQuickAddBase(false)}
                className="text-amber-200/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={quickBaseName}
                onChange={(e) => setQuickBaseName(e.target.value)}
                placeholder={isEn ? 'Analysis name (e.g. My NY Plan)' : 'Nombre (ej. Mi Análisis NY)'}
                className="bg-[#18110b] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={quickBaseContent}
                onChange={(e) => setQuickBaseContent(e.target.value)}
                placeholder={
                  isEn
                    ? 'Paste your analysis, bias, levels or rules...'
                    : 'Escribe o pega tu análisis, sesgo, niveles o reglas...'
                }
                className="sm:col-span-2 bg-[#18110b] border border-[#3b271a] rounded-lg px-3 py-2 text-xs text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddBase(false)}
                className="px-3 py-1.5 rounded-lg bg-[#18110b] text-amber-200/70 border border-[#3b271a] text-xs font-mono"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleSaveQuickBase}
                disabled={!quickBaseName.trim() || !quickBaseContent.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-mono font-bold transition"
              >
                {isEn ? 'Save & Select Analysis' : 'Guardar y Usar este Análisis'}
              </button>
            </div>
          </div>
        )}

        {/* Asset, Balance, Risk & Calculate Controls */}
        <div className="pt-3 border-t border-[#3b271a] grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1.5 uppercase tracking-wider font-mono">
              {marketMode === 'futures_only'
                ? isEn
                  ? `1. Futures Contract (${assets.length})`
                  : `1. Futuro / Activo (${assets.length})`
                : marketMode === 'cfd_only'
                ? isEn
                  ? `1. CFD Index / Asset (${assets.length})`
                  : `1. Índice CFD / Activo (${assets.length})`
                : isEn
                ? `1. Index / Asset (${assets.length})`
                : `1. Índice / Activo (${assets.length})`}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {assets.map((item) => {
                const fut = FUTURES_CONTRACT_MAP[item.symbol];
                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => setSelectedAsset(item.symbol)}
                    title={item.name}
                    className={`px-2 py-1.5 rounded-lg font-mono text-[11px] font-bold transition border ${
                      selectedAsset === item.symbol
                        ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                        : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                    }`}
                  >
                    {marketMode === 'futures_only' && fut ? fut.futuresTicker.replace('1!', '') : item.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1.5 uppercase tracking-wider font-mono">
              {isEn ? '2. Account Balance (USD)' : '2. Balance de Cuenta (USD)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-xs font-bold">
                $
              </span>
              <input
                type="number"
                min={1}
                step="any"
                value={accountBalance || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAccountBalance(isNaN(val) ? 0 : val);
                }}
                placeholder={isEn ? 'Enter balance (e.g. 6000)' : 'Escribe tu balance (ej. 6000)'}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg pl-7 pr-3 py-2 text-xs font-mono font-bold text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {[5000, 6000, 10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAccountBalance(preset)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono border transition ${
                    accountBalance === preset
                      ? 'bg-amber-700 text-white border-amber-500 font-bold'
                      : 'bg-[#120c08] text-amber-200/60 border-[#3b271a] hover:border-amber-700'
                  }`}
                >
                  ${preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1.5 uppercase tracking-wider font-mono">
              {isEn ? '3. Risk per Trade (%)' : '3. Riesgo por Operación (%)'}
            </label>
            <div className="relative mb-1.5">
              <input
                type="number"
                min={0.05}
                max={5}
                step="0.05"
                value={riskPercentage || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setRiskPercentage(isNaN(val) ? 0.5 : val);
                }}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-xs font-bold">
                % = ${(((accountBalance || 0) * (riskPercentage || 0)) / 100).toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0.25, 0.50, 0.75, 1.00].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercentage(r)}
                  className={`px-1.5 py-1 rounded font-mono text-[10px] font-bold border transition ${
                    riskPercentage === r
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-amber-200/80 mb-1.5 uppercase tracking-wider font-mono">
                {isEn ? '4. Direction Mode' : '4. Dirección de Entrada'}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'AUTO', labelEs: 'Auto IA', labelEn: 'Auto AI' },
                  { id: 'BUY', labelEs: 'Compra', labelEn: 'BUY' },
                  { id: 'SELL', labelEs: 'Venta', labelEn: 'SELL' },
                ].map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => setPreferredDirection(dir.id as 'AUTO' | 'BUY' | 'SELL')}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border transition ${
                      preferredDirection === dir.id
                        ? dir.id === 'BUY'
                          ? 'bg-emerald-700 text-white border-emerald-400'
                          : dir.id === 'SELL'
                          ? 'bg-rose-700 text-white border-rose-400'
                          : 'bg-amber-600 text-white border-amber-400'
                        : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                    }`}
                  >
                    {isEn ? dir.labelEn : dir.labelEs}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleRequestTradeSetup}
                disabled={isLoading || isScanningBest}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLoading
                    ? isEn
                      ? 'Calculating...'
                      : 'Calculando...'
                    : isEn
                    ? `Calculate ${selectedAsset}`
                    : `Sacar Entrada (${selectedAsset})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleFindBestSetupAcrossIndices}
                disabled={isLoading || isScanningBest}
                title={
                  isEn
                    ? 'Scan all enabled indices and load the #1 highest win-probability & confluence setup'
                    : 'Escanea todos los índices habilitados y carga la #1 Mejor Entrada con mayor % de acierto y confluencia'
                }
                className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-600/60 font-bold text-[11px] uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
              >
                {isScanningBest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {isScanningBest
                    ? isEn
                      ? 'Scanning #1...'
                      : 'Buscando #1...'
                    : isEn
                    ? '#1 Best Entry Across All'
                    : '🏆 Buscar #1 Mejor Entrada'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Selector & Optional Notes */}
        <div className="pt-3 border-t border-[#3b271a] grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono font-semibold text-amber-200/80 mb-1 flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isEn
                    ? `5. Institutional Playbook / Strategy (${TRADING_STRATEGIES.length}):`
                    : `5. Estrategia Operativa a Aplicar (${TRADING_STRATEGIES.length}):`}
                </span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/60">
                {
                  TRADING_STRATEGIES.filter((s) =>
                    isStrategyActiveAtHourNY(s, currentDecimalHourNY)
                  ).length
                }{' '}
                {isEn ? 'ACTIVE NOW' : 'ACTIVAS AHORA'}
              </span>
            </label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            >
              <option value="AUTO">
                {isEn
                  ? '⚡ Automatic (Best Strategy for Active NY Schedule & Asset)'
                  : '⚡ Automática (Mejor Estrategia según Bloque Horario NY y Activo)'}
              </option>
              {SCHEDULE_BLOCKS.map((block) => {
                const blockActive = isHourInWindowNY(
                  block.startHourNY,
                  block.endHourNY,
                  currentDecimalHourNY
                );
                const blockStrats = TRADING_STRATEGIES.filter(
                  (s) => s.scheduleBlock === block.id
                );
                if (blockStrats.length === 0) return null;
                return (
                  <optgroup
                    key={block.id}
                    label={`${blockActive ? (isEn ? '🟢 [ACTIVE NOW] ' : '🟢 [ACTIVA AHORA] ') : ''}${
                      isEn ? block.labelEn : block.labelEs
                    }`}
                  >
                    {blockStrats.map((st) => {
                      const isActiveNow = isStrategyActiveAtHourNY(st, currentDecimalHourNY);
                      const schedLabel = isEn
                        ? st.scheduleLabelEn || block.timeRangeNY
                        : st.scheduleLabelEs || block.timeRangeNY;
                      return (
                        <option key={st.id} value={st.id}>
                          {isActiveNow ? (isEn ? '[ACTIVE NOW] ' : '[ACTIVA AHORA] ') : ''}
                          {st.code} — {isEn ? st.nameEn : st.nameEs} • [{schedLabel}] ({st.winRateEstimate})
                        </option>
                      );
                    })}
                  </optgroup>
                );
              })}
            </select>
            {(() => {
              const activeStratObj =
                selectedStrategyId === 'AUTO'
                  ? TRADING_STRATEGIES.find(
                      (s) =>
                        isStrategyActiveAtHourNY(s, currentDecimalHourNY) &&
                        s.bestAssets.includes(selectedAsset)
                    ) ||
                    TRADING_STRATEGIES.find((s) =>
                      isStrategyActiveAtHourNY(s, currentDecimalHourNY)
                    )
                  : TRADING_STRATEGIES.find((s) => s.id === selectedStrategyId);
              if (!activeStratObj) return null;
              const isNow = isStrategyActiveAtHourNY(activeStratObj, currentDecimalHourNY);
              return (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold border ${
                      isNow
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                        : 'bg-[#120c08] text-amber-300 border-[#3b271a]'
                    }`}
                  >
                    {isNow
                      ? isEn
                        ? '🟢 [ACTIVE NOW]'
                        : '🟢 [ACTIVA AHORA]'
                      : isEn
                      ? '🕒 Scheduled'
                      : '🕒 Horario NY'}
                  </span>
                  <span className="text-amber-200/80">
                    {activeStratObj.code}:{' '}
                    {isEn
                      ? activeStratObj.scheduleLabelEn || activeStratObj.bestSessionEn
                      : activeStratObj.scheduleLabelEs || activeStratObj.bestSessionEs}
                  </span>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-amber-200/80 mb-1">
              {isEn ? '6. Specific Instruction / Note (Optional):' : '6. Nota o Condición Específica (Opcional):'}
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={
                isEn
                  ? "e.g. 'Looking for buy on 15M support' or 'Wait 5M FVG'"
                  : "Ej. 'Busco compra en soporte de 15M' o 'Confirmación en FVG de 5M'"
              }
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(isEn
                ? [
                    'Buy on 15M discount FVG',
                    'Sell after PDH sweep',
                    '5M Silver Bullet confirmation',
                    'Clear notes',
                  ]
                : [
                    'Compra en FVG 15M descuento',
                    'Venta tras barrido de PDH',
                    'Confirmación Silver Bullet 5M',
                    'Limpiar nota',
                  ]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setUserNotes(
                      chip === 'Limpiar nota' || chip === 'Clear notes' ? '' : chip
                    )
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120c08] hover:bg-[#24170f] text-amber-200/70 hover:text-amber-200 border border-[#3b271a]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Trade Setup Result */}
      {tradeSetup && metrics && (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div
            className={`p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
              tradeSetup.action === 'BUY'
                ? 'bg-gradient-to-r from-emerald-950/80 to-[#18110b] border-emerald-800/50'
                : tradeSetup.action === 'SELL'
                ? 'bg-gradient-to-r from-rose-950/80 to-[#18110b] border-rose-800/50'
                : 'bg-gradient-to-r from-amber-950/80 to-[#18110b] border-amber-800/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl shadow ${
                  tradeSetup.action === 'BUY'
                    ? 'bg-emerald-500 text-slate-950'
                    : tradeSetup.action === 'SELL'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {tradeSetup.action === 'BUY' ? (
                  <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
                ) : tradeSetup.action === 'SELL' ? (
                  <ArrowDownRight className="w-7 h-7 stroke-[2.5]" />
                ) : (
                  <PauseCircle className="w-7 h-7 stroke-[2.5]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl font-black font-mono text-white">
                    {tradeSetup.action} {tradeSetup.asset}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${metrics.badgeColorClass}`}
                  >
                    {tradeSetup.tier}
                  </span>
                </div>
                <div className="text-xs text-amber-200/80 mt-0.5 flex items-center gap-2 font-mono">
                  <span>{tradeSetup.playbookName}</span>
                  <span>•</span>
                  <span>
                    R:R <strong className="text-amber-300">{tradeSetup.prices.riskRewardRatio}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Confluence & Win Probability Badges (Never Green when Low!) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div
                className={`px-3 py-1.5 rounded-xl border font-mono text-right ${metrics.badgeColorClass}`}
              >
                <span className="text-[10px] opacity-80 block">
                  {isEn ? 'Win Probability' : 'Probabilidad de Acierto'}
                </span>
                <span className={`text-lg font-black ${metrics.textColorClass}`}>
                  {metrics.winProb}%
                </span>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl border font-mono text-right ${metrics.badgeColorClass}`}
              >
                <span className="text-[10px] opacity-80 block">
                  {isEn ? 'Confluence' : 'Confluencia'}
                </span>
                <span className={`text-lg font-black ${metrics.textColorClass}`}>
                  {metrics.score}/100
                </span>
              </div>

              {onSelectAssetInChart && (
                <button
                  type="button"
                  onClick={() => onSelectAssetInChart(tradeSetup.asset)}
                  className="text-xs px-3 py-2 rounded-xl bg-[#24170f] hover:bg-amber-700 text-amber-200 hover:text-white flex items-center gap-1.5 transition border border-[#4d3221] font-mono"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>{isEn ? 'View Chart' : 'Ver en Gráfico'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={copySetupToClipboard}
                className="text-xs px-3 py-2 rounded-xl bg-[#24170f] hover:bg-[#312015] text-amber-200 flex items-center gap-1.5 transition border border-[#4d3221] font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isEn ? 'Copied' : 'Copiado') : isEn ? 'Copy' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Recommendation Verdict Banner: Should You Take This Trade? */}
          <div
            className={`p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
              metrics.verdict === 'TAKE'
                ? 'bg-emerald-950/35 border-emerald-800/50'
                : metrics.verdict === 'CAUTION'
                ? 'bg-amber-950/35 border-amber-800/50'
                : 'bg-rose-950/45 border-rose-800/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl border shrink-0 mt-0.5 ${metrics.badgeColorClass}`}
              >
                {metrics.verdict === 'TAKE' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : metrics.verdict === 'CAUTION' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-200/70">
                    {isEn ? 'Verdict & Recommendation:' : 'Veredicto y Recomendación:'}
                  </span>
                  <span
                    className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${metrics.badgeColorClass}`}
                  >
                    {metrics.label}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 mt-1">{metrics.reason}</p>
              </div>
            </div>

            {/* 5-Factor Confluence Breakdown Mini Meters */}
            {tradeSetup.confluenceBreakdown && (
              <div className="shrink-0 bg-[#120c08] p-2.5 rounded-xl border border-[#3b271a] font-mono text-[10px] space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-[9px] text-amber-200/75 border-b border-[#2b1c12] pb-1">
                  <span className="uppercase font-bold text-amber-300">
                    {isEn ? '5-Pillar Confluence Sum:' : 'Suma Exacta 5 Pilares:'}
                  </span>
                  <span>
                    {tradeSetup.confluenceBreakdown.killzoneFilterScore} +{' '}
                    {tradeSetup.confluenceBreakdown.structureScore} +{' '}
                    {tradeSetup.confluenceBreakdown.liquiditySweepScore} +{' '}
                    {tradeSetup.confluenceBreakdown.intermarketScore} +{' '}
                    {tradeSetup.confluenceBreakdown.triggerScore} ={' '}
                    <strong className="text-white">{metrics.score}/100 pts</strong> →{' '}
                    <strong className={metrics.textColorClass}>{metrics.winProb}%</strong>
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    {
                      label: isEn ? 'Session' : 'Horario',
                      val: tradeSetup.confluenceBreakdown.killzoneFilterScore,
                      max: 20,
                    },
                    {
                      label: isEn ? 'Structure' : 'Estructura',
                      val: tradeSetup.confluenceBreakdown.structureScore,
                      max: 25,
                    },
                    {
                      label: isEn ? 'Liquidity' : 'Liquidez',
                      val: tradeSetup.confluenceBreakdown.liquiditySweepScore,
                      max: 20,
                    },
                    {
                      label: 'Macro',
                      val: tradeSetup.confluenceBreakdown.intermarketScore,
                      max: 20,
                    },
                    {
                      label: isEn ? 'Trigger' : 'Gatillo',
                      val: tradeSetup.confluenceBreakdown.triggerScore,
                      max: 15,
                    },
                  ].map((item, i) => {
                    const pct = Math.min(100, Math.round((item.val / item.max) * 100));
                    const itemColor =
                      pct >= 75 ? 'bg-emerald-500' : pct >= 55 ? 'bg-yellow-500' : 'bg-rose-500';
                    return (
                      <div key={i} className="text-center min-w-[54px]">
                        <div className="text-amber-200/60 truncate">{item.label}</div>
                        <div className="font-bold text-white mt-0.5">
                          {item.val}/{item.max}
                        </div>
                        <div className="w-full h-1 bg-[#24170f] rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${itemColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click MetaTrader 5 Auto-Execution Bar */}
          {showMt5 && (
            <MT5OneClickBar
              setup={tradeSetup}
              mt5State={mt5State}
              onRefreshMt5={onRefreshMt5}
              onOpenMt5Hub={onOpenMt5Hub}
              language={language}
            />
          )}

          {/* Coordinates */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#120c08] border-b border-[#3b271a]">
            <div className="p-3 rounded-lg bg-[#18110b] border border-[#3b271a] font-mono">
              <div className="text-[10px] text-amber-200/60 uppercase">
                {isEn ? 'Entry Price' : 'Entrada'}
              </div>
              <div className="text-base font-bold text-white mt-0.5">{tradeSetup.prices.entryPrice}</div>
              <div className="text-[10px] text-amber-400 truncate mt-0.5">{tradeSetup.prices.entryType}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#18110b] border border-rose-900/40 font-mono">
              <div className="text-[10px] text-rose-400 uppercase flex items-center justify-between">
                <span>Stop Loss</span>
                <span>{tradeSetup.prices.stopLossDistance}</span>
              </div>
              <div className="text-base font-bold text-rose-300 mt-0.5">{tradeSetup.prices.stopLoss}</div>
              <div className="text-[10px] text-amber-200/40 mt-0.5">
                {isEn ? 'Protection level' : 'Nivel de protección'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#18110b] border border-emerald-900/40 font-mono">
              <div className="text-[10px] text-emerald-400 uppercase">Take Profit 1 (50%)</div>
              <div className="text-base font-bold text-emerald-300 mt-0.5">{tradeSetup.prices.takeProfit1}</div>
              <div className="text-[10px] text-amber-200/50 mt-0.5">
                {isEn ? 'Secure + Break Even' : 'Asegurar + Break Even'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#18110b] border border-emerald-900/40 font-mono">
              <div className="text-[10px] text-emerald-400 uppercase">
                {isEn ? 'Take Profit 2 (Final)' : 'Take Profit 2 (Final)'}
              </div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{tradeSetup.prices.takeProfit2}</div>
              <div className="text-[10px] text-amber-200/50 mt-0.5">
                {isEn ? 'Liquidity target' : 'Objetivo de liquidez'}
              </div>
            </div>
          </div>

          {/* Lot Size & Exact Dollar Loss / Profit Summary */}
          <div className="p-4 border-b border-[#3b271a] grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs bg-[#150e09]">
            <div className="p-3 rounded-lg bg-[#120c08] border border-[#3b271a] flex items-center justify-between">
              <div>
                <span className="text-amber-200/60 text-[10px] block">
                  {marketMode === 'futures_only'
                    ? isEn
                      ? 'Recommended Contracts'
                      : 'Contratos Recomendados'
                    : isEn
                    ? 'Recommended Lot Size'
                    : 'Lotaje Recomendado'}
                </span>
                <span className="text-xl font-black text-amber-400">
                  {tradeSetup.propFirmRiskCalculation.recommendedLots}{' '}
                  {marketMode === 'futures_only'
                    ? isEn
                      ? 'Contracts'
                      : 'Contratos'
                    : isEn
                    ? 'Lots'
                    : 'Lotes'}
                </span>
                <span className="text-[10px] text-amber-200/50 block">
                  {tradeSetup.propFirmRiskCalculation.contractSizeSpec}
                </span>
              </div>
              <Calculator className="w-5 h-5 text-amber-500/50" />
            </div>

            <div className="p-3 rounded-lg bg-[#120c08] border border-rose-900/40">
              <span className="text-rose-400 text-[10px] font-bold block">
                {isEn ? 'Exact Loss if SL Hit' : 'Pérdida Exacta si toca SL'} ({tradeSetup.propFirmRiskCalculation.riskPercentage}%)
              </span>
              <span className="text-base font-black text-rose-300 mt-0.5 block">
                -${(tradeSetup.propFirmRiskCalculation.actualRiskAtStopUsd ?? tradeSetup.propFirmRiskCalculation.monetaryRiskUsd).toFixed(2)} USD
              </span>
              <span className="text-[10px] text-amber-200/50 block">
                {isEn ? 'Target Risk:' : 'Riesgo objetivo:'} ${tradeSetup.propFirmRiskCalculation.monetaryRiskUsd.toFixed(2)} USD
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#120c08] border border-emerald-900/40">
              <span className="text-emerald-400 text-[10px] font-bold block">
                {isEn ? 'Projected Profit TP1 / TP2' : 'Ganancia en TP1 / TP2'}
              </span>
              <span className="text-base font-black text-emerald-300 mt-0.5 block">
                +${(tradeSetup.propFirmRiskCalculation.projectedProfitTp1Usd ?? tradeSetup.propFirmRiskCalculation.monetaryRiskUsd * 1.8).toFixed(2)} / +${(tradeSetup.propFirmRiskCalculation.projectedProfitTp2Usd ?? tradeSetup.propFirmRiskCalculation.monetaryRiskUsd * 3.0).toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-200/50 block">
                R:R 1:1.8 (TP1) • 1:3.0 (TP2)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#120c08] border border-[#3b271a]">
              <span className="text-amber-400 text-[10px] font-bold block">
                {isEn ? 'Risk Control' : 'Control de Riesgo'}
              </span>
              <p className="text-[11px] text-amber-100/80 mt-0.5 font-sans">
                {tradeSetup.propFirmRiskCalculation.hardDailyDrawdownAlert}
              </p>
            </div>
          </div>

          {/* Direct Explanation, Execution Plan & Practical Basis */}
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h5 className="font-bold text-white uppercase font-mono text-[11px] mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  {isEn ? 'Technical Argument for the Entry' : 'Argumento Técnico de la Entrada'}
                </h5>
                <p className="text-amber-100/90 leading-relaxed bg-[#120c08] p-3 rounded-lg border border-[#3b271a]">
                  {tradeSetup.thesisRationale}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-rose-300 uppercase font-mono text-[11px] mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {isEn ? 'Invalidation Criteria' : 'Invalidación'}
                </h5>
                <p className="text-amber-100/90 leading-relaxed bg-[#120c08] p-3 rounded-lg border border-rose-900/40">
                  {tradeSetup.invalidationCriteria}
                </p>
              </div>
            </div>

            {tradeSetup.executionTips && tradeSetup.executionTips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-1.5">
                <h5 className="font-bold text-amber-300 uppercase font-mono text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isEn ? 'Step-by-Step Execution Plan' : 'Plan de Ejecución Paso a Paso'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  {tradeSetup.executionTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#18110b] border border-[#3b271a] flex items-start gap-2 text-amber-100/90"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-mono font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Basis & Sources Section */}
            <div className="pt-3 border-t border-[#3b271a] space-y-2">
              <h5 className="font-bold text-amber-300 uppercase font-mono text-[11px] flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                {isEn ? 'Basis & Consulted Sources' : 'En qué se basó y Dónde investigó'}
              </h5>

              {tradeSetup.ownAnalysisDeclaration && (
                <p className="text-amber-100/80 bg-[#120c08] p-2.5 rounded-lg border border-[#3b271a] font-mono text-[11px]">
                  {tradeSetup.ownAnalysisDeclaration}
                </p>
              )}

              {tradeSetup.externalSources && tradeSetup.externalSources.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                  {tradeSetup.externalSources.slice(0, 6).map((src, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#120c08] border border-[#3b271a] flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="text-amber-400 font-bold">{src.media}: </span>
                        <span className="text-amber-100/80">{src.headline}</span>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-200 underline shrink-0"
                      >
                        {isEn ? 'View source' : 'Ver fuente'}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
