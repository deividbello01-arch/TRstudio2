import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  ShieldCheck,
  Scissors,
  XCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  KeyRound,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Sparkles,
  Laptop,
  Globe,
  History,
  LogOut,
  Zap,
} from 'lucide-react';
import {
  MT5SessionState,
  MT5BrokerPreset,
  MT5ConnectionMode,
  AppLanguage,
  ALL_PROGRAMMED_TRADEABLE_SYMBOLS,
} from '../types/trading';

interface MT5ExecutionHubProps {
  mt5State: MT5SessionState | null;
  onRefreshMt5: () => Promise<void>;
  language?: AppLanguage;
  defaultBalance?: number;
  onNavigateToEntries?: () => void;
  onNavigateToScanner?: () => void;
}

const BROKER_PRESETS: Array<{
  id: MT5BrokerPreset;
  label: string;
  defaultServer: string;
  sampleNas: string;
}> = [
  { id: 'FTMO', label: 'FTMO Prop Firm', defaultServer: 'FTMO-Server3', sampleNas: 'US100.cash' },
  { id: 'FundedNext', label: 'FundedNext', defaultServer: 'FundedNext-Server', sampleNas: 'NDX100' },
  { id: 'ICMarkets', label: 'IC Markets Global', defaultServer: 'ICMarketsSC-MT5-4', sampleNas: 'USTEC' },
  { id: 'Pepperstone', label: 'Pepperstone', defaultServer: 'Pepperstone-MT5-Live01', sampleNas: 'NAS100' },
  { id: 'Exness', label: 'Exness Technologies', defaultServer: 'Exness-MT5Real7', sampleNas: 'USTECm' },
  { id: 'Eightcap', label: 'Eightcap', defaultServer: 'Eightcap-Real', sampleNas: 'NDX100' },
  { id: 'Darwinex', label: 'Darwinex Zero / Live', defaultServer: 'Darwinex-Live', sampleNas: 'NDX' },
  { id: 'Custom', label: 'Otro Broker (Personalizado)', defaultServer: 'Broker-MT5-Live', sampleNas: 'NAS100' },
];

export const MT5ExecutionHub: React.FC<MT5ExecutionHubProps> = ({
  mt5State,
  onRefreshMt5,
  language = 'es',
  defaultBalance = 10000,
  onNavigateToEntries,
  onNavigateToScanner,
}) => {
  const isEn = language === 'en';

  const [brokerPreset, setBrokerPreset] = useState<MT5BrokerPreset>(
    mt5State?.brokerPreset || 'FTMO'
  );
  const [login, setLogin] = useState<string>(mt5State?.login || '15089421');
  const [brokerServer, setBrokerServer] = useState<string>(
    mt5State?.brokerServer || 'FTMO-Server3'
  );
  const [password, setPassword] = useState<string>('••••••••••••');
  const [accountType, setAccountType] = useState<'Prop Firm' | 'Live ECN' | 'Demo Quant'>(
    mt5State?.accountType || 'Prop Firm'
  );
  const [connectionMode, setConnectionMode] = useState<MT5ConnectionMode>(
    mt5State?.connectionMode || 'integrated_web'
  );
  const [accountBalance, setAccountBalance] = useState<number>(
    mt5State?.balance || defaultBalance
  );
  const [metaApiToken, setMetaApiToken] = useState<string>('');
  const [metaApiAccountId, setMetaApiAccountId] = useState<string>('');
  const [symbolMap, setSymbolMap] = useState<Record<string, string>>(
    mt5State?.symbolMap || {}
  );

  const [showSymbolMapper, setShowSymbolMapper] = useState<boolean>(false);
  const [showWebTerminalIframe, setShowWebTerminalIframe] = useState<boolean>(false);
  const [showEaInstructions, setShowEaInstructions] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (mt5State) {
      setBrokerPreset(mt5State.brokerPreset);
      setLogin(mt5State.login);
      setBrokerServer(mt5State.brokerServer);
      setAccountType(mt5State.accountType);
      setConnectionMode(mt5State.connectionMode);
      setSymbolMap(mt5State.symbolMap || {});
    }
  }, [mt5State?.connected, mt5State?.brokerPreset]);

  const handleSelectBrokerPreset = async (presetId: MT5BrokerPreset) => {
    setBrokerPreset(presetId);
    const found = BROKER_PRESETS.find((b) => b.id === presetId);
    if (found) {
      setBrokerServer(found.defaultServer);
    }
    try {
      const res = await fetch('/api/mt5/symbol-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerPreset: presetId }),
      });
      if (res.ok) {
        await onRefreshMt5();
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleConnectSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsConnecting(true);
    setActionBanner(null);
    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login,
          brokerServer,
          password,
          brokerPreset,
          accountType,
          connectionMode,
          accountBalance: Number(accountBalance) || defaultBalance,
          metaApiToken,
          metaApiAccountId,
          customSymbolMap: symbolMap,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setActionBanner({
          type: 'success',
          text:
            data.message ||
            (isEn
              ? 'MT5 Broker Session Connected! You can now execute setups in 1 click.'
              : '¡Sesión de Broker MT5 iniciada! Ya puedes darle a "Ejecutar en MT5" en Zona de Entradas o Mejor Entrada.'),
        });
      } else {
        setActionBanner({
          type: 'error',
          text: data.error || 'Error al iniciar sesión MT5',
        });
      }
    } catch (_err) {
      setActionBanner({
        type: 'error',
        text: isEn ? 'Connection error' : 'Error de conexión con el servidor MT5',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectSession = async () => {
    try {
      await fetch('/api/mt5/disconnect', { method: 'POST' });
      await onRefreshMt5();
      setActionBanner({
        type: 'info',
        text: isEn ? 'MT5 Session disconnected.' : 'Sesión de broker MT5 cerrada.',
      });
    } catch (_e) {
      // ignore
    }
  };

  const handleSaveSymbolMap = async () => {
    try {
      const res = await fetch('/api/mt5/symbol-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbolMap }),
      });
      if (res.ok) {
        await onRefreshMt5();
        setActionBanner({
          type: 'success',
          text: isEn
            ? 'Broker symbol mapping updated!'
            : '¡Mapeo de símbolos del broker guardado correctamente!',
        });
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleModifyPosition = async (
    id: string,
    modAction: 'BREAK_EVEN' | 'PARTIAL_TP1' | 'TRIGGER_LIMIT'
  ) => {
    try {
      const res = await fetch('/api/mt5/modify-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, modAction }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setActionBanner({ type: 'success', text: data.message });
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleClosePosition = async (id: string) => {
    try {
      const res = await fetch('/api/mt5/close-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setActionBanner({ type: 'info', text: data.message });
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleOpenMacOsInstaller = async () => {
    try {
      const res = await fetch('/api/mt5/open-macos-installer', { method: 'POST' });
      const data = await res.json();
      if (data.localFileFound) {
        setActionBanner({
          type: 'success',
          text: isEn
            ? `Opened MetaTrader5.pkg.zip in Finder (${data.path})`
            : `Instalador MetaTrader5.pkg.zip abierto en tu carpeta Descargas (${data.path}). ¡Haz doble clic para instalar MT5 en tu Mac!`,
        });
      } else {
        window.open(
          'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/MetaTrader5.pkg.zip',
          '_blank'
        );
      }
    } catch (_e) {
      window.open(
        'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/MetaTrader5.pkg.zip',
        '_blank'
      );
    }
  };

  const isConnected = Boolean(mt5State?.connected);
  const openPositions = mt5State?.openPositions || [];
  const orderHistory = mt5State?.orderHistory || [];
  const floatingPnl = mt5State?.floatingPnlUsd || 0;
  const realizedPnl = mt5State?.realizedSessionPnlUsd || 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Download / WebTerminal Bar */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl border shrink-0 ${
                isConnected
                  ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                  : 'bg-amber-950/80 text-amber-400 border-amber-700/60'
              }`}
            >
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black font-mono text-white">
                  {isEn
                    ? 'MetaTrader 5 (MT5) Integrated Hub & 1-Click Auto-Execution'
                    : 'MetaTrader 5 (MT5) Integrado & Auto-Ejecución en 1 Clic'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  {isConnected
                    ? isEn
                      ? `CONNECTED: ${mt5State?.brokerServer} (#${mt5State?.login})`
                      : `SESIÓN ACTIVA: ${mt5State?.brokerServer} (#${mt5State?.login})`
                    : isEn
                    ? 'SESSION READY TO CONNECT'
                    : 'LISTO PARA INICIAR SESIÓN'}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-1 max-w-3xl">
                {isEn
                  ? 'Start your MT5 broker session here. Whenever you generate an entry in "Request Entries" or "Best Setups", click "Execute in MT5" and the web automatically selects the mapped index, exact lot size, entry, Stop Loss, and Take Profits.'
                  : 'Inicia sesión con tu broker aquí. Cuando generes una entrada en "Pedir Entradas" o en "Mejor Entrada", dale a "Ejecutar en MT5" y la web elegirá sola el índice mapeado a tu broker, el lotaje exacto, precio de entrada, Stop Loss y Take Profits.'}
              </p>
            </div>
          </div>

          {/* Action Buttons: macOS MT5 Installer, EA Bridge Download, Embedded WebTerminal */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenMacOsInstaller}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-md transition"
              title="MetaTrader5.pkg (Listo en /Downloads)"
            >
              <Download className="w-4 h-4" />
              <span>
                {mt5State?.macosInstallerReady
                  ? isEn
                    ? 'Open MT5 macOS Installer (.pkg Ready)'
                    : 'Abrir Instalador MT5 Mac (.pkg Listo)'
                  : isEn
                  ? 'Download MT5 for macOS'
                  : 'Descargar MT5 para macOS'}
              </span>
            </button>

            <a
              href="/mt5/TRstudio_MT5_AutoExecutor.mq5"
              download="TRstudio_MT5_AutoExecutor.mq5"
              className="px-3 py-2 rounded-xl bg-[#24170f] hover:bg-[#332015] text-amber-300 border border-[#4d3221] hover:border-amber-500 font-mono font-bold text-xs flex items-center gap-1.5 transition"
              title="Descargar Expert Advisor MQL5 para sincronizar con MT5 Desktop"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Download EA (.mq5)' : 'Descargar Puente EA (.mq5)'}</span>
            </a>

            <button
              type="button"
              onClick={() => setShowWebTerminalIframe(!showWebTerminalIframe)}
              className={`px-3 py-2 rounded-xl font-mono font-bold text-xs border flex items-center gap-1.5 transition ${
                showWebTerminalIframe
                  ? 'bg-emerald-700 text-white border-emerald-400'
                  : 'bg-[#24170f] hover:bg-[#332015] text-amber-200 border border-[#4d3221]'
              }`}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>
                {showWebTerminalIframe
                  ? isEn
                    ? 'Hide MT5 WebTerminal'
                    : 'Ocultar MT5 WebTerminal'
                  : isEn
                  ? 'Open MT5 WebTerminal'
                  : 'Abrir MT5 WebTerminal Oficial'}
              </span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {actionBanner && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
              actionBanner.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200'
                : actionBanner.type === 'error'
                ? 'bg-rose-950/80 border-rose-600/70 text-rose-200'
                : 'bg-amber-950/80 border-amber-600/70 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionBanner(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Account Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#3b271a] font-mono">
          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
            <span className="text-[10px] uppercase text-amber-200/60 block">
              {isEn ? 'MT5 Account Balance' : 'Balance Cuenta MT5'}
            </span>
            <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
              ${(mt5State?.balance ?? accountBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-400">
              {mt5State?.brokerPreset || brokerPreset} • {mt5State?.accountType || accountType}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
            <span className="text-[10px] uppercase text-amber-200/60 block">
              {isEn ? 'Live Equity (USD)' : 'Equidad en Vivo (USD)'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5 block">
              ${(mt5State?.equity ?? accountBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-200/50">
              {isEn ? 'Real-time mark-to-market' : 'Actualizado en tiempo real'}
            </span>
          </div>

          <div
            className={`p-3 rounded-xl bg-[#120c08] border ${
              floatingPnl > 0
                ? 'border-emerald-700/60'
                : floatingPnl < 0
                ? 'border-rose-700/60'
                : 'border-[#3b271a]'
            }`}
          >
            <span className="text-[10px] uppercase text-amber-200/60 block">
              {isEn ? 'Open Floating PnL' : 'PnL Flotante Abierto'}
            </span>
            <span
              className={`text-base sm:text-lg font-black mt-0.5 block ${
                floatingPnl > 0
                  ? 'text-emerald-400'
                  : floatingPnl < 0
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {floatingPnl >= 0 ? '+' : ''}${floatingPnl.toFixed(2)} USD
            </span>
            <span className="text-[10px] text-amber-200/60">
              {openPositions.length} {isEn ? 'active trades' : 'órdenes activas'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
            <span className="text-[10px] uppercase text-amber-200/60 block">
              {isEn ? 'Closed Session PnL' : 'Beneficio Cerrado hoy'}
            </span>
            <span
              className={`text-base sm:text-lg font-black mt-0.5 block ${
                realizedPnl > 0
                  ? 'text-emerald-400'
                  : realizedPnl < 0
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)} USD
            </span>
            <span className="text-[10px] text-amber-200/60">
              {orderHistory.length} {isEn ? 'closed executions' : 'ejecuciones cerradas'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#120c08] border border-[#3b271a] flex flex-col justify-between">
            <span className="text-[10px] uppercase text-amber-200/60 block">
              {isEn ? 'Quick Trade Finder' : 'Ir a Buscar Entrada'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {onNavigateToScanner && (
                <button
                  type="button"
                  onClick={onNavigateToScanner}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition truncate"
                >
                  {isEn ? '#1 Best Setup' : '#1 Mejor Entrada'}
                </button>
              )}
              {onNavigateToEntries && (
                <button
                  type="button"
                  onClick={onNavigateToEntries}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#24170f] hover:bg-[#332015] text-amber-200 border border-[#4d3221] text-[10px] font-bold transition truncate"
                >
                  {isEn ? 'Entry Zone' : 'Zona Entradas'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Official MetaTrader 5 WebTerminal (Toggleable) */}
      {showWebTerminalIframe && (
        <div className="bg-[#18110b] border-2 border-amber-500/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-3.5 bg-[#120c08] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">
                {isEn
                  ? 'Official MetaTrader 5 WebTerminal (MetaQuotes)'
                  : 'Terminal Web Oficial de MetaTrader 5 Integrada'}
              </span>
              <span className="text-[11px] text-amber-300/80">
                — Servidor activo: <strong>{brokerServer}</strong> | Login: <strong>{login}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://trade.mql5.com/trade"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-[#24170f] hover:bg-[#332015] text-amber-300 border border-[#4d3221] text-[11px] font-mono flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isEn ? 'Open in Full Window' : 'Abrir en Ventana Completa'}</span>
              </a>
              <button
                type="button"
                onClick={() => setShowWebTerminalIframe(false)}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[11px] font-mono"
              >
                {isEn ? 'Close WebTerminal' : 'Cerrar Vista'}
              </button>
            </div>
          </div>
          <div className="w-full h-[580px] bg-black">
            <iframe
              src="https://trade.mql5.com/trade?lang=es&save_password=on"
              title="MetaTrader 5 WebTerminal"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </div>
      )}

      {/* Broker Session Login & Auto-Symbol Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleConnectSession}
          className="lg:col-span-5 bg-[#18110b] border border-[#3b271a] rounded-2xl p-5 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#3b271a] pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold font-mono uppercase text-white">
                {isEn ? '1. Broker Session Login (MT5)' : '1. Iniciar Sesión con tu Broker en MT5'}
              </h2>
            </div>
            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnectSession}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[11px] font-mono flex items-center gap-1 transition"
              >
                <LogOut className="w-3 h-3" />
                <span>{isEn ? 'Disconnect' : 'Cerrar Sesión'}</span>
              </button>
            )}
          </div>

          {/* Broker Presets */}
          <div>
            <label className="block text-[11px] font-mono text-amber-200/80 uppercase mb-1.5">
              {isEn
                ? 'Select Your Broker / Prop Firm (Auto-Maps Indices):'
                : 'Elige tu Broker / Prop Firm (Mapea Índices Automáticamente):'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {BROKER_PRESETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBrokerPreset(b.id)}
                  className={`px-2.5 py-2 rounded-xl font-mono text-left border transition ${
                    brokerPreset === b.id
                      ? 'bg-amber-600 text-white border-amber-400 font-bold shadow'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-600'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{b.id}</div>
                  <div className="text-[9px] opacity-80 truncate">NAS → {b.sampleNas}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Login, Server, Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="block text-[11px] text-amber-200/70 mb-1">
                {isEn ? 'MT5 Account Login ID' : 'Login / Número de Cuenta MT5'}
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Ej. 15089421"
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-amber-200/70 mb-1">
                {isEn ? 'Broker Server' : 'Servidor del Broker'}
              </label>
              <input
                type="text"
                value={brokerServer}
                onChange={(e) => setBrokerServer(e.target.value)}
                placeholder="Ej. FTMO-Server3"
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-amber-200/70 mb-1">
                {isEn ? 'MT5 Password' : 'Contraseña Trader MT5'}
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-200/70 mb-1">
                {isEn ? 'Account Balance ($ USD)' : 'Balance de Cuenta ($ USD)'}
              </label>
              <input
                type="number"
                min={100}
                value={accountBalance || ''}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Execution Bridge Mode */}
          <div className="space-y-1.5 font-mono">
            <label className="block text-[11px] text-amber-200/80 uppercase">
              {isEn ? 'Execution Engine Mode:' : 'Modo de Ejecución MT5:'}
            </label>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                {
                  id: 'integrated_web',
                  titleEs: '⚡ Terminal MT5 Integrada en la Web (Ejecución Instantánea)',
                  titleEn: '⚡ Integrated Web MT5 Engine (Instant 1-Click Execution)',
                  descEs: 'Ejecuta al instante en la sesión web con precios reales y también encola para MT5 Desktop.',
                  descEn: 'Executes immediately in the live web session and queues for MT5 Desktop.',
                },
                {
                  id: 'ea_bridge',
                  titleEs: '💻 Puente Directo a MT5 Desktop Mac/PC (Expert Advisor Local)',
                  titleEn: '💻 Direct Local MT5 Desktop Bridge (MQL5 Expert Advisor)',
                  descEs: 'Dispara las órdenes directamente en tu app MetaTrader 5 instalada usando TRstudio_MT5_AutoExecutor.mq5.',
                  descEn: 'Fires orders directly inside your installed MT5 app via TRstudio_MT5_AutoExecutor.mq5.',
                },
                {
                  id: 'metaapi_cloud',
                  titleEs: '☁️ MetaApi Cloud REST Directo (Opcional sin abrir MT5)',
                  titleEn: '☁️ MetaApi Cloud Direct REST (Cloud Broker Execution)',
                  descEs: 'Conecta mediante Token y Account ID de MetaApi.cloud.',
                  descEn: 'Connects via MetaApi.cloud Token and Account ID.',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConnectionMode(m.id as MT5ConnectionMode)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    connectionMode === m.id
                      ? 'bg-[#2b1c13] border-amber-500 text-white'
                      : 'bg-[#120c08] border-[#3b271a] text-amber-200/70 hover:border-amber-700'
                  }`}
                >
                  <div className="font-bold text-xs">{isEn ? m.titleEn : m.titleEs}</div>
                  <div className="text-[10px] text-amber-200/60 mt-0.5">
                    {isEn ? m.descEn : m.descEs}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {connectionMode === 'metaapi_cloud' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#120c08] border border-amber-600/40 font-mono text-xs">
              <div>
                <label className="block text-[10px] text-amber-300 mb-1">MetaApi Auth Token</label>
                <input
                  type="password"
                  value={metaApiToken}
                  onChange={(e) => setMetaApiToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-amber-300 mb-1">MetaApi Account ID</label>
                <input
                  type="text"
                  value={metaApiAccountId}
                  onChange={(e) => setMetaApiAccountId(e.target.value)}
                  placeholder="a1b2c3d4-..."
                  className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Submit Connect Button */}
          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isConnecting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>
                {isConnected
                  ? isEn
                    ? 'Update Active MT5 Session'
                    : 'Actualizar Sesión MT5 Activa'
                  : isEn
                  ? 'Start MT5 Broker Session Now'
                  : 'Iniciar Sesión MT5 para Auto-Ejecutar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSymbolMapper(!showSymbolMapper)}
              className="px-3 py-2.5 rounded-xl bg-[#24170f] hover:bg-[#332015] text-amber-300 border border-[#4d3221] font-mono text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEn ? 'Broker Symbols' : 'Símbolos Broker'}</span>
            </button>
          </div>

          {/* Collapsible Broker Symbol Mapping Table */}
          {showSymbolMapper && (
            <div className="p-3.5 rounded-xl bg-[#120c08] border border-amber-500/50 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300">
                  {isEn
                    ? `Automatic Symbol Translation (${brokerPreset})`
                    : `Traducción Automática de Índices (${brokerPreset})`}
                </span>
                <button
                  type="button"
                  onClick={handleSaveSymbolMap}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold"
                >
                  {isEn ? 'Save Symbols' : 'Guardar Símbolos'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PROGRAMMED_TRADEABLE_SYMBOLS.map((sym) => (
                  <div key={sym} className="bg-[#18110b] p-2 rounded-lg border border-[#3b271a]">
                    <span className="text-[10px] text-amber-200/60 block">{sym} →</span>
                    <input
                      type="text"
                      value={symbolMap[sym] ?? sym}
                      onChange={(e) =>
                        setSymbolMap((prev) => ({ ...prev, [sym]: e.target.value }))
                      }
                      className="w-full bg-transparent text-white font-bold text-xs focus:outline-none border-b border-transparent focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Instructions for Local MT5 Desktop EA */}
          <div className="pt-2 border-t border-[#3b271a]">
            <button
              type="button"
              onClick={() => setShowEaInstructions(!showEaInstructions)}
              className="text-[11px] font-mono text-amber-300 hover:text-amber-200 underline flex items-center gap-1.5"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? 'How to link with MetaTrader 5 Desktop app on your Mac?'
                  : '¿Cómo vincular también con la app MetaTrader 5 instalada en tu Mac?'}
              </span>
            </button>
            {showEaInstructions && (
              <ol className="mt-2 p-3 rounded-xl bg-[#120c08] border border-[#3b271a] text-[11px] text-amber-100/80 space-y-1.5 list-decimal list-inside font-mono">
                <li>
                  Instala MetaTrader 5 desde el instalador ya descomprimido y listo en tu Mac:{' '}
                  <strong className="text-amber-300">/Downloads/MetaTrader5.pkg</strong>.
                </li>
                <li>
                  Descarga arriba el puente{' '}
                  <strong className="text-emerald-300">TRstudio_MT5_AutoExecutor.mq5</strong> y
                  cópialo en <code className="text-white">Archivo → Abrir Carpeta de Datos → MQL5/Experts</code>.
                </li>
                <li>
                  En MT5 ve a{' '}
                  <strong className="text-amber-300">
                    Herramientas → Opciones → Asesores Expertos
                  </strong>
                  , activa <strong>&quot;Permitir WebRequest para las siguientes URL&quot;</strong> y
                  agrega: <code className="text-emerald-300">http://localhost:3000</code>
                </li>
                <li>
                  Arrastra el EA a cualquier gráfico con el botón <strong>Algo Trading</strong>{' '}
                  encendido. ¡Cada vez que pulses <strong>&quot;Ejecutar en MT5&quot;</strong> en la
                  web, se disparará sola en tu MT5!
                </li>
              </ol>
            )}
          </div>
        </form>

        {/* Right Column: Live Open Positions & Order Execution Manager */}
        <div className="lg:col-span-7 bg-[#18110b] border border-[#3b271a] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3b271a] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold font-mono uppercase text-white">
                  {isEn
                    ? `2. Live MT5 Open Positions (${openPositions.length})`
                    : `2. Posiciones Abiertas en Vivo en MT5 (${openPositions.length})`}
                </h2>
              </div>

              {openPositions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClosePosition('ALL')}
                  className="px-3 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-mono text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>
                    {isEn ? 'Close All Positions' : 'Cerrar Todas las Posiciones'}
                  </span>
                </button>
              )}
            </div>

            {openPositions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#120c08] border border-dashed border-[#3b271a] text-center space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
                <div className="text-sm font-bold font-mono text-white">
                  {isEn
                    ? 'No Open Positions in MT5 Right Now'
                    : 'No hay posiciones abiertas en tu sesión MT5 en este momento'}
                </div>
                <p className="text-xs text-amber-200/60 max-w-md mx-auto">
                  {isEn
                    ? 'Go to "Best Setups" or "Request Entries" and click "Execute in MT5". The web will automatically select the index, exact lot size, Stop Loss, and Take Profits.'
                    : 'Ve a "Mejor Entrada" o "Pedir Entradas" y pulsa el botón "🚀 Ejecutar en MT5". La web elegirá sola el índice, lotaje exacto, Stop Loss y Take Profits y la verás ejecutándose aquí en vivo.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {onNavigateToScanner && (
                    <button
                      type="button"
                      onClick={onNavigateToScanner}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>
                        {isEn ? 'Go to #1 Best Setup' : 'Ir a #1 Mejor Entrada y Ejecutar'}
                      </span>
                    </button>
                  )}
                  {onNavigateToEntries && (
                    <button
                      type="button"
                      onClick={onNavigateToEntries}
                      className="px-4 py-2 rounded-xl bg-[#24170f] hover:bg-[#332015] text-amber-200 border border-[#4d3221] font-mono text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <span>
                        {isEn ? 'Go to Entry Zone' : 'Ir a Zona de Entradas'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {openPositions.map((pos) => {
                  const isProfit = pos.floatingPnlUsd >= 0;
                  return (
                    <div
                      key={pos.id}
                      className="p-4 rounded-xl bg-[#120c08] border border-[#3b271a] hover:border-amber-600/60 transition space-y-3 font-mono"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                              pos.action === 'BUY'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {pos.action === 'BUY' ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                            {pos.action}
                          </span>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-white">
                                {pos.brokerSymbol}
                              </span>
                              {pos.brokerSymbol !== pos.asset && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#24170f] text-amber-300 border border-[#4d3221]">
                                  {pos.asset}
                                </span>
                              )}
                              <span className="text-xs font-bold text-amber-400">
                                {pos.lots} {isEn ? 'Lots' : 'Lotes'}
                              </span>
                              <span className="text-[10px] text-amber-200/50">
                                #{pos.ticket}
                              </span>
                              {pos.status === 'BREAK_EVEN' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold">
                                  🛡️ SL EN BREAK EVEN
                                </span>
                              )}
                              {pos.status === 'PARTIAL_TP1' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/50 font-bold">
                                  ✂️ 50% COBRADO + BE
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-amber-200/60 mt-0.5">
                              {pos.playbookName} • {pos.orderType}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-base font-black ${
                              isProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}${pos.floatingPnlUsd.toFixed(2)} USD
                          </div>
                          <div className="text-[10px] text-amber-200/60">
                            {pos.floatingR >= 0 ? '+' : ''}
                            {pos.floatingR}R •{' '}
                            {pos.eaStatus === 'SYNCED'
                              ? '✅ Sincronizada EA MT5'
                              : '⚡ Activa en MT5 Web'}
                          </div>
                        </div>
                      </div>

                      {/* Price Coordinates */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-2 border-t border-[#3b271a]/70">
                        <div className="bg-[#18110b] p-2 rounded-lg border border-[#3b271a]">
                          <span className="text-[9px] uppercase text-amber-200/50 block">
                            {isEn ? 'Entry Price' : 'Precio Entrada'}
                          </span>
                          <span className="font-bold text-white">{pos.entryPrice}</span>
                        </div>
                        <div className="bg-[#18110b] p-2 rounded-lg border border-[#3b271a]">
                          <span className="text-[9px] uppercase text-amber-400 block">
                            {isEn ? 'Live Price' : 'Precio Actual'}
                          </span>
                          <span className="font-bold text-amber-300">{pos.currentPrice}</span>
                        </div>
                        <div className="bg-[#18110b] p-2 rounded-lg border border-rose-900/40">
                          <span className="text-[9px] uppercase text-rose-400 block">
                            Stop Loss
                          </span>
                          <span className="font-bold text-rose-300">{pos.stopLoss}</span>
                        </div>
                        <div className="bg-[#18110b] p-2 rounded-lg border border-emerald-900/40">
                          <span className="text-[9px] uppercase text-emerald-400 block">
                            TP1 (1:1.8)
                          </span>
                          <span className="font-bold text-emerald-300">{pos.takeProfit1}</span>
                        </div>
                        <div className="bg-[#18110b] p-2 rounded-lg border border-emerald-900/40">
                          <span className="text-[9px] uppercase text-emerald-400 block">
                            TP2 (1:3.0)
                          </span>
                          <span className="font-bold text-emerald-400">{pos.takeProfit2}</span>
                        </div>
                      </div>

                      {/* 1-Click Position Management Controls */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {pos.status === 'PENDING_LIMIT' && (
                          <button
                            type="button"
                            onClick={() => handleModifyPosition(pos.id, 'TRIGGER_LIMIT')}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <Play className="w-3 h-3" />
                            <span>{isEn ? 'Fill Now at Market' : 'Activar a Mercado Ahora'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleModifyPosition(pos.id, 'BREAK_EVEN')}
                          className="px-2.5 py-1 rounded-lg bg-[#24170f] hover:bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            {isEn ? 'Move SL to Break Even' : 'Mover SL a Break Even'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModifyPosition(pos.id, 'PARTIAL_TP1')}
                          className="px-2.5 py-1 rounded-lg bg-[#24170f] hover:bg-amber-950 text-amber-300 border border-amber-700/60 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>
                            {isEn ? 'Close 50% (TP1) + BE' : 'Cerrar 50% (TP1) + BE'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Close Order' : 'Cerrar Orden'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Closed Order History */}
          {orderHistory.length > 0 && (
            <div className="pt-4 border-t border-[#3b271a] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                <History className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Session Executed & Closed History (${orderHistory.length})`
                    : `Historial de Órdenes Cerradas en la Sesión (${orderHistory.length})`}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                {orderHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-[#120c08] border border-[#3b271a] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          h.action === 'BUY'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {h.action}
                      </span>
                      <span className="font-bold text-white">{h.brokerSymbol}</span>
                      <span className="text-amber-300">{h.lots} L</span>
                      <span className="text-[10px] text-amber-200/50">
                        {h.entryPrice} → {h.closePrice} ({h.closeReason})
                      </span>
                    </div>
                    <span
                      className={`font-black ${
                        h.realizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.realizedPnlUsd >= 0 ? '+' : ''}${h.realizedPnlUsd.toFixed(2)} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
