import React, { useState, useEffect } from 'react';
import {
  Activity,
  FileText,
  Compass,
  Calculator,
  BookOpen,
  Radio,
  Database,
  Settings,
  Newspaper,
  Radar,
  Award,
  Terminal,
} from 'lucide-react';
import { KillzoneSession, AppSettings, AppTheme, MT5SessionState } from '../types/trading';

const QUICK_THEMES: { id: AppTheme; label: string; bg: string; dot: string }[] = [
  { id: 'cream', label: 'Blanco Crema', bg: '#f6efe2', dot: '#b45309' },
  { id: 'obsidian', label: 'Negro Dorado', bg: '#0c0c0e', dot: '#facc15' },
  { id: 'midnight', label: 'Azul Cyan', bg: '#0b1220', dot: '#38bdf8' },
  { id: 'coffee', label: 'Café Ámbar', bg: '#18110b', dot: '#f59e0b' },
  { id: 'emerald', label: 'Verde Matrix', bg: '#081712', dot: '#34d399' },
  { id: 'mint', label: 'Menta Turquesa', bg: '#08191e', dot: '#2dd4bf' },
  { id: 'crimson', label: 'Burdeos Coral', bg: '#1a0b10', dot: '#fb7185' },
];

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: KillzoneSession | null;
  activeDocsCount: number;
  totalDocsCount: number;
  settings: AppSettings;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  mt5State?: MT5SessionState | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  session,
  activeDocsCount,
  totalDocsCount,
  settings,
  onUpdateSettings,
  onOpenSettings,
  mt5State,
}) => {
  const [nyTime, setNyTime] = useState<string>('');
  const [nextSectionBadge, setNextSectionBadge] = useState<string>('');
  const isEn = settings.language === 'en';
  const is12h = settings.timeFormat === '12h';

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setNyTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: is12h,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      const nyParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(now);

      const getPart = (type: string) => nyParts.find((p) => p.type === type)?.value || '0';
      const h = parseInt(getPart('hour'), 10) % 24;
      const m = parseInt(getPart('minute'), 10);
      const s = parseInt(getPart('second'), 10);
      const secOfDay = h * 3600 + m * 60 + s;

      const formatDur = (totalSec: number) => {
        const safe = Math.max(0, totalSec);
        const hrs = Math.floor(safe / 3600);
        const mins = Math.floor((safe % 3600) / 60);
        const secs = safe % 60;
        return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
      };

      let nextName = isEn
        ? `London (${is12h ? '2:00 AM' : '02:00'})`
        : `Sesión Londres (${is12h ? '2:00 AM' : '02:00'})`;
      let remainingSec = 0;

      if (secOfDay >= 2 * 3600 && secOfDay < 5 * 3600) {
        nextName = isEn
          ? `Pre-NY (${is12h ? '5:00 AM' : '05:00'})`
          : `Continuación Europea (${is12h ? '5:00 AM' : '05:00'})`;
        remainingSec = 5 * 3600 - secOfDay;
      } else if (secOfDay >= 5 * 3600 && secOfDay < 8 * 3600) {
        nextName = isEn
          ? `NY Pre-Market (${is12h ? '8:00 AM' : '08:00'})`
          : `Pre-Mercado NY (${is12h ? '8:00 AM' : '08:00'})`;
        remainingSec = 8 * 3600 - secOfDay;
      } else if (secOfDay >= 8 * 3600 && secOfDay < 9.5 * 3600) {
        nextName = isEn
          ? `Wall St Open (${is12h ? '9:30 AM' : '09:30'})`
          : `Apertura NY (${is12h ? '9:30 AM' : '09:30'})`;
        remainingSec = 9.5 * 3600 - secOfDay;
      } else if (secOfDay >= 9.5 * 3600 && secOfDay < 12 * 3600) {
        nextName = isEn
          ? `NY Lunch (${is12h ? '12:00 PM' : '12:00'})`
          : `Almuerzo NY (${is12h ? '12:00 PM' : '12:00'})`;
        remainingSec = 12 * 3600 - secOfDay;
      } else if (secOfDay >= 12 * 3600 && secOfDay < 13.5 * 3600) {
        nextName = isEn
          ? `NY Afternoon (${is12h ? '1:30 PM' : '13:30'})`
          : `Sesión NY Tarde (${is12h ? '1:30 PM' : '13:30'})`;
        remainingSec = 13.5 * 3600 - secOfDay;
      } else if (secOfDay >= 13.5 * 3600 && secOfDay < 16 * 3600) {
        nextName = isEn
          ? `Post-Market (${is12h ? '4:00 PM' : '16:00'})`
          : `Post-Mercado NY (${is12h ? '4:00 PM' : '16:00'})`;
        remainingSec = 16 * 3600 - secOfDay;
      } else if (secOfDay >= 16 * 3600 && secOfDay < 19 * 3600) {
        nextName = isEn
          ? `Asian Range (${is12h ? '7:00 PM' : '19:00'})`
          : `Rango Asiático (${is12h ? '7:00 PM' : '19:00'})`;
        remainingSec = 19 * 3600 - secOfDay;
      } else {
        nextName = isEn
          ? `London (${is12h ? '2:00 AM' : '02:00'})`
          : `Sesión Londres (${is12h ? '2:00 AM' : '02:00'})`;
        remainingSec = secOfDay >= 19 * 3600 ? 24 * 3600 - secOfDay + 2 * 3600 : 2 * 3600 - secOfDay;
      }

      setNextSectionBadge(
        isEn
          ? `Next: ${nextName} in ${formatDur(remainingSec)}`
          : `Siguiente: ${nextName} en ${formatDur(remainingSec)}`
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [isEn, is12h]);

  const openMt5Count = mt5State?.openPositions?.length || 0;
  const mt5Badge =
    openMt5Count > 0
      ? `${openMt5Count} LIVE`
      : mt5State?.connected
      ? 'ON'
      : undefined;

  const allNavItems = [
    { id: 'terminal', label: isEn ? 'Terminal' : 'Terminal', icon: Activity, visible: true },
    {
      id: 'scanner',
      label: isEn ? 'Best Setups' : 'Mejor Entrada',
      icon: Radar,
      visible: settings.showScannerTab ?? true,
    },
    { id: 'entries', label: isEn ? 'Request Entries' : 'Pedir Entradas', icon: Compass, visible: true },
    {
      id: 'mt5',
      label: isEn ? 'MT5 Live' : 'MT5 En Vivo',
      icon: Terminal,
      badge: mt5Badge,
      visible: settings.showMt5Tab ?? false,
    },
    {
      id: 'strategies',
      label: isEn ? 'Strategies' : 'Estrategias',
      icon: Award,
      visible: settings.showStrategiesTab ?? true,
    },
    {
      id: 'newschat',
      label: 'Gemini',
      icon: Newspaper,
      visible: settings.showNewsChatTab ?? true,
    },
    {
      id: 'reports',
      label: isEn ? 'Reports' : 'Reportes',
      icon: FileText,
      visible: settings.showReportsTab,
    },
    {
      id: 'knowledge',
      label: isEn ? 'Bases' : 'Bases',
      icon: BookOpen,
      badge: `${activeDocsCount}/${totalDocsCount}`,
      visible: settings.showKnowledgeTab,
    },
    {
      id: 'calculator',
      label: isEn ? 'Lot Calculator' : 'Calculadora Lotes',
      icon: Calculator,
      visible: settings.showCalculatorTab,
    },
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  return (
    <header className="w-full max-w-[100vw] overflow-x-hidden border-b border-[#3b271a] bg-[#120d09]/95 backdrop-blur sticky top-0 z-40">
      {/* Top status bar (optional via settings) */}
      {settings.showTopStatusBar && (
        <div className="px-3 sm:px-4 py-1.5 border-b border-[#2d1c12] bg-[#1a120b]/80 flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-mono text-amber-200/80 gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span className="font-bold tracking-wider text-[11px] text-amber-300">TRstudio LIVE</span>
            </div>
            <span className="text-[#4d3221]">|</span>
            <span className="shrink-0">
              {isEn ? 'NY:' : 'Hora NY:'}{' '}
              <strong className="text-white">{nyTime || '--:--:--'}</strong>
            </span>
            <span className="text-[#4d3221] hidden sm:inline">|</span>
            <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border bg-[#24170f] text-amber-300 border-[#4d3221] truncate max-w-[calc(100vw-2rem)] sm:max-w-none">
              {nextSectionBadge}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {session && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border flex items-center gap-1.5 ${
                  session.active
                    ? 'bg-amber-950/70 text-amber-300 border-amber-600/60'
                    : 'bg-[#22160f] text-amber-200/70 border-[#3b271a]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    session.active ? 'bg-amber-400 animate-ping' : 'bg-[#6b4731]'
                  }`}
                />
                <span className="truncate max-w-[180px] sm:max-w-none">{session.name}</span>
              </span>
            )}

            <button
              onClick={() => setActiveTab('knowledge')}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] sm:text-[11px] bg-[#24170f] border-[#4d3221] text-amber-300 hover:border-amber-500 transition shrink-0"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Bases ({activeDocsCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar — Responsive 2-row on mobile, 1-row on desktop */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-2 lg:py-0 lg:h-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
          <div
            onClick={() => setActiveTab('terminal')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow border border-amber-500/40 font-mono font-black text-xs sm:text-sm text-white shrink-0">
              TR
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                TR<span className="text-amber-400">studio</span>
              </span>
            </div>
          </div>

          {/* Mobile MT5 Status & Settings Button (visible on < lg) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            {settings.showMt5Tab && (
              <button
                type="button"
                onClick={() => setActiveTab('mt5')}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0 ${
                  mt5State?.connected
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                    : 'bg-[#24170f] text-amber-300 border-[#4d3221]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    mt5State?.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <Terminal className="w-3.5 h-3.5" />
                <span>MT5</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettings}
              title={isEn ? 'Settings & Customization' : 'Configuración y Personalización'}
              className="px-2.5 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#332116] text-amber-300 hover:text-white border border-[#4d3221] hover:border-amber-500 transition flex items-center gap-1.5 text-xs font-mono shrink-0"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Settings' : 'Ajustes'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-1.5 w-full min-w-0">
          <nav className="flex items-center gap-1.5 w-full lg:w-auto min-w-0 overflow-x-auto touch-pan-x pb-1 lg:pb-0 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2b1c13] text-amber-300 font-bold border border-amber-500/60 shadow-sm'
                      : 'text-amber-200/70 hover:text-white hover:bg-[#20150e] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-amber-400/60'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Quick 7-Theme Dots + MT5 Connection Status Button + Settings Button */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {onUpdateSettings && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#120c08] border border-[#3b271a]"
                title={isEn ? 'Quick 1-Click Color Theme Switcher' : 'Cambiar Tema de Color (1 Clic)'}
              >
                {QUICK_THEMES.map((t) => {
                  const isCurrent = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onUpdateSettings({ theme: t.id })}
                      title={t.label}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform ${
                        isCurrent ? 'scale-125 ring-2 ring-amber-400' : 'opacity-75 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{ backgroundColor: t.bg, border: `1.5px solid ${t.dot}` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: t.dot }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {settings.showMt5Tab && (
              <button
                type="button"
                onClick={() => setActiveTab('mt5')}
                title={
                  mt5State?.connected
                    ? `MT5 Activo: ${mt5State.brokerServer} (#${mt5State.login})`
                    : isEn
                    ? 'Open MT5 Broker Session & Auto-Execution'
                    : 'Abrir Sesión de Broker MT5 y Auto-Ejecución'
                }
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0 ${
                  mt5State?.connected
                    ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border-emerald-500/70'
                    : 'bg-[#24170f] hover:bg-[#332116] text-amber-300 border-[#4d3221] hover:border-amber-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    mt5State?.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <Terminal className="w-3.5 h-3.5" />
                <span>
                  {mt5State?.connected
                    ? `MT5: ${mt5State.brokerPreset}`
                    : isEn
                    ? 'Connect MT5'
                    : 'Conectar MT5'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              title={isEn ? 'Settings & Customization' : 'Configuración y Personalización'}
              className="p-2 rounded-lg bg-[#24170f] hover:bg-[#332116] text-amber-300 hover:text-white border border-[#4d3221] hover:border-amber-500 transition flex items-center gap-1.5 text-xs font-mono shrink-0"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Settings' : 'Ajustes'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
