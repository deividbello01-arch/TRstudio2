import React, { useState } from 'react';
import { Calculator, ShieldAlert } from 'lucide-react';
import { AppLanguage } from '../types/trading';

interface PropFirmCalculatorProps {
  language?: AppLanguage;
}

export const PropFirmCalculator: React.FC<PropFirmCalculatorProps> = ({
  language = 'es',
}) => {
  const isEn = language === 'en';
  const [balance, setBalance] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(0.50);
  const [selectedAsset, setSelectedAsset] = useState<string>('NAS100');
  const [stopDistance, setStopDistance] = useState<number>(40);
  const [brokerMultiplier, setBrokerMultiplier] = useState<number>(1); // 1x or 10x for CFDs

  // Asset configuration
  const assetSpecs: Record<string, { label: string; unit: string; defaultStop: number; contractMultiplier: number; pipValue: string }> = {
    EURUSD: {
      label: 'EUR/USD (Forex)',
      unit: 'pips',
      defaultStop: 12.5,
      contractMultiplier: 10,
      pipValue: isEn ? '$10.00 USD per pip' : '$10.00 USD por pip',
    },
    XAUUSD: {
      label: isEn ? 'XAU/USD (Gold)' : 'XAU/USD (Oro)',
      unit: isEn ? 'dollars ($)' : 'dólares ($)',
      defaultStop: 5.0,
      contractMultiplier: 100,
      pipValue: isEn ? '$10.00 USD per pip ($0.10)' : '$10.00 USD por pip ($0.10)',
    },
    NAS100: {
      label: 'NAS100 (Nasdaq)',
      unit: isEn ? 'points' : 'puntos',
      defaultStop: 40,
      contractMultiplier: 1,
      pipValue: isEn ? '$1.00 - $10.00 USD per point' : '$1.00 - $10.00 USD por punto',
    },
    US30: {
      label: 'US30 (Dow Jones)',
      unit: isEn ? 'points' : 'puntos',
      defaultStop: 80,
      contractMultiplier: 1,
      pipValue: isEn ? '$1.00 - $10.00 USD per point' : '$1.00 - $10.00 USD por punto',
    },
  };

  const currentSpec = assetSpecs[selectedAsset] || assetSpecs.NAS100;

  // Quantitative Calculations
  const monetaryRisk = (balance * riskPercent) / 100;
  const maxDailyLoss = balance * 0.05; // 5% standard Prop firm daily limit
  const hardCircuitBreaker = balance * 0.015; // 1.5% rule

  // Dynamic lot calculation
  let calculatedLots = 0;
  if (selectedAsset === 'EURUSD') {
    calculatedLots = monetaryRisk / (stopDistance * 10);
  } else if (selectedAsset === 'XAUUSD') {
    calculatedLots = monetaryRisk / (stopDistance * 100);
  } else {
    calculatedLots = monetaryRisk / (stopDistance * (brokerMultiplier || 1));
  }

  const finalLots = Math.max(0.01, parseFloat(calculatedLots.toFixed(2)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {isEn
              ? 'Quantitative Risk & Lot Size Calculator'
              : 'Calculadora Cuantitativa de Riesgo y Lotaje'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          {isEn
            ? 'Avoid violating the Daily Drawdown limit on FTMO, FundedNext, Apex, or Topstep. Calculate exact lot sizes according to the specific contract size of each asset.'
            : 'Evita violar el límite de pérdida diaria (Daily Drawdown) en FTMO, FundedNext, Apex o Topstep. Calcula los lotes exactos según el tamaño de contrato específico de cada activo.'}
        </p>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              {isEn ? 'Account Balance' : 'Balance de Cuenta'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[5000, 6000, 10000, 25000, 50000, 100000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBalance(b)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                    balance === b ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  ${b / 1000}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              {isEn ? 'Risk per Trade (%)' : 'Riesgo por Trade (%)'}
            </label>
            <input
              type="number"
              step="0.05"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
            />
            <div className="flex gap-1 mt-1.5">
              {[0.25, 0.50, 0.75, 1.0].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskPercent(r)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                    riskPercent === r ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              {isEn ? 'Asset to Trade' : 'Activo a Operar'}
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => {
                const ast = e.target.value;
                setSelectedAsset(ast);
                setStopDistance(assetSpecs[ast]?.defaultStop || 40);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
            >
              {Object.entries(assetSpecs).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
              {isEn ? 'Pip value:' : 'Valor pip:'} {currentSpec.pipValue}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              {isEn ? 'Stop Loss Distance' : 'Distancia Stop Loss'} ({currentSpec.unit})
            </label>
            <input
              type="number"
              step={selectedAsset === 'EURUSD' ? '0.1' : '1'}
              value={stopDistance}
              onChange={(e) => setStopDistance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
              {isEn
                ? `Technical Stop Loss measured in ${currentSpec.unit}`
                : `Stop Loss técnico medido en ${currentSpec.unit}`}
            </span>
          </div>
        </div>

        {/* Index broker multiplier toggle */}
        {(selectedAsset === 'NAS100' || selectedAsset === 'US30') && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
            <span>
              {isEn
                ? `Broker Contract for ${selectedAsset}:`
                : `Contrato del Broker para ${selectedAsset}:`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setBrokerMultiplier(1)}
                className={`px-2.5 py-1 rounded border ${
                  brokerMultiplier === 1 ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isEn
                  ? '1 Lot = $1.00 USD/Pt (Standard CFD)'
                  : '1 Lote = $1.00 USD/Pto (Estándar CFD)'}
              </button>
              <button
                onClick={() => setBrokerMultiplier(10)}
                className={`px-2.5 py-1 rounded border ${
                  brokerMultiplier === 10 ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isEn
                  ? '1 Lot = $10.00 USD/Pt (10x Contract)'
                  : '1 Lote = $10.00 USD/Pto (Contrato 10x)'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Lot Card */}
        <div className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-xl p-5 shadow-xl">
          <div className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold mb-1">
            {isEn ? 'Calculated Exact Lot Size' : 'Lotaje Exacto Calculado'}
          </div>
          <div className="text-4xl font-black font-mono text-white mt-1">
            {finalLots}{' '}
            <span className="text-sm font-normal text-slate-400">
              {isEn ? 'Lots' : 'Lotes'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-mono">
            {isEn ? (
              <>
                Enter this exact value in MetaTrader 5 or cTrader to risk exactly{' '}
                <strong>${monetaryRisk.toFixed(2)} USD</strong> ({riskPercent}% of your balance).
              </>
            ) : (
              <>
                Ingresa este valor exacto en MetaTrader 5 o cTrader para arriesgar exactamente{' '}
                <strong>${monetaryRisk.toFixed(2)} USD</strong> ({riskPercent}% de tu balance).
              </>
            )}
          </p>

          <div className="mt-4 pt-3 border-t border-cyan-900/40 text-[11px] font-mono text-slate-400">
            {isEn
              ? 'Formula: Risk ($) / (Distance × TickValue)'
              : 'Fórmula: Riesgo ($) / (Distancia × TickValue)'}
          </div>
        </div>

        {/* Drawdown Protection Limits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Prop Firm Safety Limits' : 'Límites de Seguridad Prop Firm'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>{isEn ? 'Total Daily Limit (5%):' : 'Límite Diario Total (5%):'}</span>
              <strong className="text-rose-400">-${maxDailyLoss.toLocaleString()} USD</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hard Circuit Breaker (-1.5%):</span>
              <strong className="text-amber-400">-${hardCircuitBreaker.toLocaleString()} USD</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>
                {isEn ? 'Consecutive trades allowed:' : 'Operaciones permitidas seguidas:'}
              </span>
              <strong className="text-white">{Math.floor(hardCircuitBreaker / monetaryRisk)} trades</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {isEn ? (
              <>
                If you lose 2 consecutive trades or reach <strong>-1.5%</strong> in the same day,
                close the platform until the next trading day.
              </>
            ) : (
              <>
                Si pierdes 2 operaciones consecutivas o alcanzas el <strong>-1.5%</strong> en el
                mismo día, apaga la plataforma hasta el siguiente día de negociación.
              </>
            )}
          </p>
        </div>

        {/* State Machine Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
            {isEn ? 'Risk State Machine' : 'Máquina de Estados de Riesgo'}
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex justify-between">
              <span>{isEn ? 'State 1: Normal (0% to -2%)' : 'Estado 1: Normal (0% a -2%)'}</span>
              <span className="font-bold">{isEn ? '0.50% Risk' : '0.50% Riesgo'}</span>
            </div>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 flex justify-between">
              <span>
                {isEn ? 'State 2: Defensive (-2% to -4%)' : 'Estado 2: Defensivo (-2% a -4%)'}
              </span>
              <span className="font-bold">{isEn ? '0.25% Risk' : '0.25% Riesgo'}</span>
            </div>
            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 flex justify-between">
              <span>
                {isEn ? 'State 4: Emergency (<-4.5%)' : 'Estado 4: Emergencia (<-4.5%)'}
              </span>
              <span className="font-bold">{isEn ? '0.15% Risk' : '0.15% Riesgo'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
