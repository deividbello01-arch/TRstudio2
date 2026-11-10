import React, { useState } from 'react';
import { Layers, Crosshair } from 'lucide-react';
import { InstrumentQuote, AppLanguage, AppTheme } from '../types/trading';
import { getSpec } from '../lib/instruments';

interface MiniTradingChartProps {
  instrument: InstrumentQuote;
  language?: AppLanguage;
  theme?: AppTheme;
}

export const MiniTradingChart: React.FC<MiniTradingChartProps> = ({
  instrument,
  language = 'es',
  theme = 'cream',
}) => {
  const isEn = language === 'en';
  const isLight = theme === 'cream';
  const [showFVG, setShowFVG] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);

  const generateCandles = () => {
    const base = instrument.price;
    const isCryptoOrIndex = base > 1000;
    const spread = isCryptoOrIndex ? base * 0.003 : base * 0.002;
    const candles = [];
    let currentOpen = base - spread * 3;

    for (let i = 0; i < 28; i++) {
      const isUp = (i * 7 + 13) % 11 > 4;
      const variation = Math.sin(i * 0.6) * spread * 0.8 + (isUp ? spread * 0.4 : -spread * 0.4);
      const close = currentOpen + variation;
      const high = Math.max(currentOpen, close) + Math.abs(spread * 0.4 * Math.cos(i));
      const low = Math.min(currentOpen, close) - Math.abs(spread * 0.3 * Math.sin(i));

      candles.push({
        id: i,
        open: currentOpen,
        high,
        low,
        close,
        isBullish: close >= currentOpen,
      });

      currentOpen = close;
    }
    return candles;
  };

  const candles = generateCandles();
  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const chartHeight = 180;
  const chartWidth = 540;
  const candleWidth = chartWidth / candles.length;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 30) - 15;
  };

  const spec = getSpec(instrument.symbol);
  const decimals = spec ? spec.decimals : instrument.price < 10 ? 5 : 2;
  const currentY = getY(instrument.price);

  return (
    <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#3b271a]">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-[#24170f] border border-[#4d3221] font-mono font-bold text-white text-sm">
            {instrument.symbol}
          </div>
          <div>
            <div className="text-xs text-amber-200/70">{instrument.name}</div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-base font-bold text-white">
                {instrument.price.toLocaleString(undefined, {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  instrument.change24h.startsWith('+')
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                }`}
              >
                {instrument.change24h}
              </span>
            </div>
          </div>
        </div>

        {/* Quick chart toggles */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowFVG(!showFVG)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border ${
              showFVG
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-[#120c08] text-amber-200/60 border-[#3b271a] hover:bg-[#24170f]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{isEn ? 'FVG (Imbalance)' : 'FVG (Ineficiencia)'}</span>
          </button>
          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border ${
              showLiquidity
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-[#120c08] text-amber-200/60 border-[#3b271a] hover:bg-[#24170f]'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>{isEn ? 'Liquidity Pools (PDH/PDL)' : 'Piscinas de Liquidez (PDH/PDL)'}</span>
          </button>
        </div>
      </div>

      {/* SVG Candlestick Canvas */}
      <div className="relative w-full overflow-hidden bg-[#120c08] rounded-lg p-2 border border-[#3b271a]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 select-none">
          {/* Background Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, idx) => (
            <line
              key={idx}
              x1="0"
              y1={chartHeight * pct}
              x2={chartWidth}
              y2={chartHeight * pct}
              stroke={isLight ? '#cfc8b8' : '#2d1c12'}
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          ))}

          {/* FVG Highlight Zone */}
          {showFVG && (
            <g>
              <rect
                x={candleWidth * 14}
                y={getY(maxPrice - priceRange * 0.35)}
                width={candleWidth * 7}
                height={Math.max(16, priceRange * 0.12 * (chartHeight / priceRange))}
                fill={isLight ? 'rgba(180, 83, 9, 0.14)' : 'rgba(245, 158, 11, 0.16)'}
                stroke={isLight ? 'rgba(180, 83, 9, 0.65)' : 'rgba(245, 158, 11, 0.55)'}
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={candleWidth * 14 + 6}
                y={getY(maxPrice - priceRange * 0.35) + 12}
                fill={isLight ? '#78350f' : '#fbbf24'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                FVG 1H / 15M (CE 50%)
              </text>
            </g>
          )}

          {/* Liquidity Lines */}
          {showLiquidity && (
            <g>
              <line
                x1="0"
                y1={chartHeight * 0.15}
                x2={chartWidth}
                y2={chartHeight * 0.15}
                stroke={isLight ? '#047857' : '#10b981'}
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text
                x={chartWidth - 140}
                y={chartHeight * 0.15 - 4}
                fill={isLight ? '#065f46' : '#34d399'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PDH (Buy-Side Liquidity)
              </text>

              <line
                x1="0"
                y1={chartHeight * 0.88}
                x2={chartWidth}
                y2={chartHeight * 0.88}
                stroke={isLight ? '#be123c' : '#f43f5e'}
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text
                x={chartWidth - 140}
                y={chartHeight * 0.88 - 4}
                fill={isLight ? '#9f1239' : '#fb7185'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PDL (Sell-Side Liquidity)
              </text>
            </g>
          )}

          {/* Candlesticks */}
          {candles.map((candle, index) => {
            const x = index * candleWidth + candleWidth / 2;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
            const color = candle.isBullish ? '#10b981' : '#f43f5e';

            return (
              <g key={candle.id} className="transition-all hover:opacity-80">
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                <rect
                  x={x - candleWidth * 0.35}
                  y={bodyY}
                  width={candleWidth * 0.7}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Current Live Price Horizontal Tracker */}
          <line
            x1="0"
            y1={currentY}
            x2={chartWidth}
            y2={currentY}
            stroke={isLight ? '#18181b' : '#f59e0b'}
            strokeWidth="1.2"
          />
          <rect
            x={chartWidth - 84}
            y={currentY - 9}
            width="84"
            height="18"
            fill={isLight ? '#18181b' : '#d97706'}
            rx="3"
          />
          <text
            x={chartWidth - 79}
            y={currentY + 3}
            fill="#ffffff"
            fontSize="9.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {instrument.price.toFixed(decimals)}
          </text>
        </svg>

        {/* Micro Footer Bar with Key Levels */}
        <div className="mt-2 pt-2 border-t border-[#3b271a] flex flex-wrap items-center justify-between text-[11px] font-mono text-amber-200/70 gap-2">
          <div className="flex items-center gap-3">
            <span>
              ATR (14): <strong className="text-white">{instrument.atr14 || 'Normal'}</strong>
            </span>
            <span>
              {isEn ? '4H Bias:' : 'Sesgo 4H:'}{' '}
              <strong className="text-amber-300">
                {instrument.bias4H || (isEn ? 'Bullish' : 'Alcista')}
              </strong>
            </span>
          </div>
          {instrument.keyLevels && (
            <div className="flex items-center gap-2">
              {instrument.keyLevels.pdh && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                  PDH: {instrument.keyLevels.pdh}
                </span>
              )}
              {instrument.keyLevels.pdl && (
                <span className="px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50">
                  PDL: {instrument.keyLevels.pdl}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
