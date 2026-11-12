import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Globe,
  Timer,
  Radar,
} from 'lucide-react';
import { InstrumentQuote, KillzoneSession, AppSettings, ALL_PROGRAMMED_TRADEABLE_SYMBOLS } from '../types/trading';
import { FUTURES_CONTRACT_MAP, getSpec } from '../lib/instruments';
import { MiniTradingChart } from './MiniTradingChart';
import { TradingViewChart } from './TradingViewChart';

interface MarketTerminalProps {
  instruments: InstrumentQuote[];
  session: KillzoneSession | null;
  onRefreshFeed: () => void;
  activeDocSnippet?: string;
  onRequestEntry: (symbol: string) => void;
  onGenerateReport: (symbol: string) => void;
  onOpenScanner?: () => void;
  initialAsset?: string;
  settings: AppSettings;
}

interface LiveSessionTimerInfo {
  sessionName: string;
  sessionHours: string;
  sessionRemaining: string;
  nextSessionName: string;
  nextSessionWindow: string;
  nextSessionFocus: string;
  nyClock: string;
}

function computeLiveSessionTimers(isEn: boolean, is12h: boolean): LiveSessionTimerInfo {
  const now = new Date();
  const nyClock = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: is12h,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now);

  const getVal = (t: string) => parts.find((p) => p.type === t)?.value || '0';
  const h = parseInt(getVal('hour'), 10) % 24;
  const m = parseInt(getVal('minute'), 10);
  const s = parseInt(getVal('second'), 10);
  const secOfDay = h * 3600 + m * 60 + s;

  const fmt = (sec: number) => {
    const safe = Math.max(0, sec);
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  let sessionName = isEn ? 'Asian Range (Asia Session)' : 'Rango Asiático (Sesión Asia)';
  let sessionHours = is12h ? '7:00 PM – 2:00 AM' : '19:00 – 02:00';
  let remainingSec = 0;
  let nextSessionName = isEn ? 'London & Europe Open (Killzone)' : 'Sesión Londres & Apertura Europea';
  let nextSessionWindow = is12h ? '2:00 AM – 5:00 AM (NY)' : '02:00 – 05:00 (NY)';
  let nextSessionFocus = isEn
    ? 'Asian range sweep & expansion in GER40, UK100, EU50, EUR/USD & XAU/USD'
    : 'Barrido del rango asiático y expansión en GER40, UK100, EU50, EUR/USD y XAU/USD';

  if (secOfDay >= 2 * 3600 && secOfDay < 5 * 3600) {
    sessionName = isEn ? 'London & European Open (Killzone)' : 'Sesión Londres & Apertura Europea (Killzone)';
    sessionHours = is12h ? '2:00 AM – 5:00 AM' : '02:00 – 05:00';
    remainingSec = 5 * 3600 - secOfDay;
    nextSessionName = isEn ? 'European Continuation / Pre-NY' : 'Continuación Europea / Pre-NY';
    nextSessionWindow = is12h ? '5:00 AM – 8:00 AM (NY)' : '05:00 – 08:00 (NY)';
    nextSessionFocus = isEn
      ? 'Trend continuation in European indices & FX ahead of US macro data'
      : 'Continuación de tendencia en índices europeos y divisas antes de datos macro de EE. UU.';
  } else if (secOfDay >= 5 * 3600 && secOfDay < 8 * 3600) {
    sessionName = isEn ? 'European Continuation / Pre-NY' : 'Continuación Europea / Pre-NY';
    sessionHours = is12h ? '5:00 AM – 8:00 AM' : '05:00 – 08:00';
    remainingSec = 8 * 3600 - secOfDay;
    nextSessionName = isEn ? 'NY Pre-Market & COMEX Gold' : 'Pre-Mercado NY & Apertura COMEX';
    nextSessionWindow = is12h ? '8:00 AM – 9:30 AM (NY)' : '08:00 – 09:30 (NY)';
    nextSessionFocus = isEn
      ? 'Gold futures open (8:20 AM) and 8:30 AM macro releases'
      : 'Apertura de futuros de Oro (8:20 AM) y datos macro de las 8:30 AM';
  } else if (secOfDay >= 8 * 3600 && secOfDay < 9.5 * 3600) {
    sessionName = isEn ? 'NY Pre-Market & COMEX Gold' : 'Pre-Mercado NY & Apertura COMEX';
    sessionHours = is12h ? '8:00 AM – 9:30 AM' : '08:00 – 09:30';
    remainingSec = 9.5 * 3600 - secOfDay;
    nextSessionName = isEn ? 'Wall Street Open & Silver Bullet AM' : 'Apertura Wall Street & Silver Bullet AM';
    nextSessionWindow = is12h ? '9:30 AM – 12:00 PM (NY)' : '09:30 – 12:00 (NY)';
    nextSessionFocus = isEn
      ? 'Primary liquidity injection across NAS100, US500, US30, US2000 & XAU/USD'
      : 'Inyección de liquidez principal en NAS100, US500, US30, US2000 y XAU/USD';
  } else if (secOfDay >= 9.5 * 3600 && secOfDay < 12 * 3600) {
    sessionName = isEn ? 'Wall Street Open & Silver Bullet AM' : 'Apertura Wall Street & Silver Bullet AM';
    sessionHours = is12h ? '9:30 AM – 12:00 PM' : '09:30 – 12:00';
    remainingSec = 12 * 3600 - secOfDay;
    nextSessionName = isEn ? 'New York Lunch' : 'Almuerzo Nueva York (NY Lunch)';
    nextSessionWindow = is12h ? '12:00 PM – 1:30 PM (NY)' : '12:00 – 13:30 (NY)';
    nextSessionFocus = isEn
      ? 'Intraday volume reduction on Wall Street; wait for afternoon Silver Bullet'
      : 'Reducción de volumen intradía en Wall Street; esperar ventana de la tarde';
  } else if (secOfDay >= 12 * 3600 && secOfDay < 13.5 * 3600) {
    sessionName = isEn ? 'New York Lunch (Consolidation)' : 'Almuerzo Nueva York (NY Lunch)';
    sessionHours = is12h ? '12:00 PM – 1:30 PM' : '12:00 – 13:30';
    remainingSec = 13.5 * 3600 - secOfDay;
    nextSessionName = isEn ? 'NY Afternoon & Silver Bullet PM' : 'Sesión NY Tarde & Silver Bullet PM';
    nextSessionWindow = is12h ? '1:30 PM – 4:00 PM (NY)' : '13:30 – 16:00 (NY)';
    nextSessionFocus = isEn
      ? 'Afternoon institutional orderflow & PM Silver Bullet (2:00 – 3:00 PM NY)'
      : 'Flujo institucional vespertino y ventana Silver Bullet PM (2:00 – 3:00 PM NY)';
  } else if (secOfDay >= 13.5 * 3600 && secOfDay < 16 * 3600) {
    sessionName = isEn ? 'NY Afternoon & Silver Bullet PM' : 'Sesión NY Tarde & Silver Bullet PM';
    sessionHours = is12h ? '1:30 PM – 4:00 PM' : '13:30 – 16:00';
    remainingSec = 16 * 3600 - secOfDay;
    nextSessionName = isEn ? 'Post-Market & Rollover' : 'Post-Mercado & Rollover Bancario';
    nextSessionWindow = is12h ? '4:00 PM – 7:00 PM (NY)' : '16:00 – 19:00 (NY)';
    nextSessionFocus = isEn
      ? 'US session close, lower liquidity & spread adjustment'
      : 'Cierre de sesión americana, baja liquidez y ajuste de spreads';
  } else if (secOfDay >= 16 * 3600 && secOfDay < 19 * 3600) {
    sessionName = isEn ? 'Post-Market & Rollover' : 'Post-Mercado & Rollover Bancario';
    sessionHours = is12h ? '4:00 PM – 7:00 PM' : '16:00 – 19:00';
    remainingSec = 19 * 3600 - secOfDay;
    nextSessionName = isEn ? 'Asian Session (JP225 & HK50)' : 'Rango Asiático (Sesión Asia)';
    nextSessionWindow = is12h ? '7:00 PM – 2:00 AM (NY)' : '19:00 – 02:00 (NY)';
    nextSessionFocus = isEn
      ? 'Tokyo/HK index liquidity & Asian high/low range formation'
      : 'Liquidez en Nikkei 225 / Hang Seng y marcación de altos/bajos asiáticos';
  } else {
    sessionName = isEn ? 'Asian Range (Asia Session)' : 'Rango Asiático (Sesión Asia)';
    sessionHours = is12h ? '7:00 PM – 2:00 AM' : '19:00 – 02:00';
    remainingSec = secOfDay >= 19 * 3600 ? 24 * 3600 - secOfDay + 2 * 3600 : 2 * 3600 - secOfDay;
  }

  return {
    sessionName,
    sessionHours,
    sessionRemaining: fmt(remainingSec),
    nextSessionName,
    nextSessionWindow,
    nextSessionFocus,
    nyClock,
  };
}

export const MarketTerminal: React.FC<MarketTerminalProps> = ({
  instruments,
  session,
  onRefreshFeed,
  onRequestEntry,
  onGenerateReport,
  onOpenScanner,
  initialAsset = 'NAS100',
  settings,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialAsset);

  useEffect(() => {
    if (initialAsset) {
      setSelectedSymbol(initialAsset);
    }
  }, [initialAsset]);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'US' | 'EU_UK' | 'ASIA_GLOBAL'>('ALL');
  const [chartMode, setChartMode] = useState<'tradingview' | 'microstructure'>('tradingview');
  const isEn = settings.language === 'en';
  const is12h = settings.timeFormat === '12h';

  const [timerInfo, setTimerInfo] = useState<LiveSessionTimerInfo>(() =>
    computeLiveSessionTimers(isEn, is12h)
  );

  useEffect(() => {
    setTimerInfo(computeLiveSessionTimers(isEn, is12h));
    const interval = setInterval(() => {
      setTimerInfo(computeLiveSessionTimers(isEn, is12h));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEn, is12h]);

  const marketMode = settings.instrumentMarketMode || 'all_programmed';
  const enabledList =
    Array.isArray(settings.enabledSymbols) && settings.enabledSymbols.length > 0
      ? settings.enabledSymbols
      : ALL_PROGRAMMED_TRADEABLE_SYMBOLS;

  const allTradeableQuotes = instruments.filter((i) => i.category !== 'Macro Variable');
  const tradeableInstruments =
    allTradeableQuotes.filter((i) => enabledList.includes(i.symbol)).length > 0
      ? allTradeableQuotes.filter((i) => enabledList.includes(i.symbol))
      : allTradeableQuotes;
  const macroInstruments = instruments.filter((i) => i.category === 'Macro Variable');

  useEffect(() => {
    if (
      selectedSymbol &&
      !enabledList.includes(selectedSymbol) &&
      !['DXY', 'US10Y', 'VIX'].includes(selectedSymbol) &&
      tradeableInstruments.length > 0
    ) {
      setSelectedSymbol(tradeableInstruments[0].symbol);
    }
  }, [enabledList, selectedSymbol, tradeableInstruments]);

  const filteredTradeables = tradeableInstruments.filter((inst) => {
    if (regionFilter === 'US') return inst.region === 'US';
    if (regionFilter === 'EU_UK') return inst.region === 'EU' || inst.region === 'UK';
    if (regionFilter === 'ASIA_GLOBAL')
      return inst.region === 'ASIA' || inst.region === 'GLOBAL';
    return true;
  });

  const selectedInstrument =
    instruments.find((i) => i.symbol === selectedSymbol) ||
    tradeableInstruments[0] ||
    instruments[0];

  const modeHeaderTitle =
    marketMode === 'futures_only'
      ? isEn
        ? 'Institutional Futures Contracts (CME / Eurex / ICE / COMEX)'
        : 'Contratos de Futuros Institucionales (CME / Eurex / ICE / COMEX)'
      : marketMode === 'cfd_only'
      ? isEn
        ? 'CFD Only Mode — Primary Indices, Gold & Forex (Live Stream)'
        : 'Modo Solo CFD — Índices Primarios, Oro & Forex (En Vivo)'
      : isEn
      ? 'Programmed Indices, Gold & Forex (Live Stream)'
      : 'Índices Programados, Oro & Forex (En Vivo)';

  return (
    <div className={settings.compactCards ? 'space-y-3' : 'space-y-6'}>
      {/* Current Section & Next Schedule Section Countdown Banner */}
      {settings.showSessionBanner && (
        <div
          className={`${
            settings.compactCards ? 'p-3' : 'p-4'
          } rounded-xl border bg-[#18110b] border-[#3b271a] shadow-lg`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  session?.active
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                    : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wider text-amber-300/70 font-mono font-bold">
                    {isEn ? 'Current Section' : 'Sección Actual'} ({timerInfo.sessionHours})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#24170f] text-amber-200 border border-[#4d3221] font-mono">
                    NY: {timerInfo.nyClock}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-0.5">{timerInfo.sessionName}</h2>
                {session?.description && !settings.compactCards && (
                  <p className="text-xs text-amber-200/70 mt-0.5">{session.description}</p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-amber-300/60 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-amber-400" />
                  <span>
                    {isEn ? 'Time remaining in section' : 'Tiempo restante de esta sección'}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                  {timerInfo.sessionRemaining}
                </div>
                <div className="text-[10px] font-mono text-amber-200/50">
                  {isEn ? 'Ends at' : 'Termina a las'}{' '}
                  {timerInfo.sessionHours.split('–')[1]?.trim()} (NY)
                </div>
              </div>
              {session && session.recommendedAssets.length > 0 && (
                <div className="text-right font-mono">
                  <span className="text-[10px] text-amber-200/50 block mb-1">
                    {isEn ? 'Prime Assets Now' : 'Activos Óptimos Ahora'}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                    {session.recommendedAssets
                      .filter((sym) => enabledList.includes(sym))
                      .map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => setSelectedSymbol(sym)}
                          className="px-1.5 py-0.5 rounded bg-amber-950/90 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-700/60 text-[10px] font-bold transition"
                        >
                          {sym}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl border bg-[#120c08] border-[#3b271a] flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase font-mono text-amber-300/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>
                    {isEn ? 'Next Section' : 'Siguiente Sección'} ({timerInfo.nextSessionWindow})
                  </span>
                </div>
                <div className="text-base font-black font-mono text-white mt-0.5">
                  {timerInfo.nextSessionName}
                </div>
                <div className="text-[11px] text-amber-200/60 mt-0.5 line-clamp-1">
                  {timerInfo.nextSessionFocus}
                </div>
              </div>

              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow transition"
                  title={
                    isEn
                      ? 'Scan all indices for highest win probability setup'
                      : 'Escanear todos los índices y ver la entrada con mayor acierto'
                  }
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Best Setup' : 'Mejor Entrada'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tickers Grid: Filtered by Settings (CFD Only / All Programmed / Futures Only) */}
      {(settings.showTickerGrid || settings.showMacroBar) && (
        <div>
          {settings.showTickerGrid && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-100 font-mono">
                    {modeHeaderTitle}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    {tradeableInstruments.length}{' '}
                    {marketMode === 'futures_only'
                      ? isEn
                        ? 'FUTURES LIVE'
                        : 'FUTUROS EN VIVO'
                      : marketMode === 'cfd_only'
                      ? isEn
                        ? 'CFDs LIVE'
                        : 'CFDs EN VIVO'
                      : isEn
                      ? 'ASSETS LIVE'
                      : 'ACTIVOS EN VIVO'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  {[
                    {
                      id: 'ALL',
                      labelEs: `Todos (${tradeableInstruments.length})`,
                      labelEn: `All (${tradeableInstruments.length})`,
                    },
                    {
                      id: 'US',
                      labelEs: `EE. UU. (${tradeableInstruments.filter((i) => i.region === 'US').length})`,
                      labelEn: `US (${tradeableInstruments.filter((i) => i.region === 'US').length})`,
                    },
                    {
                      id: 'EU_UK',
                      labelEs: `Europa/UK (${tradeableInstruments.filter((i) => i.region === 'EU' || i.region === 'UK').length})`,
                      labelEn: `Europe/UK (${tradeableInstruments.filter((i) => i.region === 'EU' || i.region === 'UK').length})`,
                    },
                    {
                      id: 'ASIA_GLOBAL',
                      labelEs: `Asia/Oro/FX (${tradeableInstruments.filter((i) => i.region === 'ASIA' || i.region === 'GLOBAL').length})`,
                      labelEn: `Asia/Gold/FX (${tradeableInstruments.filter((i) => i.region === 'ASIA' || i.region === 'GLOBAL').length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRegionFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${
                        regionFilter === tab.id
                          ? 'bg-amber-600 text-white border-amber-400 font-bold'
                          : 'bg-[#18110b] text-amber-200/70 border-[#3b271a] hover:border-amber-600'
                      }`}
                    >
                      {isEn ? tab.labelEn : tab.labelEs}
                    </button>
                  ))}

                  <button
                    onClick={onRefreshFeed}
                    className="text-xs text-amber-200 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#24170f] border border-[#4d3221] hover:border-amber-500 transition font-mono"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? 'Sync' : 'Sincronizar'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTradeables.map((inst) => {
                  const isSelected = selectedSymbol === inst.symbol;
                  const isPositive = inst.change24h.startsWith('+');
                  const tickUp = inst.lastTickDirection === 'up';
                  const tickDown = inst.lastTickDirection === 'down';
                  const spec = getSpec(inst.symbol);
                  const decimals = spec ? spec.decimals : inst.price < 10 ? 5 : inst.price > 15000 ? 1 : 2;
                  const futInfo = FUTURES_CONTRACT_MAP[inst.symbol];
                  const displayName =
                    marketMode === 'futures_only' && futInfo
                      ? isEn
                        ? futInfo.nameEn
                        : futInfo.nameEs
                      : inst.name;
                  const modeBadge =
                    marketMode === 'futures_only' && futInfo
                      ? `${futInfo.futuresTicker} • ${futInfo.exchange}`
                      : marketMode === 'cfd_only'
                      ? 'CFD'
                      : null;

                  return (
                    <div
                      key={inst.symbol}
                      onClick={() => setSelectedSymbol(inst.symbol)}
                      className={`${
                        settings.compactCards ? 'p-2.5' : 'p-3.5'
                      } rounded-xl border cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#2b1c13] border-amber-500 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                          : 'bg-[#18110b] border-[#3b271a] hover:border-[#573926] hover:bg-[#20150e]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-sm text-white shrink-0">
                            {inst.symbol}
                          </span>
                          {modeBadge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60 shrink-0">
                              {modeBadge}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-amber-200/60 truncate">
                            {displayName}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
                              tickUp
                                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                                : tickDown
                                ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                                : 'bg-amber-400'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                            isPositive
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {inst.change24h}
                        </span>
                      </div>

                      {/* Live Price Display with Tick Color Flash */}
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <div
                          className={`text-xl font-black font-mono tracking-tight transition-colors duration-300 ${
                            tickUp
                              ? 'text-emerald-300'
                              : tickDown
                              ? 'text-rose-300'
                              : 'text-white'
                          }`}
                        >
                          {inst.price.toLocaleString(undefined, {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals,
                          })}
                        </div>
                        <span className="text-[10px] font-mono text-amber-300/60">
                          {inst.atr14 ? `ATR: ${inst.atr14}` : tickUp ? '▲ ASK' : '▼ BID'}
                        </span>
                      </div>

                      {/* 24h High / Low Range */}
                      {!settings.compactCards && inst.high24h && inst.low24h && (
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-amber-200/70 bg-[#120c08] px-2 py-0.5 rounded border border-[#2d1c12]">
                          <span>
                            L:{' '}
                            <strong className="text-rose-300">
                              {inst.low24h.toLocaleString(undefined, {
                                minimumFractionDigits: decimals,
                                maximumFractionDigits: decimals,
                              })}
                            </strong>
                          </span>
                          <span>
                            H:{' '}
                            <strong className="text-emerald-300">
                              {inst.high24h.toLocaleString(undefined, {
                                minimumFractionDigits: decimals,
                                maximumFractionDigits: decimals,
                              })}
                            </strong>
                          </span>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-[#3b271a]/80 flex items-center justify-between gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestEntry(inst.symbol);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white font-mono font-bold transition"
                        >
                          {isEn ? 'Get Entry' : 'Pedir Entrada'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateReport(inst.symbol);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded bg-[#291b12] hover:bg-[#382519] text-amber-200 font-mono transition border border-[#422c1e]"
                        >
                          {isEn ? 'Report' : 'Reporte'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Macro Variables Bar (DXY, US10Y, VIX) */}
          {settings.showMacroBar && macroInstruments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {macroInstruments.map((inst) => {
                const isSelected = selectedSymbol === inst.symbol;
                const tickUp = inst.lastTickDirection === 'up';
                const tickDown = inst.lastTickDirection === 'down';
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => setSelectedSymbol(inst.symbol)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between font-mono text-xs ${
                      isSelected
                        ? 'bg-[#2b1c13] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-[#160f0a] hover:bg-[#1f150e] border-[#3b271a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          tickUp ? 'bg-emerald-400' : tickDown ? 'bg-rose-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-amber-300 font-bold shrink-0">{inst.symbol}</span>
                      <span className="text-[11px] text-amber-200/60 truncate hidden sm:inline">
                        ({inst.name})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-bold transition-colors duration-300 ${
                          tickUp ? 'text-emerald-300' : tickDown ? 'text-rose-300' : 'text-white'
                        }`}
                      >
                        {inst.price.toFixed(inst.symbol === 'US10Y' ? 3 : 2)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          inst.change24h.startsWith('+')
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                            : 'text-rose-400 bg-rose-950/60 border border-rose-800/40'
                        }`}
                      >
                        {inst.change24h}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chart Section Toggle & View */}
      {settings.showChartSection && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-200">
                {isEn ? 'Live Chart:' : 'Gráfico en Tiempo Real:'} {selectedSymbol}
              </span>
            </div>

            <div className="flex items-center bg-[#18110b] border border-[#3b271a] rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setChartMode('tradingview')}
                className={`px-3 py-1 rounded font-semibold transition ${
                  chartMode === 'tradingview'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-200/60 hover:text-white'
                }`}
              >
                TradingView Live
              </button>
              <button
                onClick={() => setChartMode('microstructure')}
                className={`px-3 py-1 rounded font-semibold transition ${
                  chartMode === 'microstructure'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-200/60 hover:text-white'
                }`}
              >
                {isEn ? 'POI & FVG Levels' : 'Niveles POI & FVG'}
              </button>
            </div>
          </div>

          {chartMode === 'tradingview' ? (
            <TradingViewChart
              currentSymbol={selectedSymbol}
              onSymbolChange={(sym) => setSelectedSymbol(sym)}
              language={settings.language}
              marketMode={settings.instrumentMarketMode}
              enabledSymbols={settings.enabledSymbols}
              theme={settings.theme}
            />
          ) : (
            selectedInstrument && (
              <MiniTradingChart
                instrument={selectedInstrument}
                language={settings.language}
                theme={settings.theme}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
