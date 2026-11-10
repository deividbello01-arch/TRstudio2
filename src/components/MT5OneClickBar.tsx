import React, { useState } from 'react';
import {
  Terminal,
  Zap,
  CheckCircle2,
  Server,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  TradeSetup,
  MT5SessionState,
  MT5BrokerPreset,
  AppLanguage,
} from '../types/trading';

export interface ExecutableSetupPayload {
  asset: string;
  action: 'BUY' | 'SELL' | 'WAIT';
  playbookName: string;
  prices: {
    currentPrice: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
  };
  propFirmRiskCalculation: {
    accountBalance: number;
    recommendedLots: number;
    riskPercentage: number;
    monetaryRiskUsd: number;
    actualRiskAtStopUsd?: number;
  };
}

interface MT5OneClickBarProps {
  setup: ExecutableSetupPayload;
  mt5State: MT5SessionState | null;
  onRefreshMt5: () => Promise<void>;
  onOpenMt5Hub?: () => void;
  language?: AppLanguage;
  compact?: boolean;
}

const QUICK_BROKERS: MT5BrokerPreset[] = [
  'FTMO',
  'FundedNext',
  'ICMarkets',
  'Pepperstone',
  'Exness',
  'Eightcap',
  'Darwinex',
  'Custom',
];

export const MT5OneClickBar: React.FC<MT5OneClickBarProps> = ({
  setup,
  mt5State,
  onRefreshMt5,
  onOpenMt5Hub,
  language = 'es',
  compact = false,
}) => {
  const isEn = language === 'en';
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showQuickLoginModal, setShowQuickLoginModal] = useState<boolean>(false);
  const [quickBroker, setQuickBroker] = useState<MT5BrokerPreset>(
    mt5State?.brokerPreset || 'FTMO'
  );
  const [quickLogin, setQuickLogin] = useState<string>(mt5State?.login || '15089421');
  const [quickServer, setQuickServer] = useState<string>(
    mt5State?.brokerServer || 'FTMO-Server3'
  );
  const [quickPassword, setQuickPassword] = useState<string>('••••••••••••');

  const [executionResult, setExecutionResult] = useState<{
    ticket: string;
    brokerSymbol: string;
    lots: number;
    fillPrice: number;
    action: string;
  } | null>(null);

  const isConnected = Boolean(mt5State?.connected);
  const mappedSymbol = mt5State?.symbolMap?.[setup.asset] || setup.asset;
  const autoLots = setup.propFirmRiskCalculation.recommendedLots;
  const autoDirection = setup.action === 'SELL' ? 'SELL' : 'BUY';

  React.useEffect(() => {
    setExecutionResult(null);
  }, [
    setup.asset,
    setup.action,
    setup.prices.entryPrice,
    setup.prices.stopLoss,
    setup.propFirmRiskCalculation.recommendedLots,
  ]);

  React.useEffect(() => {
    if (mt5State) {
      setQuickBroker(mt5State.brokerPreset || 'FTMO');
      setQuickLogin(mt5State.login || '15089421');
      setQuickServer(mt5State.brokerServer || 'FTMO-Server3');
    }
  }, [mt5State?.brokerPreset, mt5State?.login, mt5State?.brokerServer]);

  const executeOrderNow = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/mt5/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: setup.asset,
          action: autoDirection,
          orderType,
          lots: autoLots,
          entryPrice:
            orderType === 'MARKET'
              ? setup.prices.currentPrice
              : setup.prices.entryPrice,
          stopLoss: setup.prices.stopLoss,
          takeProfit1: setup.prices.takeProfit1,
          takeProfit2: setup.prices.takeProfit2,
          playbookName: setup.playbookName,
          riskUsd:
            setup.propFirmRiskCalculation.actualRiskAtStopUsd ??
            setup.propFirmRiskCalculation.monetaryRiskUsd,
          riskPercent: setup.propFirmRiskCalculation.riskPercentage,
          autoConnectIfNeeded: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.executedPosition) {
        await onRefreshMt5();
        setExecutionResult({
          ticket: data.executedPosition.ticket,
          brokerSymbol: data.executedPosition.brokerSymbol,
          lots: data.executedPosition.lots,
          fillPrice: data.executedPosition.entryPrice,
          action: data.executedPosition.action,
        });
        setShowQuickLoginModal(false);
      }
    } catch (_e) {
      // ignore
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClickExecute = () => {
    if (isConnected) {
      executeOrderNow();
    } else {
      setShowQuickLoginModal(true);
    }
  };

  const handleQuickLoginAndExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    try {
      await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: quickLogin,
          brokerServer: quickServer,
          password: quickPassword,
          brokerPreset: quickBroker,
          accountBalance: setup.propFirmRiskCalculation.accountBalance,
        }),
      });
      await executeOrderNow();
    } finally {
      setIsExecuting(false);
    }
  };

  if (compact) {
    return (
      <>
        <div
          className="inline-flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {executionResult ? (
            <button
              type="button"
              onClick={() => onOpenMt5Hub && onOpenMt5Hub()}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/70 font-mono text-[11px] font-bold flex items-center gap-1 shadow"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                #{executionResult.ticket} ({executionResult.lots}L) •{' '}
                {isEn ? 'View in MT5' : 'Ver en MT5'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClickExecute}
              disabled={isExecuting}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-[11px] font-black flex items-center gap-1.5 shadow-md transition border border-emerald-400/50"
              title={
                isEn
                  ? `Auto-Execute ${autoDirection} ${setup.asset} (${autoLots} Lots) in MT5`
                  : `Auto-Ejecutar ${autoDirection} ${setup.asset} (${autoLots} Lotes) en MT5`
              }
            >
              {isExecuting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>
                {isEn
                  ? `Execute in MT5 (${autoLots}L)`
                  : `Ejecutar en MT5 (${autoLots}L)`}
              </span>
            </button>
          )}
        </div>

        {showQuickLoginModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickLoginModal(false);
            }}
          >
            <div
              className="bg-[#18110b] border-2 border-amber-500 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#3b271a] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-black text-white">
                    {isEn
                      ? 'Start MT5 Broker Session & Auto-Execute'
                      : 'Iniciar Sesión MT5 y Ejecutar Entrada'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickLoginModal(false)}
                  className="text-amber-200/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#120c08] border border-emerald-800/60 text-xs space-y-1">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">
                  {isEn
                    ? 'Auto-Selected Parameters by TRstudio:'
                    : 'Parámetros Elegidos Automáticamente por la Web:'}
                </div>
                <div className="text-white font-bold">
                  {autoDirection} {setup.asset} → {mappedSymbol} •{' '}
                  <span className="text-amber-400">{autoLots} Lotes</span>
                </div>
                <div className="text-[11px] text-amber-200/80">
                  Entrada: {setup.prices.currentPrice} | SL: {setup.prices.stopLoss} | TP1:{' '}
                  {setup.prices.takeProfit1} | TP2: {setup.prices.takeProfit2}
                </div>
              </div>

              <form onSubmit={handleQuickLoginAndExecute} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-amber-200/70 uppercase mb-1">
                    Broker / Prop Firm:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {QUICK_BROKERS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setQuickBroker(b);
                          setQuickServer(`${b}-Server`);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border ${
                          quickBroker === b
                            ? 'bg-amber-600 text-white border-amber-400'
                            : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-amber-200/70 mb-1">
                      Login Cuenta MT5
                    </label>
                    <input
                      type="text"
                      value={quickLogin}
                      onChange={(e) => setQuickLogin(e.target.value)}
                      className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-amber-200/70 mb-1">
                      Servidor Broker
                    </label>
                    <input
                      type="text"
                      value={quickServer}
                      onChange={(e) => setQuickServer(e.target.value)}
                      className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-amber-200/70 mb-1">
                    Contraseña MT5
                  </label>
                  <input
                    type="password"
                    value={quickPassword}
                    onChange={(e) => setQuickPassword(e.target.value)}
                    className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isEn
                      ? `Connect Broker & Execute ${autoDirection} ${autoLots} Lots`
                      : `Iniciar Sesión y Ejecutar ${autoDirection} (${autoLots} Lotes) Ahora`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-[#161b14] to-[#18110b] border-t border-b border-emerald-700/50 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                {isEn
                  ? 'METATRADER 5 AUTO-EXECUTION READY (WEB PICKS INDEX, LOTS, SL & TP)'
                  : 'EJECUCIÓN AUTOMÁTICA EN METATRADER 5 (LA WEB ELIGE ÍNDICE, LOTAJE, SL Y TP SOLA)'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                    : 'bg-amber-950 text-amber-300 border-amber-600/70'
                }`}
              >
                {isConnected
                  ? `🟢 Broker Activo: ${mt5State?.brokerServer} (#${mt5State?.login})`
                  : isEn
                  ? '⚡ 1-Click Broker Session Ready'
                  : '⚡ Sesión de Broker en 1 Clic'}
              </span>
            </div>

            <div className="text-xs font-mono text-amber-100/90 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                {isEn ? 'Auto-Index:' : 'Índice Elegido:'}{' '}
                <strong className="text-white">
                  {setup.asset} → {mappedSymbol}
                </strong>
              </span>
              <span>•</span>
              <span>
                {isEn ? 'Direction:' : 'Acción:'}{' '}
                <strong
                  className={
                    autoDirection === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {autoDirection}
                </strong>
              </span>
              <span>•</span>
              <span>
                {isEn ? 'Exact Auto-Lots:' : 'Lotaje Calculado:'}{' '}
                <strong className="text-amber-300">{autoLots} Lotes</strong>
              </span>
              <span>•</span>
              <span>
                SL: <strong className="text-rose-300">{setup.prices.stopLoss}</strong>
              </span>
              <span>•</span>
              <span>
                TP1/TP2:{' '}
                <strong className="text-emerald-300">
                  {setup.prices.takeProfit1} / {setup.prices.takeProfit2}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Order Type Toggle & 1-Click Execute Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono">
          <div className="flex items-center rounded-xl bg-[#120c08] p-1 border border-[#3b271a] text-[11px]">
            <button
              type="button"
              onClick={() => setOrderType('MARKET')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                orderType === 'MARKET'
                  ? 'bg-emerald-600 text-white'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              {isEn ? 'Market (Now)' : 'A Mercado (Ahora)'}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('LIMIT')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                orderType === 'LIMIT'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              {isEn ? `Limit (${setup.prices.entryPrice})` : `Orden Limit (${setup.prices.entryPrice})`}
            </button>
          </div>

          <button
            type="button"
            onClick={handleClickExecute}
            disabled={isExecuting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition"
          >
            {isExecuting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-slate-950" />
            )}
            <span>
              {isExecuting
                ? isEn
                  ? 'Sending to MT5...'
                  : 'Enviando a MT5...'
                : isEn
                ? `🚀 Execute in MT5 (${autoLots} Lots)`
                : `🚀 Ejecutar en MT5 (${autoLots} Lotes)`}
            </span>
          </button>

          {onOpenMt5Hub && (
            <button
              type="button"
              onClick={onOpenMt5Hub}
              className="px-3 py-2.5 rounded-xl bg-[#24170f] hover:bg-[#332015] text-amber-200 border border-[#4d3221] text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'MT5 Terminal' : 'Ver MT5'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Instant Execution Confirmation Alert */}
      {executionResult && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isEn
                ? `Order #${executionResult.ticket} executed in MT5: ${executionResult.action} ${executionResult.lots} Lots on ${executionResult.brokerSymbol} @ ${executionResult.fillPrice}`
                : `¡Orden #${executionResult.ticket} ejecutada en tu sesión MT5! ${executionResult.action} ${executionResult.lots} Lotes en ${executionResult.brokerSymbol} @ ${executionResult.fillPrice} (SL y TP configurados solos)`}
            </span>
          </div>
          {onOpenMt5Hub && (
            <button
              type="button"
              onClick={onOpenMt5Hub}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center gap-1 hover:bg-emerald-400 transition"
            >
              <span>{isEn ? 'Manage Live Position in MT5' : 'Gestionar Posición en Vivo en MT5'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Inline Quick Broker Session Login Modal if not connected yet */}
      {showQuickLoginModal && (
        <div className="p-4 rounded-xl bg-[#120c08] border-2 border-amber-500 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-amber-300 uppercase flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-400" />
              {isEn
                ? 'Start Your Broker Session in MT5 to Execute Automatically'
                : 'Inicia Sesión de tu Broker en MT5 para Ejecutar la Entrada Automáticamente'}
            </span>
            <button
              type="button"
              onClick={() => setShowQuickLoginModal(false)}
              className="text-amber-200/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleQuickLoginAndExecute}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
          >
            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1">
                Broker / Prop Firm
              </label>
              <select
                value={quickBroker}
                onChange={(e) => {
                  const val = e.target.value as MT5BrokerPreset;
                  setQuickBroker(val);
                  setQuickServer(`${val}-Server3`);
                }}
                className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-2 text-white font-bold"
              >
                {QUICK_BROKERS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1">
                Login Cuenta MT5
              </label>
              <input
                type="text"
                value={quickLogin}
                onChange={(e) => setQuickLogin(e.target.value)}
                className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1">
                Servidor del Broker
              </label>
              <input
                type="text"
                value={quickServer}
                onChange={(e) => setQuickServer(e.target.value)}
                className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-2 text-white font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isExecuting}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg transition h-[36px]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {isEn
                  ? 'Login & Execute Now'
                  : 'Conectar y Ejecutar Ahora'}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
