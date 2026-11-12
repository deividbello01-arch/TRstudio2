import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  Play,
  ShieldCheck,
  Scissors,
  XCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Laptop,
  Globe,
  LogOut,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  MT5SessionState,
  MT5BrokerPreset,
  MT5ConnectionMode,
  AppLanguage,
  InstrumentQuote,
  InstrumentMarketMode,
  ALL_PROGRAMMED_TRADEABLE_SYMBOLS,
} from '../types/trading';
import {
  getEnabledTradeableInstruments,
  getSpec,
  valuePerPointUsd,
  roundToTick,
  DEFAULT_FX_RATES,
  FxRates,
} from '../lib/instruments';

interface MT5ExecutionHubProps {
  mt5State: MT5SessionState | null;
  onRefreshMt5: () => Promise<void>;
  language?: AppLanguage;
  defaultBalance?: number;
  defaultRisk?: number;
  instruments?: InstrumentQuote[];
  fxRates?: FxRates;
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
  onNavigateToEntries?: () => void;
  onNavigateToScanner?: () => void;
}

const BROKER_PRESETS: Array<{
  id: MT5BrokerPreset;
  label: string;
  defaultServer: string;
  sampleNas: string;
}> = [
  { id: 'FTMO', label: 'FTMO', defaultServer: 'FTMO-Server3', sampleNas: 'US100.cash' },
  { id: 'FundedNext', label: 'FundedNext', defaultServer: 'FundedNext-Server', sampleNas: 'NDX100' },
  { id: 'ICMarkets', label: 'IC Markets', defaultServer: 'ICMarketsSC-MT5-4', sampleNas: 'USTEC' },
  { id: 'Pepperstone', label: 'Pepperstone', defaultServer: 'Pepperstone-MT5-Live01', sampleNas: 'NAS100' },
  { id: 'Exness', label: 'Exness', defaultServer: 'Exness-MT5Real7', sampleNas: 'USTECm' },
  { id: 'Eightcap', label: 'Eightcap', defaultServer: 'Eightcap-Real', sampleNas: 'NDX100' },
  { id: 'Darwinex', label: 'Darwinex', defaultServer: 'Darwinex-Live', sampleNas: 'NDX' },
  { id: 'Custom', label: 'Custom', defaultServer: 'Broker-MT5-Live', sampleNas: 'NAS100' },
];

const DEFAULT_STOP_POINTS: Record<string, number> = {
  NAS100: 45,
  US30: 70,
  US500: 12,
  US2000: 8,
  GER40: 40,
  UK100: 25,
  EU50: 18,
  FRA40: 25,
  JP225: 140,
  HK50: 85,
  XAUUSD: 6,
  EURUSD: 15,
};

type ActivePanelTab = 'positions' | 'history' | 'symbols' | 'tools';

export const MT5ExecutionHub: React.FC<MT5ExecutionHubProps> = ({
  mt5State,
  onRefreshMt5,
  language = 'es',
  defaultBalance = 10000,
  defaultRisk = 0.5,
  instruments = [],
  fxRates = DEFAULT_FX_RATES,
  marketMode = 'all_programmed',
  enabledSymbols,
  onNavigateToEntries,
  onNavigateToScanner,
}) => {
  const isEn = language === 'en';
  const visibleSpecs = useMemo(
    () => getEnabledTradeableInstruments(enabledSymbols, marketMode),
    [enabledSymbols, marketMode]
  );

  // Connection state (Balance, Equity, Margin & Leverage come automatically from the MT5 account session)
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
  const [metaApiToken, setMetaApiToken] = useState<string>('');
  const [metaApiAccountId, setMetaApiAccountId] = useState<string>('');
  const [symbolMap, setSymbolMap] = useState<Record<string, string>>(
    mt5State?.symbolMap || {}
  );

  const [showAccountDrawer, setShowAccountDrawer] = useState<boolean>(!mt5State?.connected);
  const [activeTab, setActiveTab] = useState<ActivePanelTab>('positions');
  const [showWebTerminalIframe, setShowWebTerminalIframe] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  // Direct Order Ticket State
  const [ticketAsset, setTicketAsset] = useState<string>(
    visibleSpecs[0]?.symbol || 'NAS100'
  );
  const [ticketOrderType, setTicketOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [ticketLimitPrice, setTicketLimitPrice] = useState<string>('');
  const [volumeMode, setVolumeMode] = useState<'risk_pct' | 'manual_lots'>('risk_pct');
  const [ticketRiskPct, setTicketRiskPct] = useState<number>(defaultRisk || 0.5);
  const [manualLots, setManualLots] = useState<number>(0.5);
  const [stopDistancePts, setStopDistancePts] = useState<number>(
    DEFAULT_STOP_POINTS[visibleSpecs[0]?.symbol || 'NAS100'] || 45
  );
  const [rrRatio, setRrRatio] = useState<number>(2.0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Inline SL/TP editing for open positions
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editSlValue, setEditSlValue] = useState<string>('');
  const [editTpValue, setEditTpValue] = useState<string>('');

  useEffect(() => {
    if (mt5State) {
      setBrokerPreset(mt5State.brokerPreset);
      setLogin(mt5State.login);
      setBrokerServer(mt5State.brokerServer);
      setAccountType(mt5State.accountType);
      setConnectionMode(mt5State.connectionMode);
      setSymbolMap(mt5State.symbolMap || {});
    }
  }, [mt5State?.connected, mt5State?.brokerPreset, mt5State?.login]);

  useEffect(() => {
    if (visibleSpecs.length > 0 && !visibleSpecs.some((s) => s.symbol === ticketAsset)) {
      const nextSym = visibleSpecs[0].symbol;
      setTicketAsset(nextSym);
      setStopDistancePts(DEFAULT_STOP_POINTS[nextSym] || 40);
    }
  }, [visibleSpecs, ticketAsset]);

  // Live price & automatic lot calculation for Order Ticket (uses MT5 account balance automatically)
  const activeSpec = getSpec(ticketAsset) || visibleSpecs[0];
  const liveQuote = instruments.find((i) => i.symbol === ticketAsset);
  const livePrice = liveQuote?.price ?? activeSpec.fallback.price;
  const effectiveEntryPrice =
    ticketOrderType === 'LIMIT' && Number(ticketLimitPrice) > 0
      ? roundToTick(Number(ticketLimitPrice), activeSpec)
      : roundToTick(livePrice, activeSpec);

  const activeBalance =
    mt5State?.connected && mt5State.balance > 0 ? mt5State.balance : mt5State?.balance || defaultBalance;
  const activeEquity =
    mt5State?.connected && mt5State.equity > 0 ? mt5State.equity : activeBalance;
  const activeFreeMargin =
    mt5State?.freeMargin && mt5State.freeMargin > 0 ? mt5State.freeMargin : activeEquity;
  const activeLeverage = mt5State?.leverage || 100;
  const accountCurrency = mt5State?.currency || 'USD';

  const usdPerPtPerLot = valuePerPointUsd(activeSpec, fxRates);
  const isEurUsd = activeSpec.symbol === 'EURUSD';
  const priceStopDelta = isEurUsd ? stopDistancePts * 0.0001 : stopDistancePts;
  const usdLossPerLotAtSl = Math.max(0.01, priceStopDelta * usdPerPtPerLot);

  const targetRiskUsd = (activeBalance * Math.max(0.05, ticketRiskPct)) / 100;
  const autoCalculatedLots = Math.max(
    0.01,
    Number((targetRiskUsd / usdLossPerLotAtSl).toFixed(2))
  );
  const finalOrderLots = volumeMode === 'risk_pct' ? autoCalculatedLots : Math.max(0.01, manualLots);
  const actualOrderRiskUsd = Number((finalOrderLots * usdLossPerLotAtSl).toFixed(2));
  const actualOrderRiskPct = Number(((actualOrderRiskUsd / activeBalance) * 100).toFixed(2));
  const projectedOrderProfitUsd = Number((actualOrderRiskUsd * rrRatio).toFixed(2));

  const mappedTicketSymbol =
    symbolMap[ticketAsset] || mt5State?.symbolMap?.[ticketAsset] || ticketAsset;

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

  const handleConnectSession = async (
    e?: React.FormEvent,
    overrideCredentials?: {
      login: string;
      brokerServer: string;
      brokerPreset: MT5BrokerPreset;
    }
  ) => {
    if (e) e.preventDefault();
    setIsConnecting(true);
    setActionBanner(null);

    const targetLogin = overrideCredentials?.login ?? login;
    const targetServer = overrideCredentials?.brokerServer ?? brokerServer;
    const targetPreset = overrideCredentials?.brokerPreset ?? brokerPreset;

    if (overrideCredentials) {
      setLogin(targetLogin);
      setBrokerServer(targetServer);
      setBrokerPreset(targetPreset);
    }

    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: targetLogin,
          brokerServer: targetServer,
          password,
          brokerPreset: targetPreset,
          accountType,
          connectionMode,
          metaApiToken,
          metaApiAccountId,
          customSymbolMap: symbolMap,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setShowAccountDrawer(false);
        setActionBanner({
          type: 'success',
          text:
            data.message ||
            (isEn ? 'MT5 Session connected.' : 'Sesión MT5 conectada correctamente.'),
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
        text: isEn ? 'Connection error' : 'Error de conexión con MT5',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectSession = async () => {
    try {
      await fetch('/api/mt5/disconnect', { method: 'POST' });
      await onRefreshMt5();
      setShowAccountDrawer(true);
      setActionBanner({
        type: 'info',
        text: isEn ? 'MT5 Session disconnected.' : 'Sesión MT5 desconectada.',
      });
    } catch (_e) {
      // ignore
    }
  };

  const handleDirectOrderSubmit = async (action: 'BUY' | 'SELL') => {
    setIsSubmittingOrder(true);
    setActionBanner(null);
    try {
      const dir = action === 'BUY' ? 1 : -1;
      const slPrice = roundToTick(effectiveEntryPrice - dir * priceStopDelta, activeSpec);
      const tp1Price = roundToTick(
        effectiveEntryPrice + dir * priceStopDelta * rrRatio,
        activeSpec
      );
      const tp2Price = roundToTick(
        effectiveEntryPrice + dir * priceStopDelta * Math.max(rrRatio + 1, 3.0),
        activeSpec
      );

      const res = await fetch('/api/mt5/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: ticketAsset,
          action,
          orderType: ticketOrderType,
          lots: finalOrderLots,
          entryPrice: effectiveEntryPrice,
          stopLoss: slPrice,
          takeProfit1: tp1Price,
          takeProfit2: tp2Price,
          playbookName: isEn ? 'MT5 Direct Order Ticket' : 'Boleta Directa MT5',
          riskUsd: actualOrderRiskUsd,
          riskPercent: actualOrderRiskPct,
          autoConnectIfNeeded: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setActiveTab('positions');
        setActionBanner({
          type: 'success',
          text: data.message,
        });
      } else {
        setActionBanner({
          type: 'error',
          text: data.error || 'No se pudo ejecutar la orden.',
        });
      }
    } catch (_e) {
      setActionBanner({
        type: 'error',
        text: isEn ? 'Order execution failed.' : 'Error al enviar la orden a MT5.',
      });
    } finally {
      setIsSubmittingOrder(false);
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
          text: isEn ? 'Broker symbols saved.' : 'Símbolos del broker actualizados.',
        });
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleModifyPosition = async (
    id: string,
    modAction: 'BREAK_EVEN' | 'BREAK_EVEN_ALL' | 'PARTIAL_TP1' | 'TRIGGER_LIMIT' | 'UPDATE_SL_TP',
    extra?: { stopLoss?: number; takeProfit1?: number }
  ) => {
    try {
      const res = await fetch('/api/mt5/modify-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, modAction, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        await onRefreshMt5();
        setEditingPosId(null);
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

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/mt5/clear-history', { method: 'POST' });
      if (res.ok) {
        await onRefreshMt5();
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
            ? `Opened ${data.path} in Finder.`
            : `Instalador abierto en Finder (${data.path}).`,
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
    <div className="space-y-4">
      {/* 1. Minimalist Top Status & Account Bar */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Connection Identity & Quick Account Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400 shrink-0" />
              <h1 className="text-base font-bold font-mono text-white whitespace-nowrap">
                MetaTrader 5
              </h1>
            </div>

            <span className="text-amber-200/30">·</span>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className={isConnected ? 'text-emerald-300 font-bold' : 'text-amber-200'}>
                {isConnected
                  ? `${mt5State?.brokerServer} · #${mt5State?.login} (1:${activeLeverage})`
                  : isEn
                  ? 'Not logged in — Sign in below to load account balance'
                  : 'Sin sesión iniciada — Conecta tu cuenta para cargar balance real'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAccountDrawer(!showAccountDrawer)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                  showAccountDrawer || !isConnected
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-[#120c08] text-amber-200 border-[#3b271a] hover:border-amber-500'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {isConnected
                    ? isEn
                      ? 'Switch Account'
                      : 'Cambiar Cuenta'
                    : isEn
                    ? 'Sign In MT5'
                    : 'Iniciar Sesión MT5'}
                </span>
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnectSession}
                  className="px-2.5 py-1 rounded-lg bg-[#120c08] hover:bg-rose-950 text-rose-300 border border-[#3b271a] text-xs font-mono font-semibold flex items-center gap-1 transition whitespace-nowrap"
                  title={isEn ? 'Disconnect MT5 Account' : 'Cerrar sesión MT5'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? 'Logout' : 'Salir'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Account Telemetry (Automatically pulled from MT5 session) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#3b271a] font-mono tabular-nums text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a]">
              <span className="text-[10px] text-amber-200/60 block">
                {isConnected ? `Balance (${accountCurrency})` : isEn ? 'Account Balance' : 'Balance Cuenta'}
              </span>
              <span className="font-bold text-white text-sm">
                {isConnected
                  ? `$${activeBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : isEn
                  ? 'Sign in to load'
                  : 'Inicia sesión'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a]">
              <span className="text-[10px] text-amber-200/60 block">
                {isEn ? 'Equity' : 'Equidad'}
              </span>
              <span className="font-bold text-amber-300 text-sm">
                {isConnected
                  ? `$${activeEquity.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '—'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a]">
              <span className="text-[10px] text-amber-200/60 block">
                {isEn ? 'Free Margin' : 'Margen Libre'}
              </span>
              <span className="font-bold text-white text-sm">
                {isConnected
                  ? `$${activeFreeMargin.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '—'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a]">
              <span className="text-[10px] text-amber-200/60 block">
                {isEn ? 'Floating PnL' : 'PnL Flotante'}
              </span>
              <span
                className={`font-bold text-sm ${
                  floatingPnl > 0
                    ? 'text-emerald-400'
                    : floatingPnl < 0
                    ? 'text-rose-400'
                    : 'text-white'
                }`}
              >
                {isConnected ? `${floatingPnl >= 0 ? '+' : ''}$${floatingPnl.toFixed(2)}` : '$0.00'}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-200/60 block">
                {isEn ? 'Realized Today' : 'Cerrado Hoy'}
              </span>
              <span
                className={`font-bold text-sm ${
                  realizedPnl > 0
                    ? 'text-emerald-400'
                    : realizedPnl < 0
                    ? 'text-rose-400'
                    : 'text-white'
                }`}
              >
                {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Account Login Drawer (Shown automatically when disconnected or when user clicks Switch Account) */}
        {(showAccountDrawer || !isConnected) && (
          <form
            onSubmit={(e) => handleConnectSession(e)}
            className="pt-3 border-t border-[#3b271a] space-y-3 font-mono text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-amber-200/80">
                {isEn
                  ? 'Enter your MT5 Login & Server — Balance, Equity, Margin and Leverage are retrieved automatically from the account:'
                  : 'Ingresa tu Login y Servidor MT5 — El Balance, Equidad, Margen Libre y Apalancamiento se cargan automáticamente de la cuenta:'}
              </span>

              {/* 1-Click Quick Account Switcher Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-amber-200/60">{isEn ? 'Quick accounts:' : 'Cuentas rápidas:'}</span>
                {[
                  { label: 'FTMO #15089421 ($100k)', login: '15089421', server: 'FTMO-Server3', preset: 'FTMO' as MT5BrokerPreset },
                  { label: 'FundedNext #50219402 ($50k)', login: '50219402', server: 'FundedNext-Server', preset: 'FundedNext' as MT5BrokerPreset },
                  { label: 'ICMarkets #25091844 ($25k)', login: '25091844', server: 'ICMarketsSC-MT5-4', preset: 'ICMarkets' as MT5BrokerPreset },
                  { label: 'Exness #10849201 ($10k)', login: '10849201', server: 'Exness-MT5Real7', preset: 'Exness' as MT5BrokerPreset },
                ].map((acc) => (
                  <button
                    key={acc.login}
                    type="button"
                    onClick={() =>
                      handleConnectSession(undefined, {
                        login: acc.login,
                        brokerServer: acc.server,
                        brokerPreset: acc.preset,
                      })
                    }
                    className={`px-2 py-0.5 rounded border transition ${
                      login === acc.login && isConnected
                        ? 'bg-amber-600 text-white border-amber-400 font-bold'
                        : 'bg-[#120c08] text-amber-200 border-[#3b271a] hover:border-amber-500'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] text-amber-200/70 mb-1">
                  Broker
                </label>
                <select
                  value={brokerPreset}
                  onChange={(e) => handleSelectBrokerPreset(e.target.value as MT5BrokerPreset)}
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  {BROKER_PRESETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.sampleNas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-amber-200/70 mb-1">
                  {isEn ? 'Account Login (ID)' : 'Login Cuenta MT5 (ID)'}
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Ej. 15089421"
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-200/70 mb-1">
                  {isEn ? 'Broker Server' : 'Servidor del Broker'}
                </label>
                <input
                  type="text"
                  value={brokerServer}
                  onChange={(e) => setBrokerServer(e.target.value)}
                  placeholder="Ej. FTMO-Server3"
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-200/70 mb-1">
                  {isEn ? 'Password' : 'Contraseña MT5'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-200/70 mb-1">
                  {isEn ? 'Connection Method' : 'Modo de Conexión'}
                </label>
                <select
                  value={connectionMode}
                  onChange={(e) => setConnectionMode(e.target.value as MT5ConnectionMode)}
                  className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="integrated_web">
                    {isEn ? 'Direct Broker Session + EA' : 'Sesión Directa + Cola EA'}
                  </option>
                  <option value="ea_bridge">
                    {isEn ? 'Local MT5 Desktop (.mq5)' : 'Puente MT5 Desktop (.mq5)'}
                  </option>
                  <option value="metaapi_cloud">MetaApi Cloud REST</option>
                </select>
              </div>
            </div>

            {connectionMode === 'metaapi_cloud' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="password"
                  value={metaApiToken}
                  onChange={(e) => setMetaApiToken(e.target.value)}
                  placeholder="MetaApi Auth Token"
                  className="bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
                <input
                  type="text"
                  value={metaApiAccountId}
                  onChange={(e) => setMetaApiAccountId(e.target.value)}
                  placeholder="MetaApi Account ID"
                  className="bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-amber-200/60">
                {mt5State?.accountName
                  ? `${mt5State.accountName} · Sincronización automática de balance y margen`
                  : isEn
                  ? 'Account balance syncs automatically across Scanner, AI Entry & Lot Calculator.'
                  : 'Al iniciar sesión, el balance de tu cuenta se sincroniza en toda la plataforma.'}
              </span>

              <div className="flex items-center gap-2">
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => setShowAccountDrawer(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#120c08] text-amber-200 border border-[#3b271a] text-xs font-semibold"
                  >
                    {isEn ? 'Close' : 'Ocultar'}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isEn
                      ? 'Sign In & Load Account Balance'
                      : 'Iniciar Sesión y Cargar Cuenta'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Compact Status Feedback Banner */}
        {actionBanner && (
          <div
            className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
              actionBanner.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200'
                : actionBanner.type === 'error'
                ? 'bg-rose-950/70 border-rose-600/60 text-rose-200'
                : 'bg-[#120c08] border-[#3b271a] text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
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
      </div>

      {/* 2. Main 2-Column Workspace: Direct Order Ticket (Left) + Positions & Tools (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Minimalist 1-Click Order Ticket */}
        <div className="lg:col-span-4 bg-[#18110b] border border-[#3b271a] rounded-xl p-4 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#3b271a] pb-2.5">
            <div>
              <h2 className="text-xs font-bold uppercase text-white">
                {isEn ? 'Direct MT5 Order Ticket' : 'Boleta de Orden Rápida'}
              </h2>
              <p className="text-[11px] text-amber-200/60">
                {mappedTicketSymbol} · {isEn ? 'Live' : 'Precio'}{' '}
                <strong className="text-white tabular-nums">
                  {livePrice.toFixed(activeSpec.decimals)}
                </strong>
              </p>
            </div>

            {/* Order Type Segmented Toggle */}
            <div className="flex items-center bg-[#120c08] border border-[#3b271a] rounded-lg p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setTicketOrderType('MARKET')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  ticketOrderType === 'MARKET'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                {isEn ? 'Market' : 'Mercado'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketOrderType('LIMIT');
                  if (!ticketLimitPrice) {
                    setTicketLimitPrice(String(roundToTick(livePrice, activeSpec)));
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  ticketOrderType === 'LIMIT'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Asset Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase text-amber-200/70">
              {isEn ? 'Instrument / Index' : 'Índice / Activo'}
            </label>
            <select
              value={ticketAsset}
              onChange={(e) => {
                const sym = e.target.value;
                setTicketAsset(sym);
                setStopDistancePts(DEFAULT_STOP_POINTS[sym] || 40);
                setTicketLimitPrice('');
              }}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              {visibleSpecs.map((spec) => {
                const q = instruments.find((i) => i.symbol === spec.symbol);
                const p = q ? q.price.toFixed(spec.decimals) : spec.fallback.price;
                const bSym = symbolMap[spec.symbol] || spec.symbol;
                return (
                  <option key={spec.symbol} value={spec.symbol}>
                    {spec.symbol} ({bSym}) — {p}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Limit Entry Price (Only if LIMIT is selected) */}
          {ticketOrderType === 'LIMIT' && (
            <div>
              <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
                {isEn ? 'Limit Entry Price' : 'Precio de Entrada Limit'}
              </label>
              <input
                type="number"
                step="any"
                value={ticketLimitPrice}
                onChange={(e) => setTicketLimitPrice(e.target.value)}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-1.5 text-xs font-bold text-white tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Volume Sizing Mode: Auto Risk % vs Manual Lots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-amber-200/70">
                {isEn ? 'Position Size' : 'Tamaño de Posición'}
              </span>
              <div className="flex items-center bg-[#120c08] border border-[#3b271a] rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setVolumeMode('risk_pct')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    volumeMode === 'risk_pct'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-200/70 hover:text-white'
                  }`}
                >
                  Auto % Riesgo
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMode('manual_lots')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    volumeMode === 'manual_lots'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-200/70 hover:text-white'
                  }`}
                >
                  {isEn ? 'Manual Lots' : 'Lotes Fijos'}
                </button>
              </div>
            </div>

            {volumeMode === 'risk_pct' ? (
              <div className="grid grid-cols-4 gap-1.5">
                {[0.25, 0.5, 1.0, 2.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTicketRiskPct(pct)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition tabular-nums ${
                      ticketRiskPct === pct
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-[#120c08] text-amber-200/80 border-[#3b271a] hover:border-amber-600'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setManualLots((prev) => Math.max(0.01, Number((prev - 0.1).toFixed(2))))
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a] text-xs font-bold text-white"
                >
                  -0.1
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={manualLots}
                  onChange={(e) => setManualLots(Math.max(0.01, Number(e.target.value) || 0.01))}
                  className="flex-1 bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-center text-xs font-bold text-white tabular-nums focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setManualLots((prev) => Number((prev + 0.1).toFixed(2)))
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-[#120c08] border border-[#3b271a] text-xs font-bold text-white"
                >
                  +0.1
                </button>
              </div>
            )}
          </div>

          {/* Stop Loss Distance & R:R Target */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
                {isEurUsd ? 'Stop Loss (Pips)' : isEn ? 'Stop Loss (Points)' : 'Stop Loss (Puntos)'}
              </label>
              <input
                type="number"
                min={1}
                step="any"
                value={stopDistancePts}
                onChange={(e) => setStopDistancePts(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-2.5 py-1.5 text-xs font-bold text-white tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-amber-200/70 mb-1">
                {isEn ? 'Take Profit R:R' : 'Ratio Take Profit'}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[1.8, 2.5, 3.0].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRrRatio(r)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition tabular-nums ${
                      rrRatio === r
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-[#120c08] text-amber-200/80 border-[#3b271a]'
                    }`}
                  >
                    1:{r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clean Unboxed Order Telemetry Summary */}
          <div className="p-3 rounded-lg bg-[#120c08] border border-[#3b271a] space-y-1.5 text-xs tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-amber-200/70">
                {isEn ? 'Calculated Volume:' : 'Lotaje a Enviar:'}
              </span>
              <span className="font-bold text-white">{finalOrderLots} Lotes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-200/70">
                {isEn ? 'Risk at Stop Loss:' : 'Riesgo Exacto SL:'}
              </span>
              <span className="font-bold text-rose-400">
                -${actualOrderRiskUsd.toFixed(2)} USD ({actualOrderRiskPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-200/70">
                {isEn ? `Target TP (1:${rrRatio}):` : ` Meta TP (1:${rrRatio}):`}
              </span>
              <span className="font-bold text-emerald-400">
                +${projectedOrderProfitUsd.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* 1-Click SELL / BUY Execution Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={() => handleDirectOrderSubmit('SELL')}
              className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow transition"
            >
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                <span>{isEn ? 'SELL / SHORT' : 'VENDER (SELL)'}</span>
              </div>
              <span className="text-[10px] opacity-90 tabular-nums">
                {effectiveEntryPrice.toFixed(activeSpec.decimals)} · {finalOrderLots}L
              </span>
            </button>

            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={() => handleDirectOrderSubmit('BUY')}
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow transition"
            >
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>{isEn ? 'BUY / LONG' : 'COMPRAR (BUY)'}</span>
              </div>
              <span className="text-[10px] opacity-90 tabular-nums">
                {effectiveEntryPrice.toFixed(activeSpec.decimals)} · {finalOrderLots}L
              </span>
            </button>
          </div>

          {/* Quick Links to AI Setup Engine or Scanner */}
          {(onNavigateToScanner || onNavigateToEntries) && (
            <div className="pt-2 border-t border-[#3b271a] flex items-center justify-between gap-2 text-[11px]">
              {onNavigateToScanner && (
                <button
                  type="button"
                  onClick={onNavigateToScanner}
                  className="text-amber-300 hover:underline truncate"
                >
                  {isEn ? '→ Scan #1 Best Setup' : '→ Escanear #1 Mejor Entrada'}
                </button>
              )}
              {onNavigateToEntries && (
                <button
                  type="button"
                  onClick={onNavigateToEntries}
                  className="text-amber-300 hover:underline truncate"
                >
                  {isEn ? '→ AI Entry Engine' : '→ Pedir Entrada IA'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Segmented Workspace (Positions / History / Symbols / Web & Mac) */}
        <div className="lg:col-span-8 bg-[#18110b] border border-[#3b271a] rounded-xl p-4 space-y-4 font-mono">
          {/* Segmented Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3b271a] pb-3">
            <div className="flex flex-wrap items-center gap-1 bg-[#120c08] p-1 rounded-lg border border-[#3b271a] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('positions')}
                className={`px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
                  activeTab === 'positions'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                {isEn
                  ? `Open Positions (${openPositions.length})`
                  : `Posiciones Activas (${openPositions.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                {isEn
                  ? `History (${orderHistory.length})`
                  : `Historial (${orderHistory.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('symbols')}
                className={`px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
                  activeTab === 'symbols'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                {isEn ? 'Broker Symbols' : 'Símbolos Broker'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
                  activeTab === 'tools'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-200/70 hover:text-white'
                }`}
              >
                {isEn ? 'MT5 Web & Mac' : 'MT5 Web & Mac'}
              </button>
            </div>

            {/* Bulk Actions when viewing Open Positions */}
            {activeTab === 'positions' && openPositions.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleModifyPosition('ALL', 'BREAK_EVEN_ALL')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#120c08] hover:bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1 transition whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? 'All to BE' : 'Todas a BE'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClosePosition('ALL')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold flex items-center gap-1 transition whitespace-nowrap"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Close All' : 'Cerrar Todas'}</span>
                </button>
              </div>
            )}

            {activeTab === 'history' && orderHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1 rounded-lg bg-[#120c08] hover:bg-rose-950 text-amber-200/80 hover:text-rose-300 border border-[#3b271a] text-xs flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Clear' : 'Limpiar'}</span>
              </button>
            )}
          </div>

          {/* TAB 1: OPEN POSITIONS */}
          {activeTab === 'positions' && (
            <>
              {openPositions.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#120c08] border border-[#3b271a] text-center space-y-2">
                  <div className="text-sm font-bold text-white">
                    {isEn ? 'No Open Positions' : 'Sin posiciones abiertas'}
                  </div>
                  <p className="text-xs text-amber-200/60 max-w-md mx-auto">
                    {isEn
                      ? 'Use the Direct Order Ticket on the left to open a BUY or SELL position immediately, or execute any setup from the Scanner.'
                      : 'Usa la Boleta de Orden Rápida a la izquierda para abrir Compra o Venta al instante, o ejecuta cualquier entrada desde el Escáner.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {openPositions.map((pos) => {
                    const isProfit = pos.floatingPnlUsd >= 0;
                    const isEditing = editingPosId === pos.id;
                    return (
                      <div
                        key={pos.id}
                        className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-2.5 text-xs tabular-nums"
                      >
                        {/* Top Row: Identity & Floating PnL */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                pos.action === 'BUY'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {pos.action}
                            </span>
                            <span className="text-sm font-bold text-white">
                              {pos.brokerSymbol}
                            </span>
                            <span className="text-amber-300 font-bold">
                              {pos.lots} {isEn ? 'Lots' : 'Lotes'}
                            </span>
                            <span className="text-amber-200/40">·</span>
                            <span className="text-amber-200/70">#{pos.ticket}</span>
                            {pos.status === 'BREAK_EVEN' && (
                              <>
                                <span className="text-amber-200/40">·</span>
                                <span className="text-emerald-400 font-bold">Break Even</span>
                              </>
                            )}
                            {pos.status === 'PARTIAL_TP1' && (
                              <>
                                <span className="text-amber-200/40">·</span>
                                <span className="text-emerald-400 font-bold">50% TP1 + BE</span>
                              </>
                            )}
                            {pos.status === 'PENDING_LIMIT' && (
                              <>
                                <span className="text-amber-200/40">·</span>
                                <span className="text-amber-300 font-bold">Limit Pendiente</span>
                              </>
                            )}
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-sm font-black ${
                                isProfit ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isProfit ? '+' : ''}${pos.floatingPnlUsd.toFixed(2)} USD
                            </span>
                            <span className="text-[11px] text-amber-200/60 ml-2">
                              ({pos.floatingR >= 0 ? '+' : ''}
                              {pos.floatingR}R)
                            </span>
                          </div>
                        </div>

                        {/* Middle Row: Coordinates & Inline Edit SL/TP */}
                        {isEditing ? (
                          <div className="pt-2 border-t border-[#3b271a] flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-rose-400 uppercase">SL:</span>
                              <input
                                type="number"
                                step="any"
                                value={editSlValue}
                                onChange={(e) => setEditSlValue(e.target.value)}
                                className="w-28 bg-[#18110b] border border-[#3b271a] rounded px-2 py-1 text-xs font-bold text-white"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-emerald-400 uppercase">TP1:</span>
                              <input
                                type="number"
                                step="any"
                                value={editTpValue}
                                onChange={(e) => setEditTpValue(e.target.value)}
                                className="w-28 bg-[#18110b] border border-[#3b271a] rounded px-2 py-1 text-xs font-bold text-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleModifyPosition(pos.id, 'UPDATE_SL_TP', {
                                  stopLoss: Number(editSlValue),
                                  takeProfit1: Number(editTpValue),
                                })
                              }
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold"
                            >
                              {isEn ? 'Save' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPosId(null)}
                              className="px-2 py-1 rounded bg-[#18110b] text-amber-200/70 text-[11px]"
                            >
                              {isEn ? 'Cancel' : 'Cancelar'}
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#3b271a]/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>
                                {isEn ? 'Entry:' : 'Entrada:'}{' '}
                                <strong className="text-white">{pos.entryPrice}</strong>
                              </span>
                              <span>→</span>
                              <span>
                                {isEn ? 'Current:' : 'Actual:'}{' '}
                                <strong className="text-amber-300">{pos.currentPrice}</strong>
                              </span>
                              <span>·</span>
                              <span>
                                SL: <strong className="text-rose-400">{pos.stopLoss}</strong>
                              </span>
                              <span>·</span>
                              <span>
                                TP1: <strong className="text-emerald-400">{pos.takeProfit1}</strong>
                              </span>
                              <span>·</span>
                              <span>
                                TP2: <strong className="text-emerald-400">{pos.takeProfit2}</strong>
                              </span>
                            </div>

                            {/* Action Controls */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {pos.status === 'PENDING_LIMIT' && (
                                <button
                                  type="button"
                                  onClick={() => handleModifyPosition(pos.id, 'TRIGGER_LIMIT')}
                                  className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>{isEn ? 'Fill Now' : 'Activar'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPosId(pos.id);
                                  setEditSlValue(String(pos.stopLoss));
                                  setEditTpValue(String(pos.takeProfit1));
                                }}
                                className="px-2 py-1 rounded bg-[#18110b] hover:bg-[#24170f] text-amber-200 border border-[#3b271a] text-[11px] flex items-center gap-1 transition"
                                title={isEn ? 'Edit SL / TP' : 'Editar SL / TP'}
                              >
                                <Pencil className="w-3 h-3" />
                                <span>SL/TP</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModifyPosition(pos.id, 'BREAK_EVEN')}
                                className="px-2 py-1 rounded bg-[#18110b] hover:bg-emerald-950 text-emerald-300 border border-[#3b271a] text-[11px] font-bold transition"
                              >
                                BE
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModifyPosition(pos.id, 'PARTIAL_TP1')}
                                className="px-2 py-1 rounded bg-[#18110b] hover:bg-amber-950 text-amber-300 border border-[#3b271a] text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                <Scissors className="w-3 h-3" />
                                <span>50%</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClosePosition(pos.id)}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition"
                              >
                                {isEn ? 'Close' : 'Cerrar'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: CLOSED ORDER HISTORY */}
          {activeTab === 'history' && (
            <>
              {orderHistory.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#120c08] border border-[#3b271a] text-center text-xs text-amber-200/60">
                  {isEn
                    ? 'No closed executions in this session yet.'
                    : 'Aún no hay operaciones cerradas en esta sesión.'}
                </div>
              ) : (
                <div className="divide-y divide-[#3b271a] bg-[#120c08] border border-[#3b271a] rounded-xl overflow-hidden text-xs tabular-nums">
                  {orderHistory.slice(0, 20).map((h) => (
                    <div
                      key={h.id}
                      className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            h.action === 'BUY'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {h.action}
                        </span>
                        <span className="font-bold text-white">{h.brokerSymbol}</span>
                        <span className="text-amber-300">{h.lots}L</span>
                        <span className="text-amber-200/60">
                          {h.entryPrice} → {h.closePrice}
                        </span>
                        <span className="text-amber-200/40 hidden sm:inline">·</span>
                        <span className="text-amber-200/60 text-[11px] hidden sm:inline">
                          {h.closeReason}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          h.realizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {h.realizedPnlUsd >= 0 ? '+' : ''}${h.realizedPnlUsd.toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 3: BROKER SYMBOL MAPPING */}
          {activeTab === 'symbols' && (
            <div className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-amber-200/70">
                  {isEn
                    ? `Map TRstudio indices to your ${brokerPreset} MT5 MarketWatch symbols:`
                    : `Mapeo automático de índices para tu servidor ${brokerPreset}:`}
                </span>
                <button
                  type="button"
                  onClick={handleSaveSymbolMap}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  {isEn ? 'Save Mapping' : 'Guardar Símbolos'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {ALL_PROGRAMMED_TRADEABLE_SYMBOLS.map((sym) => (
                  <div
                    key={sym}
                    className="p-2.5 rounded-lg bg-[#120c08] border border-[#3b271a]"
                  >
                    <span className="text-[10px] text-amber-200/60 block mb-0.5">
                      {sym}
                    </span>
                    <input
                      type="text"
                      value={symbolMap[sym] ?? sym}
                      onChange={(e) =>
                        setSymbolMap((prev) => ({ ...prev, [sym]: e.target.value }))
                      }
                      className="w-full bg-[#18110b] border border-[#3b271a] rounded px-2 py-1 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MT5 WEBTERMINAL & MAC DESKTOP BRIDGE */}
          {activeTab === 'tools' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWebTerminalIframe(!showWebTerminalIframe)}
                  className="p-3 rounded-xl bg-[#120c08] hover:bg-[#24170f] border border-[#3b271a] text-left space-y-1 transition"
                >
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>MT5 WebTerminal</span>
                    <Globe className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-amber-200/60">
                    {showWebTerminalIframe
                      ? isEn
                        ? 'Hide embedded terminal'
                        : 'Ocultar terminal web integrada'
                      : isEn
                      ? 'Open official MetaQuotes WebTerminal'
                      : 'Abrir terminal oficial MetaQuotes aquí'}
                  </p>
                </button>

                <a
                  href="/mt5/TRstudio_MT5_AutoExecutor.mq5"
                  download="TRstudio_MT5_AutoExecutor.mq5"
                  className="p-3 rounded-xl bg-[#120c08] hover:bg-[#24170f] border border-[#3b271a] text-left space-y-1 transition block"
                >
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>{isEn ? 'Download EA (.mq5)' : 'Puente EA (.mq5)'}</span>
                    <Laptop className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-amber-200/60">
                    {isEn
                      ? 'Auto-executes web orders in MT5 Desktop'
                      : 'Sincroniza órdenes con tu MT5 de escritorio'}
                  </p>
                </a>

                <button
                  type="button"
                  onClick={handleOpenMacOsInstaller}
                  className="p-3 rounded-xl bg-[#120c08] hover:bg-[#24170f] border border-[#3b271a] text-left space-y-1 transition"
                >
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>{isEn ? 'MT5 for macOS' : 'Instalador MT5 Mac'}</span>
                    <Download className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-amber-200/60">
                    {mt5State?.macosInstallerReady
                      ? 'Abrir MetaTrader5.pkg en Descargas'
                      : 'Descargar paquete oficial MetaTrader 5'}
                  </p>
                </button>
              </div>

              {showWebTerminalIframe && (
                <div className="rounded-xl overflow-hidden border border-[#3b271a]">
                  <div className="px-3 py-2 bg-[#120c08] border-b border-[#3b271a] flex items-center justify-between">
                    <span className="font-bold text-white">
                      MetaTrader 5 WebTerminal · {brokerServer}
                    </span>
                    <a
                      href="https://trade.mql5.com/trade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{isEn ? 'Full Screen' : 'Ventana Completa'}</span>
                    </a>
                  </div>
                  <div className="w-full h-[500px] bg-black">
                    <iframe
                      src="https://trade.mql5.com/trade?lang=es&save_password=on"
                      title="MetaTrader 5 WebTerminal"
                      className="w-full h-full border-0"
                      allow="clipboard-read; clipboard-write; fullscreen"
                    />
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-1.5 text-[11px] text-amber-200/80">
                <div className="font-bold text-white">
                  {isEn
                    ? 'Quick 3-Step Local MT5 Desktop Sync:'
                    : 'Conexión rápida en 3 pasos con MT5 Desktop:'}
                </div>
                <div>
                  1. Copia <strong className="text-white">TRstudio_MT5_AutoExecutor.mq5</strong> en{' '}
                  <code>Archivo → Abrir Carpeta de Datos → MQL5/Experts</code>.
                </div>
                <div>
                  2. En MT5 ve a{' '}
                  <strong className="text-white">
                    Herramientas → Opciones → Asesores Expertos
                  </strong>{' '}
                  y añade <code>http://localhost:3000</code> en Permitir WebRequest.
                </div>
                <div>
                  3. Activa <strong className="text-white">Algo Trading</strong> y arrastra el EA a
                  cualquier gráfico.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
