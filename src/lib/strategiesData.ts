// Comprehensive Trading Strategies, Playbooks, Financial Research Websites & Knowledge Bases
// Used across the Strategies Academy tab, Knowledge Bases (DocumentManager), Trade Setup Engine & Scanner.

import { CustomDocument } from '../types/trading';

export interface WebSourceInfo {
  id: string;
  name: string;
  url: string;
  category: 'macro' | 'indices' | 'commodities' | 'quant' | 'calendar' | 'central_banks';
  categoryLabelEs: string;
  categoryLabelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  bestForAssets: string[];
}

export const FINANCIAL_WEB_SOURCES: WebSourceInfo[] = [
  // Macro & Central Banks
  {
    id: 'reuters',
    name: 'Reuters Markets',
    url: 'https://www.reuters.com/markets/',
    category: 'macro',
    categoryLabelEs: 'Macro y Bancos Centrales',
    categoryLabelEn: 'Macro & Central Banks',
    descriptionEs: 'Cobertura institucional en tiempo real de tasas Fed/BCE/BoJ, datos CPI, NFP y flujos globales.',
    descriptionEn: 'Real-time institutional coverage of Fed/ECB/BoJ rates, CPI, NFP releases and global flows.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'XAUUSD', 'EURUSD', 'DXY'],
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Markets',
    url: 'https://www.bloomberg.com/markets',
    category: 'macro',
    categoryLabelEs: 'Macro y Bancos Centrales',
    categoryLabelEn: 'Macro & Central Banks',
    descriptionEs: 'Flujos institucionales interbancarios, bonos del Tesoro (US10Y) y posicionamiento global.',
    descriptionEn: 'Interbank institutional flows, Treasury yields (US10Y), and global positioning.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'GER40', 'XAUUSD', 'EURUSD'],
  },
  {
    id: 'ft',
    name: 'Financial Times Markets',
    url: 'https://www.ft.com/markets',
    category: 'macro',
    categoryLabelEs: 'Macro y Bancos Centrales',
    categoryLabelEn: 'Macro & Central Banks',
    descriptionEs: 'Perspectiva macroeconómica europea, británica y global; ideal para GER40, UK100 y EU50.',
    descriptionEn: 'European, UK, and global macroeconomic perspective; ideal for GER40, UK100, and EU50.',
    bestForAssets: ['GER40', 'UK100', 'EU50', 'FRA40', 'EURUSD'],
  },
  {
    id: 'wsj',
    name: 'Wall Street Journal Markets',
    url: 'https://www.wsj.com/finance',
    category: 'macro',
    categoryLabelEs: 'Macro y Bancos Centrales',
    categoryLabelEn: 'Macro & Central Banks',
    descriptionEs: 'Filtraciones y cobertura directa de la Reserva Federal (Nick Timiraos) e índices de EE. UU.',
    descriptionEn: 'Direct Federal Reserve coverage and US equity market intelligence.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'US2000', 'DXY'],
  },
  {
    id: 'forexlive',
    name: 'ForexLive',
    url: 'https://www.forexlive.com/',
    category: 'macro',
    categoryLabelEs: 'Flujo de Divisas en Vivo',
    categoryLabelEn: 'Live FX & Orderflow',
    descriptionEs: 'Lectura instantánea de flujos de sesión Londres/NY, niveles de opciones y reacciones a noticias.',
    descriptionEn: 'Instant desk commentary for London/NY sessions, FX option expiries, and news reactions.',
    bestForAssets: ['EURUSD', 'XAUUSD', 'DXY', 'NAS100', 'GER40'],
  },
  {
    id: 'fxstreet',
    name: 'FXStreet',
    url: 'https://www.fxstreet.com/',
    category: 'macro',
    categoryLabelEs: 'Flujo de Divisas en Vivo',
    categoryLabelEn: 'Live FX & Orderflow',
    descriptionEs: 'Análisis técnico y fundamental continuo en divisas, oro e índices durante las 24 horas.',
    descriptionEn: '24-hour technical and fundamental coverage across FX majors, gold, and indices.',
    bestForAssets: ['EURUSD', 'XAUUSD', 'GBPUSD', 'NAS100'],
  },
  // Calendars & Rate Probabilities
  {
    id: 'forexfactory',
    name: 'ForexFactory Calendar',
    url: 'https://www.forexfactory.com/calendar',
    category: 'calendar',
    categoryLabelEs: 'Calendario Carpeta Roja',
    categoryLabelEn: 'Red-Folder Calendar',
    descriptionEs: 'El estándar para detectar eventos de carpeta roja (CPI, NFP, FOMC, PMI) y ventanas de no-operar.',
    descriptionEn: 'Industry standard calendar to spot high-impact red-folder releases and no-trade windows.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'XAUUSD', 'EURUSD', 'GER40'],
  },
  {
    id: 'investing_cal',
    name: 'Investing.com Economic Calendar',
    url: 'https://www.investing.com/economic-calendar/',
    category: 'calendar',
    categoryLabelEs: 'Calendario Carpeta Roja',
    categoryLabelEn: 'Red-Folder Calendar',
    descriptionEs: 'Calendario macroeconómico global en tiempo real con consenso, previo y desviación actual.',
    descriptionEn: 'Global real-time macroeconomic calendar with consensus, previous, and actual surprise.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'XAUUSD', 'EURUSD', 'JP225', 'UK100'],
  },
  {
    id: 'tradingeconomics',
    name: 'TradingEconomics',
    url: 'https://tradingeconomics.com/calendar',
    category: 'calendar',
    categoryLabelEs: 'Macro Datos & Proyecciones',
    categoryLabelEn: 'Macro Data & Forecasts',
    descriptionEs: 'Series históricas macroeconómicas de PIB, inflación, tasas y balanza comercial por país.',
    descriptionEn: 'Historical macroeconomic series for GDP, inflation, interest rates, and trade balances.',
    bestForAssets: ['EURUSD', 'GER40', 'UK100', 'JP225', 'HK50', 'XAUUSD'],
  },
  {
    id: 'cme_fedwatch',
    name: 'CME FedWatch Tool',
    url: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',
    category: 'central_banks',
    categoryLabelEs: 'Tasas e Intermercado',
    categoryLabelEn: 'Rates & Intermarket',
    descriptionEs: 'Probabilidades implícitas de recortes o subidas de tasas de la Fed en futuros de fondos federales.',
    descriptionEn: 'Implied probabilities of Federal Reserve rate hikes or cuts derived from Fed Funds futures.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'XAUUSD', 'DXY', 'US10Y'],
  },
  {
    id: 'fred',
    name: 'FRED (St. Louis Fed Data)',
    url: 'https://fred.stlouisfed.org/',
    category: 'central_banks',
    categoryLabelEs: 'Tasas e Intermercado',
    categoryLabelEn: 'Rates & Intermarket',
    descriptionEs: 'Datos oficiales de rendimientos reales (TIPS), liquidez de la Fed, M2 y curva de bonos 10Y-2Y.',
    descriptionEn: 'Official data on real yields (TIPS), Fed balance sheet liquidity, M2, and 10Y-2Y yield curve.',
    bestForAssets: ['NAS100', 'US500', 'XAUUSD', 'US10Y'],
  },
  // Indices & Equities
  {
    id: 'cnbc',
    name: 'CNBC World Markets',
    url: 'https://www.cnbc.com/world-markets/',
    category: 'indices',
    categoryLabelEs: 'Índices Bursátiles & Wall St',
    categoryLabelEn: 'Stock Indices & Wall St',
    descriptionEs: 'Pre-mercado de Wall Street, futuros de NAS100/US500/US30 y catalizadores de megacaps tecnológicas.',
    descriptionEn: 'Wall Street pre-market, NAS100/US500/US30 futures, and mega-cap tech catalysts.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'US2000'],
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    url: 'https://www.marketwatch.com/',
    category: 'indices',
    categoryLabelEs: 'Índices Bursátiles & Wall St',
    categoryLabelEn: 'Stock Indices & Wall St',
    descriptionEs: 'Seguimiento del rendimiento US10Y, volatilidad VIX y rotación sectorial entre Nasdaq, S&P y Russell.',
    descriptionEn: 'Tracking US10Y yields, VIX volatility, and sector rotation across Nasdaq, S&P, and Russell.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'US2000', 'VIX'],
  },
  {
    id: 'yahoo',
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/world-indices/',
    category: 'indices',
    categoryLabelEs: 'Índices Bursátiles & Wall St',
    categoryLabelEn: 'Stock Indices & Wall St',
    descriptionEs: 'Panel global de índices mundiales (América, Europa y Asia-Pacífico) y componentes por peso.',
    descriptionEn: 'Global world indices dashboard (Americas, Europe, Asia-Pacific) and index components.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'GER40', 'UK100', 'JP225', 'HK50'],
  },
  {
    id: 'finviz',
    name: 'Finviz Maps & Futures',
    url: 'https://finviz.com/map.ashx',
    category: 'quant',
    categoryLabelEs: 'Mapa de Calor & Flujo Cuantitativo',
    categoryLabelEn: 'Heatmap & Quant Flow',
    descriptionEs: 'Mapa de calor del S&P 500 y Nasdaq 100 en vivo para ver si NVDA, AAPL, MSFT impulsan el índice.',
    descriptionEn: 'Live S&P 500 and Nasdaq 100 heatmap to verify if NVDA, AAPL, MSFT confirm the index direction.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'US2000'],
  },
  {
    id: 'barchart',
    name: 'Barchart Futures & COT',
    url: 'https://www.barchart.com/futures',
    category: 'quant',
    categoryLabelEs: 'Mapa de Calor & Flujo Cuantitativo',
    categoryLabelEn: 'Heatmap & Quant Flow',
    descriptionEs: 'Posicionamiento institucional COT (Commitment of Traders), volumen de futuros CME/Eurex y niveles.',
    descriptionEn: 'Institutional COT positioning, CME/Eurex futures volume, and technical levels.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'US2000', 'GER40', 'XAUUSD', 'EURUSD'],
  },
  {
    id: 'tradingview_ideas',
    name: 'TradingView Markets',
    url: 'https://www.tradingview.com/markets/indices/',
    category: 'quant',
    categoryLabelEs: 'Mapa de Calor & Flujo Cuantitativo',
    categoryLabelEn: 'Heatmap & Quant Flow',
    descriptionEs: 'Cotizaciones intermercado, estructura multitemporal (4H/1H/15M/5M) y comparativas SMT.',
    descriptionEn: 'Intermarket quotes, multi-timeframe structure (4H/1H/15M/5M), and SMT comparisons.',
    bestForAssets: ['NAS100', 'US500', 'US30', 'GER40', 'UK100', 'JP225', 'XAUUSD', 'EURUSD'],
  },
  // Gold & Commodities
  {
    id: 'kitco',
    name: 'Kitco Gold & Metals',
    url: 'https://www.kitco.com/',
    category: 'commodities',
    categoryLabelEs: 'Oro y Metales Preciosos',
    categoryLabelEn: 'Gold & Precious Metals',
    descriptionEs: 'Cotización spot LBMA/COMEX, flujo de refugio seguro y análisis especializado en XAU/USD.',
    descriptionEn: 'Spot LBMA/COMEX quotes, safe-haven flows, and specialized XAU/USD analysis.',
    bestForAssets: ['XAUUSD'],
  },
  {
    id: 'wgc',
    name: 'World Gold Council',
    url: 'https://www.gold.org/',
    category: 'commodities',
    categoryLabelEs: 'Oro y Metales Preciosos',
    categoryLabelEn: 'Gold & Precious Metals',
    descriptionEs: 'Compras de oro de bancos centrales, flujos de ETFs institucionales y demanda física global.',
    descriptionEn: 'Central bank gold purchases, institutional ETF flows, and global physical demand.',
    bestForAssets: ['XAUUSD'],
  },
];

export type ScheduleBlockId =
  | 'asia'
  | 'london'
  | 'ny_premarket'
  | 'ny_open'
  | 'london_close'
  | 'ny_pm';

export interface ScheduleBlockInfo {
  id: ScheduleBlockId;
  timeRangeNY: string;
  startHourNY: number;
  endHourNY: number;
  labelEs: string;
  labelEn: string;
  shortEs: string;
  shortEn: string;
  focusEs: string;
  focusEn: string;
}

export const SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  {
    id: 'asia',
    timeRangeNY: '19:00 – 02:00 NY',
    startHourNY: 19,
    endHourNY: 2,
    labelEs: '19:00 – 02:00 NY • Sesión Asiática / Tokio & Acumulación',
    labelEn: '19:00 – 02:00 NY • Asian Session / Tokyo & Accumulation',
    shortEs: 'Asia & Tokio (19:00-02:00)',
    shortEn: 'Asia & Tokyo (19:00-02:00)',
    focusEs: 'Apertura Tokio (JP225/HK50/XAUUSD) y creación del rango asiático pre-Londres.',
    focusEn: 'Tokyo open (JP225/HK50/XAUUSD) and pre-London Asian range accumulation.',
  },
  {
    id: 'london',
    timeRangeNY: '02:00 – 05:30 NY',
    startHourNY: 2,
    endHourNY: 5.5,
    labelEs: '02:00 – 05:30 NY • Apertura Frankfurt & London Killzone',
    labelEn: '02:00 – 05:30 NY • Frankfurt Open & London Killzone',
    shortEs: 'Londres & DAX (02:00-05:30)',
    shortEn: 'London & DAX (02:00-05:30)',
    focusEs: 'Judas Swing del rango asiático y ORB en GER40, UK100, EU50, EURUSD y XAUUSD.',
    focusEn: 'Asian range Judas Swing and ORB on GER40, UK100, EU50, EURUSD, and XAUUSD.',
  },
  {
    id: 'ny_premarket',
    timeRangeNY: '07:00 – 09:30 NY',
    startHourNY: 7,
    endHourNY: 9.5,
    labelEs: '07:00 – 09:30 NY • Pre-Market NY, COMEX (8:20) & Noticias (8:30)',
    labelEn: '07:00 – 09:30 NY • NY Pre-Market, COMEX (8:20) & Macro News (8:30)',
    shortEs: 'Pre-Market & 8:30 (07:00-09:30)',
    shortEn: 'Pre-Market & 8:30 (07:00-09:30)',
    focusEs: 'Apertura de futuros de Oro COMEX (8:20 AM) y barrido post-noticia CPI/NFP (8:30 AM).',
    focusEn: 'COMEX Gold floor open (8:20 AM) and post-CPI/NFP red-folder reclaim (8:30 AM).',
  },
  {
    id: 'ny_open',
    timeRangeNY: '09:30 – 11:00 NY',
    startHourNY: 9.5,
    endHourNY: 11,
    labelEs: '09:30 – 11:00 NY • Apertura Wall Street & AM Silver Bullet',
    labelEn: '09:30 – 11:00 NY • Wall Street Cash Open & AM Silver Bullet',
    shortEs: 'NY Open & AM SB (09:30-11:00)',
    shortEn: 'NY Open & AM SB (09:30-11:00)',
    focusEs: 'Inyección de volumen en NAS100/US500/US30, ORB 15M (9:45 AM) y Silver Bullet (10:00 AM).',
    focusEn: 'Wall St volume surge on NAS100/US500/US30, 15M ORB (9:45 AM) & Silver Bullet (10:00 AM).',
  },
  {
    id: 'london_close',
    timeRangeNY: '11:00 – 13:30 NY',
    startHourNY: 11,
    endHourNY: 13.5,
    labelEs: '11:00 – 13:30 NY • Cierre Europeo (London Close) & Mediodía NY',
    labelEn: '11:00 – 13:30 NY • European Close (London Close) & NY Midday',
    shortEs: 'London Close (11:00-13:30)',
    shortEn: 'London Close (11:00-13:30)',
    focusEs: 'Toma de ganancias institucional en PDH/PDL, agotamiento ATR y retrocesos OTE 1H.',
    focusEn: 'Institutional profit-taking at PDH/PDL, ATR exhaustion, and 1H OTE pullbacks.',
  },
  {
    id: 'ny_pm',
    timeRangeNY: '13:30 – 16:00 NY',
    startHourNY: 13.5,
    endHourNY: 16,
    labelEs: '13:30 – 16:00 NY • PM Silver Bullet (14:00) & Power Hour (15:00-16:00)',
    labelEn: '13:30 – 16:00 NY • PM Silver Bullet (14:00) & Power Hour (15:00-16:00)',
    shortEs: 'NY PM & Power Hour (13:30-16:00)',
    shortEn: 'NY PM & Power Hour (13:30-16:00)',
    focusEs: 'Expansión vespertina post-almuerzo, PM Silver Bullet (2-3 PM) y cierre MOC de Wall St.',
    focusEn: 'Afternoon expansion, PM Silver Bullet (2-3 PM), and Wall St MOC imbalance close.',
  },
];

export interface StrategyPlaybook {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  subtitleEs: string;
  subtitleEn: string;
  category: 'ict_smc' | 'killzone' | 'intermarket' | 'mean_reversion' | 'prop_risk';
  categoryLabelEs: string;
  categoryLabelEn: string;
  scheduleBlock?: ScheduleBlockId;
  scheduleLabelEs?: string;
  scheduleLabelEn?: string;
  startHourNY?: number;
  endHourNY?: number;
  timeframes: string;
  bestSessionEs: string;
  bestSessionEn: string;
  bestAssets: string[];
  winRateEstimate: string;
  riskRewardTarget: string;
  difficulty: 'Intermedio' | 'Avanzado' | 'Institucional';
  summaryEs: string;
  summaryEn: string;
  stepsEs: string[];
  stepsEn: string[];
  entryChecklistEs: string[];
  entryChecklistEn: string[];
  keyLevelsEs?: string[];
  keyLevelsEn?: string[];
  avoidConditionsEs?: string;
  avoidConditionsEn?: string;
  invalidationEs: string;
  invalidationEn: string;
  propFirmTipEs: string;
  propFirmTipEn: string;
  /** Prompt content used when this strategy is activated as a Knowledge Base */
  knowledgeBaseContent: string;
}

export function isHourInWindowNY(
  startHourNY: number,
  endHourNY: number,
  currentDecimalHourNY: number
): boolean {
  if (startHourNY <= endHourNY) {
    return currentDecimalHourNY >= startHourNY && currentDecimalHourNY <= endHourNY;
  }
  // Overnight wrap (e.g., 19:00 to 02:00 NY)
  return currentDecimalHourNY >= startHourNY || currentDecimalHourNY <= endHourNY;
}

export function isStrategyActiveAtHourNY(
  st: StrategyPlaybook,
  currentDecimalHourNY: number
): boolean {
  if (typeof st.startHourNY === 'number' && typeof st.endHourNY === 'number') {
    return isHourInWindowNY(st.startHourNY, st.endHourNY, currentDecimalHourNY);
  }
  return false;
}

export const TRADING_STRATEGIES: StrategyPlaybook[] = [
  {
    id: 'strat-silver-bullet-ny',
    code: 'PB-01',
    nameEs: 'ICT Silver Bullet & Apertura NY (9:30 - 11:00 AM)',
    nameEn: 'ICT Silver Bullet & NY Open (9:30 - 11:00 AM)',
    subtitleEs: 'Barrido de liquidez pre-mercado + desplazamiento + entrada en 50% FVG (15M / 5M)',
    subtitleEn: 'Pre-market liquidity sweep + displacement + 50% FVG entry (15M / 5M)',
    category: 'ict_smc',
    categoryLabelEs: 'ICT / Smart Money',
    categoryLabelEn: 'ICT / Smart Money',
    scheduleBlock: 'ny_open',
    scheduleLabelEs: '09:30 – 11:00 NY • Apertura Wall St & AM Silver Bullet',
    scheduleLabelEn: '09:30 – 11:00 NY • Wall St Open & AM Silver Bullet',
    startHourNY: 9.5,
    endHourNY: 11.25,
    timeframes: '1H (Sesgo) → 15M (Estructura) → 5M/1M (Gatillo FVG)',
    bestSessionEs: '9:30 AM – 11:00 AM NY (Ventana Silver Bullet AM: 10:00 – 11:00 AM)',
    bestSessionEn: '9:30 AM – 11:00 AM NY (AM Silver Bullet Window: 10:00 – 11:00 AM)',
    bestAssets: ['NAS100', 'US500', 'US30', 'US2000', 'XAUUSD'],
    winRateEstimate: '74% - 82%',
    riskRewardTarget: '1:2.5 a 1:3.5',
    difficulty: 'Institucional',
    summaryEs:
      'Aprovecha la inyección masiva de liquidez de la apertura de Wall Street (9:30 AM NY) y la hora Silver Bullet (10:00 - 11:00 AM NY). Espera a que los primeros 15 minutos barran los stops del rango pre-mercado (8:00 - 9:29 AM) y entra en el retroceso al Fair Value Gap (FVG) con desplazamiento confirmado.',
    summaryEn:
      'Captures the massive liquidity injection at the Wall Street cash open (9:30 AM NY) and the AM Silver Bullet hour (10:00 - 11:00 AM NY). Waits for the first 15 minutes to sweep pre-market stops (8:00 - 9:29 AM) and enters on a pullback to the Fair Value Gap (FVG) after displacement.',
    stepsEs: [
      'Marca antes de las 9:30 AM NY el máximo y mínimo del Pre-Mercado (8:00 AM - 9:29 AM) y los niveles PDH / PDL (Alto y Bajo del día anterior).',
      'Deja pasar el latigazo inicial de las 9:30 a 9:45 AM (Judas Swing) donde el algoritmo caza stops en falso.',
      'Identifica el barrido de liquidez (Liquidity Sweep) de un máximo o mínimo previo seguido de un quiebre de estructura con cuerpo (MSS / CHoCH) en 5M o 15M.',
      'Ubica el Fair Value Gap (FVG / Ineficiencia de 3 velas) creado durante el desplazamiento impulsivo.',
      'Coloca orden Limit en el inicio del FVG o en el 50% (Consequent Encroachment - CE) con Stop Loss detrás de la mecha del barrido + colchón de 0.15 ATR.',
      'Toma 50% de ganancia en TP1 (1:1.8 R:R), mueve el Stop Loss a Break Even y deja correr el resto hacia el pool de liquidez opuesto (TP2 1:3.0).',
    ],
    stepsEn: [
      'Before 9:30 AM NY, mark the Pre-Market High and Low (8:00 AM - 9:29 AM) along with PDH / PDL (Previous Day High/Low).',
      'Let the initial 9:30 - 9:45 AM manipulation whip (Judas Swing) complete.',
      'Confirm a Liquidity Sweep of a key high/low followed by an energetic Market Structure Shift (MSS / CHoCH) with candle body close on 5M or 15M.',
      'Locate the 3-candle Fair Value Gap (FVG) left behind by the displacement leg.',
      'Place a Limit order at the FVG proximal edge or 50% equilibrium (CE) with Stop Loss beyond the sweep wick + 0.15 ATR buffer.',
      'Close 50% at TP1 (1:1.8 R:R), move Stop Loss to Break Even, and target the opposing liquidity pool for TP2 (1:3.0).',
    ],
    entryChecklistEs: [
      '¿Estamos dentro de la ventana 9:45 AM - 11:15 AM NY o 2:00 PM - 3:00 PM NY?',
      '¿Hubo barrido claro de liquidez (Session High/Low, PDH/PDL o Equal Highs/Lows)?',
      '¿El quiebre estructural (MSS) dejó un FVG limpio en 5M o 15M?',
      '¿El bono US10Y y el DXY no contradicen violentamente la dirección?',
      '¿El riesgo monetario está calculado a 0.25% - 0.50% de la cuenta?',
    ],
    entryChecklistEn: [
      'Are we inside the 9:45 AM - 11:15 AM NY or 2:00 PM - 3:00 PM NY window?',
      'Was there a clean liquidity sweep (Session High/Low, PDH/PDL, or Equal Highs/Lows)?',
      'Did the Market Structure Shift (MSS) leave a clean 5M or 15M FVG?',
      'Are US10Y yields and DXY aligned with the trade direction?',
      'Is monetary risk strictly sized at 0.25% - 0.50% of account balance?',
    ],
    keyLevelsEs: [
      'Pre-Market High / Low (08:00 – 09:29 AM NY)',
      'Previous Day High (PDH) & Previous Day Low (PDL)',
      'London Session High / Low (02:00 – 05:30 AM NY)',
      '50% Consequent Encroachment (CE) del FVG de 5M/15M',
    ],
    keyLevelsEn: [
      'Pre-Market High / Low (08:00 – 09:29 AM NY)',
      'Previous Day High (PDH) & Previous Day Low (PDL)',
      'London Session High / Low (02:00 – 05:30 AM NY)',
      '50% Consequent Encroachment (CE) of the 5M/15M FVG',
    ],
    avoidConditionsEs:
      'Evitar si el rango de 8:30 a 9:30 AM ya consumió más del 85% del ATR diario o en los 5 minutos previos a ISM / Michigan Sentiment (10:00 AM NY).',
    avoidConditionsEn:
      'Avoid if the 8:30–9:30 AM range already consumed >85% of daily ATR or within 5 minutes of 10:00 AM NY ISM / Consumer Sentiment releases.',
    invalidationEs:
      'Se invalida inmediatamente si una vela de 15M cierra con cuerpo completo por detrás del extremo del FVG o si el precio alcanza el 70% del recorrido al TP1 sin activar la orden Limit.',
    invalidationEn:
      'Invalidated immediately if a 15M candle closes with a full body beyond the distal FVG boundary, or if price reaches 70% of the way to TP1 without triggering the Limit order.',
    propFirmTipEs:
      'En NAS100 y US30 nunca entres en el minuto exacto 9:30:00 AM. Esperar a las 9:45 AM o 10:00 AM reduce en más de un 60% los stops por mechas de apertura.',
    propFirmTipEn:
      'On NAS100 and US30 never enter at 9:30:00 AM sharp. Waiting until 9:45 AM or 10:00 AM cuts opening-wick stop-outs by over 60%.',
    knowledgeBaseContent: `# Base Estratégica: ICT Silver Bullet & Apertura NY (PB-01)
- Activos Óptimos: NAS100, US500, US30, US2000, XAUUSD.
- Ventana Operativa Primaria: 09:45 AM a 11:00 AM NY (AM Silver Bullet) y 02:00 PM a 03:00 PM NY (PM Silver Bullet).
- Regla de Estructura: Identificar barrido de liquidez (Sweep de Pre-Mercado, Asian High/Low o PDH/PDL), esperar desplazamiento con cierre de cuerpo (MSS en 5M/15M) y programar entrada Limit en el 50% (Consequent Encroachment) del Fair Value Gap (FVG).
- Stop Loss: Detrás del extremo del barrido más colchón de volatilidad (0.15x ATR).
- Take Profit: TP1 en 1:1.8 R:R (cerrar 50% y mover a Break Even) y TP2 en 1:3.0 R:R sobre la piscina de liquidez opuesta.`,
  },
  {
    id: 'strat-london-judas-sweep',
    code: 'PB-02',
    nameEs: 'Barrido del Rango Asiático & Judas Swing (Londres / Europa)',
    nameEn: 'Asian Range Sweep & London Judas Swing (Europe Open)',
    subtitleEs: 'Captura de trampas del rango asiático en GER40, UK100, EU50, EURUSD y XAUUSD',
    subtitleEn: 'Capturing Asian range false breakouts on GER40, UK100, EU50, EURUSD, and XAUUSD',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'london',
    scheduleLabelEs: '02:00 – 05:30 NY • Apertura Frankfurt & London Killzone',
    scheduleLabelEn: '02:00 – 05:30 NY • Frankfurt Open & London Killzone',
    startHourNY: 2,
    endHourNY: 5.5,
    timeframes: '4H/1H (Tendencia) → 15M (Barrido Asia) → 5M (Confirmación)',
    bestSessionEs: '2:00 AM – 5:30 AM NY (Apertura Frankfurt/Londres)',
    bestSessionEn: '2:00 AM – 5:30 AM NY (Frankfurt/London Open)',
    bestAssets: ['GER40', 'UK100', 'EU50', 'FRA40', 'EURUSD', 'XAUUSD'],
    winRateEstimate: '72% - 79%',
    riskRewardTarget: '1:2.5 a 1:3.2',
    difficulty: 'Intermedio',
    summaryEs:
      'Durante la sesión asiática (7:00 PM – 2:00 AM NY) los índices europeos, el Euro y el Oro suelen consolidar en un rango estrecho acumulando órdenes Stop por encima del Asian High y por debajo del Asian Low. En la apertura de Frankfurt/Londres (2:00 AM – 3:30 AM NY), el algoritmo ejecuta una ruptura falsa (Judas Swing) para atrapar traders de ruptura y luego expande con fuerza hacia el lado opuesto.',
    summaryEn:
      'During the Asian session (7:00 PM – 2:00 AM NY), European indices, EURUSD, and Gold consolidate in a tight box accumulating buy stops above the Asian High and sell stops below the Asian Low. At the Frankfurt/London open (2:00 AM – 3:30 AM NY), price frequently performs a false breakout (Judas Swing) to trap breakout traders before expanding across the full range.',
    stepsEs: [
      'Traza el rectángulo del Rango Asiático entre las 7:00 PM y las 2:00 AM (Hora NY), marcando Asian High y Asian Low.',
      'Verifica el sesgo direccional de 4H y 1H: si la estructura macro es alcista, busca que Londres barra primero el Asian Low (descuento). Si es bajista, busca que barra primero el Asian High (premium).',
      'Espera el barrido de 5 a 25 puntos/pips por fuera del borde asiático y observa el reingreso inmediato dentro del rango con vela envolvente o FVG en 5M/15M.',
      'Entra en el retesteo del Order Block o FVG de reingreso.',
      'Primer objetivo (TP1): el extremo opuesto del rango asiático. Segundo objetivo (TP2): el PDH o PDL del día anterior.',
    ],
    stepsEn: [
      'Draw the Asian Range box from 7:00 PM to 2:00 AM NY time, marking Asian High and Asian Low.',
      'Check the 4H/1H directional bias: if bullish, look for London to sweep the Asian Low first (discount). If bearish, look for a sweep of the Asian High first (premium).',
      'Wait for a 5–25 point/pip sweep outside the Asian boundary followed by an energetic reclaim back inside the range leaving a 5M/15M FVG.',
      'Enter on the retest of the reclaim Order Block or FVG.',
      'First target (TP1): the opposite edge of the Asian range. Second target (TP2): Previous Day High (PDH) or Low (PDL).',
    ],
    entryChecklistEs: [
      '¿El rango asiático fue compacto (menor al 45% del ATR diario)?',
      '¿El precio barrió limpiamente el Asian High o Asian Low entre las 2:00 AM y las 4:30 AM NY?',
      '¿Cerró una vela de 5M/15M de vuelta dentro del rango con desplazamiento?',
      '¿No hay anuncio de tasas del BCE o BoE en los próximos 30 minutos?',
    ],
    entryChecklistEn: [
      'Was the Asian range compact (less than 45% of daily ATR)?',
      'Did price cleanly sweep the Asian High or Asian Low between 2:00 AM and 4:30 AM NY?',
      'Did a 5M/15M candle close back inside the range with displacement?',
      'Are the next 30 minutes clear of ECB or BoE rate decisions?',
    ],
    keyLevelsEs: [
      'Asian Session High & Asian Session Low (19:00 – 02:00 NY)',
      '50% Equilibrium del Rango Asiático',
      'Midnight NY Open (00:00 AM NYTrue Open Price)',
      'PDH / PDL Europeo (Xetra / LSE)',
    ],
    keyLevelsEn: [
      'Asian Session High & Asian Session Low (19:00 – 02:00 NY)',
      '50% Equilibrium of the Asian Range',
      'Midnight NY Open (00:00 AM NY True Open Price)',
      'European PDH / PDL (Xetra / LSE)',
    ],
    avoidConditionsEs:
      'No operar como reversión si Asia ya expandió más del 65% del ATR diario por noticias del BoJ o China.',
    avoidConditionsEn:
      'Do not fade if Asia already expanded >65% of daily ATR due to BoJ or China macro news.',
    invalidationEs:
      'Si tras perforar el rango asiático el precio acepta fuera con dos velas consecutivas de 15M de cuerpo amplio sin mechas de rechazo, es una expansión directa y no un Judas Swing.',
    invalidationEn:
      'If price breaks the Asian range and accepts outside with two consecutive wide-body 15M candles without rejection wicks, treat it as a true breakout rather than a Judas Swing.',
    propFirmTipEs:
      'En GER40 (DAX) y UK100 (FTSE), los movimientos más limpios del día ocurren entre las 3:00 AM y las 5:30 AM NY.',
    propFirmTipEn:
      'On GER40 (DAX) and UK100 (FTSE), the cleanest directional moves of the day happen between 3:00 AM and 5:30 AM NY.',
    knowledgeBaseContent: `# Base Estratégica: Barrido Asiático & Judas Swing Londres (PB-02)
- Activos Óptimos: GER40 (DAX), UK100 (FTSE), EU50, FRA40, EURUSD, XAUUSD.
- Ventana Operativa: 02:00 AM a 06:00 AM NY (Sesión Europea / Londres).
- Regla de Entrada: Marcar Asian High y Asian Low (7:00 PM - 2:00 AM NY). Esperar falso quiebre (Judas Swing) de uno de los extremos a favor de la estructura de 4H/1H, confirmar reingreso con FVG/Order Block en 5M/15M y buscar el extremo opuesto del rango asiático (TP1) y el PDH/PDL (TP2).`,
  },
  {
    id: 'strat-smt-divergence-indices',
    code: 'PB-03',
    nameEs: 'Divergencia SMT Institucional entre Índices (NAS100 / US500 / US30)',
    nameEn: 'Institutional SMT Divergence Across Indices (NAS100 / US500 / US30)',
    subtitleEs: 'Detección de acumulación o distribución institucional comparando índices hermanos',
    subtitleEn: 'Detecting institutional accumulation or distribution by comparing correlated indices',
    category: 'intermarket',
    categoryLabelEs: 'Correlación & Flujo Intermercado',
    categoryLabelEn: 'Correlation & Intermarket Flow',
    scheduleBlock: 'ny_open',
    scheduleLabelEs: '09:30 – 11:30 NY • Apertura Wall St & Confirmación Intermercado',
    scheduleLabelEn: '09:30 – 11:30 NY • Wall St Open & Intermarket Confirmation',
    startHourNY: 9.5,
    endHourNY: 11.5,
    timeframes: '1H / 15M (Detección SMT) → 5M (Ejecución)',
    bestSessionEs: '8:30 AM – 11:30 AM NY y 1:30 PM – 3:30 PM NY',
    bestSessionEn: '8:30 AM – 11:30 AM NY and 1:30 PM – 3:30 PM NY',
    bestAssets: ['NAS100', 'US500', 'US30', 'US2000', 'GER40', 'EU50'],
    winRateEstimate: '76% - 84%',
    riskRewardTarget: '1:2.8 a 1:3.5',
    difficulty: 'Avanzado',
    summaryEs:
      'Los índices correlacionados (NAS100, US500 y US30 en EE. UU.; o GER40 y EU50 en Europa) se mueven en sincronía bajo flujo normal. Cuando en un nivel clave de liquidez (PDH/PDL o máximo/mínimo de sesión) uno de los índices barre el extremo pero su índice hermano falla en romperlo, se produce una Divergencia SMT (Smart Money Technique): la huella inequívoca de que las instituciones están absorbiendo órdenes para girar el mercado.',
    summaryEn:
      'Correlated indices (NAS100, US500, and US30 in the US; or GER40 and EU50 in Europe) move in lockstep under normal conditions. When at a key liquidity level (PDH/PDL or session high/low) one index sweeps the extreme while its sibling index fails to break it, an SMT (Smart Money Technique) Divergence forms—confirming institutional absorption before a reversal.',
    stepsEs: [
      'Compara en paralelo NAS100, US500 y US30 cuando se acerquen al máximo o mínimo del día (o compara EURUSD vs DXY en sentido inverso).',
      'Para COMPRAS (SMT Alcista): Un índice perfora su mínimo previo (barre stops de venta), pero el otro índice hace un mínimo más alto (Higher Low). Elige para comprar el índice más fuerte (el que no rompió el mínimo).',
      'Para VENTAS (SMT Bajista): Un índice perfora su máximo previo (barre stops de compra), pero el otro hace un máximo más bajo (Lower High). Elige para vender el índice más débil (el que no pudo hacer nuevo máximo).',
      'Espera el quiebre de estructura en 5M/15M y entra en el retroceso al Order Block / FVG.',
    ],
    stepsEn: [
      'Compare NAS100, US500, and US30 side by side as they approach the daily high or low (or compare EURUSD inversely against DXY).',
      'For BUYS (Bullish SMT): One index sweeps its previous low, while the sibling index prints a Higher Low. Buy the stronger index (the one that held above its low).',
      'For SELLS (Bearish SMT): One index sweeps its previous high, while the sibling prints a Lower High. Sell the weaker index (the one that failed to make a new high).',
      'Wait for a 5M/15M structure break and enter on the Order Block / FVG pullback.',
    ],
    entryChecklistEs: [
      '¿La divergencia SMT ocurrió exactamente sobre un pool de liquidez relevante (PDH, PDL, Asia High/Low)?',
      '¿Estás comprando el activo relativamente más fuerte o vendiendo el relativamente más débil?',
      '¿Se confirmó el giro con cierre de vela en 5M o 15M?',
    ],
    entryChecklistEn: [
      'Did the SMT divergence occur right at a major liquidity pool (PDH, PDL, Asian High/Low)?',
      'Are you buying the relatively stronger index or selling the relatively weaker one?',
      'Is the reversal confirmed by a 5M or 15M candle close?',
    ],
    keyLevelsEs: [
      'Extremos homólogos en NAS100 vs US500 vs US30',
      'Extremos homólogos en GER40 vs EU50',
      'Divergencia inversa EURUSD vs DXY en niveles HTF',
    ],
    keyLevelsEn: [
      'Corresponding swing extremes on NAS100 vs US500 vs US30',
      'Corresponding swing extremes on GER40 vs EU50',
      'Inverse SMT between EURUSD and DXY at HTF pools',
    ],
    avoidConditionsEs:
      'No operar divergencias SMT en medio de un rango sin liquidez; la divergencia debe formarse barriendo un PDH/PDL o máximo/mínimo de sesión.',
    avoidConditionsEn:
      'Do not trade SMT divergences in the middle of a range; it must form while sweeping a PDH/PDL or session high/low.',
    invalidationEs:
      'Se invalida si el segundo índice termina rompiendo también su extremo con fuerza, eliminando la divergencia SMT.',
    invalidationEn:
      'Invalidated if the second index subsequently breaks through its extreme with momentum, canceling the SMT divergence.',
    propFirmTipEs:
      'Operar el índice que muestra fuerza relativa en compras (o debilidad relativa en ventas) mejora la tasa de acierto y reduce el drawdown flotante.',
    propFirmTipEn:
      'Trading the index with relative strength on longs (or relative weakness on shorts) significantly reduces floating drawdown.',
    knowledgeBaseContent: `# Base Estratégica: Divergencia SMT entre Índices y Activos (PB-03)
- Activos Óptimos: NAS100 vs US500 vs US30 | GER40 vs EU50 | EURUSD vs DXY (inverso).
- Regla de Selección: En giro alcista (Bullish SMT), comprar el índice que hizo un mínimo más alto mientras su par barrió el mínimo. En giro bajista (Bearish SMT), vender el índice que hizo un máximo más bajo mientras su par barrió el máximo.
- Confirmación: Quiebre de estructura en 5M/15M + retroceso al 50% del Order Block o FVG.`,
  },
  {
    id: 'strat-ote-orderblock-trend',
    code: 'PB-04',
    nameEs: 'Continuación Tendencial en Order Block 1H & Zona OTE (61.8% - 70.5%)',
    nameEn: 'Trend Continuation on 1H Order Block & OTE Zone (61.8% - 70.5%)',
    subtitleEs: 'Entradas a favor de la tendencia dominante tras retroceso a descuento/premium',
    subtitleEn: 'Pro-trend entries after a pullback into institutional discount or premium',
    category: 'ict_smc',
    categoryLabelEs: 'ICT / Smart Money',
    categoryLabelEn: 'ICT / Smart Money',
    scheduleBlock: 'london_close',
    scheduleLabelEs: '11:00 – 13:30 NY • Retroceso de Mediodía & Continuación OTE',
    scheduleLabelEn: '11:00 – 13:30 NY • Midday Pullback & OTE Continuation',
    startHourNY: 10.5,
    endHourNY: 14,
    timeframes: '4H (Tendencia) → 1H (Order Block + Fibonacci OTE) → 15M (Entrada)',
    bestSessionEs: 'Londres (3:00 AM – 7:00 AM NY) y Nueva York (10:30 AM – 2:00 PM NY)',
    bestSessionEn: 'London (3:00 AM – 7:00 AM NY) and New York (10:30 AM – 2:00 PM NY)',
    bestAssets: ['NAS100', 'US500', 'US30', 'GER40', 'UK100', 'JP225', 'XAUUSD', 'EURUSD'],
    winRateEstimate: '75% - 83%',
    riskRewardTarget: '1:3.0 a 1:4.0',
    difficulty: 'Intermedio',
    summaryEs:
      'La estrategia más consistente para cuentas de fondeo: no adivinar techos ni pisos, sino sumarse a una tendencia institucional clara de 4H/1H cuando hace su retroceso saludable hacia la zona Optimal Trade Entry (OTE: 61.8% - 70.5% de Fibonacci) en confluencia con un Order Block o FVG de 1H.',
    summaryEn:
      'The most consistent playbook for funded accounts: instead of picking tops or bottoms, join a clear 4H/1H institutional trend when it pulls back into the Optimal Trade Entry zone (OTE: 61.8% – 70.5% Fibonacci) overlapping a 1H Order Block or FVG.',
    stepsEs: [
      'Verifica en 4H y 1H una estructura claramente tendencial (máximos y mínimos crecientes tras un Break of Structure - BOS).',
      'Traza el Fibonacci desde el inicio del impulso (Swing Low) hasta el final del impulso (Swing High) en compras, o viceversa en ventas.',
      'Marca la zona entre el 50% (Equilibrio), 61.8% y 70.5% (OTE). Nunca compres en zona Premium (>50%) ni vendas en zona Descuento (<50%).',
      'Verifica que dentro de esa zona 61.8% - 70.5% exista un Order Block institucional o un FVG sin mitigar.',
      'Coloca la entrada en el 62% - 66% del retroceso con Stop Loss detrás del 79% o del extremo del Order Block (100%).',
      'Objetivo TP1 en el máximo/mínimo del impulso previo (0%) y TP2 en la extensión simétrica (-27% / -61.8%).',
    ],
    stepsEn: [
      'Confirm a clear 4H/1H trend with a fresh Break of Structure (BOS).',
      'Anchor Fibonacci from the impulse Swing Low to Swing High for longs (or Swing High to Swing Low for shorts).',
      'Highlight the 50% equilibrium and the 61.8% – 70.5% OTE zone. Never buy in Premium (>50%) or sell in Discount (<50%).',
      'Verify an unmitigated 1H/30M Order Block or FVG inside the OTE zone.',
      'Enter at the 62% – 66% retracement with Stop Loss beyond the 79% level or Order Block distal edge.',
      'Target TP1 at the prior swing high/low (0%) and TP2 at the -27% Fibonacci extension.',
    ],
    entryChecklistEs: [
      '¿Hubo un Break of Structure (BOS) claro en 1H o 4H?',
      '¿El precio retrocedió al menos más allá del 50% de equilibrio (Descuento para compras / Premium para ventas)?',
      '¿Coincide el nivel 61.8%-70.5% con un Order Block o FVG limpio?',
      '¿El ratio Riesgo/Beneficio hasta el alto/bajo previo es de al menos 1:2.0?',
    ],
    entryChecklistEn: [
      'Was there a clean 1H or 4H Break of Structure (BOS)?',
      'Has price pulled back past the 50% equilibrium (Discount for longs / Premium for shorts)?',
      'Does the 61.8%–70.5% OTE zone align with a clean Order Block or FVG?',
      'Is the Risk/Reward ratio to the prior swing extreme at least 1:2.0?',
    ],
    keyLevelsEs: [
      '50% Equilibrium del Dealing Range de 1H/4H',
      'Zona OTE (61.8% – 70.5% – 78.6% Fibonacci)',
      'Order Block 1H / 30M sin mitigar',
      'Extremo del Swing Previo (0% Fib) y Extensión -27%',
    ],
    keyLevelsEn: [
      '50% Equilibrium of the 1H/4H Dealing Range',
      'OTE Zone (61.8% – 70.5% – 78.6% Fibonacci)',
      'Unmitigated 1H / 30M Order Block',
      'Prior Swing Extreme (0% Fib) & -27% Extension',
    ],
    avoidConditionsEs:
      'Prohibido entrar si el retroceso ocurre con velas de momento violento que cierran sin mechas más allá del 79% de Fibonacci.',
    avoidConditionsEn:
      'Do not enter if the pullback arrives with violent wide-body momentum candles closing past the 79% Fibonacci level.',
    invalidationEs:
      'Se invalida si una vela de 1H cierra por debajo del origen del impulso (100% de Fibonacci), rompiendo la estructura tendencial.',
    invalidationEn:
      'Invalidated if a 1H candle closes beyond the impulse origin (100% Fibonacci), breaking the trend structure.',
    propFirmTipEs:
      'Comprar en descuento (<50% del rango) y vender en premium (>50% del rango) te permite usar Stops más cortos y multiplicar el lotaje sin aumentar el riesgo en dólares.',
    propFirmTipEn:
      'Buying in discount (<50% of range) and selling in premium (>50% of range) tightens your Stop Loss and improves R:R without increasing dollar risk.',
    knowledgeBaseContent: `# Base Estratégica: Order Block 1H & Retroceso OTE 61.8%-70.5% (PB-04)
- Activos Óptimos: Todos los índices CFD (NAS100, US500, US30, GER40, UK100, JP225), XAUUSD y EURUSD.
- Regla de Oro: Prohibido comprar en Premium (>50% del rango) o vender en Descuento (<50% del rango).
- Ejecución: Tras un Break of Structure (BOS) en 1H/4H, esperar retroceso a la zona OTE (61.8% - 70.5% Fibonacci) en confluencia con un Order Block o FVG. Stop Loss protegido detrás del Order Block; TP1 en el extremo del swing previo y TP2 en extensión -27%.`,
  },
  {
    id: 'strat-comex-gold-macro',
    code: 'PB-05',
    nameEs: 'Expansión COMEX & Correlación Tasas Reales (XAUUSD / US10Y / DXY)',
    nameEn: 'COMEX Expansion & Real Yields Correlation (XAUUSD / US10Y / DXY)',
    subtitleEs: 'Operativa especializada en Oro e Índices Tech guiada por bonos US10Y y Dólar',
    subtitleEn: 'Specialized Gold and Tech Index playbook driven by US10Y yields and DXY',
    category: 'intermarket',
    categoryLabelEs: 'Correlación & Flujo Intermercado',
    categoryLabelEn: 'Correlation & Intermarket Flow',
    scheduleBlock: 'ny_premarket',
    scheduleLabelEs: '08:00 – 09:30 NY • Apertura COMEX (8:20) & Macro US10Y/DXY',
    scheduleLabelEn: '08:00 – 09:30 NY • COMEX Open (8:20) & US10Y/DXY Macro Flow',
    startHourNY: 8,
    endHourNY: 10.5,
    timeframes: '1H (Correlación DXY/US10Y) → 15M/5M (Ejecución COMEX)',
    bestSessionEs: '8:20 AM – 10:30 AM NY (Apertura COMEX y Datos Macro EE. UU.)',
    bestSessionEn: '8:20 AM – 10:30 AM NY (COMEX Open & US Macro Releases)',
    bestAssets: ['XAUUSD', 'NAS100', 'EURUSD', 'US500'],
    winRateEstimate: '73% - 81%',
    riskRewardTarget: '1:2.5 a 1:3.5',
    difficulty: 'Avanzado',
    summaryEs:
      'El Oro (XAUUSD) y el Nasdaq 100 (NAS100) son extremadamente sensibles al rendimiento del bono del Tesoro a 10 años (US10Y) y al Índice Dólar (DXY). A las 8:20 AM NY abre el mercado de futuros COMEX y a las 8:30 AM salen los datos macro de EE. UU. Cuando DXY y US10Y caen al unísono tras una toma de liquidez, XAUUSD y NAS100 desarrollan las expansiones alcistas más limpias de la semana.',
    summaryEn:
      'Gold (XAUUSD) and Nasdaq 100 (NAS100) are heavily driven by the 10-Year US Treasury Yield (US10Y) and the US Dollar Index (DXY). At 8:20 AM NY the COMEX gold floor opens, followed by 8:30 AM US macro data. When DXY and US10Y drop together after a liquidity sweep, XAUUSD and NAS100 deliver the cleanest expansions of the week.',
    stepsEs: [
      'A las 8:15 AM NY verifica la dirección intradía del DXY y del rendimiento US10Y en la barra Macro de TRstudio.',
      'Si hubo noticia a las 8:30 AM NY (CPI, NFP, PPI, Ventas Minoristas), espera obligatoriamente 10 a 15 minutos hasta que la primera vela de 15M cierre (8:45 AM NY).',
      'Si DXY y US10Y rompen a la baja, busca en XAUUSD o NAS100 el barrido de un mínimo intradía (Stop Hunt de $4 a $8 en el Oro) y entra en compra al cerrar la vela de recuperación en 5M.',
      'Si DXY y US10Y rompen con fuerza al alza, busca ventas en XAUUSD o NAS100 tras el barrido del máximo pre-mercado.',
    ],
    stepsEn: [
      'At 8:15 AM NY check the intraday trend of DXY and the US10Y yield on the TRstudio Macro Bar.',
      'If an 8:30 AM NY release occurs (CPI, NFP, PPI, Retail Sales), wait 10–15 minutes until the 8:45 AM 15M candle closes.',
      'If DXY and US10Y break lower, look for XAUUSD or NAS100 to sweep an intraday low ($4–$8 stop hunt on Gold) and buy the 5M reclaim.',
      'If DXY and US10Y surge higher, look for shorts on XAUUSD or NAS100 after a pre-market high sweep.',
    ],
    entryChecklistEs: [
      '¿Están alineados DXY y US10Y en dirección inversa a tu operación en XAUUSD / EURUSD / NAS100?',
      '¿Ya pasaron al menos 10-15 minutos desde la noticia de carpeta roja de las 8:30 AM NY?',
      '¿El Stop Loss en XAUUSD contempla el colchón institucional de $4.00 a $6.50 (40-65 pips)?',
    ],
    entryChecklistEn: [
      'Are DXY and US10Y moving inversely to your XAUUSD / EURUSD / NAS100 trade?',
      'Have at least 10–15 minutes passed since any 8:30 AM NY red-folder release?',
      'Does your XAUUSD Stop Loss include a $4.00 to $6.50 (40–65 pip) volatility buffer?',
    ],
    keyLevelsEs: [
      'Precio de Apertura COMEX (08:20 AM NY)',
      'London Fix / Extremos de Londres en XAUUSD',
      'Niveles intradía de US10Y y DXY',
    ],
    keyLevelsEn: [
      'COMEX Pit Open Price (08:20 AM NY)',
      'London Fix / London Session High & Low on XAUUSD',
      'Intraday structure on US10Y Yields and DXY',
    ],
    avoidConditionsEs:
      'Evitar cuando el Oro y el DXY suben simultáneamente por pánico geopolítico extremo (rompiendo la correlación habitual de tasas).',
    avoidConditionsEn:
      'Avoid when Gold and DXY rally simultaneously due to geopolitical shock (breaking normal yield correlation).',
    invalidationEs:
      'Se invalida si el bono US10Y revierte violentamente y rompe su extremo opuesto del día.',
    invalidationEn:
      'Invalidated if the US10Y yield reverses sharply and breaks its opposing daily extreme.',
    propFirmTipEs:
      'En XAUUSD recuerda que 1 Lote Estándar = 100 onzas ($100 USD por cada $1.00 de movimiento en el precio). Usa siempre la Calculadora de Lotes antes de enviar la orden.',
    propFirmTipEn:
      'On XAUUSD remember that 1 Standard Lot = 100 oz ($100 USD per $1.00 price move). Always verify lot size in the Calculator before executing.',
    knowledgeBaseContent: `# Base Estratégica: Expansión COMEX & Flujo Macro US10Y/DXY (PB-05)
- Activos Óptimos: XAUUSD (Oro), NAS100, EURUSD, US500.
- Ventana Clave: 08:20 AM NY (Apertura COMEX) a 11:00 AM NY.
- Regla Intermercado: DXY bajista + US10Y bajista = Confluencia máxima para COMPRAS en XAUUSD, EURUSD y NAS100. DXY alcista + US10Y alcista = Confluencia máxima para VENTAS.
- Regla de Noticias (8:30 AM NY): Prohibido entrar durante el primer minuto de la noticia; esperar el barrido de liquidez (8:30 - 8:45 AM) y entrar en el FVG posterior.`,
  },
  {
    id: 'strat-vwap-liquidity-reversion',
    code: 'PB-06',
    nameEs: 'Reversión Institucional desde Extremos PDH/PDL & Agotamiento ATR',
    nameEn: 'Institutional Reversion from PDH/PDL Extremes & ATR Exhaustion',
    subtitleEs: 'Captura de giros de alta precisión cuando el activo agota su rango diario (ATR)',
    subtitleEn: 'High-precision reversals when an index exhausts its daily ATR at PDH/PDL',
    category: 'mean_reversion',
    categoryLabelEs: 'Reversión a la Media & Liquidez',
    categoryLabelEn: 'Mean Reversion & Liquidity',
    scheduleBlock: 'london_close',
    scheduleLabelEs: '11:00 – 13:30 NY • Cierre Europeo (London Close) & Toma de Ganancias',
    scheduleLabelEn: '11:00 – 13:30 NY • European Close (London Close) & Profit Taking',
    startHourNY: 11,
    endHourNY: 13.5,
    timeframes: '1H (PDH/PDL + ATR) → 15M (Rechazo) → 5M (CHoCH)',
    bestSessionEs: '11:00 AM – 1:00 PM NY (Reversión del Cierre Europeo / London Close)',
    bestSessionEn: '11:00 AM – 1:00 PM NY (London Close Reversal Window)',
    bestAssets: ['US30', 'US500', 'GER40', 'UK100', 'JP225', 'HK50', 'EURUSD'],
    winRateEstimate: '71% - 78%',
    riskRewardTarget: '1:2.2 a 1:3.0',
    difficulty: 'Avanzado',
    summaryEs:
      'Cuando un índice o par de divisas ya recorrió entre el 85% y el 110% de su ATR diario y perfora el Máximo del Día Anterior (PDH) o el Mínimo del Día Anterior (PDL) cerca del cierre europeo (10:30 - 11:30 AM NY), las instituciones toman ganancias masivas provocando un giro rápido hacia el punto medio (50% de equilibrio) del día.',
    summaryEn:
      'When an index or FX pair has already traveled 85%–110% of its daily ATR and sweeps the Previous Day High (PDH) or Low (PDL) around the European close (10:30 – 11:30 AM NY), institutional profit-taking triggers a sharp snap-back toward the intraday 50% equilibrium.',
    stepsEs: [
      'Verifica que el precio haya barrido el PDH (para venta) o el PDL (para compra) tras un movimiento extendido.',
      'Confirma agotamiento: mecha larga de rechazo en 15M y cierre de vuelta por dentro del nivel PDH/PDL.',
      'Espera el primer Change of Character (CHoCH) en 5M con creación de un FVG inverso.',
      'Coloca Stop Loss por detrás de la mecha máxima del barrido y apunta el TP1 al 50% del rango intradía.',
    ],
    stepsEn: [
      'Verify that price has swept PDH (for shorts) or PDL (for longs) after an extended intraday run.',
      'Confirm exhaustion: long rejection wick on 15M and a candle body close back inside the PDH/PDL level.',
      'Wait for a 5M Change of Character (CHoCH) that creates an opposing FVG.',
      'Place Stop Loss beyond the sweep extreme wick and target the 50% intraday midpoint for TP1.',
    ],
    entryChecklistEs: [
      '¿El precio barrió un nivel mayor (PDH, PDL o extremo semanal) y cerró de nuevo por dentro?',
      '¿Ya se consumió más del 80% del ATR habitual del activo?',
      '¿Hubo quiebre de microestructura (CHoCH) en 5M antes de entrar (nunca entrar a ciegas sin confirmación)?',
    ],
    entryChecklistEn: [
      'Did price sweep a major level (PDH, PDL, or weekly extreme) and close back inside?',
      'Has the asset already consumed over 80% of its average daily ATR?',
      'Did a 5M Change of Character (CHoCH) confirm the turn before entering?',
    ],
    keyLevelsEs: [
      'Previous Day High (PDH) y Previous Day Low (PDL)',
      'Proyección 100% del ATR Diario (14 periodos)',
      'VWAP Intradía y Punto Medio 50% de la Sesión',
    ],
    keyLevelsEn: [
      'Previous Day High (PDH) and Previous Day Low (PDL)',
      '100% Daily ATR (14-period) Exhaustion Projection',
      'Intraday VWAP & 50% Session Midpoint',
    ],
    avoidConditionsEs:
      'No operar en días de tendencia unidireccional post-FOMC o CPI donde el índice cierra en máximos/mínimos sin retroceder.',
    avoidConditionsEn:
      'Do not fade on runaway trend days post-FOMC or CPI where indices close at extremes without mean reverting.',
    invalidationEs:
      'No operar esta estrategia en días de tendencia macro desbocada post-FOMC o post-NFP donde el precio expande sin retroceder.',
    invalidationEn:
      'Do not trade counter-trend reversions on runaway trend days right after FOMC or NFP surprises.',
    propFirmTipEs:
      'En operaciones de reversión usa siempre la mitad de tu riesgo habitual (ej. 0.25% en vez de 0.50%) y asegura parciales rápido en el equilibrio del rango.',
    propFirmTipEn:
      'On counter-trend reversion setups use half your standard risk (e.g. 0.25% instead of 0.50%) and lock in partials at the intraday midpoint.',
    knowledgeBaseContent: `# Base Estratégica: Reversión en PDH/PDL por Agotamiento de ATR (PB-06)
- Activos Óptimos: US30, US500, GER40, UK100, JP225, HK50, EURUSD.
- Condición: El precio barre el PDH o PDL habiendo recorrido >80% de su ATR diario y rechaza volviendo a cerrar dentro del rango previo.
- Gatillo: Confirmar CHoCH en 5M/15M + FVG de giro. Objetivo TP1 en el 50% de equilibrio del día.`,
  },
  {
    id: 'strat-tokyo-open-expansion',
    code: 'PB-07',
    nameEs: 'Apertura de Tokio & Expansión Asiática (JP225 / HK50 / XAUUSD)',
    nameEn: 'Tokyo Open & Asian Liquidity Expansion (JP225 / HK50 / XAUUSD)',
    subtitleEs: 'Barrido del rango pre-Tokio (19:00 - 20:00 NY) + impulso Nikkei/Hang Seng y Oro',
    subtitleEn: 'Pre-Tokyo range sweep (7:00 - 8:00 PM NY) + Nikkei/Hang Seng & Gold impulse',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'asia',
    scheduleLabelEs: '19:00 – 22:30 NY • Apertura Bolsa de Tokio (TSE) & Hong Kong',
    scheduleLabelEn: '19:00 – 22:30 NY • Tokyo Stock Exchange (TSE) & HK Open',
    startHourNY: 19,
    endHourNY: 22.5,
    timeframes: '1H (Sesgo NY Cierre) → 15M (Rango Inicial Tokio) → 5M (FVG Entrada)',
    bestSessionEs: '7:00 PM – 10:30 PM NY (19:00 – 22:30 NY • Apertura Tokio y Hong Kong)',
    bestSessionEn: '7:00 PM – 10:30 PM NY (19:00 – 22:30 NY • Tokyo & Hong Kong Open)',
    bestAssets: ['JP225', 'HK50', 'XAUUSD', 'NAS100'],
    winRateEstimate: '72% - 79%',
    riskRewardTarget: '1:2.4 a 1:3.2',
    difficulty: 'Intermedio',
    summaryEs:
      'Diseñada para traders que operan en horario nocturno de América (7:00 PM – 10:30 PM NY). La apertura de la Bolsa de Tokio (TSE a las 19:00/20:00 NY según horario estacional) y la apertura de Hong Kong (21:30 NY) inyectan liquidez institucional directa en el Nikkei 225 (JP225), Hang Seng (HK50) y el Oro (XAUUSD). El precio barre el micro-rango post-cierre de Wall Street y expande en la dirección del flujo del Yen (USDJPY) y de los futuros asiáticos.',
    summaryEn:
      'Engineered for traders active during the US evening (7:00 PM – 10:30 PM NY). The Tokyo Stock Exchange open (19:00/20:00 NY) and Hong Kong open (21:30 NY) inject institutional volume directly into the Nikkei 225 (JP225), Hang Seng (HK50), and Gold (XAUUSD). Price sweeps the post-Wall Street dead-zone range and expands in sync with USDJPY and Asian equity flows.',
    stepsEs: [
      'Espera a que termine el Rollover bancario (5:00 PM – 6:30 PM NY) donde los spreads están ampliados.',
      'Marca el alto y bajo del rango de pre-apertura asiática (6:00 PM – 7:55 PM NY) y el cierre de la sesión de Nueva York.',
      'En la apertura de Tokio (7:00 PM / 8:00 PM NY) o Hong Kong (9:30 PM NY), identifica un barrido de liquidez de uno de los bordes seguido de una vela de desplazamiento en 5M/15M.',
      'Verifica en JP225 la correlación con USDJPY (Yen débil / USDJPY alcista impulsa a los exportadores del Nikkei 225 al alza).',
      'Entra en el retroceso al 50% del FVG o Order Block de 5M con Stop Loss detrás de la mecha del barrido.',
      'Toma parciales en 1:1.8 R:R y deja correr el resto hasta las 10:30 PM NY.',
    ],
    stepsEn: [
      'Wait for the daily bank rollover window (5:00 PM – 6:30 PM NY) to finish so spreads normalize.',
      'Mark the pre-Tokyo high and low (6:00 PM – 7:55 PM NY) along with the NY Cash Close level.',
      'At the Tokyo open (7:00/8:00 PM NY) or Hong Kong open (9:30 PM NY), spot a liquidity sweep of one boundary followed by a 5M/15M displacement candle.',
      'For JP225, check USDJPY correlation (a rising USDJPY supports Nikkei 225 exporters).',
      'Enter on the 50% FVG or 5M Order Block pullback with Stop Loss beyond the sweep wick.',
      'Scale out 50% at 1:1.8 R:R and trail the remainder until 10:30 PM NY.',
    ],
    entryChecklistEs: [
      '¿Ya pasaron las 6:45 PM NY y el spread del broker volvió a su nivel normal post-rollover?',
      '¿Hubo barrido claro del máximo o mínimo pre-Tokio con cierre de cuerpo (MSS) en 5M?',
      '¿En JP225 acompaña la dirección del par USDJPY (o PBoC/Tech China en HK50)?',
      '¿No hay anuncio sorpresa del Banco de Japón (BoJ) en los próximos 15 minutos?',
    ],
    entryChecklistEn: [
      'Is it past 6:45 PM NY with broker spreads fully normalized after rollover?',
      'Did price sweep the pre-Tokyo high/low and print a 5M Market Structure Shift (MSS)?',
      'Does USDJPY confirm the direction for JP225 (or China tech sentiment for HK50)?',
      'Is the calendar clear of Bank of Japan (BoJ) rate announcements in the next 15 minutes?',
    ],
    keyLevelsEs: [
      'Rango Pre-Tokio (18:00 – 19:55 NY)',
      'NY Cash Close Gap (16:00 PM NY)',
      'Máximo y Mínimo de la Sesión Asiática Previa',
    ],
    keyLevelsEn: [
      'Pre-Tokyo Range High & Low (18:00 – 19:55 NY)',
      'NY Cash Close Gap Level (16:00 PM NY)',
      'Previous Asian Session High & Low',
    ],
    avoidConditionsEs:
      'Nunca abrir órdenes entre las 17:00 y las 18:15 NY (Rollover bancario) ni operar índices europeos (GER40/UK100) en horario asiático.',
    avoidConditionsEn:
      'Never execute between 17:00 and 18:15 NY (Bank Rollover spread widening) and do not trade European indices during Asia.',
    invalidationEs:
      'Se invalida si tras 45 minutos de la apertura de Tokio el volumen cae y el precio reingresa al centro del rango sin desplazamiento.',
    invalidationEn:
      'Invalidated if volume dries up 45 minutes after the Tokyo open and price drifts back into the middle of the box.',
    propFirmTipEs:
      'En JP225 (Nikkei) y HK50 (Hang Seng) la sesión asiática es su mercado nativo en efectivo: ofrecen recorridos limpios de 250 a 450 puntos mientras EE. UU. duerme.',
    propFirmTipEn:
      'For JP225 (Nikkei) and HK50 (Hang Seng), the Asian hours are their native cash session—delivering clean 250–450 point trends while the US sleeps.',
    knowledgeBaseContent: `# Base Estratégica: Apertura de Tokio & Expansión Asiática (PB-07)
- Activos Óptimos: JP225 (Nikkei 225), HK50 (Hang Seng), XAUUSD (Oro), NAS100.
- Ventana Operativa: 19:00 a 22:30 NY (Apertura Tokio y Hong Kong).
- Regla de Ejecución: Esperar normalización de spreads post-rollover (después de 18:45 NY). Marcar rango pre-Tokio, esperar barrido de liquidez en apertura de Tokio (19:00/20:00 NY) o HK (21:30 NY) y entrar en el FVG de 5M.`,
  },
  {
    id: 'strat-asian-range-liquidity-box',
    code: 'PB-08',
    nameEs: 'Acumulación Asiática Tardía & Trampa Pre-Frankfurt (22:30 - 02:00 NY)',
    nameEn: 'Late Asian Accumulation & Pre-Frankfurt Liquidity Trap (22:30 - 02:00 NY)',
    subtitleEs: 'Operativa de rango al Valor Justo (VWAP) en Asia tardía y preparación del barrido de las 00:00 NY',
    subtitleEn: 'Late Asian mean-reversion to VWAP and Midnight NY Open (00:00) liquidity positioning',
    category: 'mean_reversion',
    categoryLabelEs: 'Reversión a la Media & Liquidez',
    categoryLabelEn: 'Mean Reversion & Liquidity',
    scheduleBlock: 'asia',
    scheduleLabelEs: '22:30 – 02:00 NY • Cierre Asiático, Midnight Open (00:00) & Pre-Frankfurt',
    scheduleLabelEn: '22:30 – 02:00 NY • Late Asia, Midnight Open (00:00) & Pre-Frankfurt',
    startHourNY: 22.5,
    endHourNY: 2,
    timeframes: '1H (Caja Asiática) → 15M (Midnight Open 00:00 NY) → 5M (Reversión al 50%)',
    bestSessionEs: '10:30 PM – 2:00 AM NY (22:30 – 02:00 NY • Transición Asia a Pre-Europa)',
    bestSessionEn: '10:30 PM – 2:00 AM NY (22:30 – 02:00 NY • Late Asia to Pre-Europe Transition)',
    bestAssets: ['XAUUSD', 'EURUSD', 'JP225', 'GER40'],
    winRateEstimate: '70% - 77%',
    riskRewardTarget: '1:2.0 a 1:2.8',
    difficulty: 'Avanzado',
    summaryEs:
      'Entre las 10:30 PM y las 2:00 AM NY el mercado entra en fase de compresión algorítmica (Power of 3: Acumulación) antes de la apertura de Frankfurt. A las 00:00 AM (Medianoche de Nueva York) se fija el precio institucional de referencia del día (Midnight True Open). Esta estrategia aprovecha las desviaciones falsas fuera de la caja asiática alrededor de la medianoche NY para operar el retorno al equilibrio o posicionarse antes de Londres.',
    summaryEn:
      'Between 10:30 PM and 2:00 AM NY, price enters algorithmic compression (Power of 3: Accumulation) ahead of Frankfurt. At 00:00 AM (New York Midnight), the institutional True Day Open price is anchored. This strategy fades false deviations outside the Asian box around Midnight NY back toward equilibrium or positions early for the London expansion.',
    stepsEs: [
      'A las 00:00 AM NY traza la línea horizontal del Precio de Apertura de Medianoche (NY Midnight Open).',
      'Identifica los bordes del rango acumulado desde las 7:00 PM hasta las 11:30 PM NY.',
      'Si entre las 11:30 PM y la 1:30 AM NY el precio barre por 5–15 pips el extremo del rango asiático y forma un CHoCH en 5M volviendo a entrar a la caja, ejecuta entrada hacia el 50% del rango y el Midnight Open.',
      'Cierra el 80% de la posición antes de las 1:55 AM NY (justo antes de la apertura de Frankfurt a las 2:00 AM NY).',
    ],
    stepsEn: [
      'At 00:00 AM NY, plot the horizontal New York Midnight Open reference line.',
      'Mark the high and low of the Asian box formed between 7:00 PM and 11:30 PM NY.',
      'If between 11:30 PM and 1:30 AM NY price sweeps the box boundary by 5–15 pips and prints a 5M CHoCH back inside, enter targeting the 50% midpoint and Midnight Open.',
      'Close 80% of the position before 1:55 AM NY (ahead of the 2:00 AM NY Frankfurt volatility spike).',
    ],
    entryChecklistEs: [
      '¿Está trazado el nivel exacto de las 00:00 AM (Midnight Open NY)?',
      '¿Hubo rechazo claro (mecha + CHoCH 5M) tras barrer el borde de la caja asiática?',
      '¿Quedan al menos 30 minutos antes de las 2:00 AM NY (apertura de Frankfurt)?',
    ],
    entryChecklistEn: [
      'Is the exact 00:00 AM (NY Midnight Open) horizontal level plotted?',
      'Was there a clean rejection (wick + 5M CHoCH) after sweeping the Asian box edge?',
      'Are there at least 30 minutes remaining before the 2:00 AM NY Frankfurt open?',
    ],
    keyLevelsEs: [
      '00:00 AM NY Midnight True Open',
      'Asian Box High & Low (19:00 – 23:30 NY)',
      'VWAP de la Sesión Asiática',
    ],
    keyLevelsEn: [
      '00:00 AM NY Midnight True Open',
      'Asian Box High & Low (19:00 – 23:30 NY)',
      'Asian Session VWAP',
    ],
    avoidConditionsEs:
      'No buscar reversiones cortas de rango si el activo rompió con volumen por intervención cambiaria o noticias de China.',
    avoidConditionsEn:
      'Do not play range mean-reversion if a high-volume breakout is underway from China macro data or FX intervention.',
    invalidationEs:
      'Se invalida inmediatamente si una vela de 15M cierra con cuerpo completo por fuera de la caja asiática.',
    invalidationEn:
      'Invalidated immediately if a 15M candle closes with a full body outside the Asian accumulation box.',
    propFirmTipEs:
      'La línea de las 00:00 AM NY (Midnight Open) es el filtro más poderoso para toda tu jornada: comprar por debajo de las 00:00 NY en días alcistas y vender por encima de las 00:00 NY en días bajistas.',
    propFirmTipEn:
      'The 00:00 AM NY Midnight Open line is the strongest filter for the entire day: buy below 00:00 NY on bullish days and sell above 00:00 NY on bearish days.',
    knowledgeBaseContent: `# Base Estratégica: Acumulación Asiática & Midnight Open 00:00 NY (PB-08)
- Activos Óptimos: XAUUSD, EURUSD, JP225, GER40.
- Ventana Operativa: 22:30 PM a 02:00 AM NY.
- Nivel Clave Institucional: Precio de apertura de las 00:00 AM Hora Nueva York (NY Midnight Open).`,
  },
  {
    id: 'strat-frankfurt-dax-orb',
    code: 'PB-09',
    nameEs: 'Opening Range Breakout (ORB) Frankfurt/DAX + FVG 5M (GER40 / EU50 / UK100)',
    nameEn: 'Frankfurt/DAX Opening Range Breakout (ORB) + 5M FVG (GER40 / EU50 / UK100)',
    subtitleEs: 'Expansión direccional de la apertura europea Xetra/LSE (2:00 - 4:30 AM NY)',
    subtitleEn: 'Directional European Xetra/LSE cash open expansion (2:00 - 4:30 AM NY)',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'london',
    scheduleLabelEs: '02:00 – 04:30 NY • Apertura Xetra (DAX) & Bolsa de Londres (LSE)',
    scheduleLabelEn: '02:00 – 04:30 NY • Xetra (DAX) & London Stock Exchange (LSE) Open',
    startHourNY: 2,
    endHourNY: 4.5,
    timeframes: '1H (Sesgo Europeo) → 15M (Rango ORB 02:00-03:15 NY) → 5M (Pullback FVG)',
    bestSessionEs: '2:00 AM – 4:30 AM NY (Apertura Frankfurt 2:00 AM y Xetra/Londres 3:00 AM NY)',
    bestSessionEn: '2:00 AM – 4:30 AM NY (Frankfurt 2:00 AM & Xetra/London Cash Open 3:00 AM NY)',
    bestAssets: ['GER40', 'EU50', 'UK100', 'FRA40', 'EURUSD'],
    winRateEstimate: '74% - 81%',
    riskRewardTarget: '1:2.5 a 1:3.5',
    difficulty: 'Intermedio',
    summaryEs:
      'Cuando en la apertura de Frankfurt (2:00 AM NY) y la apertura de acciones en efectivo Xetra/Londres (3:00 AM NY) el DAX (GER40) o el FTSE (UK100) no hacen un falso quiebre hacia adentro, sino que rompen el rango de los primeros 15 minutos con desplazamiento institucional y volumen, esta estrategia captura la onda de expansión europea entrando en el primer retroceso al FVG de 5M.',
    summaryEn:
      'When at the Frankfurt futures open (2:00 AM NY) and the Xetra/London cash equity open (3:00 AM NY) the DAX (GER40) or FTSE (UK100) breaks the initial 15-minute Opening Range with institutional displacement, this playbook captures the European trend wave on the first 5M FVG pullback.',
    stepsEs: [
      'Marca la primera vela de 15M de la apertura de Frankfurt (2:00 – 2:15 AM NY) o de la apertura en efectivo Xetra (3:00 – 3:15 AM NY).',
      'Verifica si el precio barre primero un extremo del rango de 15M (manipulación rápida) y luego rompe el extremo opuesto con cuerpo completo en 5M dejando un FVG.',
      'Confirma que GER40 y EU50 estén rompiendo en la misma dirección (sin divergencia en contra).',
      'Coloca orden Limit en el extremo proximal del FVG de 5M o sobre el borde roto del ORB (Break & Retest).',
      'Stop Loss detrás del punto medio (50%) del rango ORB; TP1 en 1.5x la altura de la caja ORB y TP2 en 2.5x–3.0x.',
    ],
    stepsEn: [
      'Mark the first 15M candle of the Frankfurt open (2:00 – 2:15 AM NY) or the Xetra cash open (3:00 – 3:15 AM NY).',
      'Wait for a decisive 5M candle body breakout of the 15M Opening Range that leaves a clean Fair Value Gap (FVG).',
      'Confirm that GER40 and EU50 are breaking in the same direction.',
      'Place a Limit order at the 5M FVG or the broken ORB boundary (Break & Retest).',
      'Stop Loss behind the 50% midpoint of the ORB box; TP1 at 1.5x ORB height and TP2 at 2.5x–3.0x.',
    ],
    entryChecklistEs: [
      '¿La vela de ruptura en 5M cerró con cuerpo firme fuera del rango de apertura (no solo mecha)?',
      '¿Dejó un Fair Value Gap (FVG) claro al romper el borde del ORB?',
      '¿GER40, EU50 y UK100 muestran alineación direccional?',
      '¿La altura de la caja ORB es moderada (permitiendo un Stop Loss ajustado)?',
    ],
    entryChecklistEn: [
      'Did the 5M breakout candle close firmly outside the Opening Range with a solid body?',
      'Did the breakout leave a clean Fair Value Gap (FVG) across the ORB boundary?',
      'Are GER40, EU50, and UK100 aligned in the same direction?',
      'Is the ORB box height reasonable so the Stop Loss remains tight?',
    ],
    keyLevelsEs: [
      'ORB High & ORB Low (02:00–02:15 AM o 03:00–03:15 AM NY)',
      '50% Midpoint de la Caja ORB (Nivel de Invalidación)',
      'Gap de Cierre Xetra del Día Anterior (11:30 AM NY previo)',
    ],
    keyLevelsEn: [
      'ORB High & ORB Low (02:00–02:15 AM or 03:00–03:15 AM NY)',
      '50% Midpoint of the ORB Box (Invalidation Level)',
      'Previous Day Xetra Cash Close Gap (11:30 AM NY prior)',
    ],
    avoidConditionsEs:
      'Si la primera vela de 15M mide más de 120 puntos en GER40 (demasiado extendida), no operes la ruptura directa; espera retroceso al 50%.',
    avoidConditionsEn:
      'If the initial 15M candle exceeds 120 points on GER40 (overextended), do not chase the breakout; wait for a 50% pullback.',
    invalidationEs:
      'Se invalida si tras activar la entrada una vela de 5M/15M vuelve a cerrar por detrás del 50% de la caja ORB.',
    invalidationEn:
      'Invalidated if after entry a 5M/15M candle closes back past the 50% midpoint of the ORB box.',
    propFirmTipEs:
      'El DAX (GER40) suele definir la tendencia de toda la mañana europea entre las 3:00 AM y las 3:45 AM NY (apertura de acciones en Frankfurt).',
    propFirmTipEn:
      'The DAX (GER40) regularly sets the entire European morning trend between 3:00 AM and 3:45 AM NY (Frankfurt cash equity open).',
    knowledgeBaseContent: `# Base Estratégica: ORB Frankfurt/DAX + FVG 5M (PB-09)
- Activos Óptimos: GER40 (DAX), EU50 (Euro Stoxx 50), UK100 (FTSE 100), FRA40, EURUSD.
- Ventana Operativa: 02:00 AM a 04:30 AM NY.
- Regla de Ejecución: Marcar rango de los primeros 15 minutos de apertura (2:00-2:15 AM o 3:00-3:15 AM NY), esperar ruptura con cuerpo + FVG en 5M y entrar en el retesteo con Stop Loss en el 50% del ORB.`,
  },
  {
    id: 'strat-red-folder-830-reclaim',
    code: 'PB-10',
    nameEs: 'Barrido Post-Noticia Carpeta Roja 08:30 AM (CPI / NFP Reclaim 08:45 AM)',
    nameEn: '08:30 AM Red-Folder Post-News Sweep (CPI / NFP 08:45 AM Reclaim)',
    subtitleEs: 'Captura del movimiento real a las 08:45 AM tras el latigazo algorítmico de las 08:30 AM NY',
    subtitleEn: 'Capturing the true 08:45 AM macro trend after the 08:30 AM NY algorithmic stop-hunt whip',
    category: 'prop_risk',
    categoryLabelEs: 'Protocolo Noticias & Fondeo',
    categoryLabelEn: 'News Protocol & Prop Risk',
    scheduleBlock: 'ny_premarket',
    scheduleLabelEs: '08:30 – 09:25 NY • Datos Macro EE. UU. (CPI, NFP, PPI, Jobless Claims)',
    scheduleLabelEn: '08:30 – 09:25 NY • US Macro Releases (CPI, NFP, PPI, Jobless Claims)',
    startHourNY: 8.5,
    endHourNY: 9.45,
    timeframes: '15M (Vela 08:30-08:45 NY) → 5M (CHoCH + FVG Post-Barrido) → 1M (Precisión)',
    bestSessionEs: '8:40 AM – 9:25 AM NY (10 a 15 minutos después de la publicación de las 8:30 AM)',
    bestSessionEn: '8:40 AM – 9:25 AM NY (10 to 15 minutes after the 8:30 AM data release)',
    bestAssets: ['NAS100', 'US500', 'US30', 'XAUUSD', 'EURUSD'],
    winRateEstimate: '75% - 83%',
    riskRewardTarget: '1:2.5 a 1:3.5',
    difficulty: 'Institucional',
    summaryEs:
      'En el segundo exacto de las 08:30:00 AM NY (cuando salen CPI, NFP, PPI, PIB o Peticiones de Subsidio), los algoritmos de alta frecuencia suelen disparar primero una mecha falsa para barrer la liquidez pre-noticia antes de desarrollar la tendencia real. Además, muchas empresas de fondeo prohíben ejecutar 2 a 5 minutos antes y después del evento. Esta estrategia espera el cierre de las 08:40 / 08:45 AM NY para entrar con deslizamiento cero (0 slippage) y dirección confirmada.',
    summaryEn:
      'At 08:30:00 AM NY sharp (CPI, NFP, PPI, GDP, or Jobless Claims), high-frequency algorithms routinely fire an initial fakeout wick to clear pre-news liquidity before establishing the true move. Moreover, many prop firms restrict execution within 2–5 minutes of red-folder releases. This playbook waits until 08:40 / 08:45 AM NY to enter with zero slippage and confirmed institutional direction.',
    stepsEs: [
      'A las 08:25 AM NY marca el máximo y mínimo del rango de espera pre-noticia (07:30 – 08:29 AM NY) y mantente 100% fuera del mercado.',
      'Deja que a las 08:30 AM NY ocurra el latigazo inicial. Observa qué extremo (alto o bajo pre-noticia) es barrido por la mecha de los primeros 5 a 10 minutos.',
      'A las 08:40 – 08:45 AM NY (ya fuera de la ventana de restricción de Prop Firms y con spreads normales), verifica si el precio revirtió la mecha inicial creando un desplazamiento + FVG en 5M.',
      'Confirma la reacción real del bono US10Y tras asentarse el dato (si US10Y cae tras el susto inicial, prioriza compras en NAS100/XAUUSD).',
      'Entra en el 50% del FVG de 5M con Stop Loss detrás de la mecha de las 08:30 AM y toma ganancias antes de las 09:25 AM NY (antes de la apertura de Wall Street).',
    ],
    stepsEn: [
      'At 08:25 AM NY, mark the pre-news holding range high and low (07:30 – 08:29 AM NY) and stay 100% flat.',
      'Let the 08:30 AM NY whip unfold. Note which pre-news boundary is swept by the initial 5–10 minute spike.',
      'By 08:40 – 08:45 AM NY (outside prop-firm news blackout windows and with normal spreads), check if price reversed the initial spike with a 5M displacement + FVG.',
      'Confirm the settled direction of the US10Y yield after the knee-jerk reaction.',
      'Enter at the 50% 5M FVG with Stop Loss beyond the 08:30 AM spike wick and lock in profits before 09:25 AM NY (ahead of the 9:30 cash open).',
    ],
    entryChecklistEs: [
      '¿Ya pasaron al menos 10 minutos desde las 08:30:00 AM NY (cumpliendo la regla de noticias de Prop Firms)?',
      '¿La mecha de las 08:30 AM barrió un pool de liquidez y cerró de nuevo con cuerpo en 5M?',
      '¿El spread actual volvió a su valor estándar sin deslizamiento?',
      '¿El rendimiento US10Y y el DXY confirman la dirección post-noticia?',
    ],
    entryChecklistEn: [
      'Have at least 10 minutes passed since 08:30:00 AM NY (complying with prop firm news rules)?',
      'Did the 08:30 AM wick sweep a liquidity pool and close back with a 5M displacement body?',
      'Has the broker spread returned to normal without slippage?',
      'Do US10Y yields and DXY confirm the post-release direction?',
    ],
    keyLevelsEs: [
      'Pre-News High & Low (07:30 – 08:29 AM NY)',
      'Extremos de la Vela de 15M de las 08:30 – 08:45 AM NY',
      '50% Equilibrium de la Mecha de Noticia',
    ],
    keyLevelsEn: [
      'Pre-News High & Low (07:30 – 08:29 AM NY)',
      '08:30 – 08:45 AM NY 15M Candle High & Low',
      '50% Equilibrium of the News Spike Candle',
    ],
    avoidConditionsEs:
      'PROHIBIDO enviar órdenes Market entre las 08:28 y las 08:35 AM NY: el deslizamiento (slippage) puede duplicar tu pérdida máxima permitida.',
    avoidConditionsEn:
      'NEVER send Market orders between 08:28 and 08:35 AM NY: news slippage can double your intended monetary risk.',
    invalidationEs:
      'Si el dato macro sorprende de forma extrema y la vela de 08:30–08:45 AM mide más del 90% del ATR diario, no busques reversión.',
    invalidationEn:
      'If the macro surprise is extreme and the 08:30–08:45 AM candle spans >90% of daily ATR, do not fade the move.',
    propFirmTipEs:
      'Esperar a las 08:40 / 08:45 AM NY protege tu cuenta de dos peligros letales en pruebas de fondeo: la anulación de ganancias por regla de noticias (News Trading Rule) y el slippage institucional.',
    propFirmTipEn:
      'Waiting until 08:40 / 08:45 AM NY shields your funded account from both News Trading Rule violations and institutional slippage.',
    knowledgeBaseContent: `# Base Estratégica: Barrido Post-Noticia 08:30 AM & Reclaim 08:45 AM (PB-10)
- Activos Óptimos: NAS100, US500, US30, XAUUSD, EURUSD.
- Ventana Operativa: 08:40 AM a 09:25 AM NY (después de noticias de las 08:30 AM NY).
- Regla Prop Firm: Prohibido ejecutar entre 08:28 y 08:35 AM NY. Esperar el barrido inicial y entrar a las 08:40-08:45 AM en el FVG de 5M.`,
  },
  {
    id: 'strat-ny-orb-15m-wallstreet',
    code: 'PB-11',
    nameEs: 'ORB Institucional 15M Wall Street (9:30 - 9:45 AM Breakout & Retest)',
    nameEn: 'Wall Street 15M Institutional ORB (9:30 - 9:45 AM Breakout & Retest)',
    subtitleEs: 'Ruptura y retesteo del rango de apertura de 15M en NAS100, US30 y US500',
    subtitleEn: '15-minute Opening Range Breakout & FVG retest on NAS100, US30, and US500',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'ny_open',
    scheduleLabelEs: '09:45 – 11:00 NY • Ruptura del Rango de Apertura 9:30-9:45 AM NY',
    scheduleLabelEn: '09:45 – 11:00 NY • 9:30-9:45 AM NY Opening Range Breakout',
    startHourNY: 9.5,
    endHourNY: 11,
    timeframes: '15M (Vela ORB 9:30-9:45 AM NY) → 5M (Ruptura + FVG) → 1M (Gatillo)',
    bestSessionEs: '9:45 AM – 11:00 AM NY (Ejecución tras el cierre de la primera vela de 15M)',
    bestSessionEn: '9:45 AM – 11:00 AM NY (Execution right after the first 15M candle closes)',
    bestAssets: ['NAS100', 'US30', 'US500', 'US2000'],
    winRateEstimate: '75% - 82%',
    riskRewardTarget: '1:2.4 a 1:3.2',
    difficulty: 'Intermedio',
    summaryEs:
      'El clásico institucional cuantitativo de Wall Street: entre las 9:30 y las 9:45 AM NY entran las órdenes masivas de fondos mutuos, ETFs y algoritmos de apertura. Al cerrar la vela de las 9:45 AM NY, quedan definidos el ORB High y el ORB Low. Cuando el precio rompe uno de los bordes con cuerpo en 5M respaldado por las 7 Magníficas (NVDA, AAPL, MSFT), el retesteo al borde roto ofrece una de las entradas más objetivas y mecánicas del mundo.',
    summaryEn:
      'The quantitative Wall Street staple: between 9:30 and 9:45 AM NY, mutual funds, ETFs, and opening algorithms execute their bulk orders. Once the 9:45 AM NY 15M candle closes, the ORB High and ORB Low are locked. When price breaks one boundary with a 5M candle body backed by mega-cap tech flow, the retest of the broken boundary delivers a mechanical, high-probability trend entry.',
    stepsEs: [
      'No operes entre las 9:30 y las 9:44:59 AM NY. Espera a que cierre la primera vela completa de 15 minutos (9:45 AM NY).',
      'Traza tres líneas horizontales exactas: ORB High (máximo 9:30-9:45), ORB Low (mínimo 9:30-9:45) y ORB Midpoint (50% del rango).',
      'Espera a que una vela de 5M cierre con cuerpo completo por encima del ORB High (para Compra) o por debajo del ORB Low (para Venta) creando un FVG.',
      'Coloca orden Limit en el retesteo del borde ORB roto (en confluencia con el FVG de 5M).',
      'Coloca el Stop Loss ligeramente detrás del 50% (ORB Midpoint).',
      'Proyecta TP1 a 1.0x la amplitud de la caja ORB y TP2 a 2.0x la amplitud de la caja ORB.',
    ],
    stepsEn: [
      'Stay flat from 9:30 to 9:44:59 AM NY. Wait for the first full 15-minute candle to close at 9:45 AM NY.',
      'Plot three exact horizontal lines: ORB High (9:30–9:45 high), ORB Low (9:30–9:45 low), and ORB Midpoint (50%).',
      'Wait for a 5M candle to close with a solid body above ORB High (for Longs) or below ORB Low (for Shorts), leaving a 5M FVG.',
      'Place a Limit order on the retest of the broken ORB edge overlapping the 5M FVG.',
      'Set Stop Loss just past the 50% ORB Midpoint.',
      'Target TP1 at 1.0x the ORB box height and TP2 at 2.0x the ORB box height.',
    ],
    entryChecklistEs: [
      '¿Cerró ya la vela de las 9:45 AM NY definiendo el ORB High y ORB Low?',
      '¿La ruptura de 5M fue con cuerpo firme y dejó un Fair Value Gap (FVG)?',
      '¿El rango 9:30–9:45 AM mide menos del 45% del ATR diario (no sobre-extendido)?',
      '¿El mapa de calor (Finviz) y el índice VIX apoyan la dirección de la ruptura?',
    ],
    entryChecklistEn: [
      'Has the 9:45 AM NY 15M candle closed, locking in ORB High and ORB Low?',
      'Did a 5M candle break out with a solid body and leave a Fair Value Gap (FVG)?',
      'Is the 9:30–9:45 AM box height under 45% of daily ATR (not overextended)?',
      'Do the Finviz mega-cap heatmap and VIX support the breakout direction?',
    ],
    keyLevelsEs: [
      'ORB High (Máximo 09:30 – 09:45 AM NY)',
      'ORB Low (Mínimo 09:30 – 09:45 AM NY)',
      'ORB 50% Midpoint (Stop Loss Institucional)',
      'Extensiones Simétricas +1.0x y +2.0x ORB',
    ],
    keyLevelsEn: [
      'ORB High (09:30 – 09:45 AM NY High)',
      'ORB Low (09:30 – 09:45 AM NY Low)',
      'ORB 50% Midpoint (Institutional Stop Level)',
      '+1.0x and +2.0x Symmetrical ORB Extensions',
    ],
    avoidConditionsEs:
      'Si la vela de 9:30 a 9:45 AM es un doji gigante con mechas de ambos lados que ya barrió PDH y PDL, evita operar ruptura y usa PB-01 (Silver Bullet 10:00 AM).',
    avoidConditionsEn:
      'If the 9:30–9:45 AM candle is a giant long-legged doji that already swept both PDH and PDL, skip the ORB and wait for the 10:00 AM Silver Bullet (PB-01).',
    invalidationEs:
      'Se invalida inmediatamente si una vela de 5M cierra por detrás del 50% del rango de apertura (ORB Midpoint).',
    invalidationEn:
      'Invalidated immediately if a 5M candle closes back past the 50% ORB Midpoint.',
    propFirmTipEs:
      'Usar el 50% del ORB como Stop Loss en vez del extremo opuesto reduce a la mitad tu distancia de Stop y duplica tu Ratio Riesgo/Beneficio.',
    propFirmTipEn:
      'Placing your Stop Loss just behind the 50% ORB Midpoint instead of the opposite edge cuts stop distance in half and doubles your R:R.',
    knowledgeBaseContent: `# Base Estratégica: ORB Institucional 15M Wall Street 9:30-9:45 AM (PB-11)
- Activos Óptimos: NAS100, US30, US500, US2000.
- Ventana Operativa: 09:45 AM a 11:00 AM NY.
- Regla Mecánica: Marcar máximo, mínimo y 50% de la primera vela de 15M de Wall Street (9:30-9:45 AM NY). Entrar en el retesteo de la ruptura de 5M con FVG. Stop Loss detrás del 50% del ORB; objetivos en +1.0x y +2.0x del rango.`,
  },
  {
    id: 'strat-pm-silver-bullet-power-hour',
    code: 'PB-12',
    nameEs: 'ICT PM Silver Bullet (14:00 - 15:00 NY) & Power Hour MOC (15:00 - 16:00 NY)',
    nameEn: 'ICT PM Silver Bullet (2:00 - 3:00 PM NY) & Power Hour MOC (3:00 - 4:00 PM NY)',
    subtitleEs: 'Barrido de la pausa del almuerzo NY + expansión vespertina hacia el cierre de Wall Street',
    subtitleEn: 'NY Lunch liquidity sweep + afternoon expansion into the 4:00 PM Wall Street close',
    category: 'ict_smc',
    categoryLabelEs: 'ICT / Smart Money',
    categoryLabelEn: 'ICT / Smart Money',
    scheduleBlock: 'ny_pm',
    scheduleLabelEs: '13:30 – 16:00 NY • PM Silver Bullet (14:00) & Power Hour MOC (15:00)',
    scheduleLabelEn: '13:30 – 16:00 NY • PM Silver Bullet (14:00) & Power Hour MOC (15:00)',
    startHourNY: 13.5,
    endHourNY: 16,
    timeframes: '1H (Estructura AM) → 15M (Rango Lunch 12:00-13:30) → 5M/1M (PM FVG)',
    bestSessionEs: '1:30 PM – 4:00 PM NY (13:30 – 16:00 NY • Ventana PM Silver Bullet: 14:00 – 15:00 NY)',
    bestSessionEn: '1:30 PM – 4:00 PM NY (13:30 – 16:00 NY • PM Silver Bullet Window: 2:00 – 3:00 PM NY)',
    bestAssets: ['NAS100', 'US500', 'US30', 'US2000'],
    winRateEstimate: '74% - 81%',
    riskRewardTarget: '1:2.5 a 1:3.5',
    difficulty: 'Institucional',
    summaryEs:
      'Durante el almuerzo de Nueva York (12:00 – 1:30 PM NY) los algoritmos acumulan órdenes Stop por encima y por debajo de la consolidación del mediodía. A partir de la 1:30 PM NY y especialmente en la ventana ICT PM Silver Bullet (2:00 – 3:00 PM NY), los escritorios institucionales regresan, barren la liquidez del almuerzo y ejecutan el movimiento final hacia los desequilibrios MOC (Market-On-Close) de las 3:00 – 4:00 PM NY.',
    summaryEn:
      'During the New York Lunch consolidation (12:00 – 1:30 PM NY), algorithms build stop pools above and below the midday range. Starting at 1:30 PM NY—and peaking during the ICT PM Silver Bullet window (2:00 – 3:00 PM NY)—institutional desks return, sweep lunch liquidity, and drive the final expansion into the 3:00 – 4:00 PM NY Market-On-Close (MOC) imbalances.',
    stepsEs: [
      'Marca el máximo y el mínimo del Almuerzo de Nueva York (NY Lunch High & Low: 12:00 PM – 1:30 PM NY) y los extremos de la sesión de la mañana (AM High / AM Low).',
      'Entre la 1:30 PM y las 2:15 PM NY espera el barrido de uno de los extremos del rango del almuerzo.',
      'Durante la hora PM Silver Bullet (2:00 PM – 3:00 PM NY), identifica el quiebre de estructura (MSS) y el primer Fair Value Gap (FVG) limpio en 5M o 1M a favor de la tendencia del día o hacia el extremo AM no mitigado.',
      'Entra en el 50% del FVG con Stop Loss detrás de la mecha del barrido vespertino.',
      'A las 2:50 PM / 3:00 PM NY (inicio del Power Hour) asegura al menos el 70% de la posición y cierra el 100% antes de las 3:55 PM NY.',
    ],
    stepsEn: [
      'Mark the New York Lunch High & Low (12:00 PM – 1:30 PM NY) along with the morning session extremes (AM High / AM Low).',
      'Between 1:30 PM and 2:15 PM NY, wait for a sweep of either the NY Lunch High or Low.',
      'Inside the PM Silver Bullet window (2:00 PM – 3:00 PM NY), confirm a Market Structure Shift (MSS) and locate the first clean 5M/1M Fair Value Gap (FVG).',
      'Enter at the 50% FVG with Stop Loss beyond the afternoon sweep wick.',
      'By 2:50 PM / 3:00 PM NY (Power Hour kickoff), lock in 70% of profits and close 100% before 3:55 PM NY.',
    ],
    entryChecklistEs: [
      '¿Estamos dentro de la ventana 1:30 PM – 3:30 PM NY (idealmente 2:00 – 3:00 PM NY)?',
      '¿El precio ya barrió el máximo o mínimo del almuerzo NY (12:00 – 1:30 PM)?',
      '¿Se formó un FVG con desplazamiento claro en 5M/1M hacia el objetivo de cierre?',
      '¿No es día de decisión de tasas FOMC (2:00 PM NY) o ya pasó la conferencia de prensa (2:45 PM)?',
    ],
    entryChecklistEn: [
      'Are we inside the 1:30 PM – 3:30 PM NY window (ideally 2:00 – 3:00 PM NY)?',
      'Has price swept the NY Lunch High or Low (12:00 – 1:30 PM)?',
      'Did a clean 5M/1M displacement FVG form pointing toward the afternoon liquidity draw?',
      'Is today clear of a 2:00 PM NY FOMC rate statement?',
    ],
    keyLevelsEs: [
      'NY Lunch High & Low (12:00 – 13:30 NY)',
      'AM Session High & Low (09:30 – 12:00 NY)',
      '13:30 PM NY Macro Open & 14:00 PM Silver Bullet Open',
    ],
    keyLevelsEn: [
      'NY Lunch High & Low (12:00 – 13:30 NY)',
      'AM Session High & Low (09:30 – 12:00 NY)',
      '13:30 PM NY Macro Open & 14:00 PM Silver Bullet Open',
    ],
    avoidConditionsEs:
      'No operar si ya alcanzaste tu meta diaria de ganancias en la sesión de la mañana (protege tu capital psicológico y evita sobre-operar en la tarde).',
    avoidConditionsEn:
      'Do not trade the PM session if you already hit your daily profit target in the AM session—protect your gains.',
    invalidationEs:
      'Se invalida si el precio cierra una vela de 15M anulando el FVG de las 2:00 PM o si a las 3:15 PM NY no ha alcanzado el TP1.',
    invalidationEn:
      'Invalidated if a 15M candle closes beyond the 2:00 PM FVG or if TP1 is not reached by 3:15 PM NY.',
    propFirmTipEs:
      'Cierra todas tus operaciones intradía en índices de EE. UU. antes de las 3:55 PM NY para evitar la volatilidad errática de órdenes MOC a las 4:00 PM y el cierre de futuros de las 5:00 PM.',
    propFirmTipEn:
      'Flatten all intraday US index trades before 3:55 PM NY to avoid 4:00 PM MOC imbalances and the 5:00 PM CME maintenance close.',
    knowledgeBaseContent: `# Base Estratégica: ICT PM Silver Bullet (14:00-15:00 NY) & Power Hour (PB-12)
- Activos Óptimos: NAS100, US500, US30, US2000.
- Ventana Operativa: 13:30 a 16:00 NY (PM Silver Bullet 14:00 - 15:00 NY).
- Regla de Ejecución: Marcar NY Lunch High/Low (12:00-13:30 NY). Esperar barrido vespertino y entrar en el FVG de 5M/1M entre las 14:00 y 15:00 NY apuntando al AM High/Low o PDH/PDL. Cerrar todo antes de las 15:55 NY.`,
  },
  {
    id: 'strat-yen-nikkei-boj-flow',
    code: 'PB-13',
    nameEs: 'Correlación Yen / Nikkei 225 & Flujo BoJ (JP225 / HK50 / XAUUSD)',
    nameEn: 'Yen / Nikkei 225 Correlation & BoJ Flow (JP225 / HK50 / XAUUSD)',
    subtitleEs: 'Sincronización algorítmica entre USD/JPY, bonos JGB y futuros del Nikkei 225 en Tokio',
    subtitleEn: 'Algorithmic synchronization between USD/JPY, JGB yields, and Nikkei 225 futures in Tokyo',
    category: 'intermarket',
    categoryLabelEs: 'Correlación & Flujo Intermercado',
    categoryLabelEn: 'Correlation & Intermarket Flow',
    scheduleBlock: 'asia',
    scheduleLabelEs: '20:00 – 00:00 NY • Fijación Tokio (Tokyo Fix 20:55 NY) & Flujo BoJ',
    scheduleLabelEn: '20:00 – 00:00 NY • Tokyo Fix (20:55 NY) & BoJ Institutional Flow',
    startHourNY: 20,
    endHourNY: 24,
    timeframes: '1H (Correlación USDJPY/JP225) → 15M (Tokyo Fix 20:55 NY) → 5M (Order Block)',
    bestSessionEs: '8:00 PM – 11:45 PM NY (20:00 – 23:45 NY • Incluye Fijación Bancaria de Tokio 20:55 NY)',
    bestSessionEn: '8:00 PM – 11:45 PM NY (20:00 – 23:45 NY • Includes 8:55 PM NY Tokyo Bank Fix)',
    bestAssets: ['JP225', 'HK50', 'XAUUSD', 'EURUSD'],
    winRateEstimate: '73% - 80%',
    riskRewardTarget: '1:2.5 a 1:3.3',
    difficulty: 'Avanzado',
    summaryEs:
      'A las 9:55 AM hora de Tokio (8:55 PM / 20:55 NY) los bancos comerciales japoneses ejecutan el "Tokyo Fix" de divisas, provocando un pico de liquidez institucional en el Yen y en el Nikkei 225 (JP225). Cuando el Yen se debilita (USD/JPY rompe al alza), las megacorporaciones exportadoras de Japón (Toyota, Sony, Tokyo Electron) impulsan al JP225 en tendencia limpia; cuando el Yen se fortalece agresivamente, el JP225 distribuye a la baja.',
    summaryEn:
      'At 9:55 AM Tokyo time (8:55 PM / 20:55 NY), Japanese commercial banks execute the daily currency "Tokyo Fix", triggering an institutional liquidity surge across the Yen and Nikkei 225 (JP225). When the Yen weakens (USD/JPY breaks higher), Japanese export giants drive JP225 into a clean rally; when the Yen strengthens sharply, JP225 distributes lower.',
    stepsEs: [
      'A las 8:30 PM NY (20:30 NY) abre en paralelo el gráfico de JP225 (o XAUUSD) y el par USDJPY en temporalidad de 15M y 5M.',
      'Observa la ventana de la Fijación de Tokio (8:45 PM – 9:05 PM NY): suele ocurrir un barrido de stops previo al movimiento verdadero de la sesión asiática.',
      'Para COMPRAS en JP225: verifica que USDJPY esté rompiendo máximos intradía (Yen débil) mientras JP225 barre un mínimo de 15M y deja un FVG alcista en 5M.',
      'Para COMPRAS en XAUUSD (en Asia): verifica que USDJPY caiga (Yen fuerte / Dólar débil en Asia) acompañado de demanda física en Shanghái (9:00 PM NY).',
      'Coloca Stop Loss detrás del Order Block de las 8:55 PM NY y toma beneficios antes de la medianoche de Nueva York (00:00 NY).',
    ],
    stepsEn: [
      'At 8:30 PM NY (20:30 NY), compare JP225 (or XAUUSD) alongside USDJPY on 15M and 5M charts.',
      'Monitor the Tokyo Fix window (8:45 PM – 9:05 PM NY), where an institutional stop hunt typically precedes the real Asian trend.',
      'For JP225 LONGS: confirm USDJPY is breaking intraday highs (weak Yen) while JP225 sweeps a 15M low and prints a 5M bullish FVG.',
      'For XAUUSD LONGS (Asian hours): confirm USDJPY is dropping (weaker USD in Asia) alongside the Shanghai Gold Exchange open (9:00 PM NY).',
      'Place Stop Loss beyond the 8:55 PM NY Order Block and take profit before New York Midnight (00:00 NY).',
    ],
    entryChecklistEs: [
      '¿Pasó ya la ventana de fijación bancaria de Tokio (8:55 PM / 20:55 NY)?',
      '¿Están sincronizados USDJPY y JP225 en confluencia direccional?',
      '¿Se formó un Order Block o FVG limpio en 5M tras absorber liquidez?',
      '¿El ratio Riesgo/Beneficio hasta el extremo de la sesión previa es ≥ 1:2.4?',
    ],
    entryChecklistEn: [
      'Has the 8:55 PM NY (9:55 AM Tokyo) bank fix window completed its initial whip?',
      'Are USDJPY and JP225 aligned in directional confluence?',
      'Did a clean 5M Order Block or FVG form after absorbing liquidity?',
      'Is the Risk/Reward ratio to the prior session extreme at least 1:2.4?',
    ],
    keyLevelsEs: [
      'Precio del Tokyo Fix (20:55 NY)',
      'Apertura de Shanghái SGE en Oro (21:00 NY)',
      'Máximo y Mínimo de la Primera Hora de Tokio (19:00 – 20:00 NY)',
    ],
    keyLevelsEn: [
      'Tokyo Bank Fix Price (20:55 NY)',
      'Shanghai Gold Exchange (SGE) Open (21:00 NY)',
      'Tokyo First Hour High & Low (19:00 – 20:00 NY)',
    ],
    avoidConditionsEs:
      'No operar en noches previas a decisión de política monetaria del Banco de Japón (BoJ) por riesgo de latigazos de 500 puntos.',
    avoidConditionsEn:
      'Do not trade on nights preceding Bank of Japan (BoJ) monetary policy decisions due to 500-point whip risk.',
    invalidationEs:
      'Se invalida si USDJPY gira bruscamente rompiendo su estructura de 15M en dirección opuesta a tu operación en JP225.',
    invalidationEn:
      'Invalidated if USDJPY sharply reverses and breaks its 15M structure against your JP225 position.',
    propFirmTipEs:
      'El horario 8:55 PM – 9:30 PM NY (Tokyo Fix + Apertura de Shanghái/Hong Kong) concentra el 70% del volumen asiático real en JP225, HK50 y XAUUSD.',
    propFirmTipEn:
      'The 8:55 PM – 9:30 PM NY window (Tokyo Fix + Shanghai/HK Open) concentrates 70% of real Asian institutional volume in JP225, HK50, and XAUUSD.',
    knowledgeBaseContent: `# Base Estratégica: Correlación Yen / Nikkei 225 & Tokyo Fix (PB-13)
- Activos Óptimos: JP225, HK50, XAUUSD, EURUSD.
- Ventana Operativa: 20:00 a 00:00 NY (Momento clave: Tokyo Fix 20:55 NY y Apertura Shanghái/HK 21:00-21:30 NY).
- Regla Intermercado: USDJPY alcista impulsa a JP225 al alza; caída de USDJPY en apertura de Shanghái impulsa compras de refugio en XAUUSD.`,
  },
  {
    id: 'strat-london-breaker-block-sweep',
    code: 'PB-14',
    nameEs: 'Breaker Block Institucional de Londres & Barrido Europeo (UK100 / GER40 / EURUSD)',
    nameEn: 'London Institutional Breaker Block & European Stop Raid (UK100 / GER40 / EURUSD)',
    subtitleEs: 'Entrada de alta precisión en el Order Block roto (Breaker) tras toma de liquidez en Londres',
    subtitleEn: 'High-precision entry at the flipped Breaker Block after a London Killzone stop raid',
    category: 'ict_smc',
    categoryLabelEs: 'ICT / Smart Money',
    categoryLabelEn: 'ICT / Smart Money',
    scheduleBlock: 'london',
    scheduleLabelEs: '03:00 – 05:30 NY • London Killzone & Flujo Interbancario Europeo',
    scheduleLabelEn: '03:00 – 05:30 NY • London Killzone & European Interbank Flow',
    startHourNY: 3,
    endHourNY: 5.5,
    timeframes: '1H (Liquidez Externa) → 15M (Estructura Breaker) → 5M (Mitigación)',
    bestSessionEs: '3:00 AM – 5:30 AM NY (Plena sesión de Londres y mercado de acciones europeo)',
    bestSessionEn: '3:00 AM – 5:30 AM NY (Core London Killzone & European equity cash flow)',
    bestAssets: ['UK100', 'GER40', 'EU50', 'FRA40', 'EURUSD', 'XAUUSD'],
    winRateEstimate: '76% - 83%',
    riskRewardTarget: '1:2.6 a 1:3.6',
    difficulty: 'Institucional',
    summaryEs:
      'El Breaker Block (Bloque de Ruptura) es el patrón favorito de los operadores institucionales en Londres porque no requiere adivinar el extremo de la mecha: espera a que el precio cree un máximo/mínimo, barra ese extremo para cazar liquidez (Stop Hunt) y luego rompa con violencia el bloque que originó ese barrido. Cuando el precio regresa a testear ese antiguo Order Block (ahora convertido en Breaker Block), ofrece la entrada más protegida de la sesión europea.',
    summaryEn:
      'The Institutional Breaker Block is the premier London Killzone setup because it never tries to catch a falling knife: it waits for price to form a swing point, sweep that swing to raid stops, and then violently break through the Order Block that launched the sweep. When price retests that broken block (now flipped into a Breaker), it provides the highest-probability entry of the European morning.',
    stepsEs: [
      'Entre las 2:30 AM y las 4:00 AM NY identifica un swing previo que sea barrido por unos puntos/pips (creando un Higher High falso en ventas o un Lower Low falso en compras).',
      'Localiza la última vela alcista previa al barrido bajista (para Breaker Alcista) o la última vela bajista previa al barrido alcista (para Breaker Bajista).',
      'Espera a que el desplazamiento rompa con cuerpo completo a través de esa vela en 5M/15M (convirtiéndola oficialmente en un Breaker Block).',
      'Si además ese Breaker Block coincide (Unicorn Setup) con un Fair Value Gap (FVG), tienes confluencia institucional A+.',
      'Coloca orden Limit en el borde del Breaker Block con Stop Loss detrás del cuerpo del Breaker y objetivos en 1:2.5 y 1:3.5 R:R.',
    ],
    stepsEn: [
      'Between 2:30 AM and 4:00 AM NY, spot a swing high/low that gets swept to trap stops (forming a false Higher High for shorts or false Lower Low for longs).',
      'Highlight the last opposing candle that initiated that final liquidity raid.',
      'Wait for an impulsive displacement leg to close with a full body through that candle on 5M/15M—flipping it into an Institutional Breaker Block.',
      'If a Fair Value Gap (FVG) overlaps the Breaker Block ("ICT Unicorn Model"), treat it as an A+ setup.',
      'Place a Limit order at the Breaker boundary with Stop Loss behind the Breaker body and target 1:2.5 to 1:3.5 R:R.',
    ],
    entryChecklistEs: [
      '¿Existió primero una toma de liquidez (barrido de un alto/bajo previo) antes del quiebre?',
      '¿El quiebre del Breaker Block ocurrió con desplazamiento energético y cuerpo de vela?',
      '¿Coincide un Fair Value Gap (FVG) con la zona del Breaker Block (Modelo Unicornio)?',
      '¿Estamos dentro de la ventana 3:00 AM – 5:30 AM NY?',
    ],
    entryChecklistEn: [
      'Did a clear stop raid (sweep of a prior high/low) happen right before the structure shift?',
      'Did price break through the Breaker Block with an energetic candle body close?',
      'Does a Fair Value Gap (FVG) overlap the Breaker Block zone (Unicorn Model)?',
      'Are we inside the 3:00 AM – 5:30 AM NY London window?',
    ],
    keyLevelsEs: [
      'Zona del Breaker Block de 15M / 5M',
      'FVG superpuesto al Breaker (Unicorn Confluence)',
      'Liquidez Externa en PDH / PDL o Extremo Asiático Opuesto',
    ],
    keyLevelsEn: [
      '15M / 5M Breaker Block Zone',
      'Overlapping FVG + Breaker (Unicorn Confluence)',
      'External Liquidity at PDH / PDL or Opposite Asian Extreme',
    ],
    avoidConditionsEs:
      'No entrar si el precio regresa al Breaker Block después de las 6:00 AM NY (cuando Londres entra en pausa pre-NY).',
    avoidConditionsEn:
      'Cancel the order if price does not retest the Breaker Block before 6:00 AM NY (London lunch lull).',
    invalidationEs:
      'Se invalida si una vela de 15M cierra con cuerpo completo de vuelta al otro lado del Breaker Block.',
    invalidationEn:
      'Invalidated if a 15M candle closes with a full body back through the distal side of the Breaker Block.',
    propFirmTipEs:
      'El modelo Unicornio (Breaker Block + FVG superpuestos) en UK100, GER40 y EURUSD permite colocar el Stop detrás del Breaker en vez de la mecha extrema, mejorando el R:R en +40%.',
    propFirmTipEn:
      'The Unicorn Model (overlapping Breaker Block + FVG) on UK100, GER40, and EURUSD lets you tuck the Stop behind the Breaker rather than the extreme wick, boosting R:R by +40%.',
    knowledgeBaseContent: `# Base Estratégica: Breaker Block Institucional de Londres & Modelo Unicornio (PB-14)
- Activos Óptimos: UK100, GER40, EU50, FRA40, EURUSD, XAUUSD.
- Ventana Operativa: 03:00 AM a 05:30 AM NY.
- Estructura: Toma de liquidez (Stop Hunt) + Ruptura con desplazamiento del bloque origen (Breaker Block) + FVG superpuesto (Unicorn Setup).`,
  },
  {
    id: 'strat-ny-premarket-0700-raid',
    code: 'PB-15',
    nameEs: 'Barrido Pre-Mercado NY (07:00 - 08:20 AM London High/Low Raid + Midnight Open)',
    nameEn: 'NY Pre-Market Raid (07:00 - 08:20 AM London High/Low Sweep + Midnight Open)',
    subtitleEs: 'Transición Londres a Nueva York (7:00 - 8:20 AM NY) antes de las noticias macro de las 8:30 AM',
    subtitleEn: 'London-to-NY desk handover (7:00 - 8:20 AM NY) ahead of 8:30 AM macro releases',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'ny_premarket',
    scheduleLabelEs: '07:00 – 08:20 NY • Apertura NY Forex Killzone & Handover de Londres',
    scheduleLabelEn: '07:00 – 08:20 NY • NY FX Killzone Open & London Desk Handover',
    startHourNY: 7,
    endHourNY: 8.35,
    timeframes: '1H (Rango de Londres) → 15M (Barrido 07:00 AM NY) → 5M (Entrada FVG)',
    bestSessionEs: '7:00 AM – 8:20 AM NY (Inicio de la New York Killzone para Divisas, Oro e Índices)',
    bestSessionEn: '7:00 AM – 8:20 AM NY (Start of the New York Killzone for FX, Gold, and Indices)',
    bestAssets: ['EURUSD', 'XAUUSD', 'NAS100', 'US30', 'GER40'],
    winRateEstimate: '73% - 80%',
    riskRewardTarget: '1:2.2 a 1:3.0',
    difficulty: 'Intermedio',
    summaryEs:
      'A las 7:00 AM NY se sientan los operadores institucionales de los bancos de Nueva York y reciben el libro de órdenes de Londres. Entre las 7:00 AM y las 8:15 AM NY ocurre frecuentemente una caza de stops sobre el máximo o mínimo dejado por la mañana europea (London High / London Low) en confluencia con el nivel 00:00 AM NY Midnight Open, permitiendo capturar un movimiento limpio y cerrar ganancias o proteger en Break-Even antes de las noticias de las 8:30 AM NY.',
    summaryEn:
      'At 7:00 AM NY, New York interbank desks take over the order book from London. Between 7:00 AM and 8:15 AM NY, algorithms routinely raid stops resting above the London High or below the London Low in alignment with the 00:00 AM NY Midnight Open—allowing traders to capture a clean pre-market swing and move to Break-Even before 8:30 AM macro news.',
    stepsEs: [
      'A las 6:55 AM NY marca el Máximo y Mínimo de la sesión de Londres (02:00 – 06:30 AM NY) y la línea horizontal de las 00:00 AM NY (Midnight Open).',
      'Si la estructura diaria es alcista y a las 7:00 – 7:45 AM NY el precio cae por debajo del mínimo de la pausa europea o por debajo del Midnight Open barriendo stops, busca un CHoCH + FVG alcista en 5M.',
      'Si la estructura diaria es bajista y a las 7:00 – 7:45 AM NY el precio sube a barrer el London High, busca un CHoCH + FVG bajista en 5M.',
      'Importante: A las 8:25 AM NY (5 minutos antes de cualquier noticia de las 8:30 AM) debes haber cerrado al menos el 70% de la posición y movido el Stop Loss a Break-Even.',
    ],
    stepsEn: [
      'At 6:55 AM NY, mark the London Session High and Low (02:00 – 06:30 AM NY) and the 00:00 AM NY Midnight Open line.',
      'If daily bias is bullish and between 7:00 and 7:45 AM NY price dips to sweep the London pullback low below Midnight Open, look for a 5M bullish CHoCH + FVG.',
      'If daily bias is bearish and price spikes to sweep the London High, look for a 5M bearish CHoCH + FVG.',
      'Mandatory rule: By 8:25 AM NY (5 minutes before any 8:30 AM release), lock in 70% of profits and move Stop Loss to Break-Even.',
    ],
    entryChecklistEs: [
      '¿Estamos entre las 7:00 AM y las 8:15 AM NY?',
      '¿El precio barrió un extremo de Londres o entró en descuento/premium respecto al 00:00 NY Midnight Open?',
      '¿Confirmaste un FVG en 5M con relación R:R mínima de 1:2.0 alcanzable antes de las 8:30 AM?',
      '¿Tienes alarma puesta a las 8:25 AM NY para proteger en Break-Even antes de noticias?',
    ],
    entryChecklistEn: [
      'Are we between 7:00 AM and 8:15 AM NY?',
      'Did price sweep a London session extreme or reach discount/premium relative to the 00:00 NY Midnight Open?',
      'Is there a clean 5M FVG offering at least 1:2.0 R:R prior to 8:30 AM?',
      'Is your 8:25 AM NY alarm set to secure Break-Even ahead of 8:30 AM data?',
    ],
    keyLevelsEs: [
      'London Session High & Low (02:00 – 06:45 AM NY)',
      '00:00 AM NY Midnight Open',
      '07:00 AM NY Killzone Open Price',
    ],
    keyLevelsEn: [
      'London Session High & Low (02:00 – 06:45 AM NY)',
      '00:00 AM NY Midnight Open',
      '07:00 AM NY Killzone Open Price',
    ],
    avoidConditionsEs:
      'En días de NFP (primer viernes del mes) o CPI, el mercado suele quedarse congelado de 7:30 a 8:30 AM; esos días espera directamente a PB-10 (8:45 AM).',
    avoidConditionsEn:
      'On NFP Fridays or CPI days, price often freezes from 7:30 to 8:30 AM—skip the 7:00 AM setup and wait for PB-10 at 8:45 AM.',
    invalidationEs:
      'Se invalida si a las 8:20 AM NY la operación sigue en negativo o sin despegar: cierra manualmente antes de la noticia de las 8:30 AM.',
    invalidationEn:
      'Invalidated if the trade is still in drawdown or flat by 8:20 AM NY—exit manually before 8:30 AM macro releases.',
    propFirmTipEs:
      'Entrar entre las 7:10 y las 7:50 AM NY te permite llegar a las noticias de las 8:30 AM con ganancias ya aseguradas y Stop en Break-Even (riesgo cero).',
    propFirmTipEn:
      'Entering between 7:10 and 7:50 AM NY lets you ride into 8:30 AM news with partial profits banked and a risk-free Break-Even Stop.',
    knowledgeBaseContent: `# Base Estratégica: Barrido Pre-Mercado NY 07:00 - 08:20 AM (PB-15)
- Activos Óptimos: EURUSD, XAUUSD, NAS100, US30, GER40.
- Ventana Operativa: 07:00 AM a 08:20 AM NY.
- Regla de Ejecución: Cazar el barrido del rango de Londres en la apertura de bancos de NY (7:00 AM) en confluencia con el 00:00 NY Midnight Open y asegurar ganancias a las 08:25 AM antes de las noticias de las 08:30 AM.`,
  },
  {
    id: 'strat-ict-macro-0950-1010',
    code: 'PB-16',
    nameEs: 'ICT Macro Algorítmica 09:50 - 10:10 AM & Inversión de Flujo (NAS100 / US500 / US30)',
    nameEn: 'ICT 09:50 - 10:10 AM Algorithmic Macro & Flow Inversion (NAS100 / US500 / US30)',
    subtitleEs: 'La ventana de 20 minutos más explosiva del algoritmo IPDA en índices americanos',
    subtitleEn: 'The most explosive 20-minute IPDA algorithmic window on US equity indices',
    category: 'ict_smc',
    categoryLabelEs: 'ICT / Smart Money',
    categoryLabelEn: 'ICT / Smart Money',
    scheduleBlock: 'ny_open',
    scheduleLabelEs: '09:50 – 10:10 NY • ICT Macro Algorítmica & Datos 10:00 AM NY',
    scheduleLabelEn: '09:50 – 10:10 NY • ICT Algorithmic Macro & 10:00 AM NY Releases',
    startHourNY: 9.75,
    endHourNY: 10.5,
    timeframes: '15M (Rango 09:30-09:50) → 5M (Desplazamiento 09:50) → 1M (IFVG / FVG)',
    bestSessionEs: '9:50 AM – 10:10 AM NY (Ventana de Ejecución ICT Macro + Extensión hasta 10:30 AM)',
    bestSessionEn: '9:50 AM – 10:10 AM NY (ICT Macro Execution Window + Extension to 10:30 AM)',
    bestAssets: ['NAS100', 'US500', 'US30', 'XAUUSD'],
    winRateEstimate: '77% - 85%',
    riskRewardTarget: '1:2.8 a 1:4.0',
    difficulty: 'Institucional',
    summaryEs:
      'Entre las 09:50 AM y las 10:10 AM NY se activa la principal Macro Algorítmica de la mañana en Wall Street (además de coincidir con los datos macro de las 10:00 AM como ISM, JOLTS o Confianza del Consumidor). Durante los primeros 20 minutos de bolsa (9:30 – 9:50 AM) el mercado suele inducir al público en dirección falsa; exactamente a las 09:50 AM el algoritmo barre ese extremo e invierte el primer FVG (Inversion Fair Value Gap - IFVG) para lanzar el movimiento verdadero de la mañana.',
    summaryEn:
      'Between 09:50 AM and 10:10 AM NY, the primary morning Algorithmic Macro engages on Wall Street (also coinciding with 10:00 AM macro data like ISM, JOLTS, or Consumer Confidence). After the initial 9:30 – 9:50 AM retail inducement, at 09:50 AM sharp the algorithm sweeps that extreme and inverts the opposing Fair Value Gap (IFVG) to launch the true morning trend.',
    stepsEs: [
      'Observa el movimiento de las 09:30 a las 09:49 AM NY sin entrar: identifica dónde se acumulan los stops de quienes entraron apresurados en la apertura.',
      'Exactamente a las 09:50 AM NY busca que el precio barra el máximo o mínimo formado entre las 9:30 y las 9:49 AM.',
      'En gráfico de 1M o 5M, identifica el Fair Value Gap previo que intentó continuar el movimiento falso y espera a que una vela entre las 09:50 y las 10:05 AM lo cierre en sentido opuesto (Inversion FVG / IFVG).',
      'Entra al tocar el IFVG o el nuevo FVG creado dentro de la ventana 09:50 – 10:10 AM NY.',
      'Coloca Stop Loss detrás del extremo de las 09:50 AM y apunta al extremo opuesto del día o PDH/PDL.',
    ],
    stepsEn: [
      'Watch the 09:30 to 09:49 AM NY price action without executing: identify where early retail stops have accumulated.',
      'Starting at 09:50 AM NY, look for price to sweep the 9:30–9:49 AM high or low.',
      'On the 1M or 5M chart, spot the prior FVG that supported the false move and wait for a candle between 09:50 and 10:05 AM to close right through it in the opposite direction (Inversion FVG / IFVG).',
      'Enter on the retest of the IFVG or the fresh displacement FVG inside the 09:50 – 10:10 AM NY macro window.',
      'Place Stop Loss beyond the 09:50 AM sweep extreme and target the opposing session pool or PDH/PDL.',
    ],
    entryChecklistEs: [
      '¿El gatillo se activó específicamente entre las 09:50 AM y las 10:10 AM NY?',
      '¿Hubo barrido del máximo o mínimo de los primeros 20 minutos de apertura (9:30-9:50)?',
      '¿Cerró una vela invirtiendo el FVG previo (IFVG) o creando un nuevo FVG con desplazamiento?',
      '¿Verificaste si hoy hay noticia de carpeta roja a las 10:00 AM NY (ISM / JOLTS)?',
    ],
    entryChecklistEn: [
      'Did the trigger occur specifically inside the 09:50 AM – 10:10 AM NY Macro window?',
      'Did price sweep the high or low of the initial 20-minute opening range (9:30–9:50)?',
      'Did a candle close inverting the prior FVG (IFVG) or leaving a fresh displacement FVG?',
      'Did you check the calendar for any 10:00 AM NY red-folder release (ISM / JOLTS)?',
    ],
    keyLevelsEs: [
      '09:30 – 09:49 AM Inducement High & Low',
      'Inversion Fair Value Gap (IFVG) de 1M / 5M',
      'Precio de Apertura de la Macro (09:50 AM NY)',
    ],
    keyLevelsEn: [
      '09:30 – 09:49 AM Inducement High & Low',
      '1M / 5M Inversion Fair Value Gap (IFVG)',
      'Macro Open Price (09:50 AM NY)',
    ],
    avoidConditionsEs:
      'Si hoy hay dato ISM Manufacturero/Servicios o JOLTS a las 10:00 AM NY, espera a las 10:02 AM para ejecutar tras la mecha del dato.',
    avoidConditionsEn:
      'If ISM Manufacturing/Services or JOLTS drops at 10:00 AM NY today, wait until 10:02 AM to execute after the news wick.',
    invalidationEs:
      'Se invalida de inmediato si el precio vuelve a cerrar con cuerpo por detrás del IFVG en 5M.',
    invalidationEn:
      'Invalidated immediately if a 5M candle closes with a full body back through the IFVG.',
    propFirmTipEs:
      'La Macro 09:50 – 10:10 AM NY se conecta directamente con el inicio de la ventana AM Silver Bullet (10:00 – 11:00 AM): es los 20 minutos de mayor precisión algorítmica del día en NAS100.',
    propFirmTipEn:
      'The 09:50 – 10:10 AM NY Macro bridges directly into the AM Silver Bullet (10:00 – 11:00 AM): it is the single highest-precision 20-minute window of the day on NAS100.',
    knowledgeBaseContent: `# Base Estratégica: ICT Macro Algorítmica 09:50 - 10:10 AM & IFVG (PB-16)
- Activos Óptimos: NAS100, US500, US30, XAUUSD.
- Ventana Operativa: 09:50 AM a 10:10 AM NY (con recorrido hasta las 10:45 AM NY).
- Gatillo: Barrido del rango 09:30-09:49 AM + Inversión de FVG (IFVG) en 5M/1M.`,
  },
  {
    id: 'strat-ny-lunch-trap-reclaim',
    code: 'PB-17',
    nameEs: 'Trampa de Liquidez del Mediodía NY (NY Lunch Sweep 11:45 - 13:15 NY)',
    nameEn: 'NY Midday Lunch Liquidity Trap (11:45 AM - 1:15 PM NY Sweep & Reclaim)',
    subtitleEs: 'Caza de stops de los traders atrapados en el almuerzo de Wall Street antes de la sesión PM',
    subtitleEn: 'Capturing stop hunts engineered during the Wall Street lunch hour ahead of the PM session',
    category: 'prop_risk',
    categoryLabelEs: 'Protocolo Noticias & Fondeo',
    categoryLabelEn: 'News Protocol & Prop Risk',
    scheduleBlock: 'london_close',
    scheduleLabelEs: '11:30 – 13:30 NY • Cierre Europeo & Trampa del Almuerzo NY',
    scheduleLabelEn: '11:30 – 13:30 NY • European Close & NY Lunch Liquidity Trap',
    startHourNY: 11.5,
    endHourNY: 13.5,
    timeframes: '1H (Tendencia AM) → 15M (Piscina de Stops del Mediodía) → 5M (Reclaim)',
    bestSessionEs: '11:45 AM – 1:15 PM NY (Transición del Cierre de Londres al final del Almuerzo NY)',
    bestSessionEn: '11:45 AM – 1:15 PM NY (London Close transition through the end of NY Lunch)',
    bestAssets: ['NAS100', 'US500', 'US30', 'XAUUSD'],
    winRateEstimate: '72% - 79%',
    riskRewardTarget: '1:2.3 a 1:3.2',
    difficulty: 'Avanzado',
    summaryEs:
      'Entre las 11:30 AM y la 1:00 PM NY (mientras Londres cierra y Nueva York sale a almorzar), el volumen cae temporalmente y el precio deriva lentamente hacia el mínimo o el máximo de corrección de la mañana para barrer los stops de los traders que movieron mal su Trailing Stop. Una vez absorbida esa liquidez cerca de las 12:45 – 1:15 PM NY, los escritorios institucionales retoman la tendencia principal de la mañana con un riesgo mínimo.',
    summaryEn:
      'Between 11:30 AM and 1:00 PM NY (as London closes and New York desks step out for lunch), volume thins and algorithms slowly drift price into morning pullback stops to shake out premature trailing stops. Once that midday stop pool is swept around 12:45 – 1:15 PM NY, institutional desks resume the dominant morning trend with ultra-tight risk.',
    stepsEs: [
      'Identifica la dirección dominante de la sesión de la mañana (09:30 – 11:15 AM NY).',
      'Observa el retroceso lento y comprimido del mediodía (11:30 AM – 12:45 PM NY) que forma mínimos o máximos iguales (Equal Lows / Equal Highs).',
      'Espera a que el precio barra esa piscina de stops del mediodía llegando a un Order Block o FVG de 1H/15M creado en la mañana.',
      'Confirma la recuperación (Reclaim) con cierre de cuerpo en 5M entre las 12:30 PM y la 1:15 PM NY y entra a favor de la tendencia principal.',
      'Objetivo TP1 en el extremo de la mañana (AM High o AM Low).',
    ],
    stepsEn: [
      'Identify the dominant trend established during the morning session (09:30 – 11:15 AM NY).',
      'Track the slow, compressed midday drift (11:30 AM – 12:45 PM NY) building Equal Lows or Equal Highs.',
      'Wait for price to sweep that midday stop pool right into an unmitigated morning 1H/15M Order Block or FVG.',
      'Confirm the 5M candle body reclaim between 12:30 PM and 1:15 PM NY and enter with the primary trend.',
      'Target TP1 at the morning session extreme (AM High or AM Low).',
    ],
    entryChecklistEs: [
      '¿Hubo una tendencia clara en la mañana (9:30 – 11:15 AM) que dejó un Order Block/FVG sin mitigar?',
      '¿El retroceso de 11:30 AM a 12:45 PM NY fue correctivo (bajo volumen) y barrió stops internos?',
      '¿Cerró ya una vela de 5M confirmando el giro a favor de la tendencia AM?',
    ],
    entryChecklistEn: [
      'Was there a clear morning trend (9:30 – 11:15 AM) that left an unmitigated Order Block/FVG?',
      'Was the 11:30 AM – 12:45 PM NY drift corrective before sweeping internal stops?',
      'Did a 5M candle close confirming resumption of the morning trend?',
    ],
    keyLevelsEs: [
      'Equal Highs / Equal Lows del Almuerzo (11:30 – 12:45 NY)',
      'Order Block / FVG de la Mañana (09:45 – 10:45 AM NY)',
      'AM Session High / AM Session Low (Objetivo de Liquidez)',
    ],
    keyLevelsEn: [
      'Midday Lunch Equal Highs / Equal Lows (11:30 – 12:45 NY)',
      'Morning Unmitigated Order Block / FVG (09:45 – 10:45 AM NY)',
      'AM Session High / AM Session Low (Liquidity Draw)',
    ],
    avoidConditionsEs:
      'Nunca operes rupturas en medio del almuerzo (12:00 – 12:45 PM NY): el 80% de las rupturas en esa hora son trampas de liquidez.',
    avoidConditionsEn:
      'Never trade breakouts during the dead lunch hour (12:00 – 12:45 PM NY): 80% of midday breakouts are liquidity traps.',
    invalidationEs:
      'Se invalida si el precio rompe el origen del impulso de la mañana (09:30 AM) cambiando la estructura diaria.',
    invalidationEn:
      'Invalidated if price breaks the 09:30 AM morning impulse origin, flipping the daily structure.',
    propFirmTipEs:
      'En el mediodía de NY la regla de oro es: "Prohibido perseguir rupturas; solo operar barridos en niveles de descuento/premium de la mañana".',
    propFirmTipEn:
      'During NY Midday, the golden rule is: "Never chase breakouts; only buy discount sweeps or sell premium sweeps of the morning range."',
    knowledgeBaseContent: `# Base Estratégica: Trampa de Liquidez del Mediodía NY 11:45 - 13:15 NY (PB-17)
- Activos Óptimos: NAS100, US500, US30, XAUUSD.
- Ventana Operativa: 11:45 AM a 01:15 PM NY.
- Regla: Esperar a que la pausa del mediodía barra stops internos sobre un Order Block/FVG de la mañana y entrar en la reanudación hacia el AM High/Low.`,
  },
  {
    id: 'strat-power-hour-moc-imbalance',
    code: 'PB-18',
    nameEs: 'Desbalance Institucional MOC & Power Hour (15:00 - 15:55 NY Wall Street Close)',
    nameEn: 'Institutional MOC Imbalance & Power Hour (3:00 - 3:55 PM NY Wall Street Close)',
    subtitleEs: 'Operativa del flujo final Market-On-Close (MOC) y rebalanceo de fondos en la última hora',
    subtitleEn: 'Trading the final Market-On-Close (MOC) institutional imbalance and fund rebalancing hour',
    category: 'killzone',
    categoryLabelEs: 'Killzones & Liquidez de Sesión',
    categoryLabelEn: 'Killzones & Session Liquidity',
    scheduleBlock: 'ny_pm',
    scheduleLabelEs: '15:00 – 15:55 NY • Power Hour, Bono Tesoro Close (15:00) & Órdenes MOC',
    scheduleLabelEn: '15:00 – 15:55 NY • Power Hour, Treasury Bond Close (15:00) & MOC Orders',
    startHourNY: 14.75,
    endHourNY: 16,
    timeframes: '15M (Estructura PM) → 5M (Vela 15:00 PM NY) → 1M (Ejecución Rápida)',
    bestSessionEs: '2:50 PM – 3:50 PM NY (14:50 – 15:50 NY • Cierre del Mercado de Bonos 15:00 y Power Hour)',
    bestSessionEn: '2:50 PM – 3:50 PM NY (14:50 – 15:50 NY • 3:00 PM Bond Close & Equity Power Hour)',
    bestAssets: ['US500', 'NAS100', 'US30', 'US2000'],
    winRateEstimate: '73% - 80%',
    riskRewardTarget: '1:2.2 a 1:3.0',
    difficulty: 'Avanzado',
    summaryEs:
      'A las 3:00 PM NY cierra el mercado oficial de bonos del Tesoro de EE. UU. y comienza el "Power Hour" (3:00 – 4:00 PM NY) donde los grandes fondos institucionales y ETFs apalancados están obligados a ejecutar sus órdenes Market-On-Close (MOC). Entre las 2:50 PM y las 3:10 PM NY se produce la última manipulación (Macro de Cierre) antes del sprint direccional hacia las 3:50 PM NY.',
    summaryEn:
      'At 3:00 PM NY the US Treasury bond pit closes and the Equity "Power Hour" (3:00 – 4:00 PM NY) begins, forcing pension funds and leveraged ETFs to execute their Market-On-Close (MOC) orders. Between 2:50 PM and 3:10 PM NY, algorithms run a final stop sweep (Closing Macro) before launching a directional sprint into 3:50 PM NY.',
    stepsEs: [
      'A las 2:45 PM NY (14:45 NY) identifica el rango formado entre la 1:30 PM y las 2:45 PM NY.',
      'Observa la Macro de las 2:50 PM – 3:10 PM NY: busca un barrido rápido de liquidez seguido de un desplazamiento con FVG en 5M/1M.',
      'Si el día ha sido fuertemente alcista o bajista y el precio aún no ha alcanzado el PDH/PDL o el extremo de la mañana, apunta el TP directamente a ese imán de liquidez.',
      'Regla estricta: Cierra el 100% de la operación entre las 3:50 PM y las 3:55 PM NY (nunca dejes posiciones intradía abiertas en el minuto 4:00 PM ni durante el cierre CME de las 5:00 PM).',
    ],
    stepsEn: [
      'At 2:45 PM NY (14:45 NY), mark the afternoon range formed between 1:30 PM and 2:45 PM NY.',
      'Watch the 2:50 PM – 3:10 PM NY Macro window for a quick stop raid followed by a 5M/1M displacement FVG.',
      'If the day is trending and price has not yet tapped PDH/PDL or the morning extreme, target that exact liquidity draw.',
      'Strict rule: Close 100% of the position between 3:50 PM and 3:55 PM NY (never hold intraday trades through the 4:00 PM cash bell or 5:00 PM CME close).',
    ],
    entryChecklistEs: [
      '¿Estamos en la ventana de arranque del Power Hour (2:50 PM – 3:25 PM NY)?',
      '¿Se produjo el barrido de las 2:50 – 3:05 PM NY con creación de FVG en 5M/1M?',
      '¿Existe un objetivo de liquidez claro (HOD/LOD o PDH/PDL) alcanzable antes de las 3:50 PM NY?',
      '¿Tienes programado el cierre total antes de las 3:55 PM NY?',
    ],
    entryChecklistEn: [
      'Are we inside the Power Hour launch window (2:50 PM – 3:25 PM NY)?',
      'Did the 2:50 – 3:05 PM NY sweep print a clean 5M/1M displacement FVG?',
      'Is there a clear liquidity draw (HOD/LOD or PDH/PDL) reachable before 3:50 PM NY?',
      'Are you committed to closing 100% before 3:55 PM NY?',
    ],
    keyLevelsEs: [
      'Rango Pre-Power Hour (13:30 – 14:50 NY)',
      '15:00 PM NY Bond Close & Macro Open',
      'High of Day (HOD) / Low of Day (LOD) para cierre MOC',
    ],
    keyLevelsEn: [
      'Pre-Power Hour Range (13:30 – 14:50 NY)',
      '15:00 PM NY Bond Close & Macro Open',
      'High of Day (HOD) / Low of Day (LOD) MOC Draw',
    ],
    avoidConditionsEs:
      'Prohibido abrir nuevas operaciones después de las 3:40 PM NY: a partir de esa hora el riesgo de latigazos MOC supera el beneficio potencial.',
    avoidConditionsEn:
      'Do not open new trades after 3:40 PM NY—late MOC cross-currents make risk/reward unfavorable.',
    invalidationEs:
      'Se invalida si la vela de las 3:00 – 3:15 PM NY cierra de vuelta anulando el FVG de ruptura.',
    invalidationEn:
      'Invalidated if the 3:00 – 3:15 PM NY candle closes back through the breakout FVG.',
    propFirmTipEs:
      'En cuentas de fondeo (FTMO, FundedNext, Apex), cerrar todo a las 3:50 PM NY te libra al 100% del ensanchamiento de spreads y swaps del cierre diario.',
    propFirmTipEn:
      'On funded accounts (FTMO, FundedNext, Apex), flattening by 3:50 PM NY protects you 100% from rollover spread widening and overnight swap fees.',
    knowledgeBaseContent: `# Base Estratégica: Desbalance Institucional MOC & Power Hour 15:00 - 15:55 NY (PB-18)
- Activos Óptimos: US500, NAS100, US30, US2000.
- Ventana Operativa: 14:50 a 15:50 NY (Power Hour de Wall Street).
- Regla de Ejecución: Esperar el barrido de la Macro 14:50-15:10 NY al cierre del mercado de bonos (15:00 NY), entrar en el FVG hacia el HOD/LOD y cerrar el 100% antes de las 15:55 NY.`,
  },
];

export interface StrategyExpectancyResult {
  avgWinRatePct: number;
  avgRewardRatio: number;
  riskUsdPerTrade: number;
  expectedWinUsd: number;
  expectancyR: number;
  expectancyUsdPerTrade: number;
  weeklyExpectedUsd: number;
  monthlyExpectedUsd: number;
  monthlyExpectedPct: number;
  profitFactorEstimate: number;
}

export function calculateStrategyMathExpectancy(
  st: StrategyPlaybook,
  balanceUsd: number,
  riskPct: number,
  tradesPerWeek: number
): StrategyExpectancyResult {
  // Parse winRateEstimate e.g. "74% - 82%"
  const wrMatches = st.winRateEstimate.match(/(\d+(?:\.\d+)?)/g);
  const avgWinRatePct =
    wrMatches && wrMatches.length >= 2
      ? (parseFloat(wrMatches[0]) + parseFloat(wrMatches[1])) / 2
      : wrMatches && wrMatches.length === 1
      ? parseFloat(wrMatches[0])
      : 75;

  // Parse riskRewardTarget e.g. "1:2.5 a 1:3.5"
  const rrMatches = st.riskRewardTarget.match(/1\s*:\s*(\d+(?:\.\d+)?)/g);
  let avgRewardRatio = 2.6;
  if (rrMatches && rrMatches.length > 0) {
    const nums = rrMatches.map((m) => parseFloat(m.split(':')[1]));
    avgRewardRatio = nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  const safeBalance = Math.max(100, balanceUsd || 10000);
  const safeRiskPct = Math.max(0.05, Math.min(5, riskPct || 0.5));
  const safeTradesWeek = Math.max(1, Math.min(30, tradesPerWeek || 5));

  const winProb = avgWinRatePct / 100;
  const lossProb = 1 - winProb;

  const riskUsdPerTrade = safeBalance * (safeRiskPct / 100);
  const expectedWinUsd = riskUsdPerTrade * avgRewardRatio;

  // Mathematical Expectancy Formula: E(R) = (Win% * AvgWinR) - (Loss% * 1R)
  const expectancyR = winProb * avgRewardRatio - lossProb * 1;
  const expectancyUsdPerTrade = expectancyR * riskUsdPerTrade;
  const weeklyExpectedUsd = expectancyUsdPerTrade * safeTradesWeek;
  const monthlyExpectedUsd = weeklyExpectedUsd * 4;
  const monthlyExpectedPct = (monthlyExpectedUsd / safeBalance) * 100;
  const profitFactorEstimate =
    lossProb > 0 ? (winProb * avgRewardRatio) / (lossProb * 1) : avgRewardRatio;

  return {
    avgWinRatePct: Math.round(avgWinRatePct * 10) / 10,
    avgRewardRatio: Math.round(avgRewardRatio * 100) / 100,
    riskUsdPerTrade,
    expectedWinUsd,
    expectancyR: Math.round(expectancyR * 100) / 100,
    expectancyUsdPerTrade,
    weeklyExpectedUsd,
    monthlyExpectedUsd,
    monthlyExpectedPct: Math.round(monthlyExpectedPct * 100) / 100,
    profitFactorEstimate: Math.round(profitFactorEstimate * 100) / 100,
  };
}

export const DEFAULT_KNOWLEDGE_DOCUMENTS: CustomDocument[] = [
  {
    id: 'doc-builtin-web-sources',
    name: 'Directorio Oficial: 19 Webs Financieras Institucionales (Reuters, Bloomberg, ForexFactory, CME, Finviz...)',
    type: 'builtin',
    content: `# Directorio Oficial de Fuentes Web Financieras — TRstudio
1. Noticias Macroeconómicas y Bancos Centrales:
- Reuters Markets (https://www.reuters.com/markets/)
- Bloomberg Markets (https://www.bloomberg.com/markets)
- Financial Times (https://www.ft.com/markets)
- Wall Street Journal Markets (https://www.wsj.com/finance)
- ForexLive (https://www.forexlive.com/)
- FXStreet (https://www.fxstreet.com/)

2. Calendarios Económicos (Carpeta Roja) y Tasas de la Fed:
- ForexFactory Calendar (https://www.forexfactory.com/calendar)
- Investing.com Economic Calendar (https://www.investing.com/economic-calendar/)
- TradingEconomics (https://tradingeconomics.com/calendar)
- CME FedWatch Tool (https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html)
- FRED St. Louis Fed (https://fred.stlouisfed.org/)

3. Índices Bursátiles CFD (NAS100, US500, US30, US2000, GER40, UK100, EU50, FRA40, JP225, HK50):
- CNBC World Markets (https://www.cnbc.com/world-markets/)
- MarketWatch (https://www.marketwatch.com/)
- Yahoo Finance World Indices (https://finance.yahoo.com/world-indices/)
- Finviz S&P 500 & Nasdaq Heatmap (https://finviz.com/map.ashx)
- Barchart Futures & COT Report (https://www.barchart.com/futures)
- TradingView Global Indices (https://www.tradingview.com/markets/indices/)

4. Oro y Metales Preciosos (XAU/USD):
- Kitco Gold & Metals (https://www.kitco.com/)
- World Gold Council (https://www.gold.org/)`,
    charCount: 1490,
    description:
      'Base online principal con las 19 mejores webs financieras del mundo para investigar macro, calendarios de carpeta roja, bonos, índices CFD y oro en tiempo real.',
    addedAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  },
  ...TRADING_STRATEGIES.map((st) => ({
    id: `doc-builtin-${st.id}`,
    name: `Base Estratégica [${st.code}]: ${st.nameEs}`,
    type: 'builtin' as const,
    content: `${st.knowledgeBaseContent}\n\nPasos Operativos:\n${st.stepsEs.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\nInvalidación: ${st.invalidationEs}\nRegla Prop Firm: ${st.propFirmTipEs}`,
    charCount: st.knowledgeBaseContent.length + 450,
    description: `${st.subtitleEs} | Activos: ${st.bestAssets.join(', ')} | Win Rate Est.: ${st.winRateEstimate} | R:R: ${st.riskRewardTarget}`,
    addedAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  })),
  {
    id: 'doc-builtin-prop-risk-protocol',
    name: 'Base Cuantitativa: Protocolo Anti-Drawdown para Cuentas de Fondeo (FTMO / FundedNext / Apex)',
    type: 'builtin',
    content: `# Protocolo Cuantitativo de Gestión de Riesgo para Prop Firms
1. Fórmula Exacta de Lotaje:
   Lotes = Riesgo Monetario (USD) / (Distancia al Stop Loss en precio × Valor en USD de 1 punto por lote)
   - En Índices CFD US (NAS100, US500, US30, US2000): 1 Lote CFD estándar = $1.00 USD por punto (o $10.00 USD en contratos 10x).
   - En Índices CFD Europeos (GER40, EU50, FRA40): 1 Lote CFD = €1.00 EUR por punto (convertido a USD según EUR/USD).
   - En UK100 (FTSE 100): 1 Lote CFD = £1.00 GBP por punto (convertido a USD según GBP/USD).
   - En JP225 (Nikkei 225): 1 Lote CFD = ¥100 JPY por punto (convertido a USD según USD/JPY).
   - En Oro (XAUUSD): 1 Lote estándar (100 oz) = $100.00 USD por cada $1.00 de movimiento ($10/pip).
   - En EURUSD: 1 Lote estándar (100,000 uds) = $10.00 USD por cada 1 pip (0.0001).

2. Reglas de Supervivencia Diaria:
   - Riesgo recomendado por operación: 0.25% a 0.50% del balance.
   - Hard Circuit Breaker Diario: Detener operativa si se alcanza -1.50% en el día o 2 Stop Loss consecutivos.
   - Reducción progresiva en racha negativa: si la cuenta baja -2%, reducir el riesgo por trade a la mitad (0.25%).
   - Evitar mantener entradas nuevas abiertas durante el Rollover bancario (5:00 PM - 6:00 PM NY) por ampliación de spreads.`,
    charCount: 1320,
    description:
      'Fórmulas exactas de lotaje y pérdida monetaria por contrato para cada índice CFD, Oro y Forex junto con límites diarios anti-quiebra.',
    addedAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  },
];
