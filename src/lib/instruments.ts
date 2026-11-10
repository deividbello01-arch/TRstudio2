// Shared instrument catalog (used by both the Express server and the React client).
// Contract values are the most common CFD specs; every user can override them in the
// Lot Calculator to match the exact contract specification of their broker (MT5 → Symbol → Specification).

export type InstrumentKind = 'index' | 'metal' | 'forex' | 'macro';
export type QuoteCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'HKD';
export type SessionKey =
  | 'asia'
  | 'london'
  | 'london_late'
  | 'ny_pre'
  | 'ny_am'
  | 'ny_lunch'
  | 'ny_pm'
  | 'post';

export interface InstrumentSpec {
  symbol: string;
  nameEs: string;
  nameEn: string;
  kind: InstrumentKind;
  region: 'US' | 'EU' | 'UK' | 'ASIA' | 'GLOBAL';
  /** TradingView scanner ticker used for live quotes */
  tv: string;
  /** Optional futures ticker used to estimate the CFD price while the cash market is closed */
  futTv?: string;
  /** Cash market hours in New York minutes [start, end). May wrap past midnight. */
  cashHoursNy?: [number, number];
  chart: { primary: string; alternates: Array<{ name: string; symbol: string }> };
  decimals: number;
  tick: number;
  quoteCcy: QuoteCurrency;
  /** Value (in quote currency) of a 1.0 price move for 1 standard lot */
  contractValue: number;
  /** For forex/metals: size of one pip, used only for display */
  pipSize?: number;
  unitEs: string;
  unitEn: string;
  /** 0-20 liquidity/edge score by session */
  sessionScores: Record<SessionKey, number>;
  /** How sensitive the asset is to macro drivers */
  macroProfile: 'us_tech' | 'us_index' | 'global_index' | 'gold' | 'eurusd' | 'none';
  fallback: { price: number; high: number; low: number; open: number; change: number; atr: number };
  tradeable: boolean;
}

const US_SESSIONS: Record<SessionKey, number> = {
  asia: 6,
  london: 9,
  london_late: 11,
  ny_pre: 15,
  ny_am: 20,
  ny_lunch: 8,
  ny_pm: 17,
  post: 4,
};

const EU_SESSIONS: Record<SessionKey, number> = {
  asia: 5,
  london: 20,
  london_late: 18,
  ny_pre: 16,
  ny_am: 14,
  ny_lunch: 7,
  ny_pm: 6,
  post: 3,
};

const ASIA_SESSIONS: Record<SessionKey, number> = {
  asia: 19,
  london: 12,
  london_late: 9,
  ny_pre: 9,
  ny_am: 11,
  ny_lunch: 6,
  ny_pm: 6,
  post: 5,
};

const US_CASH: [number, number] = [9 * 60 + 30, 16 * 60];
const EU_CASH: [number, number] = [3 * 60, 11 * 60 + 30];
const JP_CASH: [number, number] = [19 * 60, 2 * 60 + 30];

export const INSTRUMENTS: InstrumentSpec[] = [
  {
    symbol: 'NAS100',
    nameEs: 'Nasdaq 100',
    nameEn: 'Nasdaq 100',
    kind: 'index',
    region: 'US',
    tv: 'NASDAQ:NDX',
    futTv: 'CME_MINI:NQ1!',
    cashHoursNy: US_CASH,
    chart: {
      primary: 'PEPPERSTONE:NAS100',
      alternates: [
        { name: 'Pepperstone NAS100', symbol: 'PEPPERSTONE:NAS100' },
        { name: 'Capital.com US100', symbol: 'CAPITALCOM:US100' },
        { name: 'OANDA NAS100USD', symbol: 'OANDA:NAS100USD' },
        { name: 'Nasdaq 100 (NDX)', symbol: 'NASDAQ:NDX' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'us_tech',
    fallback: { price: 27907.6, high: 28025.7, low: 27227.5, open: 27263.4, change: 3.4, atr: 660 },
    tradeable: true,
  },
  {
    symbol: 'US500',
    nameEs: 'S&P 500',
    nameEn: 'S&P 500',
    kind: 'index',
    region: 'US',
    tv: 'SP:SPX',
    futTv: 'CME_MINI:ES1!',
    cashHoursNy: US_CASH,
    chart: {
      primary: 'PEPPERSTONE:US500',
      alternates: [
        { name: 'Pepperstone US500', symbol: 'PEPPERSTONE:US500' },
        { name: 'Capital.com US500', symbol: 'CAPITALCOM:US500' },
        { name: 'OANDA SPX500USD', symbol: 'OANDA:SPX500USD' },
        { name: 'S&P 500 (SPX)', symbol: 'SP:SPX' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'us_index',
    fallback: { price: 7549.9, high: 7560, low: 7480, open: 7490, change: 0.8, atr: 108 },
    tradeable: true,
  },
  {
    symbol: 'US30',
    nameEs: 'Dow Jones 30',
    nameEn: 'Dow Jones 30',
    kind: 'index',
    region: 'US',
    tv: 'OANDA:US30USD',
    chart: {
      primary: 'PEPPERSTONE:US30',
      alternates: [
        { name: 'Pepperstone US30', symbol: 'PEPPERSTONE:US30' },
        { name: 'Capital.com US30', symbol: 'CAPITALCOM:US30' },
        { name: 'OANDA US30USD', symbol: 'OANDA:US30USD' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'us_index',
    fallback: { price: 52595.4, high: 52611.9, low: 52401.9, open: 52415.9, change: 0.28, atr: 852 },
    tradeable: true,
  },
  {
    symbol: 'US2000',
    nameEs: 'Russell 2000',
    nameEn: 'Russell 2000',
    kind: 'index',
    region: 'US',
    tv: 'TVC:RUT',
    futTv: 'CME_MINI:RTY1!',
    cashHoursNy: US_CASH,
    chart: {
      primary: 'PEPPERSTONE:US2000',
      alternates: [
        { name: 'Pepperstone US2000', symbol: 'PEPPERSTONE:US2000' },
        { name: 'Russell 2000 (RUT)', symbol: 'TVC:RUT' },
        { name: 'Capital.com RTY', symbol: 'CAPITALCOM:RTY' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'us_index',
    fallback: { price: 2840.8, high: 2850, low: 2810, open: 2815, change: 0.9, atr: 48 },
    tradeable: true,
  },
  {
    symbol: 'GER40',
    nameEs: 'DAX 40 (Alemania)',
    nameEn: 'DAX 40 (Germany)',
    kind: 'index',
    region: 'EU',
    tv: 'OANDA:DE30EUR',
    chart: {
      primary: 'PEPPERSTONE:GER40',
      alternates: [
        { name: 'Pepperstone GER40', symbol: 'PEPPERSTONE:GER40' },
        { name: 'Capital.com DE40', symbol: 'CAPITALCOM:DE40' },
        { name: 'OANDA DE30EUR', symbol: 'OANDA:DE30EUR' },
        { name: 'DAX (XETR)', symbol: 'XETR:DAX' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'EUR',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: EU_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 26496, high: 26499, low: 26390, open: 26446.6, change: 0.25, atr: 431 },
    tradeable: true,
  },
  {
    symbol: 'UK100',
    nameEs: 'FTSE 100 (Reino Unido)',
    nameEn: 'FTSE 100 (UK)',
    kind: 'index',
    region: 'UK',
    tv: 'TVC:UKX',
    futTv: 'ICEEUR:Z1!',
    cashHoursNy: EU_CASH,
    chart: {
      primary: 'PEPPERSTONE:UK100',
      alternates: [
        { name: 'Pepperstone UK100', symbol: 'PEPPERSTONE:UK100' },
        { name: 'Capital.com UK100', symbol: 'CAPITALCOM:UK100' },
        { name: 'FTSE 100 (UKX)', symbol: 'TVC:UKX' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'GBP',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: EU_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 10782.9, high: 10800, low: 10720, open: 10740, change: 0.4, atr: 126 },
    tradeable: true,
  },
  {
    symbol: 'EU50',
    nameEs: 'Euro Stoxx 50',
    nameEn: 'Euro Stoxx 50',
    kind: 'index',
    region: 'EU',
    tv: 'TVC:SX5E',
    futTv: 'EUREX:FESX1!',
    cashHoursNy: EU_CASH,
    chart: {
      primary: 'PEPPERSTONE:EUSTX50',
      alternates: [
        { name: 'Pepperstone EUSTX50', symbol: 'PEPPERSTONE:EUSTX50' },
        { name: 'Capital.com EU50', symbol: 'CAPITALCOM:EU50' },
        { name: 'Euro Stoxx 50 (SX5E)', symbol: 'TVC:SX5E' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'EUR',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: EU_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 6290.5, high: 6300, low: 6250, open: 6260, change: 0.6, atr: 89 },
    tradeable: true,
  },
  {
    symbol: 'FRA40',
    nameEs: 'CAC 40 (Francia)',
    nameEn: 'CAC 40 (France)',
    kind: 'index',
    region: 'EU',
    tv: 'TVC:CAC40',
    cashHoursNy: EU_CASH,
    chart: {
      primary: 'PEPPERSTONE:FRA40',
      alternates: [
        { name: 'Pepperstone FRA40', symbol: 'PEPPERSTONE:FRA40' },
        { name: 'Capital.com FR40', symbol: 'CAPITALCOM:FR40' },
        { name: 'CAC 40 (Euronext)', symbol: 'TVC:CAC40' },
      ],
    },
    decimals: 1,
    tick: 0.1,
    quoteCcy: 'EUR',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: EU_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 8233.3, high: 8245, low: 8190, open: 8200, change: 0.5, atr: 105 },
    tradeable: true,
  },
  {
    symbol: 'JP225',
    nameEs: 'Nikkei 225 (Japón)',
    nameEn: 'Nikkei 225 (Japan)',
    kind: 'index',
    region: 'ASIA',
    tv: 'TVC:NI225',
    futTv: 'OSE:NK2251!',
    cashHoursNy: JP_CASH,
    chart: {
      primary: 'PEPPERSTONE:JPN225',
      alternates: [
        { name: 'Pepperstone JPN225', symbol: 'PEPPERSTONE:JPN225' },
        { name: 'Capital.com J225', symbol: 'CAPITALCOM:J225' },
        { name: 'Nikkei 225 (NI225)', symbol: 'TVC:NI225' },
      ],
    },
    decimals: 0,
    tick: 1,
    quoteCcy: 'JPY',
    contractValue: 100,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: ASIA_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 60306, high: 60800, low: 59500, open: 59600, change: 1.1, atr: 1739 },
    tradeable: true,
  },
  {
    symbol: 'HK50',
    nameEs: 'Hang Seng 50 (Hong Kong)',
    nameEn: 'Hang Seng 50 (Hong Kong)',
    kind: 'index',
    region: 'ASIA',
    tv: 'OANDA:HK33HKD',
    chart: {
      primary: 'PEPPERSTONE:HK50',
      alternates: [
        { name: 'Pepperstone HK50', symbol: 'PEPPERSTONE:HK50' },
        { name: 'OANDA HK33HKD', symbol: 'OANDA:HK33HKD' },
      ],
    },
    decimals: 0,
    tick: 1,
    quoteCcy: 'HKD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: ASIA_SESSIONS,
    macroProfile: 'global_index',
    fallback: { price: 24520, high: 24600, low: 24350, open: 24400, change: 0.3, atr: 420 },
    tradeable: true,
  },
  {
    symbol: 'XAUUSD',
    nameEs: 'Oro / Dólar',
    nameEn: 'Gold / US Dollar',
    kind: 'metal',
    region: 'GLOBAL',
    tv: 'OANDA:XAUUSD',
    chart: {
      primary: 'OANDA:XAUUSD',
      alternates: [
        { name: 'OANDA XAUUSD', symbol: 'OANDA:XAUUSD' },
        { name: 'Capital.com Gold', symbol: 'CAPITALCOM:GOLD' },
        { name: 'Forex.com XAUUSD', symbol: 'FX:XAUUSD' },
      ],
    },
    decimals: 2,
    tick: 0.01,
    quoteCcy: 'USD',
    contractValue: 100,
    pipSize: 0.1,
    unitEs: 'dólares ($)',
    unitEn: 'dollars ($)',
    sessionScores: {
      asia: 10,
      london: 17,
      london_late: 15,
      ny_pre: 20,
      ny_am: 19,
      ny_lunch: 9,
      ny_pm: 11,
      post: 4,
    },
    macroProfile: 'gold',
    fallback: { price: 4116.1, high: 4146.7, low: 4108.2, open: 4135.8, change: -0.59, atr: 81 },
    tradeable: true,
  },
  {
    symbol: 'EURUSD',
    nameEs: 'Euro / Dólar',
    nameEn: 'Euro / US Dollar',
    kind: 'forex',
    region: 'GLOBAL',
    tv: 'FX:EURUSD',
    chart: {
      primary: 'FX:EURUSD',
      alternates: [
        { name: 'FXCM EURUSD', symbol: 'FX:EURUSD' },
        { name: 'OANDA EURUSD', symbol: 'OANDA:EURUSD' },
        { name: 'Capital.com EURUSD', symbol: 'CAPITALCOM:EURUSD' },
      ],
    },
    decimals: 5,
    tick: 0.00001,
    quoteCcy: 'USD',
    contractValue: 100000,
    pipSize: 0.0001,
    unitEs: 'pips',
    unitEn: 'pips',
    sessionScores: {
      asia: 7,
      london: 20,
      london_late: 17,
      ny_pre: 18,
      ny_am: 16,
      ny_lunch: 8,
      ny_pm: 8,
      post: 4,
    },
    macroProfile: 'eurusd',
    fallback: { price: 1.12277, high: 1.12282, low: 1.1216, open: 1.12235, change: 0.04, atr: 0.0064 },
    tradeable: true,
  },
  {
    symbol: 'DXY',
    nameEs: 'Índice Dólar (DXY)',
    nameEn: 'US Dollar Index (DXY)',
    kind: 'macro',
    region: 'GLOBAL',
    tv: 'TVC:DXY',
    chart: {
      primary: 'CAPITALCOM:DXY',
      alternates: [
        { name: 'Capital.com DXY', symbol: 'CAPITALCOM:DXY' },
        { name: 'AMEX UUP (ETF Dólar)', symbol: 'AMEX:UUP' },
      ],
    },
    decimals: 2,
    tick: 0.01,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'none',
    fallback: { price: 101.64, high: 101.74, low: 101.63, open: 101.72, change: -0.04, atr: 0.5 },
    tradeable: false,
  },
  {
    symbol: 'US10Y',
    nameEs: 'Bono EE. UU. 10 años (rendimiento)',
    nameEn: '10Y US Treasury Yield',
    kind: 'macro',
    region: 'US',
    tv: 'TVC:US10Y',
    chart: {
      primary: 'TVC:US10Y',
      alternates: [
        { name: 'US10Y (TVC)', symbol: 'TVC:US10Y' },
        { name: 'NASDAQ:IEF (Bono 7-10Y)', symbol: 'NASDAQ:IEF' },
        { name: 'NASDAQ:TLT (Bono 20Y+)', symbol: 'NASDAQ:TLT' },
      ],
    },
    decimals: 3,
    tick: 0.001,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: '%',
    unitEn: '%',
    sessionScores: US_SESSIONS,
    macroProfile: 'none',
    fallback: { price: 4.872, high: 4.884, low: 4.864, open: 4.876, change: -0.25, atr: 0.08 },
    tradeable: false,
  },
  {
    symbol: 'VIX',
    nameEs: 'Volatilidad VIX',
    nameEn: 'VIX Volatility Index',
    kind: 'macro',
    region: 'US',
    tv: 'CBOE:VIX',
    chart: {
      primary: 'CAPITALCOM:VIX',
      alternates: [
        { name: 'Capital.com VIX', symbol: 'CAPITALCOM:VIX' },
        { name: 'AMEX VIXY (futuros VIX)', symbol: 'AMEX:VIXY' },
      ],
    },
    decimals: 2,
    tick: 0.01,
    quoteCcy: 'USD',
    contractValue: 1,
    unitEs: 'puntos',
    unitEn: 'points',
    sessionScores: US_SESSIONS,
    macroProfile: 'none',
    fallback: { price: 19.92, high: 25.08, low: 19.64, open: 25.08, change: -22.3, atr: 3.3 },
    tradeable: false,
  },
];

/** FX tickers only used to convert non-USD contract values into USD */
export const FX_RATE_TICKERS: Record<string, { tv: string; fallback: number }> = {
  EURUSD: { tv: 'FX:EURUSD', fallback: 1.1228 },
  GBPUSD: { tv: 'FX:GBPUSD', fallback: 1.3448 },
  USDJPY: { tv: 'FX:USDJPY', fallback: 157.95 },
};

export type FxRates = { EURUSD: number; GBPUSD: number; USDJPY: number; USDHKD: number };

export const DEFAULT_FX_RATES: FxRates = {
  EURUSD: 1.1228,
  GBPUSD: 1.3448,
  USDJPY: 157.95,
  USDHKD: 7.8,
};

export const TRADEABLE_INSTRUMENTS = INSTRUMENTS.filter((i) => i.tradeable);
export const TRADEABLE_SYMBOLS = TRADEABLE_INSTRUMENTS.map((i) => i.symbol);
export const INDEX_SYMBOLS = INSTRUMENTS.filter((i) => i.kind === 'index').map((i) => i.symbol);

export function getSpec(symbol: string): InstrumentSpec | undefined {
  return INSTRUMENTS.find((i) => i.symbol === symbol);
}

export function quoteToUsd(ccy: QuoteCurrency, fx: Partial<FxRates> = DEFAULT_FX_RATES): number {
  const rates = { ...DEFAULT_FX_RATES, ...fx };
  switch (ccy) {
    case 'EUR':
      return rates.EURUSD;
    case 'GBP':
      return rates.GBPUSD;
    case 'JPY':
      return 1 / rates.USDJPY;
    case 'HKD':
      return 1 / rates.USDHKD;
    default:
      return 1;
  }
}

/** USD value of a 1.0 price move for 1 lot, honoring a user override (in quote currency). */
export function valuePerPointUsd(
  spec: InstrumentSpec,
  fx?: Partial<FxRates>,
  contractOverride?: number
): number {
  const contract = contractOverride && contractOverride > 0 ? contractOverride : spec.contractValue;
  return contract * quoteToUsd(spec.quoteCcy, fx);
}

export function roundToTick(value: number, spec: InstrumentSpec): number {
  const ticks = Math.round(value / spec.tick);
  return Number((ticks * spec.tick).toFixed(spec.decimals));
}

export function formatPrice(value: number, spec?: InstrumentSpec): string {
  const decimals = spec ? spec.decimals : value < 10 ? 5 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Human readable stop distance (pips for FX, $ for gold, points for indices) */
export function formatDistance(distance: number, spec: InstrumentSpec, isEn = false): string {
  if (spec.kind === 'forex' && spec.pipSize) {
    return `${(distance / spec.pipSize).toFixed(1)} pips`;
  }
  if (spec.kind === 'metal') {
    const pips = spec.pipSize ? distance / spec.pipSize : distance * 10;
    return `$${distance.toFixed(2)} (${pips.toFixed(0)} pips)`;
  }
  const pts = distance.toFixed(spec.decimals === 0 ? 0 : 1);
  return `${pts} ${isEn ? 'pts' : 'pts'}`;
}
