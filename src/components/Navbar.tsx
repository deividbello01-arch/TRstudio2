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
} from 'lucide-react';
import { KillzoneSession, AppSettings } from '../types/trading';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: KillzoneSession | null;
  activeDocsCount: number;
  totalDocsCount: number;
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  session,
  activeDocsCount,
  totalDocsCount,
  settings,
  onOpenSettings,
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

      if (secOfDay >= 2 * 3600 && secOfDay < 8 * 3600) {
        nextName = isEn
          ? `NY Pre-Market (${is12h ? '8:00 AM' : '08:00'})`
          : `Pre-Mercado NY (${is12h ? '8:00 AM' : '08:00'})`;
        remainingSec = 8 * 3600 - secOfDay;
      } else if (secOfDay >= 8 * 3600 && secOfDay < 9.5 * 3600) {
        nextName = isEn
          ? `New York (${is12h ? '9:30 AM' : '09:30'})`
          : `Sesión Nueva York (${is12h ? '9:30 AM' : '09:30'})`;
        remainingSec = 9.5 * 3600 - secOfDay;
      } else if (secOfDay >= 9.5 * 3600 && secOfDay < 16 * 3600) {
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

          {/* Mobile Settings Button (visible on < lg) */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={isEn ? 'Settings & Customization' : 'Configuración y Personalización'}
            className="lg:hidden px-2.5 py-1.5 rounded-lg bg-[#24170f] hover:bg-[#332116] text-amber-300 hover:text-white border border-[#4d3221] hover:border-amber-500 transition flex items-center gap-1.5 text-xs font-mono shrink-0"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Settings' : 'Ajustes'}</span>
          </button>
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

          {/* Desktop Settings Gear Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={isEn ? 'Settings & Customization' : 'Configuración y Personalización'}
            className="hidden lg:flex p-2 rounded-lg bg-[#24170f] hover:bg-[#332116] text-amber-300 hover:text-white border border-[#4d3221] hover:border-amber-500 transition items-center gap-1.5 text-xs font-mono shrink-0"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Settings' : 'Ajustes'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
