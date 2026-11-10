import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Radar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Target,
  Calculator,
  LineChart,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { TradeSetup, ScannerResponse, AppLanguage } from '../types/trading';

interface MultiIndexScannerProps {
  defaultBalance?: number;
  defaultRisk?: number;
  language?: AppLanguage;
  onSelectAssetInChart?: (symbol: string) => void;
  onOpenInSetupEngine?: (symbol: string) => void;
}

export const MultiIndexScanner: React.FC<MultiIndexScannerProps> = ({
  defaultBalance = 10000,
  defaultRisk = 0.50,
  language = 'es',
  onSelectAssetInChart,
  onOpenInSetupEngine,
}) => {
  const isEn = language === 'en';
  const [accountBalance, setAccountBalance] = useState<number>(defaultBalance);
  const [riskPercentage, setRiskPercentage] = useState<number>(defaultRisk);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [includeNews, setIncludeNews] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanData, setScanData] = useState<ScannerResponse | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccountBalance(defaultBalance);
  }, [defaultBalance]);

  useEffect(() => {
    setRiskPercentage(defaultRisk);
  }, [defaultRisk]);

  const runScanner = async (catOverride?: string) => {
    setIsScanning(true);
    setError(null);
    const activeCat = catOverride ?? filterCategory;

    try {
      const res = await fetch('/api/scan-best-setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountBalance,
          riskPercentage,
          filterCategory: activeCat,
          includeNews,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(isEn ? 'Error scanning indices' : 'Error al escanear los índices');
      }

      const data: ScannerResponse = await res.json();
      setScanData(data);
      if (data.bestSetup) {
        setExpandedSymbol(data.bestSetup.asset);
      }
    } catch (err: any) {
      setError(err.message || (isEn ? 'Scanner failed' : 'Fallo en el escáner'));
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runScanner();
  }, [language, includeNews]);

  const handleCopySetup = (setup: TradeSetup) => {
    const text = `
TRstudio SCANNER — #1 HIGH PROBABILITY SETUP
${isEn ? 'Asset' : 'Activo'}: ${setup.asset} (${setup.assetName || ''}) | ${setup.action}
${isEn ? 'Win Probability' : 'Probabilidad de Acierto'}: ${setup.winProbability}% (${setup.totalConfluenceScore}/100)
${isEn ? 'Playbook' : 'Estrategia'}: ${setup.playbookName}

${isEn ? 'ENTRY' : 'ENTRADA'}: ${setup.prices.entryPrice} (${setup.prices.entryType})
STOP LOSS: ${setup.prices.stopLoss} (${setup.prices.stopLossDistance})
TP 1 (1:1.8): ${setup.prices.takeProfit1} (+$${setup.propFirmRiskCalculation.projectedProfitTp1Usd} USD)
TP 2 (1:3.0): ${setup.prices.takeProfit2} (+$${setup.propFirmRiskCalculation.projectedProfitTp2Usd} USD)

${isEn ? 'LOTS' : 'LOTAJE'}: ${setup.propFirmRiskCalculation.recommendedLots} Lots | ${isEn ? 'Exact SL Loss' : 'Pérdida Exacta en SL'}: -$${setup.propFirmRiskCalculation.actualRiskAtStopUsd} USD (${setup.propFirmRiskCalculation.riskPercentage}%)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSymbol(setup.asset);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  const getBadgeColors = (verdict?: 'TAKE' | 'CAUTION' | 'AVOID') => {
    if (verdict === 'TAKE') {
      return {
        badge: 'text-emerald-300 bg-emerald-950/80 border-emerald-600/60',
        text: 'text-emerald-400',
        bar: 'bg-emerald-500',
      };
    }
    if (verdict === 'CAUTION') {
      return {
        badge: 'text-amber-300 bg-amber-950/80 border-amber-600/60',
        text: 'text-amber-400',
        bar: 'bg-amber-500',
      };
    }
    return {
      badge: 'text-rose-300 bg-rose-950/80 border-rose-600/60',
      text: 'text-rose-400',
      bar: 'bg-rose-500',
    };
  };

  const filterButtons = [
    { id: 'ALL', labelEs: 'Todos los CFD (12)', labelEn: 'All CFDs (12)' },
    { id: 'INDICES', labelEs: 'Solo Índices Primarios (10)', labelEn: 'Primary Indices Only (10)' },
    { id: 'US_INDICES', labelEs: 'Índices EE. UU. (NAS100, US500, US30, US2000)', labelEn: 'US Indices (NAS100, US500, US30, US2000)' },
    { id: 'EU_ASIA_INDICES', labelEs: 'Europa & Asia (GER40, UK100, EU50, JP225...)', labelEn: 'Europe & Asia (GER40, UK100, EU50, JP225...)' },
    { id: 'METALS_FX', labelEs: 'Oro & Forex (XAUUSD, EURUSD)', labelEn: 'Gold & Forex (XAUUSD, EURUSD)' },
  ];

  const best = scanData?.bestSetup;
  const bestColors = best ? getBadgeColors(best.recommendationVerdict) : null;

  return (
    <div className="space-y-6">
      {/* Scanner Control Panel */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60 shrink-0">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                  {isEn
                    ? 'Multi-Index Scanner & Highest Win-Rate Trade Finder'
                    : 'Escáner Multi-Índice & Mejor Entrada de Mayor Acierto'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {isEn ? 'LIVE RANKING' : 'RANKING EN VIVO'}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-0.5">
                {isEn
                  ? 'Simultaneously evaluates all primary CFD indices, Gold, and EUR/USD in real time and highlights the #1 trade with the highest win probability right now.'
                  : 'Calcula simultáneamente todas las entradas de los índices CFD primarios, Oro y EUR/USD en tiempo real y destaca la operación #1 con mayor índice de acierto en este momento.'}
                </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => runScanner()}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning
                ? isEn
                  ? 'Scanning Markets...'
                  : 'Escaneando Mercados...'
                : isEn
                ? 'Scan & Rank All Now'
                : 'Escanear Mejor Entrada Ahora'}
            </span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#3b271a]">
          {filterButtons.map((fb) => {
            const active = filterCategory === fb.id;
            return (
              <button
                key={fb.id}
                type="button"
                onClick={() => {
                  setFilterCategory(fb.id);
                  runScanner(fb.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  active
                    ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-sm'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-600'
                }`}
              >
                {isEn ? fb.labelEn : fb.labelEs}
              </button>
            );
          })}
        </div>

        {/* Balance & Risk Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#3b271a] text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] min-w-0">
            <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
              {isEn ? 'Account Balance (USD)' : 'Balance de Cuenta (USD)'}
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative flex-1 min-w-[110px]">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                <input
                  type="number"
                  min={100}
                  value={accountBalance || ''}
                  onChange={(e) => setAccountBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {[5000, 10000, 25000, 50000, 100000].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAccountBalance(b)}
                    className={`px-2 py-1 rounded text-[10px] border ${
                      accountBalance === b
                        ? 'bg-amber-600 text-white border-amber-400 font-bold'
                        : 'bg-[#18110b] text-amber-200/60 border-[#3b271a]'
                    }`}
                  >
                    ${b / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] min-w-0">
            <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
              {isEn ? 'Risk per Trade (%)' : 'Riesgo por Operación (%)'}
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[0.25, 0.50, 0.75, 1.00].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskPercentage(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      riskPercentage === r
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-[#18110b] text-amber-200/70 border-[#3b271a]'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <span className="text-emerald-400 font-bold">
                =${(((accountBalance || 0) * riskPercentage) / 100).toFixed(2)} USD
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase text-amber-200/70">
                {isEn ? 'Active Session & NY Clock' : 'Sesión Activa & Hora NY'}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {scanData?.session || 'NY / London'}
              </div>
              <div className="text-[10px] text-amber-400">
                {scanData?.nyTime || '--:--'} • {scanData?.scannedCount || 0}{' '}
                {isEn ? 'assets ranked' : 'activos evaluados'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => runScanner()}
              className="px-3 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] text-xs font-bold"
            >
              {isEn ? 'Recalculate' : 'Recalcular'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* #1 SPOTLIGHT CARD: Highest Probability Trade Right Now */}
      {best && bestColors && (
        <div className="bg-[#18110b] border-2 border-amber-500/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3 bg-gradient-to-r from-amber-600/25 via-[#24170f] to-[#18110b] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 block">
                  {isEn
                    ? '#1 HIGHEST WIN-PROBABILITY TRADE RIGHT NOW'
                    : '#1 MEJOR ENTRADA DETECTADA CON MAYOR ÍNDICE DE ACIERTO'}
                </span>
                <span className="text-xs text-amber-100/80">
                  {best.recommendationReason}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onSelectAssetInChart && (
                <button
                  type="button"
                  onClick={() => onSelectAssetInChart(best.asset)}
                  className="px-3 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#332014] text-amber-200 border border-[#4d3221] text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <LineChart className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'View Chart' : 'Ver Gráfico'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCopySetup(best)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
              >
                {copiedSymbol === best.asset ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>
                  {copiedSymbol === best.asset
                    ? isEn
                      ? 'Copied!'
                      : '¡Copiada!'
                    : isEn
                    ? 'Copy #1 Trade'
                    : 'Copiar Entrada #1'}
                </span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl shadow ${
                    best.action === 'BUY'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {best.action === 'BUY' ? (
                    <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-7 h-7 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-black font-mono text-white">
                      {best.action} {best.asset}
                    </span>
                    <span className="text-xs font-mono text-amber-200/70">
                      ({best.assetName})
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${bestColors.badge}`}
                    >
                      {best.tier}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-300 mt-0.5">
                    {best.playbookName} • {isEn ? 'Live Price:' : 'Precio Actual:'}{' '}
                    <strong className="text-white">{best.prices.currentPrice.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-3.5 py-2 rounded-xl border font-mono text-right ${bestColors.badge}`}>
                  <span className="text-[10px] uppercase block opacity-80">
                    {isEn ? 'Win Probability' : 'Índice de Acierto'}
                  </span>
                  <span className={`text-2xl font-black ${bestColors.text}`}>
                    {best.winProbability}%
                  </span>
                </div>
                <div className={`px-3.5 py-2 rounded-xl border font-mono text-right ${bestColors.badge}`}>
                  <span className="text-[10px] uppercase block opacity-80">
                    {isEn ? 'Confluence' : 'Confluencia'}
                  </span>
                  <span className={`text-2xl font-black ${bestColors.text}`}>
                    {best.totalConfluenceScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinates & Exact Risk Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <span className="text-[10px] text-amber-200/60 uppercase block">
                  {isEn ? 'Entry (Limit)' : 'Entrada (Limit)'}
                </span>
                <span className="text-base font-black text-white mt-0.5 block">
                  {best.prices.entryPrice}
                </span>
                <span className="text-[10px] text-amber-400 truncate block">
                  50% FVG / POI
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-rose-900/50">
                <span className="text-[10px] text-rose-400 uppercase block">
                  Stop Loss ({best.prices.stopLossDistance})
                </span>
                <span className="text-base font-black text-rose-300 mt-0.5 block">
                  {best.prices.stopLoss}
                </span>
                <span className="text-[10px] text-rose-400/90 font-bold block">
                  -${best.propFirmRiskCalculation.actualRiskAtStopUsd.toFixed(2)} USD
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-emerald-900/50">
                <span className="text-[10px] text-emerald-400 uppercase block">
                  Take Profit 1 (1:1.8)
                </span>
                <span className="text-base font-black text-emerald-300 mt-0.5 block">
                  {best.prices.takeProfit1}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-bold block">
                  +${best.propFirmRiskCalculation.projectedProfitTp1Usd.toFixed(2)} USD
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-emerald-900/50">
                <span className="text-[10px] text-emerald-400 uppercase block">
                  Take Profit 2 (1:3.0)
                </span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                  {best.prices.takeProfit2}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-bold block">
                  +${best.propFirmRiskCalculation.projectedProfitTp2Usd.toFixed(2)} USD
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-amber-700/50">
                <span className="text-[10px] text-amber-300 uppercase block">
                  {isEn ? 'Exact Lot Size' : 'Lotaje Exacto'}
                </span>
                <span className="text-base font-black text-amber-400 mt-0.5 block">
                  {best.propFirmRiskCalculation.recommendedLots} {isEn ? 'Lots' : 'Lotes'}
                </span>
                <span className="text-[10px] text-amber-200/60 truncate block">
                  {best.propFirmRiskCalculation.contractSizeSpec}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
                <span className="text-[10px] text-amber-200/60 uppercase block">
                  {isEn ? 'Exact Risk ($)' : 'Riesgo Exacto ($)'}
                </span>
                <span className="text-base font-black text-white mt-0.5 block">
                  ${best.propFirmRiskCalculation.actualRiskAtStopUsd.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-emerald-400 block">
                  ({best.propFirmRiskCalculation.riskPercentage}% • R:R {best.prices.riskRewardRatio})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] text-xs text-amber-100/90 leading-relaxed">
              <strong className="text-amber-400 font-mono uppercase mr-2">
                {isEn ? 'Why this is the #1 Setup:' : 'Por qué es la Entrada #1:'}
              </strong>
              {best.thesisRationale}
            </div>
          </div>
        </div>
      )}

      {/* Full Ranked Table of All Scanned Indices & Assets */}
      {scanData && scanData.rankedSetups.length > 0 && (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#120c08] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold font-mono uppercase text-white">
                {isEn
                  ? `Comparative Ranking of All Scanned Setups (${scanData.rankedSetups.length} Assets)`
                  : `Tabla Comparativa de Entradas por Probabilidad de Acierto (${scanData.rankedSetups.length} Activos)`}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-200/60">
              {isEn
                ? 'Click any row to inspect full rationale & confluence meters'
                : 'Haz clic en cualquier activo para desplegar sus detalles y confluencias'}
            </span>
          </div>

          <div className="divide-y divide-[#3b271a]">
            {scanData.rankedSetups.map((item, idx) => {
              const colors = getBadgeColors(item.recommendationVerdict);
              const isExpanded = expandedSymbol === item.asset;

              return (
                <div key={item.asset} className="transition hover:bg-[#1e140d]/60">
                  <div
                    onClick={() =>
                      setExpandedSymbol(isExpanded ? null : item.asset)
                    }
                    className="p-3.5 sm:px-5 cursor-pointer flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-[210px]">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center border ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : idx < 3
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                            : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                          item.action === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/50'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-600/50'
                        }`}
                      >
                        {item.action}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-sm text-white">{item.asset}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#120c08] text-amber-300/80 border border-[#3b271a]">
                            {item.region}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-200/60 truncate max-w-[180px]">
                          {item.assetName}
                        </div>
                      </div>
                    </div>

                    {/* Coordinates Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs flex-1 max-w-2xl">
                      <div>
                        <span className="text-[10px] text-amber-200/50 block">
                          {isEn ? 'Entry' : 'Entrada'}
                        </span>
                        <span className="font-bold text-white">{item.prices.entryPrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400/80 block">Stop Loss</span>
                        <span className="font-bold text-rose-300">{item.prices.stopLoss}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400/80 block">TP1 / TP2</span>
                        <span className="font-bold text-emerald-300">
                          {item.prices.takeProfit1} / {item.prices.takeProfit2}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-300/80 block">
                          {isEn ? 'Lots' : 'Lotes'} ({item.propFirmRiskCalculation.riskPercentage}%)
                        </span>
                        <span className="font-bold text-amber-300">
                          {item.propFirmRiskCalculation.recommendedLots} L (-$
                          {item.propFirmRiskCalculation.actualRiskAtStopUsd.toFixed(0)})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-200/50 block">
                          {isEn ? 'Win Rate' : 'Acierto'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-sm ${colors.text}`}>
                            {item.winProbability}%
                          </span>
                          <span className="text-[10px] text-amber-200/50">
                            ({item.totalConfluenceScore} pts)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border hidden md:inline-block ${colors.badge}`}
                      >
                        {item.recommendationVerdict === 'TAKE'
                          ? isEn
                            ? 'A+ TAKE'
                            : 'TOMAR A+'
                          : item.recommendationVerdict === 'CAUTION'
                          ? isEn
                            ? 'CAUTION'
                            : 'PRECAUCIÓN'
                          : isEn
                          ? 'WAIT'
                          : 'ESPERAR'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-amber-200/50" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 bg-[#120c08]/90 border-t border-[#3b271a]/60 space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-amber-300 font-bold">
                          {item.playbookName}
                        </span>
                        <div className="flex items-center gap-2">
                          {onSelectAssetInChart && (
                            <button
                              type="button"
                              onClick={() => onSelectAssetInChart(item.asset)}
                              className="px-2.5 py-1 rounded bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] font-mono text-[11px] flex items-center gap-1"
                            >
                              <LineChart className="w-3 h-3 text-amber-400" />
                              <span>{isEn ? 'Open in Chart' : 'Ver en Gráfico'}</span>
                            </button>
                          )}
                          {onOpenInSetupEngine && (
                            <button
                              type="button"
                              onClick={() => onOpenInSetupEngine(item.asset)}
                              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[11px] flex items-center gap-1"
                            >
                              <Target className="w-3 h-3" />
                              <span>
                                {isEn ? 'Open in Entry Generator' : 'Abrir en Generador'}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopySetup(item)}
                            className="px-2.5 py-1 rounded bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] font-mono text-[11px] flex items-center gap-1"
                          >
                            {copiedSymbol === item.asset ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{isEn ? 'Copy' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-amber-100/90 leading-relaxed">{item.thesisRationale}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                        <div className="p-2.5 rounded-lg bg-[#18110b] border border-[#3b271a]">
                          <span className="text-amber-200/60 block">
                            {isEn ? 'Contract & Lot Math:' : 'Cálculo Exacto de Contrato:'}
                          </span>
                          <strong className="text-white">
                            {item.propFirmRiskCalculation.recommendedLots} Lotes
                          </strong>{' '}
                          • {item.propFirmRiskCalculation.contractSizeSpec}
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#18110b] border border-[#3b271a]">
                          <span className="text-rose-400 block">
                            {isEn ? 'Loss if SL Hit:' : 'Pérdida si toca Stop Loss:'}
                          </span>
                          <strong className="text-rose-300">
                            -${item.propFirmRiskCalculation.actualRiskAtStopUsd.toFixed(2)} USD
                          </strong>{' '}
                          ({item.prices.stopLossDistance})
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#18110b] border border-[#3b271a]">
                          <span className="text-emerald-400 block">
                            {isEn ? 'Profit TP1 / TP2:' : 'Ganancia en TP1 / TP2:'}
                          </span>
                          <strong className="text-emerald-300">
                            +${item.propFirmRiskCalculation.projectedProfitTp1Usd.toFixed(2)} / +$
                            {item.propFirmRiskCalculation.projectedProfitTp2Usd.toFixed(2)} USD
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
