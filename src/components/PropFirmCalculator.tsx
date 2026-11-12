import React, { useState, useEffect } from 'react';
import { Calculator, ShieldAlert, CheckCircle2, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AppLanguage, InstrumentMarketMode, InstrumentQuote, MT5SessionState } from '../types/trading';
import {
  TRADEABLE_INSTRUMENTS,
  getSpec,
  quoteToUsd,
  valuePerPointUsd,
  roundToTick,
  DEFAULT_FX_RATES,
  FxRates,
  FUTURES_CONTRACT_MAP,
  getEnabledTradeableInstruments,
} from '../lib/instruments';
import { MT5OneClickBar } from './MT5OneClickBar';

interface PropFirmCalculatorProps {
  language?: AppLanguage;
  defaultBalance?: number;
  defaultRisk?: number;
  fxRates?: FxRates;
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
  instruments?: InstrumentQuote[];
  mt5State?: MT5SessionState | null;
  onRefreshMt5?: () => Promise<void>;
  onOpenMt5Hub?: () => void;
  showMt5?: boolean;
}

export const PropFirmCalculator: React.FC<PropFirmCalculatorProps> = ({
  language = 'es',
  defaultBalance = 10000,
  defaultRisk = 0.50,
  fxRates = DEFAULT_FX_RATES,
  marketMode = 'all_programmed',
  enabledSymbols,
  instruments = [],
  mt5State = null,
  onRefreshMt5 = async () => {},
  onOpenMt5Hub,
  showMt5 = false,
}) => {
  const isEn = language === 'en';
  const visibleInstruments = getEnabledTradeableInstruments(enabledSymbols, marketMode);
  const [balance, setBalance] = useState<number>(defaultBalance || 10000);
  const [riskPercent, setRiskPercent] = useState<number>(defaultRisk || 0.50);
  const [selectedAsset, setSelectedAsset] = useState<string>('NAS100');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [customEntryPrice, setCustomEntryPrice] = useState<number | ''>('');
  const [stopDistance, setStopDistance] = useState<number>(40);
  const [brokerMultiplier, setBrokerMultiplier] = useState<number>(1); // 1x or 10x for CFDs
  const [futuresContractType, setFuturesContractType] = useState<'micro' | 'standard'>('micro');
  const [rewardRatio1, setRewardRatio1] = useState<number>(1.8);
  const [rewardRatio2, setRewardRatio2] = useState<number>(3.0);

  useEffect(() => {
    if (!visibleInstruments.some((i) => i.symbol === selectedAsset) && visibleInstruments.length > 0) {
      setSelectedAsset(visibleInstruments[0].symbol);
    }
  }, [enabledSymbols]);

  useEffect(() => {
    setBalance(defaultBalance || 10000);
  }, [defaultBalance]);

  useEffect(() => {
    setRiskPercent(defaultRisk || 0.50);
  }, [defaultRisk]);

  const defaultStopMap: Record<string, number> = {
    NAS100: 42,
    US500: 12,
    US30: 75,
    US2000: 6.5,
    GER40: 35,
    UK100: 15,
    EU50: 14,
    FRA40: 16,
    JP225: 90,
    HK50: 85,
    XAUUSD: 4.8,
    EURUSD: 12,
  };

  const spec = getSpec(selectedAsset) || visibleInstruments[0] || TRADEABLE_INSTRUMENTS[0];
  const futuresSpec = FUTURES_CONTRACT_MAP[spec.symbol];
  const isFuturesMode = marketMode === 'futures_only';

  // Quantitative Calculations
  const safeBalance = Math.max(0, Number(balance) || 0);
  const safeRiskPct = Math.max(0.01, Number(riskPercent) || 0.50);
  const safeStop = Math.max(0.1, Number(stopDistance) || 1);

  const targetMonetaryRisk = (safeBalance * safeRiskPct) / 100;
  const maxDailyLoss = safeBalance * 0.05; // 5% standard Prop firm daily limit
  const hardCircuitBreaker = safeBalance * 0.015; // 1.5% rule

  // Exact USD value per 1 unit of stopDistance for 1.00 Lot / Contract
  let usdRiskPerUnitPerLot = 1;
  let unitLabel = isEn ? spec.unitEn : spec.unitEs;
  let contractExplanation = '';

  if (isFuturesMode && futuresSpec) {
    const useMicro = futuresContractType === 'micro' && futuresSpec.microTicker;
    const activeTicker = useMicro ? futuresSpec.microTicker! : futuresSpec.futuresTicker;
    const rawPtVal = useMicro && futuresSpec.microPointValue ? futuresSpec.microPointValue : futuresSpec.stdPointValue;
    const ccyRate = quoteToUsd(spec.quoteCcy, fxRates);
    // For EURUSD futures (6E/M6E), stdPointValue is 125000 EUR ($12.50 per pip) or 12500 EUR ($1.25 per pip)
    usdRiskPerUnitPerLot =
      spec.symbol === 'EURUSD' ? (rawPtVal * 0.0001) : rawPtVal * ccyRate;
    unitLabel =
      spec.symbol === 'EURUSD'
        ? 'pips'
        : spec.symbol === 'XAUUSD'
        ? isEn
          ? 'dollars ($)'
          : 'dólares ($)'
        : isEn
        ? 'points'
        : 'puntos';
    contractExplanation = isEn
      ? `1 Contract (${activeTicker} • ${futuresSpec.exchange}) = $${usdRiskPerUnitPerLot.toFixed(2)} USD per ${unitLabel}`
      : `1 Contrato (${activeTicker} • ${futuresSpec.exchange}) = $${usdRiskPerUnitPerLot.toFixed(2)} USD por ${unitLabel}`;
  } else if (spec.symbol === 'EURUSD') {
    // stopDistance is entered in pips (1 pip = 0.0001 -> $10/pip per standard lot)
    usdRiskPerUnitPerLot = 10;
    unitLabel = 'pips';
    contractExplanation = isEn
      ? '1 Std Lot (100,000 units) = $10.00 USD per pip'
      : '1 Lote Estándar (100,000 uds) = $10.00 USD por pip';
  } else if (spec.symbol === 'XAUUSD') {
    // stopDistance is entered in dollars ($1.00 move = 10 pips = $100 per standard 100 oz lot)
    usdRiskPerUnitPerLot = 100;
    unitLabel = isEn ? 'dollars ($)' : 'dólares ($)';
    contractExplanation = isEn
      ? '1 Std Lot (100 oz) = $100.00 USD per $1.00 move ($10/pip)'
      : '1 Lote Estándar (100 oz) = $100.00 USD por cada $1.00 de movimiento ($10/pip)';
  } else {
    // CFD Index: stopDistance is entered in index points
    const baseUsdPerPt = valuePerPointUsd(spec, fxRates);
    usdRiskPerUnitPerLot = baseUsdPerPt * brokerMultiplier;
    unitLabel = isEn ? 'points' : 'puntos';
    contractExplanation =
      spec.quoteCcy === 'USD'
        ? isEn
          ? `1 CFD Lot = $${(spec.contractValue * brokerMultiplier).toFixed(2)} USD per point`
          : `1 Lote CFD = $${(spec.contractValue * brokerMultiplier).toFixed(2)} USD por punto`
        : isEn
        ? `1 CFD Lot = ${spec.contractValue * brokerMultiplier} ${spec.quoteCcy}/pt (~$${usdRiskPerUnitPerLot.toFixed(2)} USD/pt)`
        : `1 Lote CFD = ${spec.contractValue * brokerMultiplier} ${spec.quoteCcy}/pto (~$${usdRiskPerUnitPerLot.toFixed(2)} USD/pto)`;
  }

  const lossPerOneFullLot = safeStop * usdRiskPerUnitPerLot;
  const rawLots = lossPerOneFullLot > 0 ? targetMonetaryRisk / lossPerOneFullLot : 0.01;
  const finalLots = isFuturesMode
    ? Math.max(1, Math.floor(rawLots))
    : Math.max(0.01, parseFloat(rawLots.toFixed(2)));

  // Exact monetary loss with finalLots (solves the bug where 0.01 lot clamp caused actual loss != displayed risk)
  const actualMonetaryLossAtStop = finalLots * lossPerOneFullLot;
  const actualRiskPercentOfAccount = safeBalance > 0 ? (actualMonetaryLossAtStop / safeBalance) * 100 : 0;
  const profitAtTp1 = actualMonetaryLossAtStop * rewardRatio1;
  const profitAtTp2 = actualMonetaryLossAtStop * rewardRatio2;
  const isMinLotWarning = actualMonetaryLossAtStop > targetMonetaryRisk * 1.15;

  // Live or custom Entry Price & Price Coordinates for 1-Click MT5 Execution
  const liveFeedInst = instruments.find((i) => i.symbol === spec.symbol);
  const feedPrice = liveFeedInst?.price || spec.fallback.price;
  const entryPrice =
    customEntryPrice !== '' && Number(customEntryPrice) > 0
      ? roundToTick(Number(customEntryPrice), spec)
      : roundToTick(feedPrice, spec);
  const dirMult = direction === 'BUY' ? 1 : -1;
  const priceStopDelta = spec.symbol === 'EURUSD' ? safeStop * 0.0001 : safeStop;
  const stopLossPrice = roundToTick(entryPrice - dirMult * priceStopDelta, spec);
  const tp1Price = roundToTick(entryPrice + dirMult * priceStopDelta * rewardRatio1, spec);
  const tp2Price = roundToTick(entryPrice + dirMult * priceStopDelta * rewardRatio2, spec);

  return (
    <div className="space-y-6">
      {/* Header & Inputs */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-700/60">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-mono">
              {isEn
                ? 'Quantitative Risk, Lot Size & P&L Calculator'
                : 'Calculadora Cuantitativa de Riesgo, Lotaje y Pérdida/Ganancia Exacta'}
            </h2>
            <p className="text-xs text-amber-200/70">
              {isFuturesMode
                ? isEn
                  ? 'Futures Mode active: Calculates exact Micro/Standard Futures contracts and real P&L.'
                  : 'Modo Solo Futuros activo: Calcula contratos Micro/Estándar de Futuros y pérdida/ganancia exacta.'
                : isEn
                ? 'Calculates exact lot sizes and verifies the real dollar loss at Stop Loss and profit at Take Profit across your active instruments.'
                : 'Calcula el lotaje exacto y verifica cuánto pierdes realmente al tocar el Stop Loss y cuánto ganas en TP1/TP2 en tus activos habilitados.'}
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#3b271a]">
          <div>
            <label className="block text-xs font-mono font-semibold text-amber-200/80 mb-1.5 uppercase">
              {isEn ? '1. Account Balance (USD)' : '1. Balance de Cuenta (USD)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-xs font-bold">
                $
              </span>
              <input
                type="number"
                value={balance || ''}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[5000, 10000, 25000, 50000, 100000, 200000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBalance(b)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border transition ${
                    balance === b
                      ? 'bg-amber-600 text-white border-amber-400 font-bold'
                      : 'bg-[#120c08] text-amber-200/60 border-[#3b271a] hover:border-amber-600'
                  }`}
                >
                  ${b / 1000}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-amber-200/80 mb-1.5 uppercase">
              {isEn ? '2. Target Risk (%)' : '2. Riesgo Objetivo (%)'}
            </label>
            <input
              type="number"
              step="0.05"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
            />
            <div className="flex gap-1 mt-1.5">
              {[0.25, 0.50, 0.75, 1.0].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercent(r)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border transition ${
                    riskPercent === r
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-[#120c08] text-amber-200/60 border-[#3b271a] hover:border-amber-600'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-amber-200/80 mb-1.5 uppercase">
              {isFuturesMode
                ? isEn
                  ? '3. Futures Contract'
                  : '3. Contrato de Futuros'
                : isEn
                ? '3. CFD Index / Asset'
                : '3. Índice CFD / Activo'}
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => {
                const ast = e.target.value;
                setSelectedAsset(ast);
                setStopDistance(defaultStopMap[ast] || 35);
                setBrokerMultiplier(1);
                setCustomEntryPrice('');
              }}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
            >
              {visibleInstruments.map((item) => {
                const fut = FUTURES_CONTRACT_MAP[item.symbol];
                return (
                  <option key={item.symbol} value={item.symbol}>
                    {isFuturesMode && fut
                      ? `${item.symbol} (${fut.futuresTicker}) — ${isEn ? fut.nameEn : fut.nameEs}`
                      : `${item.symbol} — ${isEn ? item.nameEn : item.nameEs}`}
                  </option>
                );
              })}
            </select>
            <span className="text-[10px] text-amber-300/70 mt-1.5 block font-mono">
              {contractExplanation}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-amber-200/80 mb-1.5 uppercase">
              {isEn ? '4. Stop Loss Distance' : '4. Distancia Stop Loss'} ({unitLabel})
            </label>
            <input
              type="number"
              step={selectedAsset === 'EURUSD' || selectedAsset === 'XAUUSD' ? '0.5' : '1'}
              value={stopDistance}
              onChange={(e) => setStopDistance(Number(e.target.value))}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
            />
            <span className="text-[10px] text-amber-200/60 mt-1.5 block font-mono">
              {isEn
                ? `1 ${isFuturesMode ? 'Contract' : 'Lot'} risks $${lossPerOneFullLot.toFixed(2)} USD for ${safeStop} ${unitLabel}`
                : `1 ${isFuturesMode ? 'Contrato' : 'Lote'} arriesga $${lossPerOneFullLot.toFixed(2)} USD en ${safeStop} ${unitLabel}`}
            </span>
          </div>
        </div>

        {/* Futures Micro vs Standard toggle OR CFD Index broker contract size toggle */}
        {isFuturesMode && futuresSpec ? (
          <div className="mt-4 p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-amber-200">
            <span>
              {isEn
                ? `Futures Contract Specification (${futuresSpec.exchange}):`
                : `Especificación Contrato de Futuros (${futuresSpec.exchange}):`}
            </span>
            <div className="flex flex-wrap gap-2">
              {futuresSpec.microTicker && (
                <button
                  type="button"
                  onClick={() => setFuturesContractType('micro')}
                  className={`px-3 py-1 rounded-lg border transition ${
                    futuresContractType === 'micro'
                      ? 'bg-amber-600 text-white border-amber-400 font-bold'
                      : 'bg-[#18110b] text-amber-200/70 border-[#3b271a]'
                  }`}
                >
                  {isEn
                    ? `Micro (${futuresSpec.microTicker} • ${futuresSpec.microPointValue} ${spec.quoteCcy}/pt)`
                    : `Micro (${futuresSpec.microTicker} • ${futuresSpec.microPointValue} ${spec.quoteCcy}/pto)`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setFuturesContractType('standard')}
                className={`px-3 py-1 rounded-lg border transition ${
                  futuresContractType === 'standard' || !futuresSpec.microTicker
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#18110b] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                {isEn
                  ? `Standard (${futuresSpec.futuresTicker} • ${futuresSpec.stdPointValue} ${spec.quoteCcy}/pt)`
                  : `Estándar (${futuresSpec.futuresTicker} • ${futuresSpec.stdPointValue} ${spec.quoteCcy}/pto)`}
              </button>
            </div>
          </div>
        ) : spec.kind === 'index' ? (
          <div className="mt-4 p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-amber-200">
            <span>
              {isEn
                ? `Broker Contract Specification for ${selectedAsset}:`
                : `Especificación de Contrato del Broker para ${selectedAsset}:`}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBrokerMultiplier(1)}
                className={`px-3 py-1 rounded-lg border transition ${
                  brokerMultiplier === 1
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#18110b] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                {isEn
                  ? `Standard CFD (1 Lot = ${spec.contractValue} ${spec.quoteCcy}/pt)`
                  : `Estándar CFD (1 Lote = ${spec.contractValue} ${spec.quoteCcy}/pto)`}
              </button>
              <button
                type="button"
                onClick={() => setBrokerMultiplier(10)}
                className={`px-3 py-1 rounded-lg border transition ${
                  brokerMultiplier === 10
                    ? 'bg-amber-600 text-white border-amber-400 font-bold'
                    : 'bg-[#18110b] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                {isEn
                  ? `Institutional 10x (1 Lot = ${spec.contractValue * 10} ${spec.quoteCcy}/pt)`
                  : `Contrato 10x (1 Lote = ${spec.contractValue * 10} ${spec.quoteCcy}/pto)`}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Warning if 0.01 minimum lot or 1 minimum contract exceeds target risk */}
      {isMinLotWarning && (
        <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/70 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300 uppercase">
              {isFuturesMode
                ? isEn
                  ? 'Minimum Futures Contract (1 Contract) Risk Notice'
                  : 'Aviso Importante sobre Contrato Mínimo (1 Contrato)'
                : isEn
                ? 'Minimum Lot Size (0.01) Risk Notice'
                : 'Aviso Importante sobre Lote Mínimo (0.01 Lotes)'}
            </div>
            <p className="text-amber-100/90 mt-1 font-sans">
              {isFuturesMode
                ? isEn
                  ? `Your target ${safeRiskPct}% risk is $${targetMonetaryRisk.toFixed(2)} USD, which would require ${rawLots.toFixed(2)} contracts. Because the minimum position in Futures is 1 integer contract, executing 1 contract with a ${safeStop} ${unitLabel} Stop Loss will actually risk -$${actualMonetaryLossAtStop.toFixed(2)} USD (${actualRiskPercentOfAccount.toFixed(2)}% of your balance). Switch to a Micro contract or tighten the Stop Loss.`
                  : `Tu riesgo deseado del ${safeRiskPct}% equivale a $${targetMonetaryRisk.toFixed(2)} USD (requeriría ${rawLots.toFixed(2)} contratos). Como el tamaño mínimo en Futuros es 1 contrato entero, al abrir 1 contrato con ${safeStop} ${unitLabel} de Stop Loss tu pérdida real si toca SL será de -$${actualMonetaryLossAtStop.toFixed(2)} USD (${actualRiskPercentOfAccount.toFixed(2)}% de tu cuenta). Usa contrato Micro o ajusta el Stop Loss.`
                : isEn
                ? `Your target ${safeRiskPct}% risk is $${targetMonetaryRisk.toFixed(2)} USD, which would require ${rawLots.toFixed(3)} lots. Because MetaTrader/cTrader minimum lot is 0.01, executing 0.01 lots with a ${safeStop} ${unitLabel} Stop Loss will actually risk -$${actualMonetaryLossAtStop.toFixed(2)} USD (${actualRiskPercentOfAccount.toFixed(2)}% of your balance). Tighten the Stop Loss or use a standard 1x CFD contract.`
                : `Tu riesgo deseado del ${safeRiskPct}% equivale a $${targetMonetaryRisk.toFixed(2)} USD (requeriría ${rawLots.toFixed(3)} lotes). Como el lote mínimo en MT5/cTrader es 0.01, al abrir 0.01 lotes con ${safeStop} ${unitLabel} de Stop Loss tu pérdida real si toca SL será de -$${actualMonetaryLossAtStop.toFixed(2)} USD (${actualRiskPercentOfAccount.toFixed(2)}% de tu cuenta).`}
            </p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Lot & Exact Dollar Loss Card */}
        <div className="bg-gradient-to-br from-[#2b1c13] via-[#18110b] to-[#120c08] border border-amber-500/60 rounded-xl p-5 shadow-xl">
          <div className="text-xs uppercase font-mono tracking-wider text-amber-300 font-bold mb-1">
            {isFuturesMode
              ? isEn
                ? 'Recommended Contracts'
                : 'Contratos Exactos a Ingresar'
              : isEn
              ? 'Recommended Lot Size'
              : 'Lotaje Exacto a Ingresar'}
          </div>
          <div className="text-4xl font-black font-mono text-white mt-1">
            {finalLots}{' '}
            <span className="text-sm font-normal text-amber-200/70">
              {isFuturesMode
                ? isEn
                  ? 'Contracts'
                  : 'Contratos'
                : isEn
                ? 'Lots'
                : 'Lotes'}
            </span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-amber-200/70">
                {isEn ? 'Target Risk' : 'Riesgo Deseado'} ({safeRiskPct}%):
              </span>
              <strong className="text-white">${targetMonetaryRisk.toFixed(2)} USD</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-300 font-bold">
                {isEn ? 'Real Loss if SL Hit:' : 'Pérdida Real si toca SL:'}
              </span>
              <strong className="text-rose-400">
                -${actualMonetaryLossAtStop.toFixed(2)} USD ({actualRiskPercentOfAccount.toFixed(2)}%)
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300">
                {isEn ? `Profit at TP1 (1:${rewardRatio1}):` : `Ganancia en TP1 (1:${rewardRatio1}):`}
              </span>
              <strong className="text-emerald-400">+${profitAtTp1.toFixed(2)} USD</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300">
                {isEn ? `Profit at TP2 (1:${rewardRatio2}):` : `Ganancia en TP2 (1:${rewardRatio2}):`}
              </span>
              <strong className="text-emerald-400">+${profitAtTp2.toFixed(2)} USD</strong>
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono text-amber-200/60">
            {isEn
              ? `Formula: ${finalLots} ${isFuturesMode ? 'Contracts' : 'Lots'} × ${safeStop} ${unitLabel} × $${usdRiskPerUnitPerLot.toFixed(2)}/unit = -$${actualMonetaryLossAtStop.toFixed(2)} USD`
              : `Verificación: ${finalLots} ${isFuturesMode ? 'Contratos' : 'Lotes'} × ${safeStop} ${unitLabel} × $${usdRiskPerUnitPerLot.toFixed(2)} = -$${actualMonetaryLossAtStop.toFixed(2)} USD`}
          </div>
        </div>

        {/* Drawdown Protection Limits */}
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-3">
          <div className="text-xs uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Prop Firm Safety Limits' : 'Límites de Seguridad Prop Firm'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] text-xs font-mono space-y-2">
            <div className="flex justify-between text-amber-200/70">
              <span>{isEn ? 'Max Daily Loss (5%):' : 'Límite Diario Total (5%):'}</span>
              <strong className="text-rose-400">-${maxDailyLoss.toLocaleString()} USD</strong>
            </div>
            <div className="flex justify-between text-amber-200/70">
              <span>Hard Circuit Breaker (-1.5%):</span>
              <strong className="text-amber-400">-${hardCircuitBreaker.toLocaleString()} USD</strong>
            </div>
            <div className="flex justify-between text-amber-200/70">
              <span>
                {isEn ? 'Stops allowed before -1.5%:' : 'Stops permitidos antes de -1.5%:'}
              </span>
              <strong className="text-white">
                {Math.max(1, Math.floor(hardCircuitBreaker / Math.max(1, actualMonetaryLossAtStop)))}{' '}
                trades
              </strong>
            </div>
            <div className="flex justify-between text-amber-200/70">
              <span>
                {isEn ? 'Stops allowed before -5.0%:' : 'Colchón total hasta el -5.0%:'}
              </span>
              <strong className="text-emerald-400">
                {Math.max(1, Math.floor(maxDailyLoss / Math.max(1, actualMonetaryLossAtStop)))}{' '}
                trades
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            {isEn ? (
              <>
                If you lose 2 consecutive trades or reach <strong>-1.5%</strong> in the same day,
                stop trading until the next session to protect your funded account.
              </>
            ) : (
              <>
                Si sufres 2 Stop Loss seguidos o alcanzas el <strong>-1.5%</strong> en el mismo día,
                detén la operativa hasta el día siguiente para blindar tu cuenta de fondeo.
              </>
            )}
          </p>
        </div>

        {/* State Machine Overview */}
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-3">
          <div className="text-xs uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? 'Dynamic Risk Scaling Protocol' : 'Protocolo de Escalado de Riesgo'}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex justify-between items-center">
              <span>{isEn ? 'State 1: Normal (0% to -1.5%)' : 'Fase 1: Normal (0% a -1.5%)'}</span>
              <span className="font-bold">0.50% (${(safeBalance * 0.005).toFixed(0)})</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 flex justify-between items-center">
              <span>
                {isEn ? 'State 2: Caution (-1.5% to -3%)' : 'Fase 2: Precaución (-1.5% a -3%)'}
              </span>
              <span className="font-bold">0.25% (${(safeBalance * 0.0025).toFixed(0)})</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 flex justify-between items-center">
              <span>
                {isEn ? 'State 3: Defense (<-3.0%)' : 'Fase 3: Defensa (<-3.0%)'}
              </span>
              <span className="font-bold">0.15% (${(safeBalance * 0.0015).toFixed(0)})</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#120c08] border border-[#3b271a] text-[11px] text-amber-200/70 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isEn
                ? '1 single 1:3.0 winner recovers 3 full Stop Losses.'
                : '1 sola operación ganadora 1:3.0 recupera 3 Stop Loss completos.'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Coordinates & 1-Click MT5 Execution directly from Lot Calculator (only when MT5 is enabled in Settings) */}
      {showMt5 && (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold font-mono uppercase text-white">
                {isEn
                  ? `Direct MT5 Order Coordinates for ${spec.symbol} (${finalLots} ${isFuturesMode ? 'Contracts' : 'Lots'})`
                  : `Coordenadas de Orden y Ejecución Directa en MT5 para ${spec.symbol} (${finalLots} ${isFuturesMode ? 'Contratos' : 'Lotes'})`}
              </h3>
              <p className="text-[11px] text-amber-200/60">
                {isEn
                  ? 'Choose BUY or SELL and optional Entry Price to execute this exact lot size, SL, TP1, and TP2 in your MT5 session.'
                  : 'Elige Compra o Venta y el precio de entrada (en vivo o personalizado) para ejecutar este lotaje exacto, SL, TP1 y TP2 directo en tu sesión MT5.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDirection('BUY')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition ${
                  direction === 'BUY'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{isEn ? 'BUY / LONG' : 'COMPRA (BUY)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('SELL')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 border transition ${
                  direction === 'SELL'
                    ? 'bg-rose-600 text-white border-rose-400 shadow'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{isEn ? 'SELL / SHORT' : 'VENTA (SELL)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#120c08] border border-[#3b271a]">
              <label className="text-[10px] uppercase text-amber-200/60 block mb-1">
                {isEn ? 'Entry Price (Live / Custom)' : 'Precio Entrada (Vivo / Manual)'}
              </label>
              <input
                type="number"
                step="any"
                value={customEntryPrice !== '' ? customEntryPrice : entryPrice}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomEntryPrice(v === '' ? '' : parseFloat(v));
                }}
                className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-[#120c08] border border-rose-800/50">
              <span className="text-[10px] uppercase text-rose-400 block mb-1">
                Stop Loss ({safeStop} {unitLabel})
              </span>
              <span className="text-sm font-black text-rose-300 block">
                {stopLossPrice.toFixed(spec.decimals)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#120c08] border border-emerald-800/50">
              <span className="text-[10px] uppercase text-emerald-400 block mb-1">
                Take Profit 1 (1:{rewardRatio1})
              </span>
              <span className="text-sm font-black text-emerald-300 block">
                {tp1Price.toFixed(spec.decimals)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#120c08] border border-emerald-800/50">
              <span className="text-[10px] uppercase text-emerald-400 block mb-1">
                Take Profit 2 (1:{rewardRatio2})
              </span>
              <span className="text-sm font-black text-emerald-400 block">
                {tp2Price.toFixed(spec.decimals)}
              </span>
            </div>
          </div>

          <MT5OneClickBar
            setup={{
              asset: spec.symbol,
              action: direction,
              playbookName: isEn
                ? `Quant Lot Calculator (${safeRiskPct}% Risk)`
                : `Calculadora Cuantitativa (${safeRiskPct}% Riesgo)`,
              prices: {
                currentPrice: roundToTick(feedPrice, spec),
                entryPrice,
                stopLoss: stopLossPrice,
                takeProfit1: tp1Price,
                takeProfit2: tp2Price,
              },
              propFirmRiskCalculation: {
                accountBalance: safeBalance,
                recommendedLots: finalLots,
                riskPercentage: safeRiskPct,
                monetaryRiskUsd: Number(targetMonetaryRisk.toFixed(2)),
                actualRiskAtStopUsd: Number(actualMonetaryLossAtStop.toFixed(2)),
              },
            }}
            mt5State={mt5State}
            onRefreshMt5={onRefreshMt5}
            onOpenMt5Hub={onOpenMt5Hub}
            language={language}
            compact
          />
        </div>
      )}
    </div>
  );
};
