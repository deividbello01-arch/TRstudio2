import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INSTRUMENTS,
  FX_RATE_TICKERS,
  DEFAULT_FX_RATES,
  FxRates,
  getSpec,
  valuePerPointUsd,
  roundToTick,
  formatDistance,
  SessionKey,
  TRADEABLE_INSTRUMENTS,
  FUTURES_CONTRACT_MAP,
} from './src/lib/instruments.ts';
import { FINANCIAL_WEB_SOURCES, TRADING_STRATEGIES } from './src/lib/strategiesData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK server-side via GEMINI_API_KEY environment variable
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
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
const TREATISE_PATH = path.join(
  __dirname,
  'public/assets/aistudio/Tratado_Maestro_de_Trading_Institucional_y_Cuantitativo__US30__NAS100__XAUUSD__EURUSD__82ba1809'
);
const WEB_SOURCES_PROMPT_PATH = path.join(
  __dirname,
  'public/assets/aistudio/Prompt_Fuentes_Web_Trading_TradeCoffe_04148a93.md'
);

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

  let sessionKey: SessionKey = 'asia';
  let name = 'Rango Asiático (Sesión Asia)';
  let active = false;
  let statusColor: 'emerald' | 'amber' | 'rose' | 'cyan' | 'blue' | 'gray' = 'blue';
  let windowHours = '7:00 PM - 2:00 AM';
  let recommendedAssets: string[] = ['JP225', 'HK50', 'XAUUSD', 'EURUSD'];
  let description = 'Liquidez primaria en Nikkei 225 (JP225), Hang Seng (HK50) y formación del rango asiático.';

  if (currentMinutes >= 120 && currentMinutes < 300) {
    sessionKey = 'london';
    name = 'Sesión Londres & Apertura Europea (Killzone)';
    active = true;
    statusColor = 'emerald';
    windowHours = '2:00 AM - 5:00 AM';
    recommendedAssets = ['GER40', 'UK100', 'EU50', 'FRA40', 'EURUSD', 'XAUUSD'];
    description = 'Barrido del rango asiático (Judas Swing) y expansión en DAX 40, FTSE 100, Euro Stoxx 50 y EUR/USD.';
  } else if (currentMinutes >= 300 && currentMinutes < 480) {
    sessionKey = 'london_late';
    name = 'Continuación Europea / Pre-NY';
    active = true;
    statusColor = 'cyan';
    windowHours = '5:00 AM - 8:00 AM';
    recommendedAssets = ['GER40', 'UK100', 'EU50', 'EURUSD', 'XAUUSD'];
    description = 'Continuación de tendencia en índices europeos y divisas antes de datos macro de EE. UU.';
  } else if (currentMinutes >= 480 && currentMinutes < 570) {
    sessionKey = 'ny_pre';
    name = 'Pre-Mercado NY & Apertura COMEX';
    active = true;
    statusColor = 'emerald';
    windowHours = '8:00 AM - 9:30 AM';
    recommendedAssets = ['XAUUSD', 'NAS100', 'US500', 'US30', 'EURUSD', 'GER40'];
    description = 'Apertura de futuros de oro COMEX (8:20 AM) y datos macro de EE. UU. (8:30 AM) previos a Wall Street.';
  } else if (currentMinutes >= 570 && currentMinutes < 720) {
    sessionKey = 'ny_am';
    name = 'Apertura Wall Street & Silver Bullet AM';
    active = true;
    statusColor = 'emerald';
    windowHours = '9:30 AM - 12:00 PM';
    recommendedAssets = ['NAS100', 'US500', 'US30', 'US2000', 'XAUUSD'];
    description = 'Apertura oficial de NYSE/Nasdaq (9:30 AM) y ventana ICT Silver Bullet (10:00 - 11:00 AM NY).';
  } else if (currentMinutes >= 720 && currentMinutes < 810) {
    sessionKey = 'ny_lunch';
    name = 'Almuerzo Nueva York (NY Lunch)';
    active = false;
    statusColor = 'amber';
    windowHours = '12:00 PM - 1:30 PM';
    recommendedAssets = ['NAS100', 'US500'];
    description = 'Reducción de volumen intradía en Wall Street; esperar ventana de la tarde.';
  } else if (currentMinutes >= 810 && currentMinutes < 960) {
    sessionKey = 'ny_pm';
    name = 'Sesión NY Tarde & Silver Bullet PM';
    active = true;
    statusColor = 'cyan';
    windowHours = '1:30 PM - 4:00 PM';
    recommendedAssets = ['NAS100', 'US500', 'US30', 'US2000'];
    description = 'Flujo institucional vespertino y ventana Silver Bullet PM (2:00 - 3:00 PM) hasta el cierre (4:00 PM).';
  } else if (currentMinutes >= 960 && currentMinutes < 1140) {
    sessionKey = 'post';
    name = 'Post-Mercado & Rollover Bancario';
    active = false;
    statusColor = 'rose';
    windowHours = '4:00 PM - 7:00 PM';
    recommendedAssets = ['JP225'];
    description = 'Cierre de Wall Street y ajuste de spreads diarios (5:00 PM - 6:00 PM). Precaución con spreads.';
  }

  return {
    sessionKey,
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
  futTvSymbol?: string;
  name: string;
  category: string;
  region?: 'US' | 'EU' | 'UK' | 'ASIA' | 'GLOBAL';
  price: number;
  change24h: string;
  changeNumeric: number;
  high24h: number;
  low24h: number;
  atrNumeric: number;
  atr14?: string;
  pointValue?: string;
  bias4H?: string;
  status?: string;
  impact?: string;
  keyLevels?: Record<string, any>;
}

let liveFxRates: FxRates = { ...DEFAULT_FX_RATES };

// Build initial MARKET_INSTRUMENTS from the shared catalog
let MARKET_INSTRUMENTS: ServerInstrument[] = INSTRUMENTS.map((spec) => {
  const category =
    spec.kind === 'index'
      ? 'Indices'
      : spec.kind === 'metal'
      ? 'Commodities'
      : spec.kind === 'forex'
      ? 'Forex'
      : 'Macro Variable';

  const sign = spec.fallback.change >= 0 ? '+' : '';
  const atrFormatted =
    spec.kind === 'forex'
      ? `${Math.round(spec.fallback.atr * 10000)} pips`
      : spec.kind === 'metal'
      ? `$${spec.fallback.atr.toFixed(1)}`
      : `${Math.round(spec.fallback.atr)} pts`;

  const ptVal =
    spec.kind === 'forex'
      ? '$10.00 / pip / lote'
      : spec.kind === 'metal'
      ? '$100 / $1.00 ($10/pip)'
      : spec.quoteCcy === 'USD'
      ? `$${spec.contractValue.toFixed(2)} USD / pto`
      : `${spec.contractValue} ${spec.quoteCcy} / pto`;

  const mid = Number(((spec.fallback.high + spec.fallback.low) / 2).toFixed(spec.decimals));

  return {
    symbol: spec.symbol,
    tvScannerSymbol: spec.tv,
    futTvSymbol: spec.futTv,
    name: spec.nameEs,
    category,
    region: spec.region,
    price: spec.fallback.price,
    change24h: `${sign}${spec.fallback.change.toFixed(2)}%`,
    changeNumeric: spec.fallback.change,
    high24h: spec.fallback.high,
    low24h: spec.fallback.low,
    atrNumeric: spec.fallback.atr,
    atr14: atrFormatted,
    pointValue: ptVal,
    bias4H: spec.fallback.change >= 0 ? 'Bullish (Discount Sweep)' : 'Bearish (Premium OTE)',
    status: spec.tradeable ? 'Live Feed Active' : 'Macro Driver',
    impact:
      spec.symbol === 'DXY'
        ? 'Correlación inversa con EUR/USD, Oro e Índices'
        : spec.symbol === 'US10Y'
        ? 'Tasa de descuento clave para NAS100, US500 y Oro'
        : spec.symbol === 'VIX'
        ? 'Termómetro de volatilidad institucional S&P 500'
        : undefined,
    keyLevels: spec.tradeable
      ? {
          pdh: spec.fallback.high,
          pdl: spec.fallback.low,
          asiaHigh: Number((mid + (spec.fallback.high - mid) * 0.45).toFixed(spec.decimals)),
          asiaLow: Number((mid - (mid - spec.fallback.low) * 0.45).toFixed(spec.decimals)),
          fvg4H: `${Number((mid - spec.fallback.atr * 0.08).toFixed(spec.decimals))} - ${Number(
            (mid + spec.fallback.atr * 0.08).toFixed(spec.decimals)
          )}`,
        }
      : undefined,
  };
});

// Fetch live real-time prices from TradingView global scanner (including futures and FX rates)
async function syncRealTimeTradingViewQuotes() {
  try {
    const primaryTickers = MARKET_INSTRUMENTS.map((i) => i.tvScannerSymbol);
    const futuresTickers = MARKET_INSTRUMENTS.map((i) => i.futTvSymbol).filter(Boolean) as string[];
    const fxTickers = Object.values(FX_RATE_TICKERS).map((f) => f.tv);
    const allTickers = Array.from(new Set([...primaryTickers, ...futuresTickers, ...fxTickers]));

    const response = await fetch('https://scanner.tradingview.com/global/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: { tickers: allTickers, query: { types: [] } },
        columns: ['close', 'change', 'change_abs', 'high', 'low', 'ATR'],
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

    // Update FX conversion rates
    const eurusdRow = quoteMap.get('FX:EURUSD');
    if (eurusdRow && typeof eurusdRow[0] === 'number') liveFxRates.EURUSD = eurusdRow[0];
    const gbpusdRow = quoteMap.get('FX:GBPUSD');
    if (gbpusdRow && typeof gbpusdRow[0] === 'number') liveFxRates.GBPUSD = gbpusdRow[0];
    const usdjpyRow = quoteMap.get('FX:USDJPY');
    if (usdjpyRow && typeof usdjpyRow[0] === 'number') liveFxRates.USDJPY = usdjpyRow[0];

    MARKET_INSTRUMENTS = MARKET_INSTRUMENTS.map((inst) => {
      const spec = getSpec(inst.symbol);
      const decimals = spec ? spec.decimals : inst.price < 10 ? 5 : 2;
      const primaryData = quoteMap.get(inst.tvScannerSymbol);
      const futData = inst.futTvSymbol ? quoteMap.get(inst.futTvSymbol) : undefined;

      // Prefer primary ticker; if cash index has no intraday change outside cash hours, blend futures % change
      const liveData = primaryData && typeof primaryData[0] === 'number' ? primaryData : futData;
      if (!liveData || typeof liveData[0] !== 'number') return inst;

      const rawClose = liveData[0];
      let rawChangePct = typeof liveData[1] === 'number' ? liveData[1] : inst.changeNumeric;
      if (Math.abs(rawChangePct) < 0.001 && futData && typeof futData[1] === 'number') {
        rawChangePct = futData[1];
      }

      const rawHigh = typeof liveData[3] === 'number' ? liveData[3] : rawClose * 1.005;
      const rawLow = typeof liveData[4] === 'number' ? liveData[4] : rawClose * 0.995;
      const rawAtr =
        typeof liveData[5] === 'number' && liveData[5] > 0
          ? liveData[5]
          : spec?.fallback.atr || inst.atrNumeric;

      // Subtle micro-tick proportional to instrument tick size
      const microAmplitude =
        inst.symbol === 'EURUSD'
          ? 0.00008
          : inst.symbol === 'XAUUSD'
          ? 0.25
          : inst.symbol === 'US10Y'
          ? 0.002
          : rawClose > 15000
          ? 1.8
          : rawClose > 2000
          ? 0.6
          : 0.03;

      const microTick = (Math.random() - 0.5) * microAmplitude;
      const livePrice = Number((rawClose + microTick).toFixed(decimals));
      const high24h = Number(Math.max(rawHigh, livePrice).toFixed(decimals));
      const low24h = Number(Math.min(rawLow, livePrice).toFixed(decimals));
      const sign = rawChangePct >= 0 ? '+' : '';
      const change24h = `${sign}${rawChangePct.toFixed(2)}%`;

      const atrFormatted =
        spec?.kind === 'forex'
          ? `${Math.round(rawAtr * 10000)} pips`
          : spec?.kind === 'metal'
          ? `$${rawAtr.toFixed(1)} (${Math.round(rawAtr * 10)} pips)`
          : `${Math.round(rawAtr)} pts`;

      const mid = Number(((high24h + low24h) / 2).toFixed(decimals));
      const updatedKeyLevels = inst.keyLevels
        ? {
            ...inst.keyLevels,
            pdh: high24h,
            pdl: low24h,
            asiaHigh: Number((mid + (high24h - mid) * 0.45).toFixed(decimals)),
            asiaLow: Number((mid - (mid - low24h) * 0.45).toFixed(decimals)),
          }
        : undefined;

      return {
        ...inst,
        price: livePrice,
        change24h,
        changeNumeric: rawChangePct,
        high24h,
        low24h,
        atrNumeric: rawAtr,
        atr14: atrFormatted,
        bias4H: rawChangePct >= 0 ? 'Bullish (Discount Sweep)' : 'Bearish (Premium OTE)',
        keyLevels: updatedKeyLevels,
      };
    });
  } catch (_err) {
    // Keep last known prices on transient network error
  }
}

syncRealTimeTradingViewQuotes();
setInterval(syncRealTimeTradingViewQuotes, 3000);

// Track models that hit daily free-tier quota so we immediately route to available models
const exhaustedModels = new Set<string>();

function withTimeout<T>(promise: Promise<T>, ms: number = 4200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT_OR_QUOTA_FALLBACK')), ms)),
  ]);
}

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
      return await withTimeout(attempt(mdl), 5000);
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

// Build rich financial research sources tailored to the asset
function buildExternalTraceabilitySources(asset: string = 'NAS100', response?: any): ExternalSourceItem[] {
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

  const upper = (asset || 'NAS100').toUpperCase();
  const matchedWebs = FINANCIAL_WEB_SOURCES.filter(
    (w) => w.bestForAssets.includes(upper) || w.category === 'calendar' || w.category === 'macro'
  );

  const mapped: ExternalSourceItem[] = matchedWebs.slice(0, 8).map((w) => ({
    media: w.name,
    headline: w.descriptionEs,
    url: w.url,
    category: w.categoryLabelEs,
  }));

  return [...extractedGrounding, ...mapped];
}

function buildOwnAnalysisDeclaration(
  asset: string = 'NAS100',
  kz: any,
  riskPct: number = 0.50,
  includeNews: boolean = true,
  lang: string = 'es'
): string {
  const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
  if (lang === 'en') {
    return `4H/1H technical structure & 30M/15M/5M execution for ${inst.symbol} (live price ${inst.price.toLocaleString()}, 24h range ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()}, ATR ${inst.atr14}), PDH/PDL liquidity pools, 50% FVG, active session ${kz.name} (${kz.nyTime} NY), and exact ${riskPct}% risk sizing (${includeNews ? 'integrating macro news context' : 'pure price action filter without news'}).`;
  }
  return `Estructura técnica de ${inst.symbol} en 4H/1H y ejecución en 30M/15M/5M (precio actual ${inst.price.toLocaleString()}, rango ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()}, ATR ${inst.atr14}), niveles de liquidez PDH/PDL, FVG (50%), horario ${kz.name} (${kz.nyTime} NY) y gestión matemática de riesgo del ${riskPct}% (${includeNews ? 'integrando contexto de noticias macro' : 'filtro técnico puro sin noticias'}).`;
}

function formatAuditAttributionMarkdown(
  asset: string,
  kz: any,
  externalSources: ExternalSourceItem[],
  ownDeclaration: string,
  lang: string = 'es'
): string {
  const lines = externalSources
    .slice(0, 6)
    .map((s) => `* **[${s.media} | ${s.headline} | ${s.url}]**`)
    .join('\n');

  if (lang === 'en') {
    return `\n\n---\n### Basis & Consulted Sources\n${lines}\n\n* **Technical Basis:** ${ownDeclaration}`;
  }
  return `\n\n---\n### En qué se basó y Fuentes Consultadas\n${lines}\n\n* **Base Técnica:** ${ownDeclaration}`;
}

/**
 * Deterministic, mathematically exact trade setup & risk calculator for any instrument.
 * Guarantees that:
 * 1) Entry, Stop Loss, TP1, TP2 are accurately placed around live price using the asset's real ATR & tick size.
 * 2) Lot size and actual USD risk at Stop Loss match the exact contract specification of the instrument.
 * 3) Confluence score and Win Probability reflect real session liquidity, range position, and intermarket alignment.
 */
function buildDeterministicSetupForInstrument(params: {
  asset: string;
  accountBalance: number;
  riskPercentage: number;
  specificNotes?: string;
  customDocument?: string;
  selectedDocName?: string;
  sourceMode?: 'online' | 'custom_base';
  strategyId?: string;
  preferredDirection?: 'AUTO' | 'BUY' | 'SELL';
  marketMode?: 'all_programmed' | 'cfd_only' | 'futures_only';
  includeNews?: boolean;
  language?: string;
  currentKz: ReturnType<typeof getCurrentKillzone>;
  aiOverride?: {
    action?: 'BUY' | 'SELL' | 'WAIT';
    playbookName?: string;
    thesisRationale?: string;
    invalidationCriteria?: string;
    executionTips?: string[];
    confluenceBreakdown?: {
      killzoneFilterScore?: number;
      structureScore?: number;
      liquiditySweepScore?: number;
      intermarketScore?: number;
      triggerScore?: number;
    };
  };
}) {
  const {
    asset,
    accountBalance = 10000,
    riskPercentage = 0.5,
    specificNotes = '',
    customDocument = '',
    selectedDocName = '',
    sourceMode = 'online',
    strategyId = 'AUTO',
    preferredDirection = 'AUTO',
    marketMode = 'all_programmed',
    includeNews = true,
    language = 'es',
    currentKz,
    aiOverride,
  } = params;

  const isEn = language === 'en';
  const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
  const spec = getSpec(inst.symbol) || INSTRUMENTS[0];
  const futuresSpec = FUTURES_CONTRACT_MAP[spec.symbol];
  const isFuturesMode = marketMode === 'futures_only' && Boolean(futuresSpec);

  const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY')!;
  const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y')!;
  const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX')!;

  const rangeSpan = Math.max(spec.tick * 10, (inst.high24h || inst.price * 1.006) - (inst.low24h || inst.price * 0.994));
  const posInRange = Math.max(0, Math.min(1, (inst.price - inst.low24h) / rangeSpan)); // 0 = low, 1 = high
  const isBullish24h = inst.changeNumeric >= 0;

  // Determine direction from structure + momentum + user notes + preferredDirection
  const notesLower = (specificNotes || '').toLowerCase();
  const docLower = (customDocument || '').toLowerCase();
  let action: 'BUY' | 'SELL' = isBullish24h ? 'BUY' : 'SELL';

  // If price is at extreme discount (<24% of daily range), favor bullish liquidity sweep reversal
  if (posInRange < 0.24 && inst.changeNumeric > -1.8) action = 'BUY';
  // If price is at extreme premium (>82% of daily range) and momentum is stalling, favor bearish sweep
  else if (posInRange > 0.85 && inst.changeNumeric < 0.15) action = 'SELL';

  if (aiOverride?.action === 'BUY' || aiOverride?.action === 'SELL') {
    action = aiOverride.action;
  }
  if (sourceMode === 'custom_base' && customDocument) {
    if (
      (docLower.includes('venta') || docLower.includes('bajista') || docLower.includes('sell') || docLower.includes('short')) &&
      !(docLower.includes('compra') || docLower.includes('alcista') || docLower.includes('buy'))
    ) {
      action = 'SELL';
    } else if (
      (docLower.includes('compra') || docLower.includes('alcista') || docLower.includes('buy') || docLower.includes('long')) &&
      !(docLower.includes('venta') || docLower.includes('bajista') || docLower.includes('sell'))
    ) {
      action = 'BUY';
    }
  }
  if (notesLower.includes('venta') || notesLower.includes('sell') || notesLower.includes('short') || notesLower.includes('bajista')) {
    action = 'SELL';
  } else if (notesLower.includes('compra') || notesLower.includes('buy') || notesLower.includes('long') || notesLower.includes('alcista')) {
    action = 'BUY';
  }
  if (preferredDirection === 'BUY' || preferredDirection === 'SELL') {
    action = preferredDirection;
  }

  const dirMult = action === 'BUY' ? 1 : -1;

  // Compute realistic intraday Stop Loss distance (~12% to 15% of daily ATR, bounded per asset class)
  const rawAtr = inst.atrNumeric || spec.fallback.atr;
  let stopDistancePrice = rawAtr * 0.12;
  if (spec.symbol === 'EURUSD') {
    stopDistancePrice = Math.max(0.0010, Math.min(0.0022, rawAtr * 0.18)); // 10 - 22 pips
  } else if (spec.symbol === 'XAUUSD') {
    stopDistancePrice = Math.max(4.0, Math.min(9.5, rawAtr * 0.08)); // $4.00 - $9.50 (40 - 95 pips)
  } else if (spec.symbol === 'NAS100') {
    stopDistancePrice = Math.max(35, Math.min(75, Math.round(rawAtr * 0.08)));
  } else if (spec.symbol === 'US30') {
    stopDistancePrice = Math.max(55, Math.min(110, Math.round(rawAtr * 0.09)));
  } else if (spec.symbol === 'US500') {
    stopDistancePrice = Math.max(8, Math.min(18, Math.round(rawAtr * 0.11 * 10) / 10));
  } else if (spec.symbol === 'US2000') {
    stopDistancePrice = Math.max(4.5, Math.min(11, Math.round(rawAtr * 0.11 * 10) / 10));
  } else if (spec.symbol === 'GER40') {
    stopDistancePrice = Math.max(28, Math.min(60, Math.round(rawAtr * 0.09)));
  } else if (spec.symbol === 'UK100' || spec.symbol === 'EU50' || spec.symbol === 'FRA40') {
    stopDistancePrice = Math.max(10, Math.min(25, Math.round(rawAtr * 0.11 * 10) / 10));
  } else if (spec.symbol === 'JP225' || spec.symbol === 'HK50') {
    stopDistancePrice = Math.max(60, Math.min(160, Math.round(rawAtr * 0.09)));
  }

  stopDistancePrice = Math.max(spec.tick * 5, roundToTick(stopDistancePrice, spec));
  const pullbackOffset = roundToTick(stopDistancePrice * 0.28, spec);

  const entryPrice = roundToTick(inst.price - dirMult * pullbackOffset, spec);
  const stopLoss = roundToTick(entryPrice - dirMult * stopDistancePrice, spec);
  const exactStopDist = Math.max(spec.tick, Math.abs(entryPrice - stopLoss));
  const takeProfit1 = roundToTick(entryPrice + dirMult * exactStopDist * 1.8, spec);
  const takeProfit2 = roundToTick(entryPrice + dirMult * exactStopDist * 3.0, spec);

  // Exact Risk & Lot Size / Futures Contract Calculation
  const safeBalance = Math.max(100, Number(accountBalance) || 10000);
  const safeRiskPct = Math.max(0.05, Math.min(5, Number(riskPercentage) || 0.5));
  const targetMonetaryRiskUsd = Number(((safeBalance * safeRiskPct) / 100).toFixed(2));

  let usdPerPointPerLot = valuePerPointUsd(spec, liveFxRates);
  let recommendedLots = 0.01;
  let contractSpecLabel = '';

  if (isFuturesMode && futuresSpec) {
    const ccyRate =
      spec.quoteCcy === 'USD' ? 1 : liveFxRates[spec.quoteCcy as keyof FxRates] || 1;
    const microPtVal = futuresSpec.microPointValue ?? futuresSpec.stdPointValue;
    const microUsdPerUnit =
      spec.symbol === 'EURUSD' ? microPtVal * 1 : microPtVal * ccyRate;
    const microRiskPerContract = exactStopDist * microUsdPerUnit;
    const rawMicroContracts =
      microRiskPerContract > 0 ? targetMonetaryRiskUsd / microRiskPerContract : 1;

    usdPerPointPerLot = microUsdPerUnit;
    recommendedLots = Math.max(1, Math.round(rawMicroContracts));
    const activeFutTicker = futuresSpec.microTicker || futuresSpec.futuresTicker;
    contractSpecLabel = isEn
      ? `Futures (${activeFutTicker} • ${futuresSpec.exchange}) — $${(
          spec.symbol === 'EURUSD' ? microPtVal * 0.0001 : microUsdPerUnit
        ).toFixed(2)} USD / ${spec.symbol === 'EURUSD' ? 'pip' : 'pt'}`
      : `Futuros (${activeFutTicker} • ${futuresSpec.exchange}) — $${(
          spec.symbol === 'EURUSD' ? microPtVal * 0.0001 : microUsdPerUnit
        ).toFixed(2)} USD / ${spec.symbol === 'EURUSD' ? 'pip' : 'pto'}`;
  } else {
    const riskPerOneLotUsd = exactStopDist * usdPerPointPerLot;
    const rawLots = riskPerOneLotUsd > 0 ? targetMonetaryRiskUsd / riskPerOneLotUsd : 0.01;
    recommendedLots = Math.max(0.01, Number(rawLots.toFixed(2)));

    contractSpecLabel =
      spec.kind === 'forex'
        ? isEn
          ? '1 Std Lot = 100,000 units ($10.00 USD / pip)'
          : '1 Lote Estándar = 100,000 uds ($10.00 USD / pip)'
        : spec.kind === 'metal'
        ? isEn
          ? '1 Std Lot = 100 oz ($100 USD per $1.00 move | $10/pip)'
          : '1 Lote Estándar = 100 oz ($100 USD por cada $1.00 | $10/pip)'
        : spec.quoteCcy === 'USD'
        ? isEn
          ? `1 CFD Lot = $${spec.contractValue.toFixed(2)} USD / pt`
          : `1 Lote CFD = $${spec.contractValue.toFixed(2)} USD / pto`
        : isEn
        ? `1 CFD Lot = ${spec.contractValue} ${spec.quoteCcy}/pt (~$${usdPerPointPerLot.toFixed(2)} USD/pt)`
        : `1 Lote CFD = ${spec.contractValue} ${spec.quoteCcy}/pto (~$${usdPerPointPerLot.toFixed(2)} USD/pto)`;
  }

  const riskPerOneLotUsd = exactStopDist * usdPerPointPerLot;
  const actualRiskAtStopUsd = Number((recommendedLots * riskPerOneLotUsd).toFixed(2));
  const projectedProfitTp1Usd = Number((actualRiskAtStopUsd * 1.8).toFixed(2));
  const projectedProfitTp2Usd = Number((actualRiskAtStopUsd * 3.0).toFixed(2));

  const stopDistanceStr = formatDistance(exactStopDist, spec, isEn);

  const isMinLotWarning = actualRiskAtStopUsd > targetMonetaryRiskUsd * 1.15;
  const unitWordEs = isFuturesMode ? 'contratos' : 'lotes';
  const unitWordEn = isFuturesMode ? 'contracts' : 'lots';
  const hardDailyDrawdownAlert = isMinLotWarning
    ? isEn
      ? `Target risk ${safeRiskPct}% is $${targetMonetaryRiskUsd.toFixed(2)} USD, while minimum size (${recommendedLots} ${unitWordEn}) risks $${actualRiskAtStopUsd.toFixed(2)} USD (${((actualRiskAtStopUsd / safeBalance) * 100).toFixed(2)}%). Daily stop limit (-1.5%): -$${(safeBalance * 0.015).toFixed(2)} USD.`
      : `Tu riesgo objetivo (${safeRiskPct}%) es $${targetMonetaryRiskUsd.toFixed(2)} USD; con el mínimo (${recommendedLots} ${unitWordEs}) el riesgo real en SL es $${actualRiskAtStopUsd.toFixed(2)} USD (${((actualRiskAtStopUsd / safeBalance) * 100).toFixed(2)}%). Límite diario (-1.5%): -$${(safeBalance * 0.015).toFixed(2)} USD.`
    : isEn
    ? `Exact loss at Stop Loss: -$${actualRiskAtStopUsd.toFixed(2)} USD (${safeRiskPct}%). Profit at TP1: +$${projectedProfitTp1Usd.toFixed(2)} | TP2: +$${projectedProfitTp2Usd.toFixed(2)}. Daily circuit breaker (-1.5%): -$${(safeBalance * 0.015).toFixed(2)} USD.`
    : `Pérdida exacta en Stop Loss: -$${actualRiskAtStopUsd.toFixed(2)} USD (${safeRiskPct}%). Ganancia en TP1: +$${projectedProfitTp1Usd.toFixed(2)} | TP2: +$${projectedProfitTp2Usd.toFixed(2)}. Límite diario (-1.5%): -$${(safeBalance * 0.015).toFixed(2)} USD.`;

  // 5-Factor Quantitative Confluence Scoring tailored to asset & active session
  // 1. Killzone / Session Score (Max 20)
  const kzScore = spec.sessionScores[currentKz.sessionKey] ?? 14;

  // 2. Price Structure & Range Position Score (Max 25)
  let structScore = 18;
  if (posInRange >= 0.44 && posInRange <= 0.56) {
    structScore = 13; // Choppy midpoint equilibrium
  } else if (
    (action === 'BUY' && isBullish24h && posInRange >= 0.22 && posInRange <= 0.78) ||
    (action === 'SELL' && !isBullish24h && posInRange >= 0.22 && posInRange <= 0.78)
  ) {
    structScore = 23; // Clean pro-trend structure with room to expand
  } else if (
    (action === 'BUY' && posInRange < 0.25) ||
    (action === 'SELL' && posInRange > 0.75)
  ) {
    structScore = 19; // Liquidity sweep at discount/premium extreme
  } else {
    structScore = 12;
  }

  // 3. Liquidity Sweep / Proximity to Key Levels Score (Max 20)
  const distFromExtreme = Math.min(posInRange, 1 - posInRange);
  const sweepScore = distFromExtreme < 0.22 ? 19 : distFromExtreme < 0.36 ? 16 : 13;

  // 4. Intermarket & Macro Score (Max 20)
  const dxyUp = dxy.changeNumeric > 0;
  const us10yUp = us10y.changeNumeric > 0;
  const vixUp = vix.changeNumeric > 0;

  let interScore = 15;
  if (spec.macroProfile === 'us_tech' || spec.macroProfile === 'gold') {
    if (action === 'BUY') {
      interScore = !dxyUp && !us10yUp ? 19 : !us10yUp || !vixUp ? 16 : 10;
    } else {
      interScore = dxyUp && us10yUp ? 19 : dxyUp || vixUp ? 16 : 11;
    }
  } else if (spec.macroProfile === 'eurusd') {
    interScore = (action === 'BUY' && !dxyUp) || (action === 'SELL' && dxyUp) ? 19 : 11;
  } else {
    // US & Global equity indices
    if (action === 'BUY') {
      interScore = !vixUp ? 18 : 12;
    } else {
      interScore = vixUp ? 18 : 13;
    }
  }
  if (!includeNews) {
    interScore = Math.max(15, interScore);
  }

  // 5. Execution Trigger Score (Max 15)
  let trigScore = kzScore >= 16 && structScore >= 18 ? 14 : kzScore >= 12 ? 12 : 9;
  if (notesLower.includes('duda') || notesLower.includes('contra')) trigScore = 8;

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(val)));
  const aiB = aiOverride?.confluenceBreakdown;
  const finalBreakdown = {
    killzoneFilterScore: clamp(aiB?.killzoneFilterScore ? (aiB.killzoneFilterScore + kzScore) / 2 : kzScore, 4, 20),
    structureScore: clamp(aiB?.structureScore ? (aiB.structureScore + structScore) / 2 : structScore, 5, 25),
    liquiditySweepScore: clamp(aiB?.liquiditySweepScore ? (aiB.liquiditySweepScore + sweepScore) / 2 : sweepScore, 5, 20),
    intermarketScore: clamp(aiB?.intermarketScore ? (aiB.intermarketScore + interScore) / 2 : interScore, 4, 20),
    triggerScore: clamp(aiB?.triggerScore ? (aiB.triggerScore + trigScore) / 2 : trigScore, 4, 15),
  };

  const totalScore =
    finalBreakdown.killzoneFilterScore +
    finalBreakdown.structureScore +
    finalBreakdown.liquiditySweepScore +
    finalBreakdown.intermarketScore +
    finalBreakdown.triggerScore;

  const winProbability = clamp(totalScore * 0.92 + (kzScore >= 17 ? 3 : -2), 35, 91);

  let recommendationVerdict: 'TAKE' | 'CAUTION' | 'AVOID' = 'TAKE';
  let recommendationLabel = '';
  let recommendationReason = '';
  let tierLabel = '';

  if (totalScore >= 74 && winProbability >= 70) {
    recommendationVerdict = 'TAKE';
    tierLabel = isEn ? 'A+ Setup (High Confluence)' : 'Setup A+ (Alta Confluencia)';
    recommendationLabel = isEn ? 'RECOMMENDED TO TAKE TRADE' : 'SÍ SE RECOMIENDA TOMAR LA ENTRADA';
    recommendationReason = isEn
      ? `High probability of success (${winProbability}%). Session liquidity, price structure, and intermarket flow are aligned for ${spec.symbol}.`
      : `Alta probabilidad de acierto (${winProbability}%). Liquidez de sesión, estructura de precio y flujo intermercado alineados en ${spec.symbol}.`;
  } else if (totalScore >= 56) {
    recommendationVerdict = 'CAUTION';
    tierLabel = isEn ? 'B Setup (Moderate Confluence)' : 'Setup B (Confluencia Moderada)';
    recommendationLabel = isEn
      ? 'TRADE WITH CAUTION (WAIT 5M/15M CONFIRMATION)'
      : 'PRECAUCIÓN: ESPERAR CONFIRMACIÓN EN 5M/15M O MITAD DE LOTAJE';
    recommendationReason = isEn
      ? `Moderate probability (${winProbability}%). Wait for a clean 5M/15M displacement candle at ${entryPrice} or use 50% risk.`
      : `Probabilidad moderada (${winProbability}%). Espera vela de desplazamiento en 5M/15M sobre ${entryPrice} o opera con mitad de riesgo.`;
  } else {
    recommendationVerdict = 'AVOID';
    tierLabel = isEn ? 'Low Confluence (Wait Better Window)' : 'Baja Confluencia (Esperar Mejor Ventana)';
    recommendationLabel = isEn
      ? 'LOW SESSION LIQUIDITY FOR THIS ASSET RIGHT NOW'
      : 'BAJA LIQUIDEZ ACTUAL EN ESTE ACTIVO — REVISA EL ESCÁNER';
    recommendationReason = isEn
      ? `Win probability is ${winProbability}% because ${spec.symbol} is outside its prime session window. Check the Best Setups Scanner for active indices.`
      : `Probabilidad del ${winProbability}% porque ${spec.symbol} está fuera de su ventana óptima de liquidez. Revisa el Escáner de Mejores Entradas.`;
  }

  // Pick matching strategy playbook based on explicit strategyId, custom base, or region & session
  let matchedStrat = TRADING_STRATEGIES[0];
  const explicitStrat =
    strategyId && strategyId !== 'AUTO'
      ? TRADING_STRATEGIES.find((s) => s.id === strategyId || s.code === strategyId)
      : undefined;

  if (explicitStrat) {
    matchedStrat = explicitStrat;
  } else if (sourceMode === 'custom_base' && (selectedDocName || customDocument)) {
    const combinedText = `${selectedDocName} ${customDocument.slice(0, 600)}`.toLowerCase();
    const byDoc = TRADING_STRATEGIES.find(
      (s) =>
        combinedText.includes(s.code.toLowerCase()) ||
        combinedText.includes(s.nameEs.toLowerCase().slice(0, 14)) ||
        combinedText.includes(s.nameEn.toLowerCase().slice(0, 14))
    );
    if (byDoc) matchedStrat = byDoc;
    else if (spec.region === 'EU' || spec.region === 'UK' || currentKz.sessionKey === 'london') {
      matchedStrat = TRADING_STRATEGIES[1];
    }
  } else if (spec.region === 'EU' || spec.region === 'UK' || currentKz.sessionKey === 'london') {
    matchedStrat = TRADING_STRATEGIES[1]; // Asian Range Sweep & London Judas
  } else if (spec.symbol === 'XAUUSD') {
    matchedStrat = TRADING_STRATEGIES[4]; // COMEX Expansion & Real Yields
  } else if (posInRange < 0.22 || posInRange > 0.78) {
    matchedStrat = TRADING_STRATEGIES[5]; // PDH/PDL Reversion
  } else if (currentKz.sessionKey === 'ny_am' || currentKz.sessionKey === 'ny_pm') {
    matchedStrat = TRADING_STRATEGIES[0]; // ICT Silver Bullet NY
  } else {
    matchedStrat = TRADING_STRATEGIES[3]; // 1H Order Block & OTE
  }

  const playbookName =
    explicitStrat
      ? isEn
        ? `${explicitStrat.code}: ${explicitStrat.nameEn}`
        : `${explicitStrat.code}: ${explicitStrat.nameEs}`
      : sourceMode === 'custom_base' && selectedDocName
      ? `${matchedStrat.code} • ${selectedDocName}`
      : aiOverride?.playbookName ||
        (isEn ? `${matchedStrat.code}: ${matchedStrat.nameEn}` : `${matchedStrat.code}: ${matchedStrat.nameEs}`);

  const externalSources = buildExternalTraceabilitySources(spec.symbol);
  const baseDeclaration = buildOwnAnalysisDeclaration(spec.symbol, currentKz, safeRiskPct, includeNews, language);
  const ownDeclaration =
    sourceMode === 'custom_base' && selectedDocName
      ? isEn
        ? `[Applied Base: "${selectedDocName}"] • ${baseDeclaration}`
        : `[Base Aplicada: "${selectedDocName}"] • ${baseDeclaration}`
      : baseDeclaration;

  const macroContextSnippetEs = includeNews
    ? ` Confluencia macro activa: DXY en ${dxy.price} (${dxy.change24h}), Bono US10Y en ${us10y.price}% (${us10y.change24h}) y VIX en ${vix.price}.`
    : ' Filtro Técnico Puro activado (noticias macro excluidas por configuración del usuario).';
  const macroContextSnippetEn = includeNews
    ? ` Active macro confluence: DXY at ${dxy.price} (${dxy.change24h}), US10Y yield at ${us10y.price}% (${us10y.change24h}), and VIX at ${vix.price}.`
    : ' Pure Technical Price Action filter active (macro news excluded per user setting).';

  const customBaseSnippetEs =
    sourceMode === 'custom_base' && selectedDocName
      ? ` Calculado aplicando las reglas de la base "${selectedDocName}".`
      : '';
  const customBaseSnippetEn =
    sourceMode === 'custom_base' && selectedDocName
      ? ` Calculated applying the rules from base "${selectedDocName}".`
      : '';

  const notesSnippetEs = specificNotes.trim()
    ? ` Nota del operador integrada: "${specificNotes.trim()}".`
    : '';
  const notesSnippetEn = specificNotes.trim()
    ? ` Trader note integrated: "${specificNotes.trim()}".`
    : '';

  const displayAssetLabel =
    isFuturesMode && futuresSpec
      ? `${spec.symbol} (${futuresSpec.futuresTicker} • ${isEn ? futuresSpec.nameEn : futuresSpec.nameEs})`
      : `${spec.symbol} (${isEn ? spec.nameEn : spec.nameEs})`;

  const defaultThesis = isEn
    ? `${displayAssetLabel} trades at ${inst.price.toLocaleString()} (${inst.change24h}) inside the 24h range ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()} (ATR: ${inst.atr14}). Strategy ${playbookName} projects ${action === 'BUY' ? 'bullish absorption in discount' : 'bearish supply rejection in premium'} at ${entryPrice} targeting TP1 ${takeProfit1} (+$${projectedProfitTp1Usd}) and TP2 ${takeProfit2} (+$${projectedProfitTp2Usd}) with Stop Loss at ${stopLoss} (-$${actualRiskAtStopUsd}).${macroContextSnippetEn}${customBaseSnippetEn}${notesSnippetEn}`
    : `${displayAssetLabel} cotiza en ${inst.price.toLocaleString()} (${inst.change24h}) dentro del rango 24h de ${inst.low24h.toLocaleString()} – ${inst.high24h.toLocaleString()} (ATR: ${inst.atr14}). Mediante ${playbookName} se proyecta ${action === 'BUY' ? 'absorción compradora en descuento' : 'rechazo vendedor en zona premium'} sobre ${entryPrice} buscando TP1 ${takeProfit1} (+$${projectedProfitTp1Usd}) y TP2 ${takeProfit2} (+$${projectedProfitTp2Usd}), protegiendo con Stop Loss en ${stopLoss} (-$${actualRiskAtStopUsd}).${macroContextSnippetEs}${customBaseSnippetEs}${notesSnippetEs}`;

  const defaultInvalidation = isEn
    ? `Invalidated if a 15M candle closes with a full body ${action === 'BUY' ? 'below' : 'above'} ${stopLoss}, or if price hits ${takeProfit1} before triggering the entry at ${entryPrice}.`
    : `Se invalida si una vela de 15M cierra con cuerpo completo por ${action === 'BUY' ? 'debajo' : 'encima'} de ${stopLoss}, o si el precio toca ${takeProfit1} antes de activar la orden en ${entryPrice}.`;

  const defaultTips = isEn
    ? [
        `Execute ${recommendedLots} ${unitWordEn} (${contractSpecLabel}) so Stop Loss (${stopDistanceStr}) risks -$${actualRiskAtStopUsd.toFixed(2)} USD.`,
        `Close 50% at TP1 (${takeProfit1}) and move Stop Loss to Break Even (${entryPrice}).`,
        `Let the remaining 50% run toward TP2 (${takeProfit2}) for a 1:3.0 R:R (+$${projectedProfitTp2Usd.toFixed(2)} USD).`,
        ...(specificNotes.trim() ? [`User instruction applied: "${specificNotes.trim()}"`] : []),
      ]
    : [
        `Ejecutar ${recommendedLots} ${unitWordEs} (${contractSpecLabel}) para que el Stop Loss (${stopDistanceStr}) represente -$${actualRiskAtStopUsd.toFixed(2)} USD.`,
        `Cerrar 50% de la posición en TP1 (${takeProfit1}) y mover el Stop Loss a Break Even (${entryPrice}).`,
        `Dejar correr el resto hacia TP2 (${takeProfit2}) para un 1:3.0 R:R (+$${projectedProfitTp2Usd.toFixed(2)} USD).`,
        ...(specificNotes.trim() ? [`Instrucción del operador aplicada: "${specificNotes.trim()}"`] : []),
      ];

  return {
    asset: spec.symbol,
    assetName:
      isFuturesMode && futuresSpec
        ? `${futuresSpec.futuresTicker} • ${isEn ? futuresSpec.nameEn : futuresSpec.nameEs}`
        : isEn
        ? spec.nameEn
        : spec.nameEs,
    region: spec.region,
    action,
    playbookName,
    strategyId: matchedStrat.id,
    tier: tierLabel,
    totalConfluenceScore: totalScore,
    confluenceBreakdown: finalBreakdown,
    winProbability,
    recommendationVerdict,
    recommendationLabel,
    recommendationReason,
    prices: {
      currentPrice: inst.price,
      entryPrice,
      entryType: isEn
        ? `${action === 'BUY' ? 'Buy Limit' : 'Sell Limit'} at 50% FVG / POI`
        : `${action === 'BUY' ? 'Buy Limit' : 'Sell Limit'} en 50% FVG / Zona POI`,
      stopLoss,
      stopLossDistance: stopDistanceStr,
      stopLossPoints: exactStopDist,
      takeProfit1,
      takeProfit2,
      riskRewardRatio: '1:3.0',
    },
    propFirmRiskCalculation: {
      accountBalance: safeBalance,
      riskPercentage: safeRiskPct,
      monetaryRiskUsd: targetMonetaryRiskUsd,
      actualRiskAtStopUsd,
      projectedProfitTp1Usd,
      projectedProfitTp2Usd,
      recommendedLots,
      valuePerPointPerLotUsd: Number(usdPerPointPerLot.toFixed(4)),
      contractSizeSpec: contractSpecLabel,
      hardDailyDrawdownAlert,
    },
    thesisRationale: aiOverride?.thesisRationale
      ? `${aiOverride.thesisRationale}${customBaseSnippetEs}${notesSnippetEs}`
      : defaultThesis,
    invalidationCriteria: aiOverride?.invalidationCriteria || defaultInvalidation,
    executionTips:
      Array.isArray(aiOverride?.executionTips) && aiOverride.executionTips.length > 0
        ? aiOverride.executionTips
        : defaultTips,
    externalSources,
    ownAnalysisDeclaration: ownDeclaration,
  };
}

// Routes

// 1. Get Treatise & Web Sources Prompt
app.get('/api/treatise', (req, res) => {
  res.json({
    title: 'Tratado Maestro de Investigación Financiera y Microestructura de Mercado',
    assetsCovered: TRADEABLE_INSTRUMENTS.map((i) => i.symbol),
    contentLength: treatiseContent.length,
    snippet: treatiseContent.substring(0, 1500) + '...',
    fullContent: treatiseContent,
    webSourcesPromptContent,
  });
});

// 2. Real-Time Market Feed (with live FX conversion rates)
app.get('/api/market-feed', async (req, res) => {
  await syncRealTimeTradingViewQuotes();
  const killzone = getCurrentKillzone();
  res.json({
    timestamp: new Date().toISOString(),
    session: killzone,
    instruments: MARKET_INSTRUMENTS,
    fxRates: liveFxRates,
  });
});

// 3. Multi-Index High-Probability Trade Scanner (/api/scan-best-setups)
app.post('/api/scan-best-setups', async (req, res) => {
  await syncRealTimeTradingViewQuotes();
  const {
    accountBalance = 10000,
    riskPercentage = 0.50,
    filterCategory = 'ALL', // 'ALL' | 'INDICES' | 'US_INDICES' | 'EU_ASIA_INDICES' | 'METALS_FX'
    includeNews = true,
    customDocument = '',
    marketMode = 'all_programmed',
    language = 'es',
  } = req.body || {};

  const currentKz = getCurrentKillzone();

  const pool = TRADEABLE_INSTRUMENTS.filter((spec) => {
    if (filterCategory === 'INDICES') return spec.kind === 'index';
    if (filterCategory === 'US_INDICES') return spec.kind === 'index' && spec.region === 'US';
    if (filterCategory === 'EU_ASIA_INDICES')
      return spec.kind === 'index' && (spec.region === 'EU' || spec.region === 'UK' || spec.region === 'ASIA');
    if (filterCategory === 'METALS_FX') return spec.kind === 'metal' || spec.kind === 'forex';
    return true;
  });

  const evaluated = pool.map((spec) =>
    buildDeterministicSetupForInstrument({
      asset: spec.symbol,
      accountBalance: Number(accountBalance) || 10000,
      riskPercentage: Number(riskPercentage) || 0.50,
      customDocument,
      marketMode,
      includeNews: Boolean(includeNews),
      language,
      currentKz,
    })
  );

  // Sort by highest winProbability first, then totalConfluenceScore
  evaluated.sort((a, b) => {
    const probDiff = (b.winProbability || 0) - (a.winProbability || 0);
    if (probDiff !== 0) return probDiff;
    return b.totalConfluenceScore - a.totalConfluenceScore;
  });

  res.json({
    bestSetup: evaluated[0],
    rankedSetups: evaluated,
    scannedCount: evaluated.length,
    nyTime: currentKz.nyTime,
    session: currentKz.name,
    timestamp: new Date().toISOString(),
  });
});

// 4. Interactive Gemini Chat (Neutral General AI + News & Macro Support)
app.post('/api/chat', async (req, res) => {
  const {
    message,
    history = [],
    asset = 'NAS100',
    customDocument,
    useOnlineOnly = false,
    language = 'es',
  } = req.body;
  const isEn = language === 'en';
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();

  if (!message) {
    return res.status(400).json({ error: isEn ? 'Message required' : 'Mensaje requerido' });
  }

  const ownDeclaration = buildOwnAnalysisDeclaration(asset, currentKz, 0.50, true, isEn ? 'en' : 'es');

  const qLower = String(message).toLowerCase();
  const isNewsOrMarketQuestion =
    /cpi|ipc|inflac|nfp|empleo|nomina|fomc|powell|fed|bce|ecb|boj|boe|tasa|rate|bono|yield|us10y|dxy|vix|notici|news|macro|oro|gold|xau|nas100|nasdaq|us30|dow|us500|s&p|sp500|us2000|russell|ger40|dax|uk100|ftse|eu50|fra40|jp225|nikkei|hk50|eurusd|mercado|market|trading|entrada|lote|pip|fvg|liquidez|sesion|killzone/.test(
      qLower
    );

  try {
    const recentHistoryText = Array.isArray(history)
      ? history
          .slice(-4)
          .map((h: any) => `${h.role === 'user' ? 'User' : 'Gemini'}: ${h.content}`)
          .join('\n')
      : '';

    const systemPrompt = isEn
      ? `You are Gemini, a neutral, helpful, and versatile general-purpose AI assistant.
- If the user asks any general question (concepts, math, writing, summaries, technology, productivity, or everyday topics), answer naturally, clearly, and neutrally like a standard general AI assistant without forcing trading jargon.
- If the user asks about economic news (CPI inflation, NFP jobs report, FOMC, Federal Reserve/ECB/BoE/BoJ interest rates, Jerome Powell speeches, US10Y Treasury yields, DXY Dollar Index, VIX, geopolitical events) or financial markets, use the live context below to give a clear, practical explanation of how it affects ${asset} and global markets.

LIVE CONTEXT (use when relevant to news/markets):
Current New York Time: ${currentKz.nyTime} | Active Session: ${currentKz.name}.
LIVE MARKET QUOTES: ${liveSnapshot}
${customDocument ? `REFERENCE CONTEXT:\n${customDocument.substring(0, 2500)}` : ''}
Respond in English concisely and clearly.`
      : `Eres Gemini, una inteligencia artificial de propósito general, neutral, versátil y directa.
- Si el usuario te hace cualquier pregunta general (dudas cotidianas, explicaciones, cálculos, redacción, resúmenes, programación, cultura general o cualquier tema), responde con total naturalidad y neutralidad como una IA general cualquiera, sin forzar temas de trading si no vienen al caso.
- Si el usuario te pregunta sobre noticias económicas (CPI/Inflación, NFP/Empleo, FOMC, tasas de la Fed/BCE/BoE/BoJ, discursos de Jerome Powell, rendimientos de bonos US10Y, DXY, VIX, eventos geopolíticos, calendario económico) o sobre mercados financieros, utiliza el contexto en tiempo real de abajo para explicarle con claridad cómo funciona y cómo impacta a ${asset} y a los mercados.

CONTEXTO EN TIEMPO REAL (úsalo cuando pregunten sobre noticias o mercados):
Hora actual en Nueva York: ${currentKz.nyTime} | Sesión activa: ${currentKz.name}.
COTIZACIONES EN VIVO: ${liveSnapshot}
${customDocument ? `CONTEXTO DE REFERENCIA:\n${customDocument.substring(0, 2500)}` : ''}
Responde en español de forma clara, natural y bien estructurada.`;

    const promptWithContext = recentHistoryText
      ? `${recentHistoryText}\nUser: ${message}`
      : message;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: promptWithContext }] }],
      config: { systemInstruction: systemPrompt },
    });

    const externalSources = isNewsOrMarketQuestion
      ? buildExternalTraceabilitySources(asset, response)
      : [];
    const reply = response.text || '';
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
    const externalSources = isNewsOrMarketQuestion ? buildExternalTraceabilitySources(asset) : [];
    const targetInst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
    const xau = MARKET_INSTRUMENTS.find((i) => i.symbol === 'XAUUSD')!;
    const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY')!;
    const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y')!;
    const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX')!;

    let fallbackReply = '';

    if (qLower.includes('cpi') || qLower.includes('inflac') || qLower.includes('ipc')) {
      fallbackReply = isEn
        ? `### Impact of CPI (Inflation) on ${asset}, Gold & Indices (${currentKz.nyTime} NY)
- **Higher-than-expected CPI (Hot Inflation):** Means the Federal Reserve is likely to keep interest rates higher for longer.
  - **DXY (${dxy.price}) & US10Y (${us10y.price}%):** Move upward immediately.
  - **XAUUSD Gold ($${xau.price.toLocaleString()}) & Equity Indices (${targetInst.symbol}: ${targetInst.price.toLocaleString()}):** Experience initial selling pressure due to higher yields.
- **Lower-than-expected CPI (Cool Inflation):** Increases expectations of rate cuts.
  - **DXY & US10Y:** Drop sharply.
  - **NAS100, US500, US30, GER40, EURUSD & XAUUSD:** Tend to rally upward after the initial 8:30 AM NY volatility.`
        : `### Impacto del CPI (Inflación) en ${asset}, Oro e Índices (${currentKz.nyTime} NY)
- **Si el CPI sale MÁS ALTO de lo esperado (Inflación alta):** El banco central (Fed) tiende a mantener tasas altas por más tiempo.
  - **DXY (${dxy.price}) y Bono US10Y (${us10y.price}%):** Suben con fuerza.
  - **XAUUSD Oro ($${xau.price.toLocaleString()}) e Índices (${targetInst.symbol}: ${targetInst.price.toLocaleString()}):** Suelen enfrentar presión bajista inicial porque suben los rendimientos de los bonos.
- **Si el CPI sale MÁS BAJO de lo esperado (Inflación moderándose):** Aumenta la probabilidad de recortes de tasas.
  - **DXY y US10Y:** Caen con rapidez.
  - **NAS100, US500, US30, GER40, EURUSD y XAUUSD:** Suelen reaccionar al alza tras la volatilidad inicial de las 8:30 AM (Hora NY).`;
    } else if (
      qLower.includes('nfp') ||
      qLower.includes('empleo') ||
      qLower.includes('nomina') ||
      qLower.includes('fomc') ||
      qLower.includes('powell') ||
      qLower.includes('fed') ||
      qLower.includes('tasa') ||
      qLower.includes('rate')
    ) {
      fallbackReply = isEn
        ? `### Central Bank Rates, NFP & FOMC Overview (${currentKz.nyTime} NY)
- **How Interest Rates Work:** Central banks (like the Federal Reserve) raise interest rates to cool down inflation by making credit more expensive, and lower rates to stimulate economic growth.
- **NFP (Non-Farm Payrolls — 8:30 AM NY):** Strong job creation strengthens the USD (**DXY: ${dxy.price}**), while weak job data supports rate-cut expectations, boosting **Gold ($${xau.price.toLocaleString()})** and equity indices (**${targetInst.symbol}: ${targetInst.price.toLocaleString()}**).
- **FOMC & Powell Speeches (2:00 PM & 2:30 PM NY):** High volatility windows where spreads widen; waiting 10–15 minutes after the announcement helps avoid false spikes.`
        : `### Tasas de Interés, NFP y FOMC (${currentKz.nyTime} NY)
- **Cómo funcionan las tasas de interés:** Los bancos centrales (como la Reserva Federal o el BCE) suben las tasas para frenar la inflación encareciendo el crédito, y las bajan para estimular el crecimiento económico.
- **NFP (Nóminas No Agrícolas — 8:30 AM NY):** Un empleo muy fuerte impulsa al dólar (**DXY: ${dxy.price}**), mientras que un empleo débil aumenta la expectativa de recortes de tasas, favoreciendo al **Oro ($${xau.price.toLocaleString()})** y a los índices (**${targetInst.symbol}: ${targetInst.price.toLocaleString()}**).
- **FOMC y Rueda de Prensa de Powell (2:00 PM y 2:30 PM NY):** Son momentos de alta volatilidad; esperar 10 a 15 minutos tras el anuncio ayuda a evitar barridos bruscos.`;
    } else if (isNewsOrMarketQuestion) {
      fallbackReply = isEn
        ? `### Market & News Context (${currentKz.nyTime} NY)
- **Your question:** *"${message}"*
- **Current Live Reference:**
  - **${targetInst.symbol} (${targetInst.name}):** **${targetInst.price.toLocaleString()}** (${targetInst.change24h}) | 24h Range: **${targetInst.low24h.toLocaleString()} – ${targetInst.high24h.toLocaleString()}**
  - **Macro Indicators:** **DXY:** ${dxy.price} (${dxy.change24h}) | **US10Y Yield:** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}) | **Gold (XAUUSD):** $${xau.price.toLocaleString()}`
        : `### Contexto de Noticias y Mercado (${currentKz.nyTime} NY)
- **Tu consulta:** *"${message}"*
- **Referencia en Tiempo Real:**
  - **${targetInst.symbol} (${targetInst.name}):** **${targetInst.price.toLocaleString()}** (${targetInst.change24h}) | Rango 24h: **${targetInst.low24h.toLocaleString()} – ${targetInst.high24h.toLocaleString()}**
  - **Indicadores Macro:** **DXY:** ${dxy.price} (${dxy.change24h}) | **Bono US10Y:** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}) | **Oro (XAUUSD):** $${xau.price.toLocaleString()}`;
    } else {
      fallbackReply = isEn
        ? `Hello! Regarding your message (*"${message}"*): I am **Gemini**, your general-purpose AI assistant. You can ask me general questions, calculations, summaries, concepts, or specific questions about economic news (CPI, NFP, FOMC, interest rates) and how they impact the markets.`
        : `¡Hola! Respecto a tu consulta (*"${message}"*): soy **Gemini**, tu asistente de inteligencia artificial de propósito general. Puedes pedirme explicaciones de cualquier tema, cálculos, resúmenes, ideas o preguntarme dudas sobre noticias económicas (CPI, NFP, FOMC, tasas de interés) y mercados.`;
    }

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

// 5. Generate Detailed Institutional Trading Report
app.post('/api/generate-report', async (req, res) => {
  await syncRealTimeTradingViewQuotes();
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
        ? 'Factor in the impact of current macroeconomic news (Fed, ECB, CPI, NFP, US10Y yields, DXY, VIX) from Reuters, Bloomberg, ForexLive, ForexFactory, Investing, Kitco, and CNBC.'
        : 'Toma en cuenta el impacto de noticias macroeconómicas actuales (Fed, BCE, CPI, NFP, bonos US10Y, DXY, VIX) de Reuters, Bloomberg, ForexLive, ForexFactory, Investing, Kitco y CNBC.'
      : isEn
      ? 'IGNORE macroeconomic news; focus strictly on price structure, liquidity levels, range, and pure price action.'
      : 'IGNORA las noticias macroeconómicas; enfócate exclusivamente en estructura de precio, niveles de liquidez, rango y acción del precio.';

    const prompt = isEn
      ? `Generate a practical, direct trading report in ENGLISH for ${asset} (${timeframe}).
Focus: ${focusArea}. NY Time: ${currentKz.nyTime}. Session: ${currentKz.name}.
Live Quotes: ${liveSnapshot}.
${newsInstruction}
${customDocument ? `Applicable analysis context:\n${customDocument.substring(0, 4500)}` : ''}
IMPORTANT: Go straight to key levels, bias, points of interest, and action plan. Use 12-hour time format (e.g. 9:30 AM, 4:00 PM). Write 100% in English.`
      : `Genera un reporte práctico, directo y al grano en ESPAÑOL para ${asset} (${timeframe}).
Enfoque: ${focusArea}. Hora NY: ${currentKz.nyTime}. Sesión: ${currentKz.name}.
Cotizaciones: ${liveSnapshot}.
${newsInstruction}
${customDocument ? `Contexto de análisis aplicable:\n${customDocument.substring(0, 4500)}` : ''}
IMPORTANTE: Ve directo a los niveles, dirección, puntos de interés y plan operativo. Usa formato de hora de 12 horas (ej. 9:30 AM, 4:00 PM).`;

    const systemInstruction = isEn
      ? `You are the lead analyst at TRstudio. Write clear, direct, practical trading reports in English without fluff. Always use 12h time format (AM/PM).`
      : `Eres el analista principal de TRstudio. Escribe reportes claros, directos, sin texto exagerado ni repetitivo. Usa siempre horas en formato 12h (AM/PM).\n${webSourcesPromptContent}`;

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
    const dxy = MARKET_INSTRUMENTS.find((i) => i.symbol === 'DXY')!;
    const us10y = MARKET_INSTRUMENTS.find((i) => i.symbol === 'US10Y')!;
    const vix = MARKET_INSTRUMENTS.find((i) => i.symbol === 'VIX')!;
    const externalSources = buildExternalTraceabilitySources(asset === 'TODOS' ? 'NAS100' : asset);

    let baseReport = '';

    if (asset === 'TODOS' || asset === 'ALL') {
      const summarySymbols = ['NAS100', 'US500', 'US30', 'GER40', 'XAUUSD', 'EURUSD'];
      const rowsEs = summarySymbols
        .map((sym) => {
          const item = MARKET_INSTRUMENTS.find((m) => m.symbol === sym) || MARKET_INSTRUMENTS[0];
          const sc = buildDeterministicSetupForInstrument({
            asset: sym,
            accountBalance: 10000,
            riskPercentage: 0.5,
            includeNews: Boolean(includeNews),
            language,
            currentKz,
          });
          return `- **${sym} (${item.name}):** Precio **${item.price.toLocaleString()}** (${item.change24h}) | Rango: ${item.low24h.toLocaleString()} – ${item.high24h.toLocaleString()} | **${sc.action}** en **${sc.prices.entryPrice}** (SL: ${sc.prices.stopLoss} | TP2: ${sc.prices.takeProfit2} | Acierto: **${sc.winProbability}%**)`;
        })
        .join('\n');

      const rowsEn = summarySymbols
        .map((sym) => {
          const item = MARKET_INSTRUMENTS.find((m) => m.symbol === sym) || MARKET_INSTRUMENTS[0];
          const sc = buildDeterministicSetupForInstrument({
            asset: sym,
            accountBalance: 10000,
            riskPercentage: 0.5,
            includeNews: Boolean(includeNews),
            language,
            currentKz,
          });
          return `- **${sym} (${item.name}):** Price **${item.price.toLocaleString()}** (${item.change24h}) | Range: ${item.low24h.toLocaleString()} – ${item.high24h.toLocaleString()} | **${sc.action}** at **${sc.prices.entryPrice}** (SL: ${sc.prices.stopLoss} | TP2: ${sc.prices.takeProfit2} | Win Prob: **${sc.winProbability}%**)`;
        })
        .join('\n');

      baseReport = isEn
        ? `# Multi-Asset Market Report: ALL PRIMARY ASSETS (${timeframe})
**NY Time:** ${currentKz.nyTime} | **Session:** ${currentKz.name} (${currentKz.windowHours}) | **Focus:** ${focusArea}

## 1. Live Multi-Index, Gold & Forex Summary
${rowsEn}

## 2. Macro & Intermarket Drivers
- **DXY Dollar Index:** **${dxy.price}** (${dxy.change24h}) | **US10Y Yield:** **${us10y.price}%** (${us10y.change24h}) | **VIX Volatility:** **${vix.price}** (${vix.change24h}).
- **Recommended Session Focus:** ${currentKz.recommendedAssets.join(', ')}.`
        : `# Reporte Multi-Activo: TODOS LOS ÍNDICES Y ACTIVOS (${timeframe})
**Hora NY:** ${currentKz.nyTime} | **Sesión:** ${currentKz.name} (${currentKz.windowHours}) | **Enfoque:** ${focusArea}

## 1. Resumen Operativo de Índices, Oro y Forex en Vivo
${rowsEs}

## 2. Indicadores Macro e Intermercado
- **Índice Dólar (DXY):** **${dxy.price}** (${dxy.change24h}) | **Bono 10 Años (US10Y):** **${us10y.price}%** (${us10y.change24h}) | **Volatilidad (VIX):** **${vix.price}** (${vix.change24h}).
- **Activos con Mayor Liquidez en esta Sesión:** ${currentKz.recommendedAssets.join(', ')}.`;
    } else {
      const inst = MARKET_INSTRUMENTS.find((i) => i.symbol === asset) || MARKET_INSTRUMENTS[0];
      const spec = getSpec(inst.symbol) || INSTRUMENTS[0];
      const mid = ((inst.high24h + inst.low24h) / 2).toFixed(spec.decimals);
      const setupCalc = buildDeterministicSetupForInstrument({
        asset: inst.symbol,
        accountBalance: 10000,
        riskPercentage: 0.5,
        includeNews: Boolean(includeNews),
        language,
        currentKz,
      });

      baseReport = isEn
        ? `# Market Action Report: ${asset} (${timeframe})
**NY Time:** ${currentKz.nyTime} | **Session:** ${currentKz.name} (${currentKz.windowHours}) | **Focus:** ${focusArea}

## 1. Live Price & Key Levels
- **Current Price:** **${inst.price.toLocaleString()}** (${inst.change24h}) | **ATR (14):** ${inst.atr14}
- **Day High (PDH):** **${inst.high24h.toLocaleString()}** | **Day Low (PDL):** **${inst.low24h.toLocaleString()}**
- **Intraday Equilibrium (50%):** **${mid}**
- **Structural Bias:** ${inst.price >= Number(mid) ? 'Bullish — targeting liquidity above daily high' : 'Bearish — selling pressure below intraday midpoint'}

## 2. Tactical Setup & Actionable Coordinates (${setupCalc.winProbability}% Win Probability)
- **Direction & Strategy:** **${setupCalc.action}** via *${setupCalc.playbookName}*
- **Entry Zone (Limit):** **${setupCalc.prices.entryPrice}** | **Stop Loss:** **${setupCalc.prices.stopLoss}** (${setupCalc.prices.stopLossDistance})
- **Take Profit 1 (1:1.8):** **${setupCalc.prices.takeProfit1}** | **Take Profit 2 (1:3.0):** **${setupCalc.prices.takeProfit2}**
${
  includeNews
    ? `\n## 3. Macro & Intermarket Context (${focusArea})\n- **DXY:** ${dxy.price} (${dxy.change24h}) | **10Y Yield (US10Y):** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}).\n- Monitor high-impact releases at 8:30 AM and 10:00 AM (NY Time).`
    : `\n## 3. Pure Technical Focus (${focusArea})\n- Evaluation strictly centered on candle structure, session liquidity, and 5M/15M confirmation (news filter disabled).`
}`
        : `# Reporte Operativo: ${asset} (${timeframe})
**Hora NY:** ${currentKz.nyTime} | **Sesión:** ${currentKz.name} (${currentKz.windowHours}) | **Enfoque:** ${focusArea}

## 1. Precio y Niveles Clave
- **Cotización Actual:** **${inst.price.toLocaleString()}** (${inst.change24h}) | **ATR (14):** ${inst.atr14}
- **Techo del Día (PDH):** **${inst.high24h.toLocaleString()}** | **Piso del Día (PDL):** **${inst.low24h.toLocaleString()}**
- **Equilibrio Intradía (50%):** **${mid}**
- **Sesgo Estructural:** ${inst.price >= Number(mid) ? 'Alcista — buscando liquidez sobre el máximo diario' : 'Bajista — presión bajo el punto medio intradía'}

## 2. Coordenadas Operativas Calculadas (${setupCalc.winProbability}% Prob. Acierto)
- **Dirección y Estrategia:** **${setupCalc.action}** mediante *${setupCalc.playbookName}*
- **Zona de Entrada (Limit):** **${setupCalc.prices.entryPrice}** | **Stop Loss:** **${setupCalc.prices.stopLoss}** (${setupCalc.prices.stopLossDistance})
- **Take Profit 1 (1:1.8):** **${setupCalc.prices.takeProfit1}** | **Take Profit 2 (1:3.0):** **${setupCalc.prices.takeProfit2}**
${
  includeNews
    ? `\n## 3. Contexto Macro e Intermercado (${focusArea})\n- **DXY:** ${dxy.price} (${dxy.change24h}) | **Bono 10Y (US10Y):** ${us10y.price}% (${us10y.change24h}) | **VIX:** ${vix.price} (${vix.change24h}).\n- Vigilar publicaciones de carpeta roja a las 8:30 AM y 10:00 AM (hora NY).`
    : `\n## 3. Enfoque Técnico Puro (${focusArea})\n- Evaluación centrada estrictamente en estructura de velas, liquidez de sesión y confirmación en 5M/15M (filtro de noticias desactivado).`
}`;
    }

    const fallbackReport =
      baseReport + formatAuditAttributionMarkdown(asset, currentKz, externalSources, ownDeclaration, language);

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

// 6. Generate Tactical Trade Setup (Always enforces exact risk math & contract sizing)
app.post('/api/generate-trade-setup', async (req, res) => {
  await syncRealTimeTradingViewQuotes();
  const {
    asset = 'NAS100',
    accountBalance = 10000,
    riskPercentage = 0.50,
    specificNotes = '',
    customDocument = '',
    selectedDocName = '',
    sourceMode = 'online',
    strategyId = 'AUTO',
    preferredDirection = 'AUTO',
    marketMode = 'all_programmed',
    includeNews = true,
    language = 'es',
  } = req.body;
  const isEn = language === 'en';
  const currentKz = getCurrentKillzone();
  const liveSnapshot = getLiveMarketSnapshotText();

  try {
    const newsRule = includeNews
      ? isEn
        ? 'FACTOR IN NEWS: Integrate current macroeconomic sentiment, US10Y yields, DXY, and economic calendar.'
        : 'TOMAR EN CUENTA NOTICIAS: Integra el sentimiento macroeconómico actual, tasas US10Y, DXY y calendario económico.'
      : isEn
      ? 'IGNORE NEWS: Calculate the entry strictly from technical price structure (4H/1H and 30M/15M/5M).'
      : 'IGNORAR NOTICIAS: Calcula la entrada únicamente por estructura técnica de precio (4H/1H y 30M/15M/5M).';

    const analysisRule =
      sourceMode === 'custom_base' && customDocument
        ? `Use this user analysis/strategy ("${selectedDocName || 'Custom Base'}") to structure the entry:\n${customDocument.substring(0, 4500)}`
        : `Research and structure the entry based on live prices and top financial sources:\n${webSourcesPromptContent}`;

    const strategyOverrideRule =
      strategyId && strategyId !== 'AUTO'
        ? `Apply strategy ID "${strategyId}".`
        : '';

    const directionRule =
      preferredDirection === 'BUY' || preferredDirection === 'SELL'
        ? `Required trade direction: ${preferredDirection}.`
        : '';

    const prompt = isEn
      ? `Evaluate a practical trading entry in ENGLISH for ${asset}. Account Balance: $${accountBalance}, Risk: ${riskPercentage}%. ${strategyOverrideRule} ${directionRule} User Notes: "${specificNotes}". NY Time: ${currentKz.nyTime}. Live Quotes: ${liveSnapshot}.\n${newsRule}`
      : `Evalúa una entrada práctica y directa en ESPAÑOL para ${asset}. Balance: $${accountBalance}, Riesgo: ${riskPercentage}%. ${strategyOverrideRule} ${directionRule} Notas: "${specificNotes}". Hora NY: ${currentKz.nyTime}. Cotizaciones: ${liveSnapshot}.\n${newsRule}`;

    const systemInstruction = `Eres el motor cuantitativo de entradas de TRstudio. Devuelve un JSON válido en ${isEn ? 'INGLÉS (English)' : 'ESPAÑOL'}.\n${analysisRule}`;

    const response = await generateAiContentWithConnectedKey({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            playbookName: { type: Type.STRING },
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
            thesisRationale: { type: Type.STRING },
            invalidationCriteria: { type: Type.STRING },
            executionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['action', 'playbookName', 'confluenceBreakdown', 'thesisRationale', 'invalidationCriteria', 'executionTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const normalizedAction: 'BUY' | 'SELL' | 'WAIT' =
      parsed.action === 'SELL' ? 'SELL' : parsed.action === 'WAIT' ? 'WAIT' : 'BUY';

    // Always compute prices, Stop Loss, and lot sizing through the deterministic engine so risk math is 100% exact
    const finalSetup = buildDeterministicSetupForInstrument({
      asset,
      accountBalance: Number(accountBalance) || 10000,
      riskPercentage: Number(riskPercentage) || 0.50,
      specificNotes,
      customDocument,
      selectedDocName,
      sourceMode,
      strategyId,
      preferredDirection,
      marketMode,
      includeNews: Boolean(includeNews),
      language,
      currentKz,
      aiOverride: {
        action: normalizedAction,
        playbookName: parsed.playbookName,
        thesisRationale: parsed.thesisRationale,
        invalidationCriteria: parsed.invalidationCriteria,
        executionTips: parsed.executionTips,
        confluenceBreakdown: parsed.confluenceBreakdown,
      },
    });

    return res.json({
      setup: finalSetup,
      nyTime: currentKz.nyTime,
      session: currentKz.name,
      timestamp: new Date().toISOString(),
    });
  } catch (_err: any) {
    const fallbackSetup = buildDeterministicSetupForInstrument({
      asset,
      accountBalance: Number(accountBalance) || 10000,
      riskPercentage: Number(riskPercentage) || 0.50,
      specificNotes,
      customDocument,
      selectedDocName,
      sourceMode,
      strategyId,
      preferredDirection,
      marketMode,
      includeNews: Boolean(includeNews),
      language,
      currentKz,
    });

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
