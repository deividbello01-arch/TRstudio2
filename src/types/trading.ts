export type AssetSymbol =
  | 'NAS100'
  | 'US500'
  | 'US30'
  | 'US2000'
  | 'GER40'
  | 'UK100'
  | 'EU50'
  | 'FRA40'
  | 'JP225'
  | 'HK50'
  | 'XAUUSD'
  | 'EURUSD'
  | 'DXY'
  | 'US10Y'
  | 'VIX'
  | 'TODOS';

export interface InstrumentQuote {
  symbol: string;
  name: string;
  category: string;
  region?: 'US' | 'EU' | 'UK' | 'ASIA' | 'GLOBAL';
  price: number;
  change24h: string;
  high24h?: number;
  low24h?: number;
  lastTickDirection?: 'up' | 'down' | 'none';
  atr14?: string;
  pointValue?: string;
  bias4H?: string;
  status?: string;
  impact?: string;
  keyLevels?: {
    pdh?: number;
    pdl?: number;
    asiaHigh?: number;
    asiaLow?: number;
    fvg4H?: string;
    fvg1H?: string;
    equalHighs?: number;
    roundNumber?: number;
  };
}

export interface KillzoneSession {
  name: string;
  active: boolean;
  statusColor: 'emerald' | 'amber' | 'rose' | 'cyan' | 'blue' | 'gray';
  nyTime: string;
  windowHours?: string;
  recommendedAssets: string[];
  description: string;
}

export interface ExternalSourceAttribution {
  media: string;
  headline: string;
  url: string;
  category?: string;
}

export interface MarketQueryResponse {
  answer: string;
  sources: Array<{ title: string; url: string; media?: string; headline?: string }>;
  externalSources?: ExternalSourceAttribution[];
  ownAnalysisDeclaration?: string;
  searchQueries: string[];
  nyTime: string;
  session: string;
  timestamp: string;
}

export interface TradeSetup {
  asset: string;
  assetName?: string;
  region?: string;
  action: 'BUY' | 'SELL' | 'WAIT';
  playbookName: string;
  strategyId?: string;
  tier: string;
  totalConfluenceScore: number;
  confluenceBreakdown: {
    killzoneFilterScore: number;
    structureScore: number;
    liquiditySweepScore: number;
    intermarketScore: number;
    triggerScore: number;
  };
  prices: {
    currentPrice: number;
    entryPrice: number;
    entryType: string;
    stopLoss: number;
    stopLossDistance: string;
    stopLossPoints?: number;
    takeProfit1: number;
    takeProfit2: number;
    riskRewardRatio: string;
  };
  propFirmRiskCalculation: {
    accountBalance: number;
    riskPercentage: number;
    monetaryRiskUsd: number;
    actualRiskAtStopUsd: number;
    projectedProfitTp1Usd: number;
    projectedProfitTp2Usd: number;
    recommendedLots: number;
    valuePerPointPerLotUsd: number;
    contractSizeSpec: string;
    hardDailyDrawdownAlert: string;
  };
  thesisRationale: string;
  invalidationCriteria: string;
  executionTips: string[];
  winProbability?: number;
  recommendationVerdict?: 'TAKE' | 'CAUTION' | 'AVOID';
  recommendationLabel?: string;
  recommendationReason?: string;
  externalSources?: ExternalSourceAttribution[];
  ownAnalysisDeclaration?: string;
}

export interface ScannerResponse {
  bestSetup: TradeSetup;
  rankedSetups: TradeSetup[];
  scannedCount: number;
  nyTime: string;
  session: string;
  timestamp: string;
}

export interface TradingReport {
  id: string;
  asset: string;
  timeframe: string;
  report: string;
  sources: Array<{ title: string; url: string; media?: string; headline?: string }>;
  externalSources?: ExternalSourceAttribution[];
  ownAnalysisDeclaration?: string;
  generatedAt: string;
  nyTime: string;
  session: string;
}

export interface CustomDocument {
  id: string;
  name: string;
  type: 'builtin' | 'custom';
  content: string;
  charCount: number;
  description: string;
  addedAt: string;
  isActive: boolean;
}

export interface OpenPosition {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  monetaryRisk: number;
  projectedReward1: number;
  projectedReward2: number;
  riskRewardRatio: number;
  playbook: string;
  openedAt: string;
  status: 'OPEN' | 'BREAK_EVEN' | 'PARTIAL_CLOSED';
}

export type AppTheme = 'cream' | 'crimson' | 'mint' | 'coffee' | 'midnight' | 'emerald' | 'obsidian';
export type AppLanguage = 'es' | 'en';
export type InstrumentMarketMode = 'all_programmed' | 'cfd_only' | 'futures_only';

export const ALL_PROGRAMMED_TRADEABLE_SYMBOLS: string[] = [
  'NAS100',
  'US500',
  'US30',
  'US2000',
  'GER40',
  'UK100',
  'EU50',
  'FRA40',
  'JP225',
  'HK50',
  'XAUUSD',
  'EURUSD',
];

export const ONLY_INDEX_SYMBOLS: string[] = [
  'NAS100',
  'US500',
  'US30',
  'US2000',
  'GER40',
  'UK100',
  'EU50',
  'FRA40',
  'JP225',
  'HK50',
];

export type MT5BrokerPreset =
  | 'FTMO'
  | 'FundedNext'
  | 'ICMarkets'
  | 'Pepperstone'
  | 'Exness'
  | 'Eightcap'
  | 'Darwinex'
  | 'Custom';

export type MT5ConnectionMode = 'integrated_web' | 'ea_bridge' | 'metaapi_cloud';

export interface MT5LivePosition {
  id: string;
  ticket: string;
  asset: string;
  brokerSymbol: string;
  action: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  lots: number;
  initialLots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  floatingPnlUsd: number;
  floatingR: number;
  realizedPnlUsd: number;
  riskUsd: number;
  riskPercent: number;
  playbookName: string;
  status: 'OPEN' | 'BREAK_EVEN' | 'PARTIAL_TP1' | 'PENDING_LIMIT';
  eaStatus?: 'SYNCED' | 'QUEUED' | 'WEB_SIM';
  openedAt: string;
}

export interface MT5ClosedOrderHistory {
  id: string;
  ticket: string;
  asset: string;
  brokerSymbol: string;
  action: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  closePrice: number;
  realizedPnlUsd: number;
  playbookName: string;
  closedAt: string;
  closeReason: string;
}

export interface MT5SessionState {
  connected: boolean;
  login: string;
  brokerServer: string;
  brokerPreset: MT5BrokerPreset;
  accountType: 'Prop Firm' | 'Live ECN' | 'Demo Quant';
  connectionMode: MT5ConnectionMode;
  accountName?: string;
  currency?: string;
  leverage?: string;
  margin?: number;
  freeMargin?: number;
  marginLevelPct?: number;
  syncSource?: 'EA_LIVE' | 'METAAPI_CLOUD' | 'BROKER_SESSION';
  metaApiConnected?: boolean;
  eaLastSeenAt?: string | null;
  eaPendingCount?: number;
  balance: number;
  initialBalance: number;
  equity: number;
  floatingPnlUsd: number;
  realizedSessionPnlUsd: number;
  symbolMap: Record<string, string>;
  openPositions: MT5LivePosition[];
  orderHistory: MT5ClosedOrderHistory[];
  macosInstallerReady?: boolean;
  macosInstallerPath?: string;
}

export interface MT5ExecuteOrderPayload {
  asset: string;
  action: 'BUY' | 'SELL';
  orderType?: 'MARKET' | 'LIMIT';
  lots: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  playbookName?: string;
  riskUsd?: number;
  riskPercent?: number;
  splitTpOrders?: boolean;
}

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
  timeFormat: '12h' | '24h';
  minimalistMode: boolean;
  compactCards: boolean;
  autoTick: boolean;
  defaultBalance: number;
  defaultRisk: number;
  // Market Instrument Mode & Custom Asset Selection
  instrumentMarketMode: InstrumentMarketMode;
  enabledSymbols: string[];
  // Section visibility toggles
  showTopStatusBar: boolean;
  showSessionBanner: boolean;
  showTickerGrid: boolean;
  showMacroBar: boolean;
  showChartSection: boolean;
  showFooter: boolean;
  // Navigation tab toggles
  showScannerTab: boolean;
  showStrategiesTab: boolean;
  showReportsTab: boolean;
  showKnowledgeTab: boolean;
  showCalculatorTab: boolean;
  showNewsChatTab: boolean;
  showMt5Tab?: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'cream',
  language: 'es',
  timeFormat: '12h',
  minimalistMode: false,
  compactCards: false,
  autoTick: true,
  defaultBalance: 10000,
  defaultRisk: 0.50,
  instrumentMarketMode: 'all_programmed',
  enabledSymbols: ALL_PROGRAMMED_TRADEABLE_SYMBOLS,
  showTopStatusBar: true,
  showSessionBanner: true,
  showTickerGrid: true,
  showMacroBar: true,
  showChartSection: true,
  showFooter: true,
  showScannerTab: true,
  showStrategiesTab: true,
  showReportsTab: true,
  showKnowledgeTab: true,
  showCalculatorTab: true,
  showNewsChatTab: true,
  showMt5Tab: false,
};
