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
  invalidationEs: string;
  invalidationEn: string;
  propFirmTipEs: string;
  propFirmTipEn: string;
  /** Prompt content used when this strategy is activated as a Knowledge Base */
  knowledgeBaseContent: string;
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
    timeframes: '4H (Tendencia) → 1H (Order Block + Fibonacci OTE) → 15M (Entrada)',
    bestSessionEs: 'Londres (3:00 AM – 7:00 AM NY) y Nueva York (9:30 AM – 2:30 PM NY)',
    bestSessionEn: 'London (3:00 AM – 7:00 AM NY) and New York (9:30 AM – 2:30 PM NY)',
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
    timeframes: '1H (PDH/PDL + ATR) → 15M (Rechazo) → 5M (CHoCH)',
    bestSessionEs: '10:30 AM – 12:00 PM NY (Reversión de Londres/Cierre Europeo) y 1:30 PM – 3:30 PM NY',
    bestSessionEn: '10:30 AM – 12:00 PM NY (London Close Reversal) and 1:30 PM – 3:30 PM NY',
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
];

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
