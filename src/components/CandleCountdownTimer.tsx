import React, { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { AppLanguage } from '../types/trading';

interface CandleCountdownTimerProps {
  activeTimeframe?: string; // '1' | '5' | '15' | '60' | '240' | 'D'
  onTimeframeChange?: (tf: string) => void;
  language?: AppLanguage;
}

export const CandleCountdownTimer: React.FC<CandleCountdownTimerProps> = ({
  activeTimeframe = '15',
  onTimeframeChange,
  language = 'es',
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const isEn = language === 'en';

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown in seconds for a given interval in minutes
  const getRemainingTime = (intervalMinutes: number) => {
    const currentSeconds = now.getMinutes() * 60 + now.getSeconds();
    const intervalSeconds = intervalMinutes * 60;
    const elapsedInCurrentInterval = currentSeconds % intervalSeconds;
    const remainingSeconds = intervalSeconds - elapsedInCurrentInterval;

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const progressPct = ((intervalSeconds - remainingSeconds) / intervalSeconds) * 100;

    return {
      formatted: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      totalRemainingSecs: remainingSeconds,
      progressPct,
      isClosingSoon: remainingSeconds <= 30,
    };
  };

  // 1H remaining
  const getHourRemaining = () => {
    const remainingSeconds = 3600 - (now.getMinutes() * 60 + now.getSeconds());
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const progressPct = ((3600 - remainingSeconds) / 3600) * 100;
    return {
      formatted: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      totalRemainingSecs: remainingSeconds,
      progressPct,
      isClosingSoon: remainingSeconds <= 60,
    };
  };

  // 4H remaining (aligned to UTC / 00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
  const get4HRemaining = () => {
    const utcHours = now.getUTCHours();
    const hoursInto4H = utcHours % 4;
    const totalSecsInto4H = hoursInto4H * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const remainingSeconds = 14400 - totalSecsInto4H;
    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    const progressPct = (totalSecsInto4H / 14400) * 100;
    return {
      formatted: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      totalRemainingSecs: remainingSeconds,
      progressPct,
      isClosingSoon: remainingSeconds <= 120,
    };
  };

  const m1 = getRemainingTime(1);
  const m5 = getRemainingTime(5);
  const m15 = getRemainingTime(15);
  const m30 = getRemainingTime(30);
  const h1 = getHourRemaining();
  const h4 = get4HRemaining();

  const prefix = isEn ? 'Candle' : 'Vela';

  // Pick active countdown based on current chart timeframe
  let activeCountdown = m15;
  let activeLabel = `${prefix} 15M`;

  if (activeTimeframe === '1') {
    activeCountdown = m1;
    activeLabel = `${prefix} 1M`;
  } else if (activeTimeframe === '5') {
    activeCountdown = m5;
    activeLabel = `${prefix} 5M`;
  } else if (activeTimeframe === '15') {
    activeCountdown = m15;
    activeLabel = `${prefix} 15M`;
  } else if (activeTimeframe === '30') {
    activeCountdown = m30;
    activeLabel = `${prefix} 30M`;
  } else if (activeTimeframe === '60') {
    activeCountdown = h1;
    activeLabel = `${prefix} 1H`;
  } else if (activeTimeframe === '240') {
    activeCountdown = h4;
    activeLabel = `${prefix} 4H`;
  } else {
    activeCountdown = h1;
    activeLabel = `${prefix} 1D`;
  }

  return (
    <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Big Active Countdown */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
            activeCountdown.isClosingSoon 
              ? 'bg-amber-950/80 border-amber-500 text-amber-400 animate-pulse' 
              : 'bg-[#24170f] border-[#4a3222] text-amber-400'
          }`}>
            <Hourglass className={`w-5 h-5 ${activeCountdown.isClosingSoon ? 'text-amber-300' : 'text-amber-500'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300/80 tracking-wider">
                {isEn
                  ? `Active Candle Countdown (${activeLabel})`
                  : `Contador de Vela Activa (${activeLabel})`}
              </span>
              {activeCountdown.isClosingSoon && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/70 font-mono font-bold animate-ping">
                  {isEn ? 'CLOSING SOON!' : '¡CIERRA PRONTO!'}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-2xl font-black text-white tracking-tight">
                {activeCountdown.formatted}
              </span>
              <span className="text-xs text-amber-400/80">
                ({activeCountdown.progressPct.toFixed(0)}% {isEn ? 'completed' : 'completada'})
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Mini Clocks (5M, 15M, 30M, 1H, 4H) */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <div 
            onClick={() => onTimeframeChange?.('5')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
              activeTimeframe === '5'
                ? 'bg-[#3b271a] border-amber-500 text-white shadow-sm'
                : 'bg-[#1e130c] border-[#332014] text-amber-200/70 hover:border-amber-700'
            }`}
          >
            <div className="text-[10px] text-amber-400/60 uppercase">5M</div>
            <div className="font-bold">{m5.formatted}</div>
          </div>

          <div 
            onClick={() => onTimeframeChange?.('15')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
              activeTimeframe === '15'
                ? 'bg-[#3b271a] border-amber-500 text-white shadow-sm'
                : 'bg-[#1e130c] border-[#332014] text-amber-200/70 hover:border-amber-700'
            }`}
          >
            <div className="text-[10px] text-amber-400/60 uppercase">15M</div>
            <div className="font-bold">{m15.formatted}</div>
          </div>

          <div 
            onClick={() => onTimeframeChange?.('30')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
              activeTimeframe === '30'
                ? 'bg-[#3b271a] border-amber-500 text-white shadow-sm'
                : 'bg-[#1e130c] border-[#332014] text-amber-200/70 hover:border-amber-700'
            }`}
          >
            <div className="text-[10px] text-amber-400/60 uppercase">30M</div>
            <div className="font-bold">{m30.formatted}</div>
          </div>

          <div 
            onClick={() => onTimeframeChange?.('60')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
              activeTimeframe === '60'
                ? 'bg-[#3b271a] border-amber-500 text-white shadow-sm'
                : 'bg-[#1e130c] border-[#332014] text-amber-200/70 hover:border-amber-700'
            }`}
          >
            <div className="text-[10px] text-amber-400/60 uppercase">1H</div>
            <div className="font-bold">{h1.formatted}</div>
          </div>

          <div 
            onClick={() => onTimeframeChange?.('240')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
              activeTimeframe === '240'
                ? 'bg-[#3b271a] border-amber-500 text-white shadow-sm'
                : 'bg-[#1e130c] border-[#332014] text-amber-200/70 hover:border-amber-700'
            }`}
          >
            <div className="text-[10px] text-amber-400/60 uppercase">4H</div>
            <div className="font-bold">{h4.formatted}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar of Current Active Candle */}
      <div className="w-full bg-[#24170f] h-1.5 rounded-full mt-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            activeCountdown.isClosingSoon 
              ? 'bg-amber-400' 
              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300'
          }`}
          style={{ width: `${activeCountdown.progressPct}%` }}
        />
      </div>
    </div>
  );
};
