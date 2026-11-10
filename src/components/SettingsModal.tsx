import React from 'react';
import {
  X,
  Settings,
  Palette,
  Globe,
  Eye,
  LayoutGrid,
  Sliders,
  RotateCcw,
  Sparkles,
  Clock,
  DollarSign,
  Check,
} from 'lucide-react';
import {
  AppSettings,
  AppTheme,
  InstrumentMarketMode,
  ALL_PROGRAMMED_TRADEABLE_SYMBOLS,
  ONLY_INDEX_SYMBOLS,
} from '../types/trading';
import { TRADEABLE_INSTRUMENTS, FUTURES_CONTRACT_MAP } from '../lib/instruments';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const isEn = settings.language === 'en';
  const currentMarketMode: InstrumentMarketMode =
    settings.instrumentMarketMode || 'all_programmed';
  const currentEnabledSymbols: string[] =
    Array.isArray(settings.enabledSymbols) && settings.enabledSymbols.length > 0
      ? settings.enabledSymbols
      : ALL_PROGRAMMED_TRADEABLE_SYMBOLS;

  const handleToggleSymbol = (symbol: string) => {
    const exists = currentEnabledSymbols.includes(symbol);
    if (exists) {
      // Keep at least 1 symbol active so the terminal is never empty
      if (currentEnabledSymbols.length <= 1) return;
      onUpdateSettings({
        enabledSymbols: currentEnabledSymbols.filter((s) => s !== symbol),
      });
    } else {
      // Preserve canonical order from ALL_PROGRAMMED_TRADEABLE_SYMBOLS
      const nextSet = new Set([...currentEnabledSymbols, symbol]);
      const ordered = ALL_PROGRAMMED_TRADEABLE_SYMBOLS.filter((s) => nextSet.has(s));
      onUpdateSettings({ enabledSymbols: ordered });
    }
  };

  const themes: Array<{ id: AppTheme; nameEs: string; nameEn: string; previewClass: string }> = [
    {
      id: 'coffee',
      nameEs: 'Naranja / Café Espresso (Predeterminado)',
      nameEn: 'Orange / Coffee Espresso (Default)',
      previewClass: 'bg-[#f59e0b] border-amber-300',
    },
    {
      id: 'mint',
      nameEs: 'Verde Salvia (#DAF1DE)',
      nameEn: 'Mint Sage (#DAF1DE)',
      previewClass: 'bg-[#DAF1DE] border-emerald-200',
    },
    {
      id: 'crimson',
      nameEs: 'Rojo Claro & Negro Marmoleado',
      nameEn: 'Light Red & Black Marble',
      previewClass: 'bg-[#ff6b6b] border-rose-300',
    },
    {
      id: 'midnight',
      nameEs: 'Azul Institucional',
      nameEn: 'Institutional Midnight',
      previewClass: 'bg-sky-500 border-sky-300',
    },
    {
      id: 'emerald',
      nameEs: 'Esmeralda Quant',
      nameEn: 'Emerald Quant',
      previewClass: 'bg-emerald-500 border-emerald-300',
    },
    {
      id: 'obsidian',
      nameEs: 'Negro Obsidiana Minimal',
      nameEn: 'Obsidian Minimal',
      previewClass: 'bg-zinc-300 border-white',
    },
  ];

  const handleToggleMinimalist = () => {
    const nextMinimal = !settings.minimalistMode;
    if (nextMinimal) {
      onUpdateSettings({
        minimalistMode: true,
        compactCards: true,
        showTopStatusBar: false,
        showMacroBar: false,
        showFooter: false,
      });
    } else {
      onUpdateSettings({
        minimalistMode: false,
        compactCards: false,
        showTopStatusBar: true,
        showSessionBanner: true,
        showTickerGrid: true,
        showMacroBar: true,
        showChartSection: true,
        showFooter: true,
      });
    }
  };

  const ToggleRow = ({
    label,
    desc,
    checked,
    onChange,
  }: {
    label: string;
    desc: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
      <div>
        <div className="text-xs font-bold text-white font-mono">{label}</div>
        <div className="text-[11px] text-amber-200/60">{desc}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
          checked ? 'bg-emerald-600' : 'bg-[#2d1c12]'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#18110b] border border-[#3b271a] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#3b271a] flex items-center justify-between bg-[#120d09]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                {isEn ? 'TRstudio Settings & Customization' : 'Configuración y Personalización de TRstudio'}
              </h2>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Customize colors, CFD/Futures mode, visible indices, language, and layout.'
                  : 'Configura modo CFD/Futuros, elige qué índices salen, colores, idioma y diseño.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#24170f] hover:bg-[#332116] text-amber-200 border border-[#4d3221] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 text-xs">
          {/* 1. Quick Minimalist Mode Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-[#120c08] border border-amber-600/50 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white font-mono">
                  {isEn ? 'Ultra Minimalist Mode (1-Click)' : 'Modo Minimalista Rápido (1 Clic)'}
                </div>
                <p className="text-[11px] text-amber-200/70 mt-0.5">
                  {isEn
                    ? 'Hides secondary bars, macro tickers, and footer for a distraction-free workspace.'
                    : 'Oculta barras secundarias, tickers macro y pie de página para dejar la web más limpia y directa.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleMinimalist}
              className={`relative w-12 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                settings.minimalistMode ? 'bg-amber-500' : 'bg-[#2d1c12]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.minimalistMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. NEW SECTION: Market Mode (Solo CFD / Todos los Índices Programados / Solo Futuros) + Custom Index Picker */}
          <div className="pt-2 border-t border-[#3b271a] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>
                  {isEn
                    ? 'Market Mode (CFD Only / All Programmed Indices / Futures Only)'
                    : 'Modo de Instrumentos (Solo CFD / Todos los Índices / Solo Futuros)'}
                </span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/60 font-bold">
                {currentEnabledSymbols.length} / {ALL_PROGRAMMED_TRADEABLE_SYMBOLS.length}{' '}
                {isEn ? 'active' : 'activos visibles'}
              </span>
            </div>

            {/* 3 Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'cfd_only' as InstrumentMarketMode,
                  titleEs: 'Solo CFD',
                  titleEn: 'CFD Only',
                  descEs: 'Especificaciones y gráficos CFD ($1/pto en índices, lotes MT4/MT5/cTrader).',
                  descEn: 'CFD specs & broker feeds ($1/pt index CFDs, standard MT4/MT5 lots).',
                  badge: 'CFD',
                },
                {
                  id: 'all_programmed' as InstrumentMarketMode,
                  titleEs: 'Todos los Índices Programados',
                  titleEn: 'All Programmed Indices',
                  descEs: 'Catálogo completo programado. Elige abajo exactamente cuáles quieres que salgan.',
                  descEn: 'Full programmed catalog. Choose below exactly which indices appear.',
                  badge: 'CUSTOM / ALL',
                },
                {
                  id: 'futures_only' as InstrumentMarketMode,
                  titleEs: 'Solo Futuros',
                  titleEn: 'Futures Only',
                  descEs: 'Contratos de Futuros CME / Eurex / COMEX (NQ, ES, YM, RTY, FDAX, GC, 6E).',
                  descEn: 'CME / Eurex / COMEX Futures contracts (NQ, ES, YM, RTY, FDAX, GC, 6E).',
                  badge: 'FUTUROS',
                },
              ].map((m) => {
                const isSelected = currentMarketMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onUpdateSettings({ instrumentMarketMode: m.id })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#2b1c13] border-amber-400 text-white ring-1 ring-amber-400/50 shadow-md'
                        : 'bg-[#120c08] border-[#3b271a] text-amber-200/70 hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-mono font-bold text-xs text-white">
                        {isEn ? m.titleEn : m.titleEs}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-300'
                            : 'bg-[#18110b] text-amber-300/70 border-[#3b271a]'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/60 leading-snug">
                      {isEn ? m.descEn : m.descEs}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Individual Index & Asset Picker */}
            <div className="p-3.5 rounded-xl bg-[#120c08] border border-[#3b271a] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white font-mono">
                    {isEn
                      ? 'Choose which Programmed Indices & Assets appear across TRstudio:'
                      : 'Elige cuáles Índices y Activos Programados quieres que salgan:'}
                  </div>
                  <div className="text-[11px] text-amber-200/60">
                    {isEn
                      ? 'Click any instrument below to enable or hide it in Terminal, Scanner, Chart, and Calculator.'
                      : 'Marca o desmarca los índices que deseas ver en la Terminal, Escáner, Gráfico y Calculadora.'}
                  </div>
                </div>

                {/* Quick Filter Presets */}
                <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ enabledSymbols: ALL_PROGRAMMED_TRADEABLE_SYMBOLS })
                    }
                    className="px-2 py-1 rounded bg-[#24170f] hover:bg-amber-600 text-amber-200 hover:text-white border border-[#4d3221] transition font-bold"
                  >
                    {isEn ? 'All (12)' : 'Todos (12)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ enabledSymbols: ONLY_INDEX_SYMBOLS })}
                    className="px-2 py-1 rounded bg-[#24170f] hover:bg-amber-600 text-amber-200 hover:text-white border border-[#4d3221] transition font-bold"
                  >
                    {isEn ? 'Only 10 Indices' : 'Solo 10 Índices'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        enabledSymbols: ['NAS100', 'US500', 'US30', 'US2000'],
                      })
                    }
                    className="px-2 py-1 rounded bg-[#24170f] hover:bg-amber-600 text-amber-200 hover:text-white border border-[#4d3221] transition"
                  >
                    {isEn ? 'US Indices (4)' : 'EE. UU. (4)'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        enabledSymbols: ['GER40', 'UK100', 'EU50', 'FRA40', 'JP225', 'HK50'],
                      })
                    }
                    className="px-2 py-1 rounded bg-[#24170f] hover:bg-amber-600 text-amber-200 hover:text-white border border-[#4d3221] transition"
                  >
                    {isEn ? 'EU & Asia (6)' : 'Europa/Asia (6)'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        enabledSymbols: ['NAS100', 'US500', 'US30', 'GER40', 'XAUUSD', 'EURUSD'],
                      })
                    }
                    className="px-2 py-1 rounded bg-[#24170f] hover:bg-amber-600 text-amber-200 hover:text-white border border-[#4d3221] transition"
                  >
                    {isEn ? 'Top 6 + Gold' : 'Principales + Oro (6)'}
                  </button>
                </div>
              </div>

              {/* 12 Checkable Instrument Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {TRADEABLE_INSTRUMENTS.map((inst) => {
                  const isChecked = currentEnabledSymbols.includes(inst.symbol);
                  const futInfo = FUTURES_CONTRACT_MAP[inst.symbol];
                  const modeSubLabel =
                    currentMarketMode === 'futures_only' && futInfo
                      ? `${futInfo.futuresTicker} (${futInfo.exchange})`
                      : currentMarketMode === 'cfd_only'
                      ? `CFD • ${inst.quoteCcy}`
                      : futInfo
                      ? `CFD / ${futInfo.futuresTicker}`
                      : inst.region;

                  return (
                    <button
                      key={inst.symbol}
                      type="button"
                      onClick={() => handleToggleSymbol(inst.symbol)}
                      className={`p-2 rounded-xl border text-left transition flex items-center justify-between gap-2 font-mono ${
                        isChecked
                          ? 'bg-emerald-950/50 border-emerald-500/70 text-white'
                          : 'bg-[#18110b]/60 border-[#3b271a] text-amber-200/40 hover:border-[#573926]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{inst.symbol}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-300/90 truncate">
                            {modeSubLabel}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-200/60 truncate">
                          {isEn ? inst.nameEn : inst.nameEs}
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                            : 'bg-[#120c08] border-[#3b271a]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. App Color Theme */}
          <div className="pt-2 border-t border-[#3b271a] space-y-2.5">
            <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'App Theme & Color' : 'Color y Tema de la App'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {themes.map((t) => {
                const active = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 font-mono ${
                      active
                        ? 'bg-[#2b1c13] border-amber-400 text-white font-bold ring-1 ring-amber-400/40'
                        : 'bg-[#120c08] border-[#3b271a] text-amber-200/70 hover:border-amber-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${t.previewClass}`} />
                    <span className="truncate">{isEn ? t.nameEn : t.nameEs}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Language & Clock Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#3b271a]">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Language / Idioma' : 'Idioma de la Interfaz'}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ language: 'es' })}
                  className={`py-2 px-3 rounded-xl border font-mono font-bold transition ${
                    settings.language === 'es'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                  }`}
                >
                  Español (ES)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ language: 'en' })}
                  className={`py-2 px-3 rounded-xl border font-mono font-bold transition ${
                    settings.language === 'en'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Time Format' : 'Formato de Hora'}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ timeFormat: '12h' })}
                  className={`py-2 px-3 rounded-xl border font-mono font-bold transition ${
                    settings.timeFormat === '12h'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                  }`}
                >
                  12 Horas (6:00 PM)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ timeFormat: '24h' })}
                  className={`py-2 px-3 rounded-xl border font-mono font-bold transition ${
                    settings.timeFormat === '24h'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a]'
                  }`}
                >
                  24 Horas (18:00)
                </button>
              </div>
            </div>
          </div>

          {/* 4. Default Account Balance & Risk */}
          <div className="pt-2 border-t border-[#3b271a] space-y-2.5">
            <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>
                {isEn
                  ? 'Default Account Balance & Risk'
                  : 'Balance y Riesgo Predeterminados al Pedir Entrada'}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#120c08] border border-[#3b271a]">
              <div>
                <label className="block text-[11px] font-mono text-amber-200/70 mb-1">
                  {isEn ? 'Default Balance (USD)' : 'Balance Predeterminado (USD)'}
                </label>
                <input
                  type="number"
                  value={settings.defaultBalance || ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    onUpdateSettings({ defaultBalance: isNaN(v) ? 0 : v });
                  }}
                  className="w-full bg-[#18110b] border border-[#3b271a] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[5000, 6000, 10000, 25000, 50000, 100000].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => onUpdateSettings({ defaultBalance: b })}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                        settings.defaultBalance === b
                          ? 'bg-amber-600 text-white border-amber-400 font-bold'
                          : 'bg-[#18110b] text-amber-200/60 border-[#3b271a]'
                      }`}
                    >
                      ${b / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-amber-200/70 mb-1">
                  {isEn ? 'Default Risk per Trade (%)' : 'Riesgo Predeterminado (%)'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[0.25, 0.50, 1.00].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateSettings({ defaultRisk: r })}
                      className={`py-2 rounded-lg font-mono text-xs font-bold border ${
                        settings.defaultRisk === r
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-[#18110b] text-amber-200/60 border-[#3b271a]'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Section Visibility Toggles */}
          <div className="pt-2 border-t border-[#3b271a] space-y-2.5">
            <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>
                {isEn
                  ? 'Show or Hide Terminal Sections'
                  : 'Mostrar u Ocultar Secciones de la Terminal'}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ToggleRow
                label={isEn ? 'Top Status Bar' : 'Barra Superior de Horario'}
                desc={isEn ? 'NY Clock & next section timer in top bar' : 'Reloj NY y contador en el encabezado'}
                checked={settings.showTopStatusBar}
                onChange={() => onUpdateSettings({ showTopStatusBar: !settings.showTopStatusBar })}
              />
              <ToggleRow
                label={isEn ? 'Session & Timer Banner' : 'Banner de Sección de Horario'}
                desc={isEn ? 'Asian, London, NY session countdown box' : 'Cuadro con tiempo restante y siguiente sección'}
                checked={settings.showSessionBanner}
                onChange={() => onUpdateSettings({ showSessionBanner: !settings.showSessionBanner })}
              />
              <ToggleRow
                label={isEn ? 'Live Asset Cards' : 'Tarjetas de Precios en Vivo'}
                desc={
                  isEn
                    ? '12 primary CFD indices, Gold (XAUUSD) & Forex cards'
                    : 'Cotizaciones de 12 índices CFD primarios, Oro y Forex'
                }
                checked={settings.showTickerGrid}
                onChange={() => onUpdateSettings({ showTickerGrid: !settings.showTickerGrid })}
              />
              <ToggleRow
                label={isEn ? 'Macro Bar (DXY, US10Y, VIX)' : 'Barra Macro (DXY, US10Y, VIX)'}
                desc={isEn ? 'Secondary intermarket indicators' : 'Indicadores de correlación intermercado'}
                checked={settings.showMacroBar}
                onChange={() => onUpdateSettings({ showMacroBar: !settings.showMacroBar })}
              />
              <ToggleRow
                label={isEn ? 'Interactive Chart' : 'Gráfico en Tiempo Real'}
                desc={isEn ? 'TradingView & POI levels chart' : 'Gráfico TradingView y niveles POI'}
                checked={settings.showChartSection}
                onChange={() => onUpdateSettings({ showChartSection: !settings.showChartSection })}
              />
              <ToggleRow
                label={isEn ? 'Real-Time Price Auto-Tick' : 'Movimiento Auto-Tick en Vivo'}
                desc={isEn ? 'Sub-second price tick updates' : 'Actualización fluida de precios segundo a segundo'}
                checked={settings.autoTick}
                onChange={() => onUpdateSettings({ autoTick: !settings.autoTick })}
              />
            </div>
          </div>

          {/* 6. Navigation Tabs & Layout */}
          <div className="pt-2 border-t border-[#3b271a] space-y-2.5">
            <h3 className="text-xs font-bold uppercase font-mono text-amber-300 flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>
                {isEn ? 'Navigation Menu Tabs & Layout' : 'Pestañas Visibles en el Menú y Diseño'}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ToggleRow
                label={isEn ? 'Best Setup Scanner Tab' : 'Pestaña Escáner de Mejor Entrada'}
                desc={
                  isEn
                    ? 'Multi-index ranking of highest win-rate setups'
                    : 'Escáner simultáneo de índices con el #1 de mayor acierto'
                }
                checked={settings.showScannerTab ?? true}
                onChange={() => onUpdateSettings({ showScannerTab: !(settings.showScannerTab ?? true) })}
              />
              <ToggleRow
                label={isEn ? 'Strategies & Playbooks Tab' : 'Pestaña de Estrategias y Webs'}
                desc={
                  isEn
                    ? 'Detailed step-by-step strategies & 19 web sources'
                    : 'Academia de estrategias explicadas y directorio de 19 webs'
                }
                checked={settings.showStrategiesTab ?? true}
                onChange={() => onUpdateSettings({ showStrategiesTab: !(settings.showStrategiesTab ?? true) })}
              />
              <ToggleRow
                label={isEn ? 'Gemini News Chat Tab' : 'Pestaña Chat de Noticias (Gemini)'}
                desc={isEn ? 'Show Gemini News Q&A in menu' : 'Mostrar el chat de dudas sobre noticias'}
                checked={settings.showNewsChatTab ?? true}
                onChange={() => onUpdateSettings({ showNewsChatTab: !(settings.showNewsChatTab ?? true) })}
              />
              <ToggleRow
                label={isEn ? 'Reports Tab' : 'Pestaña de Reportes'}
                desc={isEn ? 'Show Reports in navigation bar' : 'Mostrar apartado de Reportes en el menú'}
                checked={settings.showReportsTab}
                onChange={() => onUpdateSettings({ showReportsTab: !settings.showReportsTab })}
              />
              <ToggleRow
                label={isEn ? 'Bases Tab' : 'Pestaña de Bases'}
                desc={isEn ? 'Show Bases in navigation bar' : 'Mostrar apartado de Bases en el menú'}
                checked={settings.showKnowledgeTab}
                onChange={() => onUpdateSettings({ showKnowledgeTab: !settings.showKnowledgeTab })}
              />
              <ToggleRow
                label={isEn ? 'Lot Calculator Tab' : 'Pestaña Calculadora de Lotes'}
                desc={isEn ? 'Show Lot Calculator in navigation bar' : 'Mostrar Calculadora de Lotes en el menú'}
                checked={settings.showCalculatorTab}
                onChange={() => onUpdateSettings({ showCalculatorTab: !settings.showCalculatorTab })}
              />
              <ToggleRow
                label={isEn ? 'Compact Layout & Hide Footer' : 'Diseño Compacto sin Pie de Página'}
                desc={isEn ? 'Tighter spacing for smaller screens' : 'Reduce márgenes y oculta el pie de página'}
                checked={settings.compactCards && !settings.showFooter}
                onChange={() =>
                  onUpdateSettings({
                    compactCards: !settings.compactCards,
                    showFooter: settings.compactCards,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#3b271a] bg-[#120d09] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetSettings}
            className="px-3 py-2 rounded-xl bg-[#24170f] hover:bg-rose-950/80 text-amber-200 hover:text-rose-200 border border-[#4d3221] text-xs font-mono flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEn ? 'Reset to Default' : 'Restaurar por Defecto'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs transition shadow"
          >
            {isEn ? 'Done & Apply' : 'Guardar y Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
