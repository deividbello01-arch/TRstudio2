import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import {
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

  useEffect(() => {
    setExecutionResult(null);
  }, [
    setup.asset,
    setup.action,
    setup.prices.entryPrice,
    setup.prices.stopLoss,
    setup.propFirmRiskCalculation.recommendedLots,
  ]);

  useEffect(() => {
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
              className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/70 font-mono text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                #{executionResult.ticket} ({executionResult.lots}L) · MT5
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClickExecute}
              disabled={isExecuting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
              title={
                isEn
                  ? `Execute ${autoDirection} ${setup.asset} (${autoLots} Lots) in MT5`
                  : `Ejecutar ${autoDirection} ${setup.asset} (${autoLots} Lotes) en MT5`
              }
            >
              {isExecuting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>
                MT5 · {autoDirection} {autoLots}L
              </span>
            </button>
          )}
        </div>

        {showQuickLoginModal && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickLoginModal(false);
            }}
          >
            <div
              className="bg-[#18110b] border border-[#3b271a] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#3b271a] pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    {isEn ? 'Connect MT5 & Execute' : 'Conectar MT5 y Ejecutar'}
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

              <div className="p-2.5 rounded-lg bg-[#120c08] border border-[#3b271a] text-xs flex items-center justify-between">
                <span className="font-bold text-white">
                  {autoDirection} {mappedSymbol} · {autoLots} Lotes
                </span>
                <span className="text-amber-200/80 text-[11px] tabular-nums">
                  SL {setup.prices.stopLoss} · TP {setup.prices.takeProfit1}
                </span>
              </div>

              <form onSubmit={handleQuickLoginAndExecute} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-amber-200/70 mb-1">Broker</label>
                    <select
                      value={quickBroker}
                      onChange={(e) => {
                        const val = e.target.value as MT5BrokerPreset;
                        setQuickBroker(val);
                        setQuickServer(`${val}-Server3`);
                      }}
                      className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2 py-1.5 text-white font-bold"
                    >
                      {QUICK_BROKERS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-amber-200/70 mb-1">Login</label>
                    <input
                      type="text"
                      value={quickLogin}
                      onChange={(e) => setQuickLogin(e.target.value)}
                      className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-amber-200/70 mb-1">Servidor</label>
                    <input
                      type="text"
                      value={quickServer}
                      onChange={(e) => setQuickServer(e.target.value)}
                      className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isEn
                      ? `Connect & Execute ${autoDirection} (${autoLots}L)`
                      : `Conectar y Ejecutar ${autoDirection} (${autoLots}L)`}
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
    <div className="px-4 py-3 bg-[#120c08] border-t border-b border-[#3b271a] space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-white">MT5 Auto-Orden:</span>
          <span
            className={`font-bold ${
              autoDirection === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {autoDirection}
          </span>
          <span className="text-white font-bold">{mappedSymbol}</span>
          <span className="text-amber-200/40">·</span>
          <span className="font-bold text-amber-300 tabular-nums">{autoLots} Lotes</span>
          <span className="text-amber-200/40">·</span>
          <span className="text-rose-300 tabular-nums">SL {setup.prices.stopLoss}</span>
          <span className="text-amber-200/40">·</span>
          <span className="text-emerald-300 tabular-nums">
            TP {setup.prices.takeProfit1}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center rounded-lg bg-[#18110b] p-0.5 border border-[#3b271a] text-[11px]">
            <button
              type="button"
              onClick={() => setOrderType('MARKET')}
              className={`px-2.5 py-1 rounded-md font-bold transition whitespace-nowrap ${
                orderType === 'MARKET'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              {isEn ? 'Market' : 'Mercado'}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('LIMIT')}
              className={`px-2.5 py-1 rounded-md font-bold transition whitespace-nowrap ${
                orderType === 'LIMIT'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              Limit ({setup.prices.entryPrice})
            </button>
          </div>

          <button
            type="button"
            onClick={handleClickExecute}
            disabled={isExecuting}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
          >
            {isExecuting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>
              {isExecuting
                ? isEn
                  ? 'Sending...'
                  : 'Enviando...'
                : isEn
                ? `Execute in MT5 (${autoLots}L)`
                : `Ejecutar en MT5 (${autoLots}L)`}
            </span>
          </button>

          {onOpenMt5Hub && (
            <button
              type="button"
              onClick={onOpenMt5Hub}
              className="px-2.5 py-1.5 rounded-lg bg-[#18110b] hover:bg-[#24170f] text-amber-200 border border-[#3b271a] text-xs font-semibold transition whitespace-nowrap shrink-0"
            >
              {isEn ? 'Open MT5' : 'Panel MT5'}
            </button>
          )}
        </div>
      </div>

      {executionResult && (
        <div className="px-3 py-2 rounded-lg bg-emerald-950/70 border border-emerald-600/60 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="tabular-nums">
              {isEn
                ? `Executed #${executionResult.ticket}: ${executionResult.action} ${executionResult.lots}L ${executionResult.brokerSymbol} @ ${executionResult.fillPrice}`
                : `Orden #${executionResult.ticket} activa: ${executionResult.action} ${executionResult.lots}L ${executionResult.brokerSymbol} @ ${executionResult.fillPrice}`}
            </span>
          </div>
          {onOpenMt5Hub && (
            <button
              type="button"
              onClick={onOpenMt5Hub}
              className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-500 transition whitespace-nowrap"
            >
              <span>{isEn ? 'Manage Position' : 'Gestionar Posición'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {showQuickLoginModal && (
        <form
          onSubmit={handleQuickLoginAndExecute}
          className="p-3 rounded-lg bg-[#18110b] border border-[#3b271a] grid grid-cols-1 sm:grid-cols-4 gap-2 items-end font-mono text-xs"
        >
          <div>
            <label className="block text-[10px] text-amber-200/70 mb-1">Broker</label>
            <select
              value={quickBroker}
              onChange={(e) => {
                const val = e.target.value as MT5BrokerPreset;
                setQuickBroker(val);
                setQuickServer(`${val}-Server3`);
              }}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold"
            >
              {QUICK_BROKERS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-amber-200/70 mb-1">Login MT5</label>
            <input
              type="text"
              value={quickLogin}
              onChange={(e) => setQuickLogin(e.target.value)}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] text-amber-200/70 mb-1">Servidor</label>
            <input
              type="text"
              value={quickServer}
              onChange={(e) => setQuickServer(e.target.value)}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isExecuting}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isEn ? 'Connect & Send' : 'Conectar y Enviar'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuickLoginModal(false)}
              className="p-1.5 rounded-lg bg-[#120c08] border border-[#3b271a] text-amber-200/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
