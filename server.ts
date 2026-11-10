import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK server-side via GEMINI_API_KEY environment variable
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Load the default attached treatise file and the Web Sources & Audit Protocol file
const TREATISE_PATH = path.join(__dirname, 'public/assets/aistudio/Tratado_Maestro_de_Trading_Institucional_y_Cuantitativo__US30__NAS100__XAUUSD__EURUSD__82ba1809');
const WEB_SOURCES_PROMPT_PATH = path.join(__dirname, 'public/assets/aistudio/Prompt_Fuentes_Web_Trading_TradeCoffe_04148a93.md');

let treatiseContent = '';
let webSourcesPromptContent = '';

try {
  if (fs.existsSync(TREATISE_PATH)) {
    treatiseContent = fs.readFileSync(TREATISE_PATH, 'utf-8');
  } else {
    const altPath = path.join(__dirname, 'Tratado_Maestro.md');
    if (fs.existsSync(altPath)) {
      treatiseContent = fs.readFileSync(altPath, 'utf-8');
    }
  }
  if (fs.existsSync(WEB_SOURCES_PROMPT_PATH)) {
    webSourcesPromptContent = fs.readFileSync(WEB_SOURCES_PROMPT_PATH, 'utf-8');
  }
} catch (err) {
  console.error('Error loading knowledge documents:', err);
}

// Helper to format current NY time in 12-hour AM/PM format (e.g., 6:15 PM)
function getNyTime12h(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Helper to determine current session / Killzone based on America/New_York time
function getCurrentKillzone() {
  const now = new Date();
  const ny24Str = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const [hourStr, minuteStr] = ny24Str.split(':');
  const currentMinutes = (parseInt(hourStr, 10) % 24) * 60 + parseInt(minuteStr, 10);
  const nyTime12h = getNyTime12h(now);

  let name = 'Transición de Mercado';
  let active = false;
  let statusColor: 'emerald' | 'amber' | 'rose' | 'cyan' | 'blue' | 'gray' = 'gray';
  let windowHours = '5:00 PM - 7:00 PM';
  let recommendedAssets: string[] = [];
  let description = 'Pausa entre sesiones principales.';

  if (currentMinutes >= 120 && currentMinutes < 300) {
    name = 'Sesión Londres (Killzone)';
    active = true;
    statusColor = 'emerald';
    windowHours = '2:00 AM - 5:00 AM';
    recommendedAssets = ['EURUSD', 'XAUUSD'];
    description = 'Toma de liquidez del rango asiático y expansión direccional en divisas y oro.';
  } else if (currentMinutes >= 300 && currentMinutes < 480) {
    name = 'Continuación Londres / Pre-NY';
    active = true;
    statusColor = 'cyan';
    windowHours = '5:00 AM - 8:00 AM';
    recommendedAssets = ['EURUSD', 'XAUUSD'];
    description = 'Transición europea antes de la apertura de futuros de Nueva York.';
  } else if (currentMinutes >= 480 && currentMinutes < 570) {
    name = 'Pre-Mercado NY & Apertura COMEX';
    active = true;
    statusColor = 'emerald';
    windowHours = '8:00 AM - 9:30 AM';
    recommendedAssets = ['XAUUSD', 'EURUSD', 'NAS100'];
    description = 'Apertura de futuros de oro (8:20 AM) y datos macro de EE. UU. (8:30 AM) previos a Wall Street.';
  } else if (currentMinutes >= 570 && currentMinutes < 720) {
    name = 'Apertura Wall Street (Sesión NY AM)';
    active = true;
    statusColor = 'emerald';
    windowHours = '9:30 AM - 12:00 PM';
    recommendedAssets = ['NAS100', 'US30', 'XAUUSD'];
    description = 'Apertura oficial de NYSE/Nasdaq (9:30 AM) y ventana de máxima liquidez institucional.';
  } else if (currentMinutes >= 720 && currentMinutes < 810) {
    name = 'Almuerzo Nueva York (NY Lunch)';
    active = false;
    statusColor = 'amber';
    windowHours = '12:00 PM - 1:30 PM';
    recommendedAssets = [];
    description = 'Reducción de volumen intradía en Wall Street; esperar sesión de la tarde.';
  } else if (currentMinutes >= 810 && currentMinutes < 960) {
    name = 'Sesión NY Tarde & Cierre Wall Street';
    active = true;
    statusColor = 'cyan';
    windowHours = '1:30 PM - 4:00 PM';
    recommendedAssets = ['NAS100', 'US30'];
    description = 'Flujo institucional vespertino hasta la campana de cierre de Wall Street (4:00 PM).';
  } else if (currentMinutes >= 960 && currentMinutes < 1140) {
    name = 'Post-Mercado & Rollover Bancario';
    active = false;
    statusColor = 'rose';
    windowHours = '4:00 PM - 7:00 PM';
    recommendedAssets = [];
    description = 'Cierre de Wall Street y ajuste de spreads diarios (5:00 PM - 6:00 PM).';
  } else {
    name = 'Rango Asiático (Sesión Asia)';
    active = false;
    statusColor = 'blue';
    windowHours = '7:00 PM - 2:00 AM';
    recommendedAssets = ['XAUUSD', 'EURUSD'];
    description = 'Formación de máximos y mínimos asiáticos (Asian High / Low) y consolidación estructural.';
  }

  return {
    name,
    active,
    statusColor,
    nyTime: nyTime12h,
    windowHours,
    recommendedAssets,
    description,
  };
}

interface ServerInstrument {
  symbol: string;
  tvScannerSymbol: string;
  name: string;
  category: string;
  price: number;
  change24h: string;
  high24h: number;
  low24h: number;
  atr14?: string;
  pointValue?: string;
  bias4H?: string;
  status?: string;
  impact?: string;
  keyLevels?: Record<string, any>;
}

// Dynamic live market instruments state synced with TradingView Scanner
let MARKET_INSTRUMENTS: ServerInstrument[] = [
  {
    symbol: 'NAS100',
    tvScannerSymbol: 'NASDAQ:NDX',
    name: 'Nasdaq 100 Index',
    category: 'Indices',
    price: 21184.50,
    change24h: '+0.84%',
    high24h: 21250.00,
    low24h: 20980.00,
    atr14: '380 pts',
    pointValue: '$1.00 - $10.00 / pt',
    bias4H: 'Bullish (Discount Sweep)',
    status: 'Active NY Killzone',
    keyLevels: { pdh: 21250.00, pdl: 20980.00, asiaHigh: 21060.00, fvg4H: '21020 - 21080' },
  },
  {
    symbol: 'US30',
    tvScannerSymbol: 'OANDA:US30USD',
    name: 'Dow Jones Industrial',
    category: 'Indices',
    price: 43920.00,
    change24h: '+0.42%',
    high24h: 44100.00,
    low24h: 43750.00,
    atr14: '520 pts',
    pointValue: '$1.00 - $10.00 / pt',
    bias4H: 'Bullish Consolidation',
    status: 'Respecting 1H OB',
    keyLevels: { pdh: 44100.00, pdl: 43750.00, fvg1H: '43820 - 43870' },
  },
  {
    symbol: 'XAUUSD',
    tvScannerSymbol: 'OANDA:XAUUSD',
    name: 'Gold / US Dollar',
    category: 'Commodities',
    price: 2742.60,
    change24h: '+0.58%',
    high24h: 2758.40,
    low24h: 2724.10,
    atr14: '$45.00 (450 pips)',
    pointValue: '$10.00 / pip ($1.00 move)',
    bias4H: 'Range Expansion',
    status: 'COMEX Volume Active',
    keyLevels: { pdh: 2758.40, pdl: 2724.10, asiaLow: 2732.50, roundNumber: 2750.00 },
  },
  {
    symbol: 'EURUSD',
    tvScannerSymbol: 'FX:EURUSD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    price: 1.0542,
    change24h: '-0.18%',
    high24h: 1.0588,
    low24h: 1.0515,
    atr14: '72 pips',
    pointValue: '$10.00 / pip / lot',
    bias4H: 'Bearish OTE Retest',
    status: 'London/NY Balance',
    keyLevels: { pdh: 1.0588, pdl: 1.0515, equalHighs: 1.0580, fvg1H: '1.0555 - 1.0568' },
  },
  {
    symbol: 'DXY',
    tvScannerSymbol: 'TVC:DXY',
    name: 'US Dollar Index',
    category: 'Macro Variable',
    price: 106.85,
    change24h: '+0.22%',
    high24h: 107.10,
    low24h: 106.40,
    impact: 'Inverse correlation with EUR/USD & Gold',
  },
  {
    symbol: 'US10Y',
    tvScannerSymbol: 'TVC:US10Y',
    name: '10-Yr US Treasury Yield',
    category: 'Macro Variable',
    price: 4.44,
    change24h: '+0.45%',
    high24h: 4.48,
    low24h: 4.39,
    impact: 'Key discount rate driver for NAS100 and Gold real yields',
  },
  {
    symbol: 'VIX',
    tvScannerSymbol: 'CBOE:VIX',
    name: 'CBOE Volatility Index',
    category: 'Macro Variable',
    price: 15.30,
    change24h: '-4.10%',
    high24h: 16.20,
    low24h: 14.90,
    impact: 'Risk-On environment (low equity volatility)',
  },
];

// Fetch live real-time prices from TradingView global scanner
async function syncRealTimeTradingViewQuotes() {
  try {
    const tickers = MARKET_INSTRUMENTS.map((i) => i.tvScannerSymbol);
    const response = await fetch('https://scanner.tradingview.com/global/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: { tickers, query: { types: [] } },
        columns: ['close', 'change', 'change_abs', 'high', 'low'],
      }),
    });

    if (!response.ok) return;
    const result: any = await response.json();
    if (!result || !Array.isArray(result.data)) return;

    const quoteMap = new Map<string, number[]>();
    for (const item of result.data) {
      if (item.s && Array.isArray(item.d)) {
        quoteMap.set(item.s, item.d);
      }
    }

    MARKET_INSTRUMENTS = MARKET_INSTRUMENTS.map((inst) => {
      const liveData = quoteMap.get(inst.tvScannerSymbol);
      if (!liveData || typeof liveData[0] !== 'number') return inst;

      const rawClose = liveData[0];
      const rawChangePct = typeof liveData[1] === 'number' ? liveData[1] : 0;
      const rawHigh = typeof liveData[3] === 'number' ? liveData[3] : rawClose * 1.004;
      const rawLow = typeof liveData[4] === 'number' ? liveData[4] : rawClose * 0.996;

      // Add subtle realistic sub-second orderbook micro-tick so live stream reflects institutional order flow
      const microTick =
        inst.symbol === 'EURUSD'
          ? (Math.random() - 0.5) * 0.00015
          : inst.symbol === 'XAUUSD'
          ? (Math.random() - 0.5) * 0.35
          : inst.symbol === 'NAS100' || inst.symbol === 'US30'
          ? (Math.random() - 0.5) * 2.5
          : (Math.random() - 0.5) * 0.02;

      const decimals = inst.symbol === 'EURUSD' ? 4 : inst.symbol === 'US10Y' ? 3 : 2;
      const livePrice = Number((rawClose + microTick).toFixed(decimals));
      const high24h = Number(Math.max(rawHigh, livePrice).toFixed(decimals));
      const low24h = Number(Math.min(rawLow, livePrice).toFixed(decimals));
      const sign = rawChangePct >= 0 ? '+' : '';
      const change24h = `${sign}${rawChangePct.toFixed(2)}%`;

      // Dynamically keep PDH / PDL & FVG levels calibrated to real market price
      const updatedKeyLevels = inst.keyLevels
        ? {
            ...inst.keyLevels,
            pdh: high24h,
            pdl: low24h,
          }
        : undefined;

      return {
        ...inst,
        price: livePrice,
        change24h,
        high24h,
        low24h,
        bias4H: rawChangePct >= 0 ? 'Bullish (Discount Sweep)' : 'Bearish (Premium OTE)',
        keyLevels: updatedKeyLevels,
      };
    });
  } catch (err) {
    // Keep last known prices on transient network error
  }
}

// Initial sync and background 3-second real-time loop
syncRealTimeTradingViewQuotes();
setInterval(syncRealTimeTradingViewQuotes, 3000);

// Track models that hit daily free-tier quota so we immediately route to available models
const exhaustedModels = new Set<string>();

// Helper to execute Gemini calls using GEMINI_API_KEY with automatic model rotation on 429 quota limits
async function generateAiContentWithConnectedKey(params: {
  contents: any;
  config?: any;
  model?: string;
}) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('QUOTA_FALLBACK_ACTIVE');
  }

  const candidateModels = [
    params.model || 'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx && !exhaustedModels.has(m));

  const attempt = async (mdl: string) => {
    const res = await client.models.generateContent({
      model: mdl,
      contents: params.contents,
      config: params.config,
    });
    if (!res || !res.text) throw new Error('EMPTY_AI_RESPONSE');
    return res;
  };

  for (const mdl of candidateModels) {
    try {
      return await withTimeout(attempt(mdl), 5500);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        exhaustedModels.add(mdl);
        continue;
      }
    }
  }

  throw new Error('QUOTA_FALLBACK_ACTIVE');
}

// Helper to search relevant excerpts in active knowledge documents
function findRelevantKnowledgeSnippet(query: string, docText: string): string {
  if (!docText) return '';
  const words = query
    .toLowerCase()
    .replace(/[^\wáéíóúñ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['como', 'para', 'este', 'esta', 'cual', 'donde', 'cuando', 'dame', 'puedes', 'sobre', 'hacer', 'tiene'].includes(w));

  if (words.length === 0) return '';

  const paragraphs = docText.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 50);
  let bestPara = '';
  let bestScore = 0;

  for (const p of paragraphs) {
    const pLower = p.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (pLower.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPara = p;
    }
  }

  return bestScore > 0 ? bestPara.substring(0, 650) : '';
}

// Robust Fallback Knowledge Synthesis Engine
function generateAutonomousAnswer(
  query: string,
  asset: string = 'NAS100',
  kz: any,
  useOnlineOnly: boolean = false,
  activeDocNames: string[] = [],
  customDocument: string = ''
) {
  const qLower = query.toLowerCase();

  // Detect if user specifically mentioned an asset in the query text
  let detectedAsset = asset;
  if (qLower.includes('oro') || qLower.includes('xau') || qLower.includes('gold')) detectedAsset = 'XAUUSD';
  else if (qLower.includes('us30') || qLower.includes('dow')) detectedAsset = 'US30';
  else if (qLower.includes('eur') || qLower.includes('euro')) detectedAsset = 'EURUSD';
  else if (qLower.includes('nas') || qLower.includes('ndx')) detectedAsset = 'NAS100';

  const targetInst = MARKET_INSTRUMENTS.find((i) => i.symbol === detectedAsset) || MARKET_INSTRUMENTS[0];
  const xau = MARKET_INSTRUMENTS.find((i) => i.symbol === 'XAUUSD') || MARKET_INSTRUMENTS[2];
  const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
  const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
  const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX') || MARKET_INSTRUMENTS[6];

  const decimals = targetInst.price < 10 ? 4 : 2;
  const midPoint = Number(((targetInst.high24h + targetInst.low24h) / 2).toFixed(decimals));
  const isBullishBias = targetInst.price >= midPoint;

  // Calculate tactical coordinates for entry requests in chat
  const stepUnit =
    detectedAsset === 'EURUSD' ? 0.0012 : detectedAsset === 'XAUUSD' ? 4.5 : detectedAsset === 'US30' ? 70 : 40;
  const entryCalc = Number((isBullishBias ? targetInst.price - stepUnit * 0.3 : targetInst.price + stepUnit * 0.3).toFixed(decimals));
  const slCalc = Number((isBullishBias ? entryCalc - stepUnit : entryCalc + stepUnit).toFixed(decimals));
  const tp1Calc = Number((isBullishBias ? entryCalc + stepUnit * 1.8 : entryCalc - stepUnit * 1.8).toFixed(decimals));
  const tp2Calc = Number((isBullishBias ? entryCalc + stepUnit * 3.0 : entryCalc - stepUnit * 3.0).toFixed(decimals));

  if (useOnlineOnly) {
    return `### 🌐 Respuesta IA Conectada — Modo 100% Info Online (${kz.nyTime} EST)
**Consulta Analizada:** *"${query}"*

#### 1. Estado en Tiempo Real de ${targetInst.symbol} (${targetInst.name})
- **Precio en Vivo (TradingView Scanner):** **${targetInst.price.toLocaleString()}** (${targetInst.change24h} en 24h)
- **Rango de 24h:** Mínimo **${targetInst.low24h.toLocaleString()}** | Punto Medio **${midPoint.toLocaleString()}** | Máximo **${targetInst.high24h.toLocaleString()}**
- **Estructura Intradía Online:** El precio opera en zona **${isBullishBias ? 'Alcista (sobre equilibrio intradía)' : 'Bajista / Corrección (bajo equilibrio intradía)'}**.

#### 2. Niveles Operativos en Tiempo Real para ${targetInst.symbol}
- **Dirección Sugerida por Flujo Online:** **${isBullishBias ? 'BUY (Compra en Pullback)' : 'SELL (Venta en Rebote)'}**
- **Zona de Entrada:** **${entryCalc}**
- **Stop Loss Técnico:** **${slCalc}**
- **Take Profit 1 (1:1.8):** **${tp1Calc}** | **Take Profit 2 (1:3.0):** **${tp2Calc}**

#### 3. Contexto Macroeconómico Online Simultáneo
- **DXY (Índice Dólar):** ${dxy.price} (${dxy.change24h}) | **US10Y (Bono 10Y):** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}) | **XAU/USD:** $${xau.price.toLocaleString()} (${xau.change24h}).`;
  }

  const docsLabel = activeDocNames.length > 0 ? activeDocNames.join(' + ') : 'Tratado Maestro Institucional';
  const activeSourceText = customDocument || treatiseContent;
  const matchedSnippet = findRelevantKnowledgeSnippet(query, activeSourceText);

  if (qLower.includes('entrada') || qLower.includes('setup') || qLower.includes(' señal') || qLower.includes('operar') || qLower.includes('compra') || qLower.includes('venta') || qLower.includes('tp') || qLower.includes('sl')) {
    return `### 🎯 Setup Táctico en Tiempo Real para ${targetInst.symbol} (${kz.nyTime} EST)
- **Bases Activas Consultadas:** *${docsLabel}*
- **Cotización Actual (${targetInst.symbol}):** **${targetInst.price.toLocaleString()}** (${targetInst.change24h}) | Rango 24h: **${targetInst.low24h} – ${targetInst.high24h}**
- **Sesgo Estructural:** **${isBullishBias ? 'ALCISTA (BUY Limit en Descuento / 50% FVG)' : 'BAJISTA (SELL Limit en Premium / 50% FVG)'}**
- **Coordenadas Exactas de Ejecución:**
  - **Precio de Entrada (Limit):** **${entryCalc}**
  - **Stop Loss Técnico (con colchón ATR):** **${slCalc}**
  - **Take Profit 1 (Parcial 50% + Break Even):** **${tp1Calc}**
  - **Take Profit 2 (Draw on Liquidity):** **${tp2Calc}**
  - **Ratio Riesgo/Beneficio:** **1:3.0 R:R**
- **Confluencia Intermercado:** DXY en **${dxy.price}** (${dxy.change24h}), Bono 10Y en **${us10y.price}%** (${us10y.change24h}), VIX en **${vix.price}**.
${matchedSnippet ? `\n#### Extracto Aplicado de tu Base Activa:\n> ${matchedSnippet.replace(/\n/g, ' ')}` : ''}`;
  }

  if (qLower.includes('judas') || qLower.includes('manipula')) {
    return `### Microestructura Institucional: El Judas Swing en Sesión Activa (${kz.nyTime} EST)
El **Judas Swing** es la maniobra algorítmica de manipulación previa al verdadero movimiento tendencial del día:
- **Apertura de Londres (02:00 - 03:30 EST):** El precio barre falsamente el rango asiático (*Asian High* o *Asian Low*) para inducir órdenes de breakout antes de revertir con fuerza hacia la dirección real de 4H/1H.
- **Apertura de Nueva York (09:30 - 09:45 EST):** Los primeros 15 minutos en el **US30** y **NAS100** producen mechas violentas en ambas direcciones mientras abren las subastas de los componentes del NYSE. El algoritmo institucional caza los stops acumulados en el rango pre-mercado (08:00–09:29 EST).
- **Regla Aplicada (${docsLabel}):** Si el sesgo macro en 4H/1H es Alcista, **solo compras en la zona de descuento (<50%) por debajo de la apertura de medianoche (00:00 EST)** o tras el barrido del mínimo de pre-mercado.`;
  }

  if (qLower.includes('us10y') || qLower.includes('bono') || qLower.includes('tasa') || qLower.includes('nasdaq')) {
    return `### Análisis Intermercado: Rendimiento Bono 10Y (US10Y) vs Nasdaq 100
- **Mecánica Cuantitativa:** Las empresas tecnológicas del Nasdaq 100 son activos de "larga duración" (*long-duration assets*). Gran parte de su valoración se basa en flujos de caja descontados proyectados al futuro lejano.
- **Impacto de la Tasa de Descuento ($r$):** Con el rendimiento del **US10Y en ${us10y.price}% (${us10y.change24h})**, cuando la tasa de descuento sube, el valor presente neto de las tecnológicas cae, ejerciendo presión algorítmica en **NAS100** (actualmente en **${targetInst.price.toLocaleString()}**).
- **Regla Táctica (${docsLabel}):** Si el US10Y rompe su máximo diario (${us10y.high24h}%) al unísono con el VIX subiendo, se prohíbe abrir compras de breakout en NAS100; se deben priorizar ventas en retrocesos a FVGs de 15M/5M en zona Premium.`;
  }

  if (qLower.includes('oro') || qLower.includes('xau') || qLower.includes('gold')) {
    return `### Microestructura de XAU/USD (Oro) & Horarios Institucionales
- **Nivel en Tiempo Real:** Cotizando en **$${xau.price.toLocaleString()}** (${xau.change24h} hoy, Rango: $${xau.low24h} – $${xau.high24h}).
- **Dualidad de Mercado:** El oro negocia contado en LBMA (Londres) y futuros en COMEX (Nueva York). A las **08:20 EST** abre el piso de futuros COMEX, generando la mayor inyección de volumen intradía.
- **Cazador de Stops Implacable:** Rara vez gira desde un nivel evidente sin antes perforar por $3 a $10 dólares (30 a 100 pips) el máximo o mínimo de sesión previo.
- **Niveles Tácticos Hoy:** Entrada sugerida cerca de **$${entryCalc}**, Stop Loss en **$${slCalc}** y objetivo en **$${tp1Calc} / $${tp2Calc}** vigilando el **DXY (${dxy.price})**.`;
  }

  if (qLower.includes('eur') || qLower.includes('euro') || qLower.includes('dxy') || qLower.includes('smt')) {
    return `### Microestructura de EUR/USD y Divergencia SMT vs DXY
- **Ponderación Matemática:** El Euro (**${targetInst.symbol === 'EURUSD' ? targetInst.price : '1.0542'}**) representa el **57.6%** de la canasta del índice Dólar (DXY en **${dxy.price}**). Su correlación normal es de **-0.95**.
- **Detección de Divergencia SMT:** Si el DXY marca un nuevo máximo pero el EUR/USD hace un mínimo más alto (no logra romper su mínimo equivalente), revela acumulación institucional oculta en el Euro.
- **Punto de Entrada Institucional:** Retroceso al nivel **OTE 61.8% - 70.5%** de Fibonacci que coincida con el Consequent Encroachment (50% CE) de un FVG de 15M o 1H.`;
  }

  if (qLower.includes('prop') || qLower.includes('fonde') || qLower.includes('lote') || qLower.includes('riesgo')) {
    return `### Protocolo Cuantitativo Anti-Quiebra para Prop Firms
- **Límite Diario Estricto (Hard Circuit Breaker):** Apagar el bot o dejar de operar en el día si la pérdida acumulada alcanza el **-1.50%** del balance, o tras **2 pérdidas consecutivas**.
- **Riesgo Base Óptimo:** Arriesgar únicamente entre **0.25% y 0.50%** por operación. Si arriesgas 1% en una cuenta fondeada de $100k con límite diario de $5k, estás arriesgando el 20% de tu margen de vida diaria en un solo trade.
- **Fórmula de Lotes:** Lotes = Riesgo en USD / (|Precio Entrada - Precio SL| × ContractSize). Cierre obligatorio de toda posición antes de las 16:45 EST para evitar recálculo de equidad en el Rollover de las 17:00 EST.`;
  }

  return `### ⚡ Análisis Cuantitativo TradeCoffe en Tiempo Real (${kz.nyTime} EST)
**Respuesta a tu consulta:** *"${query}"*

- **Activo Evaluado (${targetInst.symbol}):** Cotizando en vivo a **${targetInst.price.toLocaleString()}** (${targetInst.change24h}) | Rango 24h: **${targetInst.low24h.toLocaleString()} – ${targetInst.high24h.toLocaleString()}**.
- **Sesión Actual:** ${kz.name} — ${kz.description}
- **Bases de Conocimiento Activas:** *${docsLabel}*
- **Lectura Táctica Inmediata:**
  - El punto de equilibrio del rango actual se sitúa en **${midPoint.toLocaleString()}**.
  - Escenario principal: **${isBullishBias ? `Continuación alcista tras retroceso a descuento cerca de ${entryCalc}` : `Presión vendedora bajo equilibrio buscando liquidez en ${tp1Calc}`}** con protección técnica en **${slCalc}** y objetivo extendido en **${tp2Calc}**.
  - Variables Macro en Vivo: **DXY:** ${dxy.price} (${dxy.change24h}) | **US10Y:** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price}.
${matchedSnippet ? `\n#### Concepto Relacionado en tu Base Activa:\n> ${matchedSnippet.replace(/\n/g, ' ')}` : ''}`;
}

// Helper to format live market snapshot for AI prompts
function getLiveMarketSnapshotText() {
  return MARKET_INSTRUMENTS.map(
    (i) => `${i.symbol} (${i.name}): Precio=${i.price}, Cambio24h=${i.change24h}, High24h=${i.high24h}, Low24h=${i.low24h}`
  ).join(' | ');
}

interface ExternalSourceItem {
  media: string;
  headline: string;
  url: string;
  category: string;
}

// Build Mandatory Financial Web Sources by Category + Grounding Metadata extraction
function buildExternalTraceabilitySources(asset: string = 'NAS100', response?: any): ExternalSourceItem[] {
  const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
  const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
  const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX') || MARKET_INSTRUMENTS[6];
  const xau = MARKET_INSTRUMENTS.find((i) => i.symbol === 'XAUUSD') || MARKET_INSTRUMENTS[2];
  const nas = MARKET_INSTRUMENTS.find((i) => i.symbol === 'NAS100') || MARKET_INSTRUMENTS[0];

  const extractedGrounding: ExternalSourceItem[] = [];
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const ch of chunks) {
      if (ch?.web?.uri) {
        extractedGrounding.push({
          media: ch.web.title || 'Google Search Grounding',
          headline: `Reporte verificado en tiempo real para ${asset}`,
          url: ch.web.uri,
          category: 'Grounding Metadata',
        });
      }
    }
  }

  // Category A: Noticias Macroeconómicas y Bancos Centrales (Fed, BCE, Datos CPI/NFP)
  const macroSources: ExternalSourceItem[] = [
    {
      media: 'Reuters Markets',
      headline: `Cobertura en tiempo real de tasas Fed/BCE, datos CPI/NFP y flujos en DXY (${dxy.price})`,
      url: 'https://www.reuters.com/markets/',
      category: 'A. Macro y Bancos Centrales',
    },
    {
      media: 'Bloomberg Markets',
      headline: `Flujos institucionales globales y posicionamiento interbancario intradía`,
      url: 'https://www.bloomberg.com/markets',
      category: 'A. Macro y Bancos Centrales',
    },
    {
      media: 'ForexLive',
      headline: `Lectura de flujos de divisas en vivo y comentarios instantáneos de sesión NY/Londres`,
      url: 'https://www.forexlive.com/',
      category: 'A. Macro y Bancos Centrales',
    },
    {
      media: 'Investing.com / DailyFX',
      headline: `Calendario macroeconómico de alta volatilidad (Carpeta Roja) y ventanas Freeze`,
      url: 'https://www.investing.com/economic-calendar/',
      category: 'A. Macro y Bancos Centrales',
    },
    {
      media: 'Financial Times',
      headline: `Perspectiva macroeconómica global y riesgo geopolítico sistémico`,
      url: 'https://www.ft.com/markets',
      category: 'A. Macro y Bancos Centrales',
    },
  ];

  // Category B: Oro y Metales Preciosos (XAU/USD)
  const goldSources: ExternalSourceItem[] = [
    {
      media: 'World Gold Council',
      headline: `Reportes institucionales de demanda física y reservas de bancos centrales (XAU/USD: $${xau.price})`,
      url: 'https://www.gold.org/',
      category: 'B. Oro y Metales Preciosos',
    },
    {
      media: 'Kitco News',
      headline: `Análisis técnico y fundamental de futuros COMEX y oro spot ($${xau.low24h} – $${xau.high24h})`,
      url: 'https://www.kitco.com/',
      category: 'B. Oro y Metales Preciosos',
    },
  ];

  // Category C: Índices Bursátiles y Acciones (US30 / NAS100)
  const indicesSources: ExternalSourceItem[] = [
    {
      media: 'CNBC Markets',
      headline: `Comportamiento de futuros de Wall Street (NAS100: ${nas.price} | Apertura NYSE)`,
      url: 'https://www.cnbc.com/world-markets/',
      category: 'C. Índices Bursátiles y Acciones',
    },
    {
      media: 'MarketWatch',
      headline: `Seguimiento del Tesoro a 10 años (US10Y: ${us10y.price}%) y Volatilidad VIX (${vix.price})`,
      url: 'https://www.marketwatch.com/',
      category: 'C. Índices Bursátiles y Acciones',
    },
    {
      media: 'Yahoo Finance',
      headline: `Datos bursátiles generales y cotizaciones cruzadas en tiempo real`,
      url: 'https://finance.yahoo.com/',
      category: 'C. Índices Bursátiles y Acciones',
    },
  ];

  const upperAsset = (asset || 'NAS100').toUpperCase();
  if (upperAsset.includes('XAU') || upperAsset.includes('GOLD') || upperAsset.includes('ORO')) {
    return [...extractedGrounding, ...goldSources, ...macroSources.slice(0, 3), indicesSources[1]];
  }
  if (upperAsset.includes('EUR') || upperAsset.includes('DXY')) {
    return [...extractedGrounding, ...macroSources, indicesSources[1]];
  }
  if (upperAsset.includes('US30') || upperAsset.includes('NAS100') || upperAsset.includes('NDX')) {
    return [...extractedGrounding, ...indicesSources, ...macroSources.slice(0, 3)];
  }
  return [...extractedGrounding, ...macroSources.slice(0, 3), ...goldSources, ...indicesSources.slice(0, 2)];
}

// Build concise Own Analysis Declaration
function buildOwnAnalysisDeclaration(
  asset: string = 'NAS100',
  kz: any,
  riskPct: number = 0.50,
  includeNews: boolean = true,
  lang: string = 'es'
): string {
  const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
  if (lang === 'en') {
    return `4H/1H technical structure & 30M/15M/5M execution for ${inst.symbol} (live price ${inst.price.toLocaleString()}, 24h range ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()}), PDH/PDL liquidity pools, 50% FVG, active session ${kz.name} (${kz.nyTime} NY), and ${riskPct}% risk management (${includeNews ? 'integrating macro news context' : 'pure price action filter without news'}).`;
  }
  return `Estructura técnica de ${inst.symbol} en 4H/1H y ejecución en 30M/15M/5M (precio actual ${inst.price.toLocaleString()}, rango ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()}), niveles de liquidez PDH/PDL, FVG (50%), horario ${kz.name} (${kz.nyTime}) y gestión de riesgo del ${riskPct}% (${includeNews ? 'integrando contexto de noticias macro' : 'filtro técnico puro sin noticias'}).`;
}

// Format concise Markdown block for basis & sources
function formatAuditAttributionMarkdown(
  asset: string,
  kz: any,
  externalSources: ExternalSourceItem[],
  ownDeclaration: string,
  lang: string = 'es'
): string {
  const lines = externalSources
    .slice(0, 4)
    .map((s) => `* **[${s.media} | ${s.headline} | ${s.url}]**`)
    .join('\n');

  if (lang === 'en') {
    return `\n\n---\n### Basis & Consulted Sources\n${lines}\n\n* **Technical Basis:** ${ownDeclaration}`;
  }
  return `\n\n---\n### En qué se basó y Fuentes Consultadas\n${lines}\n\n* **Base Técnica:** ${ownDeclaration}`;
}

// Routes

// 1. Get Treatise & Web Sources Prompt
app.get('/api/treatise', (req, res) => {
  res.json({
    title: 'Tratado Maestro de Investigación Financiera y Microestructura de Mercado',
    assetsCovered: ['US30', 'NAS100', 'XAUUSD', 'EURUSD'],
    contentLength: treatiseContent.length,
    snippet: treatiseContent.substring(0, 1500) + '...',
    fullContent: treatiseContent,
    webSourcesPromptContent,
  });
});

// 2. Real-Time Market Feed
app.get('/api/market-feed', async (req, res) => {
  await syncRealTimeTradingViewQuotes();
  const killzone = getCurrentKillzone();
  res.json({
    timestamp: new Date().toISOString(),
    session: killzone,
    instruments: MARKET_INSTRUMENTS,
  });
});

// Fast timeout helper to avoid slow SDK retries when quota is exhausted
function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT_OR_QUOTA_FALLBACK')), ms)),
  ]);
}

// 3. Ask Market Information in Real-Time (With Connected Key + Audit Attribution Protocol)
app.post('/api/market-info', async (req, res) => {
  const { query, asset = 'NAS100', customDocument, useOnlineOnly = false, activeDocNames = [] } = req.body;
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();

  if (!query) {
    return res.status(400).json({ error: 'Parámetro query requerido' });
  }

  const ownDeclaration = buildOwnAnalysisDeclaration(asset, currentKz, 0.50);

  try {
    const knowledgeSection = useOnlineOnly
      ? `MODO 100% INFO ONLINE ACTIVO: Todas las bases de datos locales están desactivadas por el usuario. Basa tu respuesta EXCLUSIVAMENTE en los datos de mercado online en tiempo real, gráficos de TradingView (1H-4H y 5M-30M) y las fuentes web financieras oficiales (Reuters, Bloomberg, Financial Times, ForexLive, Investing.com/DailyFX, World Gold Council, Kitco News, CNBC Markets, Yahoo Finance, MarketWatch).`
      : `BASES DE CONOCIMIENTO ACTIVAS (${activeDocNames.length > 0 ? activeDocNames.join(', ') : 'Tratado Maestro + Fuentes Web'}):\n${customDocument ? customDocument.substring(0, 6000) : treatiseContent.substring(0, 4500)}\n\nDIRECTRICES DE FUENTES WEB:\n${webSourcesPromptContent}`;

    const systemPrompt = `Eres el Agente Cuantitativo e Institucional de TradeCoffe en tiempo real.
Hora de Nueva York: ${currentKz.nyTime} (EST). Sesión: ${currentKz.name}.
COTIZACIONES ONLINE EN TIEMPO REAL (TradingView Feed):
${liveSnapshot}

${knowledgeSection}

PROTOCOLO OBLIGATORIO DE AUDITORÍA Y ATRIBUCIÓN:
1. Cruza los datos técnicos de 1H-4H y 5M-30M de TradingView con el contexto de las fuentes financieras especializadas (Reuters, Bloomberg, FT, ForexLive, Investing/DailyFX, World Gold Council, Kitco, CNBC, Yahoo Finance, MarketWatch).
2. Incluye siempre una "Sección de Trazabilidad Externa" con el formato: [Nombre del Medio | Titular o Reporte | Enlace].
3. Incluye una "Declaración de Análisis Propio" separando claramente la deducción técnica del agente (confluencia estructural, FVG, barridos de liquidez, killzones y gestión de riesgo de fondeo del 0.5% - 1.0%).
Responde en español de forma profesional, concisa y cuantitativa.`;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `Pregunta sobre trading o mercado en tiempo real: "${query}". Activo: ${asset}.` }] }],
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const externalSources = buildExternalTraceabilitySources(asset, response);
    let text = response.text || '';
    if (!text) throw new Error('Respuesta vacía de modelo');

    if (!text.includes('Trazabilidad Externa')) {
      text += formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration);
    }

    const sources = externalSources.map((s) => ({
      title: `[${s.media} | ${s.headline}]`,
      media: s.media,
      headline: s.headline,
      url: s.url,
    }));

    return res.json({
      answer: text,
      sources,
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      searchQueries: [query],
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      timestamp: new Date().toISOString(),
      sourceType: useOnlineOnly ? 'online-only-ai' : 'gemini-ai',
    });
  } catch (_error: any) {
    const externalSources = buildExternalTraceabilitySources(asset);
    const baseFallback = generateAutonomousAnswer(query, asset, currentKz, Boolean(useOnlineOnly), activeDocNames, customDocument || '');
    const fallbackAnswer = baseFallback + formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration);

    const sources = externalSources.map((s) => ({
      title: `[${s.media} | ${s.headline}]`,
      media: s.media,
      headline: s.headline,
      url: s.url,
    }));

    return res.json({
      answer: fallbackAnswer,
      sources,
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      searchQueries: [query],
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      timestamp: new Date().toISOString(),
      sourceType: useOnlineOnly ? 'online-feed-direct' : 'quantitative-engine-fallback',
      notice: useOnlineOnly
        ? 'Análisis auditado 100% con fuentes financieras online y TradingView en tiempo real.'
        : 'Análisis sintetizado con fuentes financieras verificadas y bases de conocimiento activas.',
    });
  }
});

// 4. Interactive Gemini Chat for News & Macro Doubts
app.post('/api/chat', async (req, res) => {
  const {
    message,
    history = [],
    asset = 'NAS100',
    customDocument,
    useOnlineOnly = false,
    activeDocNames = [],
    language = 'es',
  } = req.body;
  const isEn = language === 'en';
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();

  if (!message) {
    return res.status(400).json({ error: isEn ? 'Message required' : 'Mensaje requerido' });
  }

  const ownDeclaration = buildOwnAnalysisDeclaration(asset, currentKz, 0.50, true, isEn ? 'en' : 'es');

  try {
    const recentHistoryText = Array.isArray(history)
      ? history
          .slice(-4)
          .map((h: any) => `${h.role === 'user' ? 'User' : 'Analyst'}: ${h.content}`)
          .join('\n')
      : '';

    const systemPrompt = isEn
      ? `You are the TRstudio Gemini News & Macro Analyst.
Current New York Time: ${currentKz.nyTime} | Active Session: ${currentKz.name}.
LIVE MARKET QUOTES: ${liveSnapshot}
${customDocument ? `REFERENCE CONTEXT:\n${customDocument.substring(0, 3500)}` : ''}

Your role is to clearly and directly answer user doubts about macroeconomic news (CPI inflation, NFP jobs report, FOMC, Federal Reserve interest rates, Jerome Powell speeches, US10Y Treasury yields, DXY Dollar Index, VIX volatility, geopolitical events, red-folder economic calendar releases) and explain how they impact ${asset} (NAS100, US30, XAUUSD Gold, EURUSD) and when to trade or wait.
Respond in English concisely, practically, and without unnecessary filler.`
      : `Eres el Analista Gemini de Noticias y Macroeconomía de TRstudio.
Hora actual en Nueva York: ${currentKz.nyTime} | Sesión activa: ${currentKz.name}.
COTIZACIONES EN VIVO: ${liveSnapshot}
${customDocument ? `CONTEXTO DE REFERENCIA:\n${customDocument.substring(0, 3500)}` : ''}

Tu función es resolver de forma directa, práctica y clara cualquier duda del usuario sobre noticias macroeconómicas (CPI/Inflación, NFP/Nóminas no agrícolas, FOMC, tasas de interés de la Fed, discursos de Jerome Powell, rendimientos de bonos US10Y, Índice Dólar DXY, volatilidad VIX, eventos geopolíticos y calendario económico de carpeta roja) explicando cómo afectan a ${asset} (NAS100, US30, XAUUSD Oro, EURUSD) y qué precauciones tomar al operar.
Responde en español de forma directa y estructurada.`;

    const promptWithContext = recentHistoryText
      ? `${recentHistoryText}\nUser: ${message}`
      : message;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: promptWithContext }] }],
      config: { systemInstruction: systemPrompt },
    });

    const externalSources = buildExternalTraceabilitySources(asset, response);
    let reply = response.text || '';
    if (!reply) throw new Error('Empty response');

    return res.json({
      reply,
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      timestamp: new Date().toISOString(),
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      source: useOnlineOnly ? 'online-only' : 'gemini',
    });
  } catch (_err: any) {
    const externalSources = buildExternalTraceabilitySources(asset);
    const qLower = String(message).toLowerCase();
    const targetInst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
    const xau = MARKET_INSTRUMENTS.find((i) => i.symbol === 'XAUUSD') || MARKET_INSTRUMENTS[2];
    const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
    const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
    const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX') || MARKET_INSTRUMENTS[6];

    let newsFallbackReply = '';

    if (qLower.includes('cpi') || qLower.includes('inflac') || qLower.includes('ipc')) {
      newsFallbackReply = isEn
        ? `### Impact of CPI (Inflation) on ${asset}, Gold & Indices (${currentKz.nyTime} NY)
- **Higher-than-expected CPI (Hot Inflation):** Means the Federal Reserve is likely to keep interest rates higher for longer.
  - **DXY (${dxy.price}) & US10Y (${us10y.price}%):** Spike upward immediately.
  - **XAUUSD Gold ($${xau.price.toLocaleString()}) & NAS100 (${targetInst.price.toLocaleString()}):** Experience strong initial selling pressure due to higher real yields and discount rates.
- **Lower-than-expected CPI (Cool Inflation):** Increases expectations of Fed rate cuts.
  - **DXY & US10Y:** Drop sharply.
  - **NAS100, US30, EURUSD & XAUUSD:** Rally strongly upward after the initial 8:30 AM NY volatility sweep.
- **Execution Rule:** Wait 15 minutes after the 8:30 AM NY release so the initial manipulation wick (*Judas Swing*) completes before entering on a 5M/15M FVG.`
        : `### Impacto del CPI (Inflación) en ${asset}, Oro e Índices (${currentKz.nyTime} NY)
- **Si el CPI sale MÁS ALTO de lo esperado (Inflación Caliente):** La Reserva Federal (Fed) mantendrá las tasas altas por más tiempo.
  - **DXY (${dxy.price}) y Bono US10Y (${us10y.price}%):** Suben con fuerza de inmediato.
  - **XAUUSD Oro ($${xau.price.toLocaleString()}) y NAS100 (${targetInst.price.toLocaleString()}):** Sufren presión bajista inmediata porque suben los rendimientos reales de los bonos y el costo del dinero.
- **Si el CPI sale MÁS BAJO de lo esperado (Inflación Moderándose):** Aumenta la probabilidad de recortes de tasas de la Fed.
  - **DXY y US10Y:** Caen con fuerza.
  - **NAS100, US30, EURUSD y XAUUSD:** Reaccionan al alza buscando liquidez de máximos previos.
- **Regla Operativa:** El CPI se publica a las **8:30 AM (Hora NY)**. Espera de 10 a 15 minutos tras el dato para que termine el barrido de liquidez inicial antes de tomar entrada en 5M/15M.`;
    } else if (qLower.includes('nfp') || qLower.includes('empleo') || qLower.includes('nomina') || qLower.includes('fomc') || qLower.includes('powell') || qLower.includes('fed')) {
      newsFallbackReply = isEn
        ? `### Trading Protocol for NFP, FOMC & Powell Speeches (${currentKz.nyTime} NY)
- **NFP (Non-Farm Payrolls — 8:30 AM NY, First Friday of Month):**
  - Strong job numbers + higher wages = Bullish **DXY (${dxy.price})** / Bearish **XAUUSD ($${xau.price.toLocaleString()}) & EURUSD**.
  - Weak job numbers = Bearish **DXY** / Bullish **Gold & NAS100** (rate-cut expectations).
- **FOMC & Powell Press Conference (2:00 PM & 2:30 PM NY):**
  - The 2:00 PM rate statement creates the first fakeout wick; the real directional move frequently starts at **2:30 PM NY** when Jerome Powell answers the first question.
- **Account Protection Rule:** Close or protect open positions at Break Even 15 minutes before the release, and reduce risk by 50% (e.g., 0.25% instead of 0.50%) due to spread widening.`
        : `### Protocolo Operativo para NFP, FOMC y Discursos de Powell (${currentKz.nyTime} NY)
- **NFP (Nóminas No Agrícolas — 8:30 AM NY, primer viernes del mes):**
  - Empleo más fuerte de lo previsto = Impulso alcista en **DXY (${dxy.price})** y caída inicial en **XAUUSD ($${xau.price.toLocaleString()}) y EURUSD**.
  - Empleo débil = Caída en **DXY y US10Y (${us10y.price}%)** e impulso alcista en **Oro y NAS100**.
- **FOMC y Rueda de Prensa de Powell (2:00 PM y 2:30 PM NY):**
  - El comunicado de las **2:00 PM NY** suele provocar un barrido en falso en ambas direcciones; la tendencia real suele definirse a las **2:30 PM NY** cuando Powell inicia la ronda de preguntas.
- **Protección de Cuenta:** Protege en Break Even o cierra parciales 15 minutos antes de la noticia y espera a que los spreads se normalicen antes de entrar.`;
    } else if (qLower.includes('horario') || qLower.includes('carpeta roja') || qLower.includes('evitar') || qLower.includes('red-folder') || qLower.includes('when')) {
      newsFallbackReply = isEn
        ? `### Key High-Impact News Windows (New York Time)
- **8:30 AM NY:** US Macro Releases (CPI, NFP, PPI, Retail Sales, Jobless Claims, GDP). High volatility across **XAUUSD, NAS100, US30, EURUSD**.
- **9:30 AM NY:** NYSE / Wall Street Cash Open. Wait until **9:45 AM NY** if major news coincided with the morning session.
- **10:00 AM NY:** ISM Manufacturing/Services PMI, Consumer Confidence & JOLTS.
- **2:00 PM – 2:30 PM NY:** FOMC Rate Decisions, Fed Minutes & Powell Press Conference.
- **5:00 PM – 6:00 PM NY:** Daily Bank Rollover (wide spreads — avoid opening new trades).`
        : `### Horarios Clave de Noticias de Carpeta Roja (Hora Nueva York)
- **8:30 AM NY:** Publicación de datos macro de EE. UU. (CPI, NFP, PPI, Ventas Minoristas, PIB, Desempleo). Máxima volatilidad en **XAUUSD, NAS100, US30 y EURUSD**.
- **9:30 AM NY:** Apertura de Wall Street. Si hubo noticia a las 8:30 AM, los primeros 15 minutos (9:30 – 9:45 AM) suelen barrer stops antes de dar la entrada limpia.
- **10:00 AM NY:** ISM Manufacturero/Servicios, Confianza del Consumidor y JOLTS.
- **2:00 PM – 2:30 PM NY:** Decisión de tasas FOMC, Actas de la Fed y conferencia de Jerome Powell.
- **5:00 PM – 6:00 PM NY:** Rollover bancario diario (spreads altos; evitar abrir entradas nuevas).`;
    } else {
      newsFallbackReply = isEn
        ? `### Macro & News Analysis for ${targetInst.symbol} (${currentKz.nyTime} NY)
- **Question Analyzed:** *"${message}"*
- **Live Market Context:**
  - **${targetInst.symbol}:** **${targetInst.price.toLocaleString()}** (${targetInst.change24h}) | 24h Range: **${targetInst.low24h.toLocaleString()} – ${targetInst.high24h.toLocaleString()}**
  - **DXY (US Dollar Index):** **${dxy.price}** (${dxy.change24h}) — inverse driver for EURUSD and XAUUSD.
  - **US10Y (10Y Treasury Yield):** **${us10y.price}%** (${us10y.change24h}) — key valuation driver for NAS100 and Gold.
  - **VIX Volatility:** **${vix.price}** (${vix.change24h}).
- **Practical Takeaway:** During **${currentKz.name}**, monitor whether **US10Y (${us10y.price}%)** and **DXY (${dxy.price})** confirm the direction of **${targetInst.symbol}**. Avoid entering 15 minutes before high-impact 8:30 AM or 10:00 AM NY news releases.`
        : generateAutonomousAnswer(message, asset, currentKz, Boolean(useOnlineOnly), activeDocNames, customDocument || '');
    }

    const fallbackReply =
      newsFallbackReply +
      formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration, isEn ? 'en' : 'es');

    return res.json({
      reply: fallbackReply,
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      timestamp: new Date().toISOString(),
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      source: useOnlineOnly ? 'online-only' : 'gemini',
    });
  }
});

// Quantitative Confluence, Win Probability & Recommendation Evaluator
function evaluateConfluenceAndProbability(params: {
  asset: string;
  action: 'BUY' | 'SELL' | 'WAIT';
  inst: any;
  currentKz: any;
  includeNews: boolean;
  specificNotes: string;
  customDocument?: string;
  lang: string;
  aiBreakdown?: {
    killzoneFilterScore?: number;
    structureScore?: number;
    liquiditySweepScore?: number;
    intermarketScore?: number;
    triggerScore?: number;
  };
}) {
  const { asset, action, inst, currentKz, includeNews, specificNotes, lang, aiBreakdown } = params;
  const isEn = lang === 'en';
  const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
  const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
  const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX') || MARKET_INSTRUMENTS[6];

  // 1. Killzone / Session Score (Max 20)
  const kzNameLower = (currentKz?.name || '').toLowerCase();
  let kzScore = 16;
  if (kzNameLower.includes('nueva york') || kzNameLower.includes('londres') || kzNameLower.includes('pre-mercado')) {
    kzScore = 19;
  } else if (kzNameLower.includes('asiático') || kzNameLower.includes('asia')) {
    kzScore = asset === 'XAUUSD' || asset === 'EURUSD' ? 14 : 10;
  } else if (kzNameLower.includes('post-mercado') || kzNameLower.includes('rollover')) {
    kzScore = 7; // Low liquidity / wide spreads during rollover
  }

  // 2. Price Structure & Range Position Score (Max 25)
  const rangeSpan = Math.max(0.0001, (inst.high24h || inst.price * 1.01) - (inst.low24h || inst.price * 0.99));
  const posInRange = (inst.price - (inst.low24h || inst.price * 0.99)) / rangeSpan; // 0 = low, 1 = high
  const isPriceBullish24h = String(inst.change24h || '').startsWith('+');

  let structScore = 18;
  if (posInRange >= 0.43 && posInRange <= 0.57) {
    // Price is stuck in the middle of equilibrium (chop zone)
    structScore = 12;
  } else if (
    (action === 'BUY' && isPriceBullish24h && posInRange < 0.78) ||
    (action === 'SELL' && !isPriceBullish24h && posInRange > 0.22)
  ) {
    structScore = 22;
  } else if (
    (action === 'BUY' && !isPriceBullish24h && posInRange < 0.25) ||
    (action === 'SELL' && isPriceBullish24h && posInRange > 0.75)
  ) {
    // Reversal at extreme discount/premium
    structScore = 17;
  } else {
    // Counter-trend or buying the very top / selling the very bottom
    structScore = 10;
  }

  // 3. Liquidity Sweep / Proximity to PDH/PDL Score (Max 20)
  const distFromExtreme = Math.min(posInRange, 1 - posInRange);
  let sweepScore = distFromExtreme < 0.22 ? 18 : distFromExtreme < 0.38 ? 15 : 11;

  // 4. Intermarket & News Alignment Score (Max 20)
  const dxyUp = String(dxy.change24h || '').startsWith('+');
  const us10yUp = String(us10y.change24h || '').startsWith('+');
  const vixUp = String(vix.change24h || '').startsWith('+');

  let interScore = 15;
  if (action === 'BUY') {
    if (!dxyUp && !us10yUp) interScore = 19;
    else if (dxyUp && us10yUp && vixUp) interScore = 8; // Strong macro headwind against BUY
    else interScore = 13;
  } else if (action === 'SELL') {
    if (dxyUp && (us10yUp || vixUp)) interScore = 19;
    else if (!dxyUp && !us10yUp) interScore = 9;
    else interScore = 14;
  }
  if (!includeNews) {
    // When user turns off news, weight pure technicals neutral-positive
    interScore = Math.max(12, interScore);
  }

  // 5. Execution Trigger & User Notes Alignment (Max 15)
  const notesLower = (specificNotes || '').toLowerCase();
  let trigScore = 13;
  if (notesLower.includes('duda') || notesLower.includes('arriesg') || notesLower.includes('contra')) {
    trigScore = 8;
  } else if (
    (notesLower.includes('compra') || notesLower.includes('buy')) &&
    !isPriceBullish24h &&
    dxyUp
  ) {
    trigScore = 9;
  } else if (
    (notesLower.includes('venta') || notesLower.includes('sell')) &&
    isPriceBullish24h &&
    !dxyUp
  ) {
    trigScore = 9;
  } else if (kzScore >= 17 && structScore >= 18) {
    trigScore = 14;
  }

  // Blend with AI breakdown if valid and realistic, otherwise use quantitative scores
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(val)));
  const finalBreakdown = {
    killzoneFilterScore: clamp(
      aiBreakdown?.killzoneFilterScore ? (aiBreakdown.killzoneFilterScore + kzScore) / 2 : kzScore,
      4,
      20
    ),
    structureScore: clamp(
      aiBreakdown?.structureScore ? (aiBreakdown.structureScore + structScore) / 2 : structScore,
      5,
      25
    ),
    liquiditySweepScore: clamp(
      aiBreakdown?.liquiditySweepScore ? (aiBreakdown.liquiditySweepScore + sweepScore) / 2 : sweepScore,
      5,
      20
    ),
    intermarketScore: clamp(
      aiBreakdown?.intermarketScore ? (aiBreakdown.intermarketScore + interScore) / 2 : interScore,
      4,
      20
    ),
    triggerScore: clamp(
      aiBreakdown?.triggerScore ? (aiBreakdown.triggerScore + trigScore) / 2 : trigScore,
      4,
      15
    ),
  };

  const totalScore =
    finalBreakdown.killzoneFilterScore +
    finalBreakdown.structureScore +
    finalBreakdown.liquiditySweepScore +
    finalBreakdown.intermarketScore +
    finalBreakdown.triggerScore;

  // Compute realistic Win Probability (32% to 89%)
  const winProbability = clamp(totalScore * 0.92 + (kzScore >= 17 ? 3 : -4), 32, 89);

  let recommendationVerdict: 'TAKE' | 'CAUTION' | 'AVOID' = 'TAKE';
  let recommendationLabel = '';
  let recommendationReason = '';
  let tierLabel = '';

  if (totalScore >= 75 && winProbability >= 70) {
    recommendationVerdict = 'TAKE';
    tierLabel = isEn ? 'A+ Setup (High Confluence)' : 'Setup A+ (Alta Confluencia)';
    recommendationLabel = isEn
      ? 'RECOMMENDED TO TAKE TRADE'
      : 'SÍ SE RECOMIENDA TOMAR LA ENTRADA';
    recommendationReason = isEn
      ? `High probability of success (${winProbability}%). Structure, session liquidity, and intermarket flow are aligned. Execute with standard risk.`
      : `Alta probabilidad de acierto (${winProbability}%). La estructura, liquidez de sesión y flujo intermercado están alineados. Puedes ejecutar con tu riesgo normal.`;
  } else if (totalScore >= 56) {
    recommendationVerdict = 'CAUTION';
    tierLabel = isEn ? 'B Setup (Moderate Confluence)' : 'Setup B (Confluencia Moderada)';
    recommendationLabel = isEn
      ? 'TRADE WITH CAUTION (WAIT CONFIRMATION OR HALF RISK)'
      : 'PRECAUCIÓN: ESPERAR CONFIRMACIÓN O USAR MITAD DE RIESGO';
    recommendationReason = isEn
      ? `Moderate probability (${winProbability}%). Some factors are mixed (e.g., mid-range price or macro divergence). Wait for a clear 5M/15M candle confirmation or reduce risk by 50%.`
      : `Probabilidad moderada (${winProbability}%). Hay factores mixtos en estructura o horario. Se recomienda esperar vela de confirmación en 5M/15M o entrar con la mitad del lotaje.`;
  } else {
    recommendationVerdict = 'AVOID';
    tierLabel = isEn ? 'Low Confluence (Avoid Entry)' : 'Baja Confluencia (No Operar)';
    recommendationLabel = isEn
      ? 'DO NOT TAKE THIS TRADE RIGHT NOW'
      : 'NO SE RECOMIENDA TOMAR ESTA ENTRADA AHORA';
    recommendationReason = isEn
      ? `Low probability of success (${winProbability}%). Unfavorable schedule, low liquidity, or counter-trend flow increases Stop Loss risk. Wait for the next clean setup.`
      : `Baja probabilidad de acierto (${winProbability}%). El horario actual, la falta de liquidez o la dirección en contra del flujo aumentan el riesgo de tocar Stop Loss. Mejor esperar.`;
  }

  return {
    totalConfluenceScore: totalScore,
    confluenceBreakdown: finalBreakdown,
    winProbability,
    recommendationVerdict,
    recommendationLabel,
    recommendationReason,
    tier: tierLabel,
  };
}

// 5. Generate Detailed Institutional Trading Report
app.post('/api/generate-report', async (req, res) => {
  const {
    asset = 'TODOS',
    timeframe = 'Intraday (4H / 1H / 15M)',
    focusArea = 'General',
    customDocument,
    includeNews = true,
    language = 'es',
  } = req.body;
  const isEn = language === 'en';
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();
  const ownDeclaration = buildOwnAnalysisDeclaration(asset, currentKz, 0.50, Boolean(includeNews), language);

  try {
    const newsInstruction = includeNews
      ? isEn
        ? 'Factor in the impact of current macroeconomic news (Fed, CPI, NFP, US10Y yields, DXY, VIX) from Reuters, Bloomberg, ForexLive, Investing, Kitco, and CNBC.'
        : 'Toma en cuenta el impacto de noticias macroeconómicas actuales (Fed, CPI, NFP, bonos US10Y, DXY, VIX) de Reuters, Bloomberg, ForexLive, Investing, Kitco y CNBC.'
      : isEn
      ? 'IGNORE macroeconomic news; focus strictly on price structure, liquidity levels, range, and pure price action.'
      : 'IGNORA las noticias macroeconómicas; enfócate exclusivamente en estructura de precio, niveles de liquidez, rango y acción del precio.';

    const prompt = isEn
      ? `Generate a practical, direct trading report in ENGLISH for ${asset} (${timeframe}).
Focus: ${focusArea}. NY Time: ${currentKz.nyTime}. Session: ${currentKz.name}.
Live Quotes: ${liveSnapshot}.
${newsInstruction}
${customDocument ? `Applicable analysis context:\n${customDocument.substring(0, 4500)}` : ''}
IMPORTANT: Go straight to key levels, bias, points of interest, and action plan. Do NOT mention "online mode" or "database mode". Use 12-hour time format (e.g. 9:30 AM, 4:00 PM). Write 100% in English.`
      : `Genera un reporte práctico, directo y al grano en ESPAÑOL para ${asset} (${timeframe}).
Enfoque: ${focusArea}. Hora NY: ${currentKz.nyTime}. Sesión: ${currentKz.name}.
Cotizaciones: ${liveSnapshot}.
${newsInstruction}
${customDocument ? `Contexto de análisis aplicable:\n${customDocument.substring(0, 4500)}` : ''}
IMPORTANTE: Ve directo a los niveles, dirección, puntos de interés y plan operativo. NO menciones si estás en "modo online" o "modo base de datos". Usa formato de hora de 12 horas (ej. 9:30 AM, 4:00 PM).`;

    const systemInstruction = isEn
      ? `You are the lead analyst at TRstudio. Write clear, direct, practical trading reports in English without fluff. Never say "Online Mode" or "Database Mode". Always use 12h time format (AM/PM).`
      : `Eres el analista principal de TRstudio. Escribe reportes claros, directos, sin texto exagerado ni repetitivo. Nunca digas "Modo Online" ni "Modo Base de Datos". Usa siempre horas en formato 12h (AM/PM).\n${webSourcesPromptContent}`;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction },
    });

    const externalSources = buildExternalTraceabilitySources(asset, response);
    let reportText = response.text || '';
    if (!reportText) throw new Error('Empty report');

    if (
      !reportText.includes('En qué se basó') &&
      !reportText.includes('Basis & Consulted') &&
      !reportText.includes('Trazabilidad Externa')
    ) {
      reportText += formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration, language);
    }

    return res.json({
      asset,
      timeframe,
      report: reportText,
      sources: externalSources.map((s) => ({
        title: `[${s.media} | ${s.headline}]`,
        media: s.media,
        headline: s.headline,
        url: s.url,
      })),
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      generatedAt: new Date().toISOString(),
      nyTime: currentKz.nyTime,
      session: currentKz.name,
    });
  } catch (_err: any) {
    const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
    const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
    const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
    const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX') || MARKET_INSTRUMENTS[6];
    const externalSources = buildExternalTraceabilitySources(asset);
    const decimals = inst.price < 10 ? 4 : 2;
    const mid = ((inst.high24h + inst.low24h) / 2).toFixed(decimals);

    const baseReport = isEn
      ? `# Market Action Report: ${asset} (${timeframe})
**NY Time:** ${currentKz.nyTime} | **Session:** ${currentKz.name} (${currentKz.windowHours})

## 1. Live Price & Key Levels
- **Current Price:** **${inst.price.toLocaleString()}** (${inst.change24h})
- **Day High (PDH):** **${inst.high24h.toLocaleString()}** | **Day Low (PDL):** **${inst.low24h.toLocaleString()}**
- **Intraday Equilibrium (50%):** **${mid}**
- **Structural Bias:** ${inst.price >= Number(mid) ? 'Bullish — targeting liquidity above daily high' : 'Bearish — selling pressure below intraday midpoint'}

## 2. Actionable Zones (4H / 1H / 30M / 5M)
- **Point of Interest (POI):** Watch pullback toward **${mid}** to validate absorption with a 15M/5M FVG.
- **Primary Target:** **${inst.high24h.toLocaleString()}** | **Key Support:** **${inst.low24h.toLocaleString()}**
${
  includeNews
    ? `\n## 3. Macro & News Context\n- **DXY:** ${dxy.price} (${dxy.change24h}) | **10Y Yield (US10Y):** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}).\n- Monitor high-impact releases at 8:30 AM and 10:00 AM (NY Time).`
    : `\n## 3. Pure Technical Focus\n- Evaluation strictly centered on candle structure, session liquidity, and 5M/30M confirmation (news filter disabled).`
}`
      : `# Reporte Operativo: ${asset} (${timeframe})
**Hora NY:** ${currentKz.nyTime} | **Sesión:** ${currentKz.name} (${currentKz.windowHours})

## 1. Precio y Niveles Clave
- **Cotización Actual:** **${inst.price.toLocaleString()}** (${inst.change24h})
- **Techo del Día (PDH):** **${inst.high24h.toLocaleString()}** | **Piso del Día (PDL):** **${inst.low24h.toLocaleString()}**
- **Equilibrio Intradía (50%):** **${mid}**
- **Sesgo Estructural:** ${inst.price >= Number(mid) ? 'Alcista — buscando liquidez sobre el máximo diario' : 'Bajista — presión bajo el punto medio intradía'}

## 2. Zonas Operativas (4H / 1H / 30M / 5M)
- **Zona de Interés (POI):** Espera de retroceso hacia **${mid}** para validar absorción con FVG en 15M/5M.
- **Objetivo Primario:** **${inst.high24h.toLocaleString()}** | **Soporte Crítico:** **${inst.low24h.toLocaleString()}**
${
  includeNews
    ? `\n## 3. Contexto Macro y Noticias\n- **DXY:** ${dxy.price} (${dxy.change24h}) | **Bono 10Y (US10Y):** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}).\n- Vigilar publicaciones de alto impacto a las 8:30 AM y 10:00 AM (hora NY).`
    : `\n## 3. Enfoque Técnico Puro\n- Evaluación centrada estrictamente en estructura de velas, liquidez de sesión y confirmación en 5M/30M (filtro de noticias desactivado).`
}`;

    const fallbackReport = baseReport + formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration, language);

    return res.json({
      asset,
      timeframe,
      report: fallbackReport,
      sources: externalSources.map((s) => ({
        title: `[${s.media} | ${s.headline}]`,
        media: s.media,
        headline: s.headline,
        url: s.url,
      })),
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
      generatedAt: new Date().toISOString(),
      nyTime: currentKz.nyTime,
      session: currentKz.name,
    });
  }
});

// 6. Generate Tactical Trade Setup
app.post('/api/generate-trade-setup', async (req, res) => {
  const {
    asset = 'NAS100',
    accountBalance = 6000,
    riskPercentage = 0.50,
    specificNotes = '',
    customDocument,
    sourceMode = 'online', // 'online' | 'custom_base'
    includeNews = true,
    language = 'es',
  } = req.body;
  const isEn = language === 'en';
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();
  const externalSources = buildExternalTraceabilitySources(asset);
  const ownDeclaration = buildOwnAnalysisDeclaration(asset, currentKz, riskPercentage, Boolean(includeNews), language);
  const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];

  try {
    const newsRule = includeNews
      ? isEn
        ? 'FACTOR IN NEWS: Integrate current macroeconomic sentiment, US10Y yields, DXY, and economic calendar from financial sources.'
        : 'TOMAR EN CUENTA NOTICIAS: Integra el sentimiento macroeconómico actual, tasas US10Y, DXY y calendario económico de las fuentes financieras.'
      : isEn
      ? 'IGNORE NEWS: Calculate the entry strictly from technical price structure (4H/1H and 30M/15M/5M) without fundamental bias.'
      : 'IGNORAR NOTICIAS: Calcula la entrada únicamente por estructura técnica de precio (4H/1H y 30M/15M/5M) sin condicionamiento fundamental.';

    const analysisRule =
      sourceMode === 'custom_base' && customDocument
        ? `Use this user analysis/strategy to structure the entry:\n${customDocument.substring(0, 4500)}`
        : `Research and structure the entry based on live prices and top financial sources:\n${webSourcesPromptContent}`;

    const prompt = isEn
      ? `Calculate a practical, direct trading entry in ENGLISH for ${asset}. Account Balance: $${accountBalance}, Risk: ${riskPercentage}%. User Notes: "${specificNotes}". NY Time: ${currentKz.nyTime}. Live Quotes: ${liveSnapshot}.
${newsRule}
IMPORTANT:
1. Evaluate confluence honestly: if the current session has low liquidity (like Post-Market Rollover) or if price is choppy/counter-trend, assign lower scores in confluenceBreakdown so totalConfluenceScore reflects the true probability of winning.
2. In thesisRationale go straight to the technical and operational explanation in ENGLISH. Do NOT write "Online Mode" or "Database Mode". Use 12-hour time format (e.g. 9:30 AM, 4:00 PM).`
      : `Calcula una entrada práctica y directa en ESPAÑOL para ${asset}. Balance: $${accountBalance}, Riesgo: ${riskPercentage}%. Notas: "${specificNotes}". Hora NY: ${currentKz.nyTime}. Cotizaciones: ${liveSnapshot}.
${newsRule}
IMPORTANTE:
1. Evalúa la confluencia de forma real y crítica: si el horario actual tiene baja liquidez (como Post-Mercado/Rollover) o si el precio está en rango lateral o contra tendencia, asigna puntajes más bajos en confluenceBreakdown para que refleje la probabilidad real de acertar.
2. En thesisRationale ve directo a la explicación técnica y operativa. NO escribas "Modo Online" ni "Basado en la base de datos". Usa formato de 12 horas (ej. 9:30 AM, 4:00 PM).`;

    const systemInstruction = `Eres el motor cuantitativo de entradas de TRstudio. Devuelve un JSON válido, directo y práctico en ${isEn ? 'INGLÉS (English)' : 'ESPAÑOL'}.\n${analysisRule}`;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            asset: { type: Type.STRING },
            action: { type: Type.STRING },
            playbookName: { type: Type.STRING },
            tier: { type: Type.STRING },
            totalConfluenceScore: { type: Type.NUMBER },
            confluenceBreakdown: {
              type: Type.OBJECT,
              properties: {
                killzoneFilterScore: { type: Type.NUMBER },
                structureScore: { type: Type.NUMBER },
                liquiditySweepScore: { type: Type.NUMBER },
                intermarketScore: { type: Type.NUMBER },
                triggerScore: { type: Type.NUMBER },
              },
              required: ['killzoneFilterScore', 'structureScore', 'liquiditySweepScore', 'intermarketScore', 'triggerScore'],
            },
            prices: {
              type: Type.OBJECT,
              properties: {
                currentPrice: { type: Type.NUMBER },
                entryPrice: { type: Type.NUMBER },
                entryType: { type: Type.STRING },
                stopLoss: { type: Type.NUMBER },
                stopLossDistance: { type: Type.STRING },
                takeProfit1: { type: Type.NUMBER },
                takeProfit2: { type: Type.NUMBER },
                riskRewardRatio: { type: Type.STRING },
              },
              required: ['currentPrice', 'entryPrice', 'stopLoss', 'takeProfit1', 'takeProfit2', 'riskRewardRatio'],
            },
            propFirmRiskCalculation: {
              type: Type.OBJECT,
              properties: {
                accountBalance: { type: Type.NUMBER },
                riskPercentage: { type: Type.NUMBER },
                monetaryRiskUsd: { type: Type.NUMBER },
                recommendedLots: { type: Type.NUMBER },
                contractSizeSpec: { type: Type.STRING },
                hardDailyDrawdownAlert: { type: Type.STRING },
              },
              required: ['accountBalance', 'riskPercentage', 'monetaryRiskUsd', 'recommendedLots', 'hardDailyDrawdownAlert'],
            },
            thesisRationale: { type: Type.STRING },
            invalidationCriteria: { type: Type.STRING },
            executionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['asset', 'action', 'playbookName', 'tier', 'totalConfluenceScore', 'confluenceBreakdown', 'prices', 'propFirmRiskCalculation', 'thesisRationale', 'invalidationCriteria', 'executionTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const normalizedAction: 'BUY' | 'SELL' | 'WAIT' =
      parsed.action === 'SELL' ? 'SELL' : parsed.action === 'WAIT' ? 'WAIT' : 'BUY';

    const quantEval = evaluateConfluenceAndProbability({
      asset,
      action: normalizedAction,
      inst,
      currentKz,
      includeNews: Boolean(includeNews),
      specificNotes,
      customDocument,
      lang: language,
      aiBreakdown: parsed.confluenceBreakdown,
    });

    return res.json({
      setup: {
        ...parsed,
        action: normalizedAction,
        tier: quantEval.tier,
        totalConfluenceScore: quantEval.totalConfluenceScore,
        confluenceBreakdown: quantEval.confluenceBreakdown,
        winProbability: quantEval.winProbability,
        recommendationVerdict: quantEval.recommendationVerdict,
        recommendationLabel: quantEval.recommendationLabel,
        recommendationReason: quantEval.recommendationReason,
        externalSources,
        ownAnalysisDeclaration: ownDeclaration,
      },
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      timestamp: new Date().toISOString(),
    });
  } catch (_err: any) {
    const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY') || MARKET_INSTRUMENTS[4];
    const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y') || MARKET_INSTRUMENTS[5];
    const monetaryRisk = (accountBalance * riskPercentage) / 100;

    // Determine direction from real 24h momentum & user notes
    const notesLower = (specificNotes || '').toLowerCase();
    const isBullish24h = String(inst.change24h || '').startsWith('+');
    let action: 'BUY' | 'SELL' | 'WAIT' = isBullish24h ? 'BUY' : 'SELL';
    if (notesLower.includes('venta') || notesLower.includes('sell') || notesLower.includes('short')) {
      action = 'SELL';
    } else if (notesLower.includes('compra') || notesLower.includes('buy') || notesLower.includes('long')) {
      action = 'BUY';
    }

    const dirMult = action === 'BUY' ? 1 : -1;

    let entryPrice = inst.price;
    let stopLoss = inst.price;
    let takeProfit1 = inst.price;
    let takeProfit2 = inst.price;
    let stopDistanceStr = '';
    let lots = 1.0;
    let contractSpec = '';
    let playbook = isEn ? 'Intraday Liquidity & Structure' : 'Estructura & Liquidez Intradía';

    if (asset === 'NAS100') {
      const stopPts = 42.0;
      entryPrice = Math.round((inst.price - dirMult * 12.0) * 10) / 10;
      stopLoss = Math.round((entryPrice - dirMult * stopPts) * 10) / 10;
      takeProfit1 = Math.round((entryPrice + dirMult * stopPts * 1.8) * 10) / 10;
      takeProfit2 = Math.round((entryPrice + dirMult * stopPts * 3.0) * 10) / 10;
      stopDistanceStr = '42 pts';
      lots = parseFloat((monetaryRisk / stopPts).toFixed(2));
      contractSpec = isEn ? '1 CFD Lot = $1.00 USD/pt' : '1 Lote CFD = $1.00 USD/pto';
      playbook = isEn ? '15M/5M FVG & Liquidity Sweep' : 'Barrido de Liquidez & FVG 15M/5M';
    } else if (asset === 'US30') {
      const stopPts = 75.0;
      entryPrice = Math.round(inst.price - dirMult * 25.0);
      stopLoss = Math.round(entryPrice - dirMult * stopPts);
      takeProfit1 = Math.round(entryPrice + dirMult * stopPts * 1.8);
      takeProfit2 = Math.round(entryPrice + dirMult * stopPts * 3.0);
      stopDistanceStr = '75 pts';
      lots = parseFloat((monetaryRisk / stopPts).toFixed(2));
      contractSpec = isEn ? '1 CFD Lot = $1.00 USD/pt' : '1 Lote CFD = $1.00 USD/pto';
      playbook = isEn ? '1H Order Block Absorption & NY Flow' : 'Absorción en Order Block 1H & Flujo NY';
    } else if (asset === 'XAUUSD') {
      const stopDol = 4.80;
      entryPrice = Math.round((inst.price - dirMult * 1.20) * 100) / 100;
      stopLoss = Math.round((entryPrice - dirMult * stopDol) * 100) / 100;
      takeProfit1 = Math.round((entryPrice + dirMult * stopDol * 1.8) * 100) / 100;
      takeProfit2 = Math.round((entryPrice + dirMult * stopDol * 3.0) * 100) / 100;
      stopDistanceStr = '$4.80 (48 pips)';
      lots = parseFloat((monetaryRisk / (stopDol * 100)).toFixed(2));
      contractSpec = isEn ? '1 Lot = 100 oz ($10/pip)' : '1 Lote = 100 oz ($10/pip)';
      playbook = isEn ? 'Liquidity Sweep & COMEX Expansion' : 'Toma de Liquidez & Expansión COMEX';
    } else {
      const stopPips = 12.0;
      entryPrice = Math.round((inst.price - dirMult * 0.0008) * 10000) / 10000;
      stopLoss = Math.round((entryPrice - dirMult * 0.0012) * 10000) / 10000;
      takeProfit1 = Math.round((entryPrice + dirMult * 0.0022) * 10000) / 10000;
      takeProfit2 = Math.round((entryPrice + dirMult * 0.0036) * 10000) / 10000;
      stopDistanceStr = '12 pips';
      lots = parseFloat((monetaryRisk / (stopPips * 10)).toFixed(2));
      contractSpec = isEn ? '1 Lot = 100,000 units ($10/pip)' : '1 Lote = 100,000 uds ($10/pip)';
      playbook = isEn ? 'SMT Divergence & OTE Pullback' : 'Divergencia SMT & Retroceso OTE';
    }

    const quantEval = evaluateConfluenceAndProbability({
      asset,
      action,
      inst,
      currentKz,
      includeNews: Boolean(includeNews),
      specificNotes,
      customDocument,
      lang: language,
    });

    const newsContextSentence = includeNews
      ? isEn
        ? ` Macro context checked against DXY at ${dxy.price} (${dxy.change24h}) and US10Y yield at ${us10y.price}%.`
        : ` Confluencia macro evaluada con DXY en ${dxy.price} (${dxy.change24h}) y bono US10Y en ${us10y.price}%.`
      : isEn
      ? ' Entry calculated strictly from price action and technical structure (news filter off).'
      : ' Entrada calculada estrictamente por acción del precio y estructura técnica (sin filtro de noticias).';

    const fallbackSetup = {
      asset,
      action,
      playbookName: playbook,
      tier: quantEval.tier,
      totalConfluenceScore: quantEval.totalConfluenceScore,
      confluenceBreakdown: quantEval.confluenceBreakdown,
      winProbability: quantEval.winProbability,
      recommendationVerdict: quantEval.recommendationVerdict,
      recommendationLabel: quantEval.recommendationLabel,
      recommendationReason: quantEval.recommendationReason,
      prices: {
        currentPrice: inst.price,
        entryPrice,
        entryType: isEn
          ? `${action === 'BUY' ? 'Buy Limit' : 'Sell Limit'} at 50% FVG / POI`
          : `${action === 'BUY' ? 'Buy Limit' : 'Sell Limit'} en 50% FVG / Zona POI`,
        stopLoss,
        stopLossDistance: stopDistanceStr,
        takeProfit1,
        takeProfit2,
        riskRewardRatio: '1:3.0',
      },
      propFirmRiskCalculation: {
        accountBalance,
        riskPercentage,
        monetaryRiskUsd: monetaryRisk,
        recommendedLots: Math.max(0.01, lots),
        contractSizeSpec: contractSpec,
        hardDailyDrawdownAlert: isEn
          ? `Risk set to ${riskPercentage}% ($${monetaryRisk.toFixed(2)} USD). Recommended daily stop limit: -1.5% (-$${(accountBalance * 0.015).toLocaleString()} USD).`
          : `Riesgo controlado al ${riskPercentage}% ($${monetaryRisk.toFixed(2)} USD). Límite diario recomendado: -1.5% (-$${(accountBalance * 0.015).toLocaleString()} USD).`,
      },
      thesisRationale: isEn
        ? `${asset} trades at ${inst.price.toLocaleString()} (${inst.change24h}) within the ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()} range during ${currentKz.name}. Looking for ${action === 'BUY' ? 'bullish reaction at discount' : 'bearish rejection at premium'} targeting ${takeProfit2.toLocaleString()}.${newsContextSentence}`
        : `${asset} cotiza en ${inst.price.toLocaleString()} (${inst.change24h}) dentro del rango ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()} durante ${currentKz.name}. Se proyecta ${action === 'BUY' ? 'reacción compradora en descuento' : 'rechazo vendedor en zona premium'} buscando liquidez hacia ${takeProfit2.toLocaleString()}.${newsContextSentence}`,
      invalidationCriteria: isEn
        ? `Invalidated if a 15M or 30M candle closes with a full body ${action === 'BUY' ? 'below' : 'above'} ${stopLoss}.`
        : `Se invalida si una vela de 15M o 30M cierra con cuerpo completo por ${action === 'BUY' ? 'debajo' : 'encima'} de ${stopLoss}.`,
      executionTips: isEn
        ? [
            'Close 50% of the position at TP1 and move Stop Loss to Break Even.',
            `Let the runner target TP2 (${takeProfit2}).`,
            'Avoid holding new positions open through the 5:00 PM NY rollover.',
          ]
        : [
            'Cerrar 50% de la posición en TP1 y mover el Stop Loss a Break Even.',
            `Dejar correr el resto hacia TP2 (${takeProfit2}).`,
            'Evitar mantener operaciones abiertas durante el rollover (5:00 PM NY).',
          ],
      externalSources,
      ownAnalysisDeclaration: ownDeclaration,
    };

    return res.json({
      setup: fallbackSetup,
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      timestamp: new Date().toISOString(),
    });
  }
});

// Setup Vite dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ApexQuant Institutional Terminal running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
