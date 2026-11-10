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
} from 'lucide-react';
import { AppSettings, AppTheme, DEFAULT_APP_SETTINGS } from '../types/trading';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
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
                  ? 'Customize colors, language, minimalist mode, and visible sections.'
                  : 'Cambia colores, idioma, modo minimalista y activa o desactiva cualquier sección.'}
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
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
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

          {/* 2. App Color Theme */}
          <div className="space-y-2.5">
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
                desc={isEn ? 'NAS100, US30, XAUUSD, EURUSD cards' : 'Cotizaciones de NAS100, US30, XAUUSD y EURUSD'}
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
