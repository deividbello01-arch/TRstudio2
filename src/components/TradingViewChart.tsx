import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  ExternalLink,
  Coffee,
  TrendingUp,
  TrendingDown,
  Square,
  Minus,
  Pencil,
  Type,
  Undo2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CandleCountdownTimer } from './CandleCountdownTimer';
import { AppLanguage, AppTheme, InstrumentMarketMode, ALL_PROGRAMMED_TRADEABLE_SYMBOLS } from '../types/trading';
import { INSTRUMENTS, FUTURES_CONTRACT_MAP } from '../lib/instruments';

interface TradingViewChartProps {
  currentSymbol: string;
  onSymbolChange?: (symbol: string) => void;
  language?: AppLanguage;
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
  theme?: AppTheme;
}

type DrawingTool = 'cursor' | 'long' | 'short' | 'zone' | 'hline' | 'line' | 'pen' | 'text';

interface ChartDrawing {
  id: string;
  symbol: string;
  tool: Exclude<DrawingTool, 'cursor'>;
  color: string;
  x1: number; // percentage 0..100
  y1: number; // percentage 0..100
  x2: number; // percentage 0..100
  y2: number; // percentage 0..100
  points?: Array<{ x: number; y: number }>;
  label?: string;
}

const STORAGE_KEY = 'trstudio_chart_drawings_v1';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  currentSymbol,
  onSymbolChange,
  language = 'es',
  marketMode = 'all_programmed',
  enabledSymbols,
  theme = 'cream',
}) => {
  const isEn = language === 'en';
  const [timeframe, setTimeframe] = useState<string>('15');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [brokerSource, setBrokerSource] = useState<string>('default');

  // Drawing Overlay State
  const [isDrawMenuOpen, setIsDrawMenuOpen] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor');
  const [drawColor, setDrawColor] = useState<string>('#f59e0b');
  const [showDrawings, setShowDrawings] = useState<boolean>(true);
  const [customTextLabel, setCustomTextLabel] = useState<string>(
    isEn ? 'Entry / POI' : 'Entrada / POI'
  );
  const [drawings, setDrawings] = useState<ChartDrawing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [draftDrawing, setDraftDrawing] = useState<ChartDrawing | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings));
    } catch {
      // ignore storage errors
    }
  }, [drawings]);

  const activeEnabledSet = new Set(
    Array.isArray(enabledSymbols) && enabledSymbols.length > 0
      ? enabledSymbols
      : ALL_PROGRAMMED_TRADEABLE_SYMBOLS
  );

  // Build unrestricted embed symbols for all 15 CFD indices, metals, forex & macro variables
  const symbolMap: Record<
    string,
    {
      primary: string;
      alternates: Array<{ name: string; symbol: string }>;
      name: string;
      category: string;
    }
  > = Object.fromEntries(
    INSTRUMENTS.map((spec) => {
      const fut = FUTURES_CONTRACT_MAP[spec.symbol];
      const displayName =
        marketMode === 'futures_only' && fut
          ? isEn
            ? fut.nameEn
            : fut.nameEs
          : isEn
          ? spec.nameEn
          : spec.nameEs;
      return [
        spec.symbol,
        {
          primary: spec.chart.primary,
          alternates: spec.chart.alternates,
          name: displayName,
          category: spec.kind.toUpperCase(),
        },
      ];
    })
  );

  const visibleSymbolKeys = Object.keys(symbolMap).filter(
    (sym) => activeEnabledSet.has(sym) || ['DXY', 'US10Y', 'VIX'].includes(sym)
  );

  const selectedConfig = symbolMap[currentSymbol] || symbolMap.NAS100;

  const activeTvSymbol =
    brokerSource === 'default'
      ? selectedConfig.primary
      : selectedConfig.alternates.find((a) => a.symbol === brokerSource)?.symbol ||
        selectedConfig.primary;

  const encodedSymbol = encodeURIComponent(activeTvSymbol);
  const tvLocale = isEn ? 'en' : 'es';
  const isLightCream = theme === 'cream';
  const tvTheme = isLightCream ? 'light' : 'dark';
  const tvToolbarBg = isLightCream ? 'efeae0' : '18110b';
  const tvPaneBg = isLightCream ? '%23ffffff' : '%23120d09';
  const tvGridColor = isLightCream ? '%23e7e2d6' : '%23261a12';

  const widgetUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodedSymbol}&interval=${timeframe}&hidesidetoolbar=${isDrawMenuOpen ? '0' : '1'}&symboledit=1&saveimage=1&toolbarbg=${tvToolbarBg}&studies=%5B%5D&theme=${tvTheme}&style=1&timezone=America%2FNew_York&studies_overrides=%7B%7D&overrides=%7B%22paneProperties.background%22%3A%22${tvPaneBg}%22%2C%22paneProperties.vertGridProperties.color%22%3A%22${tvGridColor}%22%2C%22paneProperties.horzGridProperties.color%22%3A%22${tvGridColor}%22%2C%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2310b981%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23f43f5e%22%2C%22mainSeriesProperties.candleStyle.borderUpColor%22%3A%22%2310b981%22%2C%22mainSeriesProperties.candleStyle.borderDownColor%22%3A%22%23f43f5e%22%2C%22mainSeriesProperties.candleStyle.wickUpColor%22%3A%22%2310b981%22%2C%22mainSeriesProperties.candleStyle.wickDownColor%22%3A%22%23f43f5e%22%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=${tvLocale}&utm_source=trstudio&utm_medium=widget&utm_campaign=chart`;

  const timeframes = [
    { label: '1M', value: '1' },
    { label: '5M', value: '5' },
    { label: '15M', value: '15' },
    { label: '30M', value: '30' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
  ];

  const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'cursor') return;
    const { x, y } = getRelativeCoords(e);
    const id = `draw-${Date.now()}`;

    if (activeTool === 'hline') {
      const newHline: ChartDrawing = {
        id,
        symbol: currentSymbol,
        tool: 'hline',
        color: drawColor,
        x1: 0,
        y1: y,
        x2: 100,
        y2: y,
        label: isEn ? 'Key Level' : 'Nivel Clave',
      };
      setDrawings((prev) => [...prev, newHline]);
      setActiveTool('cursor');
      return;
    }

    if (activeTool === 'text') {
      const newText: ChartDrawing = {
        id,
        symbol: currentSymbol,
        tool: 'text',
        color: drawColor,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        label: customTextLabel.trim() || (isEn ? 'Note' : 'Nota'),
      };
      setDrawings((prev) => [...prev, newText]);
      setActiveTool('cursor');
      return;
    }

    setDraftDrawing({
      id,
      symbol: currentSymbol,
      tool: activeTool,
      color: drawColor,
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      points: activeTool === 'pen' ? [{ x, y }] : undefined,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draftDrawing) return;
    const { x, y } = getRelativeCoords(e);

    if (draftDrawing.tool === 'pen') {
      setDraftDrawing((prev) =>
        prev
          ? {
              ...prev,
              x2: x,
              y2: y,
              points: [...(prev.points || []), { x, y }],
            }
          : null
      );
    } else {
      setDraftDrawing((prev) => (prev ? { ...prev, x2: x, y2: y } : null));
    }
  };

  const handleMouseUp = () => {
    if (!draftDrawing) return;
    const finalized = { ...draftDrawing };

    const width = Math.abs(finalized.x2 - finalized.x1);
    const height = Math.abs(finalized.y2 - finalized.y1);
    if (
      (finalized.tool === 'long' || finalized.tool === 'short' || finalized.tool === 'zone') &&
      width < 2 &&
      height < 2
    ) {
      finalized.x2 = Math.min(96, finalized.x1 + 16);
      finalized.y2 = Math.min(92, finalized.y1 + 18);
    }

    setDrawings((prev) => [...prev, finalized]);
    setDraftDrawing(null);
    setActiveTool('cursor');
  };

  const toggleTool = (tool: Exclude<DrawingTool, 'cursor'>) => {
    setActiveTool((prev) => (prev === tool ? 'cursor' : tool));
  };

  const currentSymbolDrawings = drawings.filter((d) => d.symbol === currentSymbol);
  const allToRender = draftDrawing
    ? [...currentSymbolDrawings, draftDrawing]
    : currentSymbolDrawings;

  const handleUndoSymbolDrawing = () => {
    const lastForSymbol = [...drawings]
      .reverse()
      .find((d) => d.symbol === currentSymbol);
    if (!lastForSymbol) return;
    setDrawings((prev) => prev.filter((d) => d.id !== lastForSymbol.id));
  };

  const handleClearSymbolDrawings = () => {
    setDrawings((prev) => prev.filter((d) => d.symbol !== currentSymbol));
  };

  const handleRemoveSingleDrawing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrawings((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div
      className={`space-y-3 w-full min-w-0 max-w-full ${
        isFullscreen ? 'fixed inset-2 z-50 flex flex-col bg-[#0c0906] p-2' : ''
      }`}
    >
      {/* Live Candle Countdown Timer Banner */}
      <CandleCountdownTimer
        activeTimeframe={timeframe}
        onTimeframeChange={(tf) => setTimeframe(tf)}
        language={language}
      />

      <div
        className={`bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl transition-all w-full min-w-0 ${
          isFullscreen ? 'flex-1 flex flex-col' : ''
        }`}
      >
        {/* Top Control Bar */}
        <div className="p-2.5 sm:px-4 bg-[#1e140d] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-[#2e1d13] border border-[#4d3221] text-amber-400 shrink-0">
                <Coffee className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 font-mono flex-wrap">
                  <span className="font-bold text-white text-sm">{currentSymbol}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#332014] text-amber-300 border border-[#4d3221] truncate max-w-[140px] sm:max-w-none">
                    {activeTvSymbol}
                  </span>
                  <span className="text-[11px] text-amber-200/70 hidden sm:inline">
                    {selectedConfig.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Broker Feed Selector, Draw Toggle Button & Timeframes */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
            {selectedConfig.alternates.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs font-mono min-w-0 max-w-full">
                <span className="text-[10px] text-amber-400/60 uppercase hidden md:inline">
                  Feed:
                </span>
                <select
                  value={brokerSource}
                  onChange={(e) => setBrokerSource(e.target.value)}
                  className="bg-[#26180f] border border-[#3d2719] rounded-lg px-2 py-1 text-xs text-amber-200 focus:outline-none focus:border-amber-500 font-mono max-w-[175px] sm:max-w-none truncate"
                >
                  <option value="default">{selectedConfig.alternates[0].name}</option>
                  {selectedConfig.alternates.slice(1).map((alt) => (
                    <option key={alt.symbol} value={alt.symbol}>
                      {alt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle Drawing Options Button */}
            <button
              type="button"
              onClick={() => {
                const next = !isDrawMenuOpen;
                setIsDrawMenuOpen(next);
                if (!next) setActiveTool('cursor');
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0 ${
                isDrawMenuOpen
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-[#24170f] hover:bg-[#332014] text-amber-300 border-[#4d3221]'
              }`}
              title={
                isEn
                  ? 'Show or hide tools to draw and mark your trades on the chart'
                  : 'Mostrar u ocultar herramientas para dibujar y marcar tus operaciones en el gráfico'
              }
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEn ? 'Draw' : 'Dibujar'}</span>
              {currentSymbolDrawings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                  {currentSymbolDrawings.length}
                </span>
              )}
            </button>

            {/* Timeframe buttons */}
            <div className="flex items-center bg-[#24170f] border border-[#3b271a] rounded-lg p-0.5 font-mono text-xs overflow-x-auto max-w-full">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-2 py-1 rounded transition text-[11px] font-semibold shrink-0 ${
                    timeframe === tf.value
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-200/60 hover:text-white hover:bg-[#332014]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#24170f] hover:bg-[#332014] border border-[#3b271a] text-amber-300 hover:text-white transition shrink-0"
              title={
                isFullscreen
                  ? isEn
                    ? 'Exit fullscreen'
                    : 'Salir de pantalla completa'
                  : isEn
                  ? 'Fullscreen'
                  : 'Pantalla completa'
              }
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={`https://${isEn ? 'www' : 'es'}.tradingview.com/chart/?symbol=${encodedSymbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#24170f] hover:bg-[#332014] border border-[#3b271a] text-amber-300 hover:text-amber-100 transition shrink-0"
              title={isEn ? 'Open in TradingView.com' : 'Abrir en TradingView.com'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Asset Switcher Bar */}
        <div className="px-3 py-2 bg-[#140d08] border-b border-[#3b271a]/80 flex items-center gap-1.5 w-full min-w-0 overflow-x-auto touch-pan-x text-xs font-mono">
          <span className="text-[11px] text-amber-500/60 uppercase mr-1 shrink-0">
            {isEn ? 'Assets:' : 'Activos:'}
          </span>
          {visibleSymbolKeys.map((sym) => {
            const isSelected = currentSymbol === sym;
            const fut = FUTURES_CONTRACT_MAP[sym];
            const pillLabel =
              marketMode === 'futures_only' && fut
                ? `${sym} (${fut.futuresTicker})`
                : sym;
            return (
              <button
                key={sym}
                onClick={() => {
                  setBrokerSource('default');
                  onSymbolChange?.(sym);
                }}
                className={`px-2.5 py-1 rounded-md transition font-semibold whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-700 text-white border border-amber-500 shadow-sm'
                    : 'bg-[#1e130c] text-amber-200/70 hover:text-amber-100 border border-[#332014] hover:border-amber-800'
                }`}
              >
                {pillLabel}
              </button>
            );
          })}
        </div>

        {/* Tactical Trade Drawing & Marking Toolbar (Hidden by default until user clicks "Dibujar / Marcar") */}
        {isDrawMenuOpen && (
          <div className="px-3 py-2 bg-[#160f0a] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase text-amber-400 font-bold mr-1">
                {isEn ? 'Tools:' : 'Herramientas:'}
              </span>

              <button
                type="button"
                onClick={() => toggleTool('long')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'long'
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:border-emerald-500'
                }`}
                title={
                  isEn
                    ? 'Drag on chart to mark a Long Buy (TP/SL)'
                    : 'Arrastra en el gráfico para marcar una Compra (Long TP/SL)'
                }
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isEn ? 'Buy (Long)' : 'Compra (Long)'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('short')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'short'
                    ? 'bg-rose-600 text-white border-rose-400 font-bold'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60 hover:border-rose-500'
                }`}
                title={
                  isEn
                    ? 'Drag on chart to mark a Short Sell (SL/TP)'
                    : 'Arrastra en el gráfico para marcar una Venta (Short SL/TP)'
                }
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{isEn ? 'Sell (Short)' : 'Venta (Short)'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('zone')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'zone'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#24170f] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                }`}
                title={
                  isEn
                    ? 'Drag to draw a POI / Order Block / FVG zone'
                    : 'Arrastra para dibujar una zona POI / Order Block / FVG'
                }
              >
                <Square className="w-3.5 h-3.5" />
                <span>{isEn ? 'POI/FVG Zone' : 'Zona POI/FVG'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('hline')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'hline'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#24170f] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                }`}
                title={
                  isEn
                    ? 'Click to place a horizontal liquidity or support/resistance level'
                    : 'Haz clic para trazar un nivel horizontal de liquidez o soporte/resistencia'
                }
              >
                <Minus className="w-3.5 h-3.5" />
                <span>{isEn ? 'H. Level' : 'Nivel H.'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('line')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'line'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#24170f] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                }`}
                title={
                  isEn
                    ? 'Drag to draw a trendline or BOS/CHoCH line'
                    : 'Arrastra para trazar una línea de tendencia o BOS/CHoCH'
                }
              >
                <span className="font-bold">╱</span>
                <span>{isEn ? 'Line' : 'Línea'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('pen')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'pen'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#24170f] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                }`}
                title={isEn ? 'Freehand draw on chart' : 'Dibuja libremente sobre el gráfico'}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isEn ? 'Pen' : 'Lápiz'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTool('text')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  activeTool === 'text'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#24170f] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                }`}
                title={
                  isEn
                    ? 'Click on chart to place a text label'
                    : 'Haz clic en el gráfico para poner una etiqueta de texto'
                }
              >
                <Type className="w-3.5 h-3.5" />
                <span>{isEn ? 'Note' : 'Nota'}</span>
              </button>

              {activeTool === 'text' && (
                <input
                  type="text"
                  value={customTextLabel}
                  onChange={(e) => setCustomTextLabel(e.target.value)}
                  placeholder={isEn ? 'Text to place...' : 'Texto a colocar...'}
                  className="bg-[#120c08] border border-amber-500/60 rounded px-2 py-0.5 text-xs text-white w-32 focus:outline-none"
                />
              )}
            </div>

            {/* Colors & Erase Controls */}
            <div className="flex items-center gap-1.5">
              {['#f59e0b', '#DAF1DE', '#ff6b6b', '#10b981', '#38bdf8', '#ffffff'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDrawColor(c)}
                  className={`w-4 h-4 rounded-full border transition ${
                    drawColor === c ? 'scale-125 border-white ring-2 ring-amber-400/50' : 'border-black/50'
                  }`}
                  style={{ backgroundColor: c }}
                  title={isEn ? 'Drawing color' : 'Color de dibujo'}
                />
              ))}

              <span className="text-[#4d3221] mx-1">|</span>

              <button
                type="button"
                onClick={() => setShowDrawings(!showDrawings)}
                className="p-1.5 rounded bg-[#24170f] hover:bg-[#332014] text-amber-200 border border-[#3b271a]"
                title={
                  showDrawings
                    ? isEn
                      ? 'Hide drawings'
                      : 'Ocultar dibujos'
                    : isEn
                    ? 'Show drawings'
                    : 'Mostrar dibujos'
                }
              >
                {showDrawings ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleUndoSymbolDrawing}
                disabled={currentSymbolDrawings.length === 0}
                className="p-1.5 rounded bg-[#24170f] hover:bg-[#332014] text-amber-200 border border-[#3b271a] disabled:opacity-40"
                title={isEn ? 'Undo last drawing' : 'Deshacer último trazo'}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClearSymbolDrawings}
                disabled={currentSymbolDrawings.length === 0}
                className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 flex items-center gap-1 disabled:opacity-40"
                title={
                  isEn
                    ? 'Clear all drawings for this asset'
                    : 'Borrar todos los dibujos de este activo'
                }
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isEn ? 'Clear' : 'Limpiar'} ({currentSymbolDrawings.length})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Embedded TradingView Iframe + Interactive Trade Marking Canvas Overlay */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`w-full bg-[#0c0906] relative select-none ${
            isFullscreen ? 'flex-1' : 'h-[480px] sm:h-[540px]'
          } ${activeTool !== 'cursor' ? 'cursor-crosshair' : ''}`}
        >
          <iframe
            key={`${activeTvSymbol}-${timeframe}-${tvLocale}-${isDrawMenuOpen}`}
            src={widgetUrl}
            className="w-full h-full border-0"
            title={`TradingView ${currentSymbol} (${activeTvSymbol})`}
            scrolling="no"
            allow="fullscreen"
          />

          {/* Drawing mode active indicator badge */}
          {activeTool !== 'cursor' && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 rounded-full bg-amber-600/95 text-white font-mono text-[11px] font-bold shadow-lg border border-amber-300 flex items-center gap-2">
              <span>
                {isEn
                  ? `Place your mark (${activeTool.toUpperCase()}) on chart • Automatically returns to pan mode on release`
                  : `Coloca tu marca (${activeTool.toUpperCase()}) en el gráfico • Volverá a modo normal al soltar`}
              </span>
            </div>
          )}

          {/* SVG & HTML Overlay for Trade Markings */}
          {showDrawings && (
            <div
              className={`absolute inset-0 z-10 ${
                activeTool === 'cursor' ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
            >
              {/* SVG Layer for Lines, Horizontal Levels, and Freehand Pen */}
              <svg className="w-full h-full overflow-visible">
                {allToRender.map((d) => {
                  if (d.tool === 'hline') {
                    return (
                      <g key={d.id}>
                        <line
                          x1="0%"
                          y1={`${d.y1}%`}
                          x2="100%"
                          y2={`${d.y1}%`}
                          stroke={d.color}
                          strokeWidth="2"
                          strokeDasharray="6 4"
                        />
                      </g>
                    );
                  }
                  if (d.tool === 'line') {
                    return (
                      <line
                        key={d.id}
                        x1={`${d.x1}%`}
                        y1={`${d.y1}%`}
                        x2={`${d.x2}%`}
                        y2={`${d.y2}%`}
                        stroke={d.color}
                        strokeWidth="2.5"
                      />
                    );
                  }
                  if (d.tool === 'pen' && d.points && d.points.length > 1) {
                    const pointsAttr = d.points.map((pt) => `${pt.x},${pt.y}`).join(' ');
                    return (
                      <svg
                        key={d.id}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                      >
                        <polyline
                          fill="none"
                          stroke={d.color}
                          strokeWidth="0.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsAttr}
                        />
                      </svg>
                    );
                  }
                  return null;
                })}
              </svg>

              {/* HTML Layer for Long/Short Position Boxes, POI Zones, and Text Labels */}
              {allToRender.map((d) => {
                const left = Math.min(d.x1, d.x2);
                const top = Math.min(d.y1, d.y2);
                const width = Math.max(2, Math.abs(d.x2 - d.x1));
                const height = Math.max(2, Math.abs(d.y2 - d.y1));

                if (d.tool === 'long') {
                  return (
                    <div
                      key={d.id}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                      className="absolute flex flex-col border border-white/50 rounded overflow-hidden shadow-lg"
                    >
                      {/* Take Profit Top 65% */}
                      <div className="h-[65%] bg-emerald-500/25 border-b-2 border-amber-400 flex items-start justify-between px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        <span>LONG TP (Take Profit)</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSingleDrawing(d.id, e)}
                          className="px-1 rounded bg-black/60 text-white hover:bg-rose-600 pointer-events-auto"
                          title={isEn ? 'Remove mark' : 'Eliminar marca'}
                        >
                          ×
                        </button>
                      </div>
                      {/* Stop Loss Bottom 35% */}
                      <div className="h-[35%] bg-rose-500/25 flex items-end justify-between px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                        <span>STOP LOSS</span>
                        <span className="text-amber-300">{isEn ? 'ENTRY ▲' : 'ENTRADA ▲'}</span>
                      </div>
                    </div>
                  );
                }

                if (d.tool === 'short') {
                  return (
                    <div
                      key={d.id}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                      className="absolute flex flex-col border border-white/50 rounded overflow-hidden shadow-lg"
                    >
                      {/* Stop Loss Top 35% */}
                      <div className="h-[35%] bg-rose-500/25 border-b-2 border-amber-400 flex items-start justify-between px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                        <span>STOP LOSS</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSingleDrawing(d.id, e)}
                          className="px-1 rounded bg-black/60 text-white hover:bg-rose-600 pointer-events-auto"
                          title={isEn ? 'Remove mark' : 'Eliminar marca'}
                        >
                          ×
                        </button>
                      </div>
                      {/* Take Profit Bottom 65% */}
                      <div className="h-[65%] bg-emerald-500/25 flex items-end justify-between px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        <span>SHORT TP (Take Profit)</span>
                        <span className="text-amber-300">{isEn ? 'ENTRY ▼' : 'ENTRADA ▼'}</span>
                      </div>
                    </div>
                  );
                }

                if (d.tool === 'zone') {
                  return (
                    <div
                      key={d.id}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        borderColor: d.color,
                        backgroundColor: `${d.color}26`,
                      }}
                      className="absolute border-2 rounded flex items-start justify-between px-1.5 py-0.5 text-[10px] font-mono font-bold text-white"
                    >
                      <span className="drop-shadow">{isEn ? 'POI / FVG ZONE' : 'ZONA POI / FVG'}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSingleDrawing(d.id, e)}
                        className="px-1 rounded bg-black/60 text-white hover:bg-rose-600 pointer-events-auto"
                        title={isEn ? 'Remove zone' : 'Eliminar zona'}
                      >
                        ×
                      </button>
                    </div>
                  );
                }

                if (d.tool === 'text') {
                  return (
                    <div
                      key={d.id}
                      style={{
                        left: `${d.x1}%`,
                        top: `${d.y1}%`,
                        borderColor: d.color,
                      }}
                      className="absolute -translate-y-1/2 px-2 py-0.5 rounded bg-[#120c08]/90 border text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow"
                    >
                      <span style={{ color: d.color }}>{d.label}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSingleDrawing(d.id, e)}
                        className="text-rose-400 hover:text-rose-200 pointer-events-auto"
                        title={isEn ? 'Remove note' : 'Eliminar nota'}
                      >
                        ×
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>

        {/* Micro-footer bar */}
        <div className="px-4 py-2 bg-[#120c08] border-t border-[#3b271a] flex flex-wrap items-center justify-between text-[11px] font-mono text-amber-400/80 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isEn ? 'Live Symbol:' : 'Símbolo Libre en Vivo:'} {activeTvSymbol}
            </span>
            <span className="text-[#4d3221]">|</span>
            <span className="text-amber-300/80">
              {isEn
                ? 'Click "Draw / Mark" above to open tactical drawing tools'
                : 'Haz clic en "Dibujar / Marcar" arriba para abrir las herramientas de dibujo'}
            </span>
          </div>

          <div className="text-amber-400/60 text-[10px]">
            {isEn ? 'TRstudio • Persistent Chart Markings' : 'TRstudio • Pizarra Operativa Persistente'}
          </div>
        </div>
      </div>
    </div>
  );
};
