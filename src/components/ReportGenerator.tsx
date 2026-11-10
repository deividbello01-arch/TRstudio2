import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  Clock, 
  Newspaper
} from 'lucide-react';
import { TradingReport, KillzoneSession, AppLanguage, InstrumentMarketMode } from '../types/trading';
import { getEnabledTradeableInstruments, FUTURES_CONTRACT_MAP } from '../lib/instruments';

interface ReportGeneratorProps {
  initialAsset?: string;
  session: KillzoneSession | null;
  activeDocName: string;
  customDocContent?: string;
  useOnlineOnly?: boolean;
  onOpenKnowledgeTab?: () => void;
  language?: AppLanguage;
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  initialAsset = 'NAS100',
  customDocContent,
  language = 'es',
  marketMode = 'all_programmed',
  enabledSymbols,
}) => {
  const isEn = language === 'en';
  const visibleInstruments = getEnabledTradeableInstruments(enabledSymbols, marketMode);
  const [selectedAsset, setSelectedAsset] = useState<string>(initialAsset);
  const [timeframe, setTimeframe] = useState<string>('Intradía (4H / 1H / 30M / 15M)');
  const [focusArea, setFocusArea] = useState<string>('Niveles Operativos & Sesión');
  const [includeNews, setIncludeNews] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<TradingReport | null>(null);
  const [savedReports, setSavedReports] = useState<TradingReport[]>(() => {
    try {
      const saved = localStorage.getItem('trstudio_saved_reports_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (
      initialAsset &&
      (initialAsset === 'TODOS' || visibleInstruments.some((i) => i.symbol === initialAsset))
    ) {
      setSelectedAsset(initialAsset);
    } else if (
      selectedAsset !== 'TODOS' &&
      !visibleInstruments.some((i) => i.symbol === selectedAsset) &&
      visibleInstruments.length > 0
    ) {
      setSelectedAsset(visibleInstruments[0].symbol);
    }
  }, [initialAsset, enabledSymbols, selectedAsset, visibleInstruments]);

  const assets = [
    ...visibleInstruments.map((i) => {
      const fut = FUTURES_CONTRACT_MAP[i.symbol];
      return {
        value: i.symbol,
        label:
          marketMode === 'futures_only' && fut
            ? `${i.symbol} (${fut.futuresTicker})`
            : i.symbol,
      };
    }),
    { value: 'TODOS', label: isEn ? 'ALL' : 'TODOS' },
  ];

  const timeframes = [
    {
      value: 'Intradía (4H / 1H / 30M / 15M)',
      label: isEn ? 'Intraday (4H / 1H / 30M / 15M)' : 'Intradía (4H / 1H / 30M / 15M)',
    },
    {
      value: 'Scalping (30M / 15M / 5M)',
      label: 'Scalping (30M / 15M / 5M)',
    },
    {
      value: 'Swing (Diario / 4H)',
      label: isEn ? 'Swing (Daily / 4H)' : 'Swing (Diario / 4H)',
    },
  ];

  const focusOptions = [
    {
      value: 'Niveles Operativos & Sesión',
      label: isEn ? 'Key Trading Levels & Session' : 'Niveles Operativos & Sesión',
    },
    {
      value: 'Impacto de Tasas (US10Y) & Noticias',
      label: isEn ? 'Yields Impact (US10Y) & News' : 'Impacto de Tasas (US10Y) & Noticias',
    },
    {
      value: 'Liquidez (PDH/PDL) & FVG',
      label: isEn ? 'Liquidity (PDH/PDL) & FVG' : 'Liquidez (PDH/PDL) & FVG',
    },
    {
      value: 'Correlaciones DXY / Índices / Oro',
      label: isEn ? 'Correlations DXY / Indices / Gold' : 'Correlaciones DXY / Índices / Oro',
    },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: selectedAsset,
          timeframe,
          focusArea,
          customDocument: customDocContent,
          includeNews,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || (isEn ? 'Failed to generate report' : 'Fallo al generar reporte')
        );
      }

      const data = await res.json();
      const newReport: TradingReport = {
        id: Date.now().toString(),
        asset: data.asset,
        timeframe: data.timeframe,
        report: data.report,
        sources: data.sources || [],
        generatedAt: data.generatedAt,
        nyTime: data.nyTime,
        session: data.session,
      };

      setCurrentReport(newReport);
      const updated = [newReport, ...savedReports.slice(0, 8)];
      setSavedReports(updated);
      try {
        localStorage.setItem('trstudio_saved_reports_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save reports to localStorage', e);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          (isEn ? 'Error connecting to server.' : 'Error al conectar con el servidor.')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentReport) return;
    navigator.clipboard.writeText(currentReport.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!currentReport) return;
    const blob = new Blob([currentReport.report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${isEn ? 'Report' : 'Reporte'}_${currentReport.asset}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderFormattedMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');

    return (
      <div className="space-y-2.5 font-sans text-amber-100/90 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg sm:text-xl font-black font-mono text-amber-400 pb-2 border-b border-[#3b271a] mt-3 first:mt-0">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm sm:text-base font-bold font-mono text-white pt-3 pb-1 border-b border-[#3b271a]/60 mt-3 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs sm:text-sm font-bold text-amber-300 font-mono mt-2.5">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-amber-400 font-mono font-bold">•</span>
                <span className="text-amber-100/90">
                  {trimmed.replace(/^[-*]\s+/, '')}
                </span>
              </div>
            );
          }
          if (trimmed === '---') {
            return <hr key={idx} className="border-[#3b271a] my-3" />;
          }
          if (trimmed === '') {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="text-amber-100/80">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Config Card */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEn ? 'Market Trading Reports' : 'Reportes Operativos de Mercado'}
              </h2>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Direct synthesis of key levels, structure, and consulted sources.'
                  : 'Síntesis directa de niveles clave, estructura y fuentes consultadas.'}
              </p>
            </div>
          </div>

          {/* News Toggle */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#120c08] border border-[#3b271a]">
            <Newspaper className={`w-4 h-4 ${includeNews ? 'text-amber-400' : 'text-amber-200/40'}`} />
            <div className="text-xs">
              <span className="font-mono font-bold text-white block">
                {isEn ? 'Include Macro News' : 'Incluir Noticias Macro'}
              </span>
              <span className="text-[10px] text-amber-200/60">
                {includeNews
                  ? isEn
                    ? 'Enabled'
                    : 'Activado'
                  : isEn
                  ? 'Disabled (Technical Only)'
                  : 'Desactivado (Solo Técnico)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIncludeNews(!includeNews)}
              className={`relative w-12 h-6 rounded-full transition-colors p-0.5 ${
                includeNews ? 'bg-emerald-600' : 'bg-[#2d1c12]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  includeNews ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#3b271a]">
          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1 font-mono uppercase">
              {isEn ? 'Asset' : 'Activo'}
            </label>
            <div className="flex flex-wrap gap-1">
              {assets.map((ast) => (
                <button
                  key={ast.value}
                  onClick={() => setSelectedAsset(ast.value)}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold transition border ${
                    selectedAsset === ast.value
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-700'
                  }`}
                >
                  {ast.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1 font-mono uppercase">
              {isEn ? 'Timeframes' : 'Temporalidades'}
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1 font-mono uppercase">
              {isEn ? 'Focus' : 'Enfoque'}
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full bg-[#120c08] border border-[#3b271a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            >
              {focusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {isGenerating
                  ? isEn
                    ? 'Generating...'
                    : 'Generando...'
                  : isEn
                  ? 'Generate Report'
                  : 'Generar Reporte'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Report Display Card */}
      {currentReport ? (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#3b271a] bg-[#120c08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono text-xs font-bold">
                {currentReport.asset}
              </span>
              <div className="text-xs text-amber-200/70 font-mono">
                <span>
                  {isEn ? 'NY Time:' : 'Hora NY:'}{' '}
                  <strong className="text-white">{currentReport.nyTime}</strong>
                </span>
                <span className="mx-2 text-[#4d3221]">|</span>
                <span>
                  {isEn ? 'Session:' : 'Sesión:'}{' '}
                  <strong className="text-amber-300">{currentReport.session}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isEn ? 'Copied' : 'Copiado') : isEn ? 'Copy' : 'Copiar'}</span>
              </button>

              <button
                onClick={downloadMarkdown}
                className="px-3 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'Download' : 'Descargar'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isEn ? 'Print' : 'Imprimir'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-[#140e09]">
            {renderFormattedMarkdown(currentReport.report)}

            {currentReport.sources && currentReport.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#3b271a]">
                <div className="text-xs font-mono text-amber-300 mb-2 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isEn ? 'Direct Reference Links:' : 'Enlaces Directos de Referencia:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentReport.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded bg-[#120c08] hover:bg-[#24170f] text-amber-300 border border-[#3b271a] flex items-center gap-1 transition"
                    >
                      <span className="truncate max-w-xs">{src.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed border-[#3b271a] rounded-xl bg-[#18110b]/50">
          <FileText className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">
            {isEn ? 'No active report' : 'Sin reporte activo'}
          </h3>
          <p className="text-xs text-amber-200/60 max-w-md mx-auto mt-1 mb-4">
            {isEn
              ? 'Select the asset and click "Generate Report" to get direct levels and context.'
              : 'Selecciona el activo y pulsa "Generar Reporte" para obtener niveles y contexto directo.'}
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEn ? 'Generate Report' : 'Generar Reporte'}</span>
          </button>
        </div>
      )}

      {savedReports.length > 0 && (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300/80 font-mono mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isEn ? 'Recent Reports' : 'Reportes Recientes'} ({savedReports.length})
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {savedReports.map((rpt) => (
              <div
                key={rpt.id}
                onClick={() => setCurrentReport(rpt)}
                className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                  currentReport?.id === rpt.id
                    ? 'bg-[#2b1c13] border-amber-500 text-white'
                    : 'bg-[#120c08] border-[#3b271a] text-amber-200/70 hover:border-amber-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-amber-400">{rpt.asset}</span>
                  <span className="text-[10px] text-amber-200/50">{rpt.nyTime}</span>
                </div>
                <div className="text-[11px] truncate text-white">{rpt.timeframe}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
