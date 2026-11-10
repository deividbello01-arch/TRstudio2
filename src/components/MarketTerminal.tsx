import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Globe,
  Timer,
} from 'lucide-react';
import { InstrumentQuote, KillzoneSession, AppSettings } from '../types/trading';
import { MiniTradingChart } from './MiniTradingChart';
import { TradingViewChart } from './TradingViewChart';

interface MarketTerminalProps {
  instruments: InstrumentQuote[];
  session: KillzoneSession | null;
  onRefreshFeed: () => void;
  activeDocSnippet?: string;
  onRequestEntry: (symbol: string) => void;
  onGenerateReport: (symbol: string) => void;
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
  let nextSessionName = isEn ? 'London Session' : 'Sesión Londres';
  let nextSessionWindow = is12h ? '2:00 AM – 8:00 AM (NY)' : '02:00 – 08:00 (NY)';
  let nextSessionFocus = isEn
    ? 'Asian range sweep and expansion in EUR/USD & XAU/USD'
    : 'Barrido del rango asiático y expansión en EUR/USD y XAU/USD';

  if (secOfDay >= 2 * 3600 && secOfDay < 8 * 3600) {
    sessionName = isEn ? 'London Session' : 'Sesión Londres';
    sessionHours = is12h ? '2:00 AM – 8:00 AM' : '02:00 – 08:00';
    remainingSec = 8 * 3600 - secOfDay;
    nextSessionName = isEn ? 'NY Pre-Market & COMEX Gold' : 'Pre-Mercado NY & Oro COMEX';
    nextSessionWindow = is12h ? '8:00 AM – 9:30 AM (NY)' : '08:00 – 09:30 (NY)';
    nextSessionFocus = isEn
      ? 'Gold futures open (8:20 AM) and 8:30 AM macro releases'
      : 'Apertura de futuros de Oro (8:20 AM) y datos macro de las 8:30 AM';
  } else if (secOfDay >= 8 * 3600 && secOfDay < 9.5 * 3600) {
    sessionName = isEn ? 'NY Pre-Market & COMEX Gold' : 'Pre-Mercado NY & Oro COMEX';
    sessionHours = is12h ? '8:00 AM – 9:30 AM' : '08:00 – 09:30';
    remainingSec = 9.5 * 3600 - secOfDay;
    nextSessionName = isEn ? 'New York Session (Open)' : 'Sesión Nueva York (Apertura)';
    nextSessionWindow = is12h ? '9:30 AM – 4:00 PM (NY)' : '09:30 – 16:00 (NY)';
    nextSessionFocus = isEn
      ? 'Primary liquidity injection across NAS100, US500, XAU/USD & EUR/USD'
      : 'Inyección de liquidez principal en NAS100, US500, XAU/USD y EUR/USD';
  } else if (secOfDay >= 9.5 * 3600 && secOfDay < 16 * 3600) {
    sessionName = isEn ? 'New York Session' : 'Sesión Nueva York';
    sessionHours = is12h ? '9:30 AM – 4:00 PM' : '09:30 – 16:00';
    remainingSec = 16 * 3600 - secOfDay;
    nextSessionName = isEn ? 'Post-Market & Rollover' : 'Post-Mercado & Rollover';
    nextSessionWindow = is12h ? '4:00 PM – 7:00 PM (NY)' : '16:00 – 19:00 (NY)';
    nextSessionFocus = isEn
      ? 'US session close, lower liquidity & spread adjustment'
      : 'Cierre de sesión americana, baja liquidez y ajuste de spreads';
  } else if (secOfDay >= 16 * 3600 && secOfDay < 19 * 3600) {
    sessionName = isEn ? 'Post-Market & Rollover' : 'Post-Mercado & Rollover';
    sessionHours = is12h ? '4:00 PM – 7:00 PM' : '16:00 – 19:00';
    remainingSec = 19 * 3600 - secOfDay;
    nextSessionName = isEn ? 'Asian Range (Asia Session)' : 'Rango Asiático (Sesión Asia)';
    nextSessionWindow = is12h ? '7:00 PM – 2:00 AM (NY)' : '19:00 – 02:00 (NY)';
    nextSessionFocus = isEn
      ? 'Accumulation & Asian high/low liquidity boundaries'
      : 'Acumulación y marcación de altos/bajos de liquidez asiática';
  } else {
    sessionName = isEn ? 'Asian Range (Asia Session)' : 'Rango Asiático (Sesión Asia)';
    sessionHours = is12h ? '7:00 PM – 2:00 AM' : '19:00 – 02:00';
    remainingSec = secOfDay >= 19 * 3600 ? 24 * 3600 - secOfDay + 2 * 3600 : 2 * 3600 - secOfDay;
    nextSessionName = isEn ? 'London Session' : 'Sesión Londres';
    nextSessionWindow = is12h ? '2:00 AM – 8:00 AM (NY)' : '02:00 – 08:00 (NY)';
    nextSessionFocus = isEn
      ? 'Asian range sweep and expansion in EUR/USD & XAU/USD'
      : 'Barrido del rango asiático y expansión en EUR/USD y XAU/USD';
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
  settings,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NAS100');
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

  const selectedInstrument = instruments.find((i) => i.symbol === selectedSymbol) || instruments[0];

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
            {/* Left: Current Section Info */}
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

            {/* Center: Remaining Time in Current Section */}
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
                    {isEn ? 'Key Pairs' : 'Pares clave'}
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {session.recommendedAssets.map((sym) => (
                      <span
                        key={sym}
                        className="px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/60 text-[10px] font-bold"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Next Schedule Section Info */}
            <div className="p-3 rounded-xl border bg-[#120c08] border-[#3b271a] flex items-center justify-between">
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
            </div>
          </div>
        </div>
      )}

      {/* Tickers Grid: 4 Core Assets + Macro Variables */}
      {(settings.showTickerGrid || settings.showMacroBar) && (
        <div>
          {settings.showTickerGrid && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-100 font-mono">
                    {isEn ? 'Live Quotes & Microstructure' : 'Cotizaciones & Microestructura'}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    {isEn ? 'LIVE STREAM' : 'EN VIVO'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onRefreshFeed}
                    className="text-xs text-amber-200 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#24170f] border border-[#4d3221] hover:border-amber-500 transition font-mono"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? 'Sync Now' : 'Sincronizar'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {instruments.slice(0, 4).map((inst) => {
                  const isSelected = selectedSymbol === inst.symbol;
                  const isPositive = inst.change24h.startsWith('+');
                  const tickUp = inst.lastTickDirection === 'up';
                  const tickDown = inst.lastTickDirection === 'down';

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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-white">
                            {inst.symbol}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              tickUp
                                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                                : tickDown
                                ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                                : 'bg-amber-400'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
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
                            minimumFractionDigits: inst.price < 10 ? 4 : 2,
                            maximumFractionDigits: inst.price < 10 ? 4 : 2,
                          })}
                        </div>
                        <span className="text-[10px] font-mono text-amber-300/60">
                          {tickUp ? '▲ ASK' : tickDown ? '▼ BID' : '• LIVE'}
                        </span>
                      </div>

                      {/* 24h High / Low Range */}
                      {!settings.compactCards && inst.high24h && inst.low24h && (
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-amber-200/70 bg-[#120c08] px-2 py-0.5 rounded border border-[#2d1c12]">
                          <span>
                            L:{' '}
                            <strong className="text-rose-300">
                              {inst.low24h.toLocaleString(undefined, {
                                minimumFractionDigits: inst.price < 10 ? 4 : 2,
                              })}
                            </strong>
                          </span>
                          <span>
                            H:{' '}
                            <strong className="text-emerald-300">
                              {inst.high24h.toLocaleString(undefined, {
                                minimumFractionDigits: inst.price < 10 ? 4 : 2,
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
                          className="text-[10px] px-2 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white font-mono font-bold transition"
                        >
                          {isEn ? 'Get Entry' : 'Pedir Entrada'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateReport(inst.symbol);
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-[#291b12] hover:bg-[#382519] text-amber-200 font-mono transition border border-[#422c1e]"
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
          {settings.showMacroBar && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {instruments.slice(4).map((inst) => {
                const tickUp = inst.lastTickDirection === 'up';
                const tickDown = inst.lastTickDirection === 'down';
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => setSelectedSymbol(inst.symbol)}
                    className="p-2.5 rounded-lg bg-[#160f0a] hover:bg-[#1f150e] border border-[#3b271a] cursor-pointer transition flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tickUp ? 'bg-emerald-400' : tickDown ? 'bg-rose-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-amber-300 font-bold">{inst.symbol}</span>
                      <span className="text-[11px] text-amber-200/60 hidden sm:inline">
                        ({inst.name})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
            />
          ) : (
            selectedInstrument && (
              <MiniTradingChart instrument={selectedInstrument} language={settings.language} />
            )
          )}
        </div>
      )}
    </div>
  );
};
