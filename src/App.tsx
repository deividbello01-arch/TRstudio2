import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketTerminal } from './components/MarketTerminal';
import { TradeSetupEngine } from './components/TradeSetupEngine';
import { ReportGenerator } from './components/ReportGenerator';
import { DocumentManager } from './components/DocumentManager';
import { PropFirmCalculator } from './components/PropFirmCalculator';
import { SettingsModal } from './components/SettingsModal';
import { NewsGeminiChat } from './components/NewsGeminiChat';
import { MultiIndexScanner } from './components/MultiIndexScanner';
import { StrategiesPlaybook } from './components/StrategiesPlaybook';
import { MT5ExecutionHub } from './components/MT5ExecutionHub';
import {
  InstrumentQuote,
  KillzoneSession,
  CustomDocument,
  AppSettings,
  DEFAULT_APP_SETTINGS,
  MT5SessionState,
} from './types/trading';
import { DEFAULT_KNOWLEDGE_DOCUMENTS, StrategyPlaybook } from './lib/strategiesData';
import { getSpec, roundToTick, FxRates, DEFAULT_FX_RATES } from './lib/instruments';
import { Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('terminal');
  const [targetAssetForAction, setTargetAssetForAction] = useState<string>('NAS100');
  const [targetStrategyForAction, setTargetStrategyForAction] = useState<string>('AUTO');
  const [instruments, setInstruments] = useState<InstrumentQuote[]>([]);
  const [session, setSession] = useState<KillzoneSession | null>(null);
  const [fxRates, setFxRates] = useState<FxRates>(DEFAULT_FX_RATES);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [mt5State, setMt5State] = useState<MT5SessionState | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedV4 = localStorage.getItem('trstudio_settings_v4');
      if (savedV4) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(savedV4) };
      }
      const savedV3 = localStorage.getItem('trstudio_settings_v3');
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        return {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          theme: 'cream',
        };
      }
    } catch (e) {
      console.warn('Could not load saved settings:', e);
    }
    return DEFAULT_APP_SETTINGS;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    try {
      localStorage.setItem('trstudio_settings_v4', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not persist settings:', e);
    }
  }, [settings]);

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_APP_SETTINGS);
  };

  // Pre-load the 8 built-in institutional strategy & web databases + preserve any custom user bases
  const [documents, setDocuments] = useState<CustomDocument[]>(() => {
    try {
      const savedV2 = localStorage.getItem('trstudio_knowledge_docs_v2');
      if (savedV2) {
        const parsed: CustomDocument[] = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure all built-in documents from DEFAULT_KNOWLEDGE_DOCUMENTS exist
          const existingIds = new Set(parsed.map((d) => d.id));
          const missingBuiltins = DEFAULT_KNOWLEDGE_DOCUMENTS.filter(
            (b) => !existingIds.has(b.id)
          );
          return [...parsed, ...missingBuiltins];
        }
      }

      // Migrate custom documents from v1 if present
      const savedV1 = localStorage.getItem('trstudio_knowledge_docs_v1');
      if (savedV1) {
        const parsedV1: CustomDocument[] = JSON.parse(savedV1);
        if (Array.isArray(parsedV1)) {
          const customDocs = parsedV1.filter((d) => d.type === 'custom');
          return [...customDocs, ...DEFAULT_KNOWLEDGE_DOCUMENTS];
        }
      }
    } catch (e) {
      console.warn('Could not load saved knowledge docs:', e);
    }
    return DEFAULT_KNOWLEDGE_DOCUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('trstudio_knowledge_docs_v2', JSON.stringify(documents));
    } catch (e) {
      console.warn('Could not persist docs to localStorage:', e);
    }
  }, [documents]);

  useEffect(() => {
    const fetchWebSourcesDoc = async () => {
      try {
        const res = await fetch('/api/treatise');
        if (res.ok) {
          const data = await res.json();
          const webSourcesText = data.webSourcesPromptContent || '';
          if (webSourcesText) {
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === 'doc-builtin-web-sources'
                  ? { ...d, content: webSourcesText, charCount: webSourcesText.length }
                  : d
              )
            );
          }
        }
      } catch (err) {
        console.error('Error fetching web sources doc:', err);
      }
    };

    fetchWebSourcesDoc();
    refreshFeed();
    refreshMt5Status();

    const syncInterval = setInterval(() => {
      refreshFeed();
      refreshMt5Status();
    }, 2500);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    if (!settings.autoTick) return;

    const tickInterval = setInterval(() => {
      setInstruments((prev) =>
        prev.map((inst) => {
          const spec = getSpec(inst.symbol);
          const decimals = spec ? spec.decimals : inst.symbol === 'EURUSD' ? 5 : 2;
          const step =
            inst.symbol === 'EURUSD'
              ? (Math.random() - 0.5) * 0.00012
              : inst.symbol === 'XAUUSD'
              ? (Math.random() - 0.5) * 0.25
              : inst.symbol === 'NAS100' || inst.symbol === 'US30' || inst.symbol === 'JP225' || inst.symbol === 'HK50'
              ? (Math.random() - 0.5) * 1.8
              : inst.symbol === 'GER40' || inst.symbol === 'UK100' || inst.symbol === 'EU50' || inst.symbol === 'FRA40' || inst.symbol === 'US500' || inst.symbol === 'US2000'
              ? (Math.random() - 0.5) * 0.65
              : (Math.random() - 0.5) * 0.015;

          const rawNext = inst.price + step;
          const nextPrice = spec ? roundToTick(rawNext, spec) : Number(rawNext.toFixed(decimals));
          const direction: 'up' | 'down' | 'none' =
            nextPrice > inst.price ? 'up' : nextPrice < inst.price ? 'down' : 'none';

          return {
            ...inst,
            price: nextPrice,
            lastTickDirection: direction,
            high24h: inst.high24h ? Math.max(inst.high24h, nextPrice) : nextPrice,
            low24h: inst.low24h ? Math.min(inst.low24h, nextPrice) : nextPrice,
          };
        })
      );
    }, 900);

    return () => clearInterval(tickInterval);
  }, [settings.autoTick]);

  const refreshFeed = async () => {
    try {
      const res = await fetch('/api/market-feed');
      if (res.ok) {
        const data = await res.json();
        setInstruments((prev) => {
          const incoming: InstrumentQuote[] = data.instruments || [];
          return incoming.map((inc) => {
            const existing = prev.find((p) => p.symbol === inc.symbol);
            const direction: 'up' | 'down' | 'none' = existing
              ? inc.price > existing.price
                ? 'up'
                : inc.price < existing.price
                ? 'down'
                : existing.lastTickDirection || 'none'
              : 'none';
            return { ...inc, lastTickDirection: direction };
          });
        });
        setSession(data.session || null);
        if (data.fxRates) {
          setFxRates((prev) => ({ ...prev, ...data.fxRates }));
        }
      }
    } catch (err) {
      console.error('Error fetching market feed:', err);
    }
  };

  const refreshMt5Status = async () => {
    try {
      const res = await fetch('/api/mt5/status');
      if (res.ok) {
        const data: MT5SessionState = await res.json();
        setMt5State(data);
      }
    } catch (_err) {
      // ignore transient error
    }
  };

  const handleToggleDocActive = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleActivateAllDocs = () => {
    setDocuments((prev) => prev.map((d) => ({ ...d, isActive: true })));
  };

  const handleDeactivateAllDocs = () => {
    setDocuments((prev) => prev.map((d) => ({ ...d, isActive: false })));
  };

  const handleAddCustomDoc = (name: string, content: string, description: string) => {
    const newDoc: CustomDocument = {
      id: `doc-${Date.now()}`,
      name,
      type: 'custom',
      content,
      charCount: content.length,
      description,
      addedAt: new Date().toISOString(),
      isActive: true,
    };

    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id || d.type === 'builtin'));
  };

  const handleQuickRequestEntry = (symbol: string) => {
    setTargetAssetForAction(symbol);
    setTargetStrategyForAction('AUTO');
    setActiveTab('entries');
  };

  useEffect(() => {
    const hiddenMap: Record<string, boolean> = {
      scanner: !(settings.showScannerTab ?? true),
      strategies: !(settings.showStrategiesTab ?? true),
      mt5: !(settings.showMt5Tab ?? true),
      newschat: !(settings.showNewsChatTab ?? true),
      reports: !settings.showReportsTab,
      knowledge: !settings.showKnowledgeTab,
      calculator: !settings.showCalculatorTab,
    };
    if (hiddenMap[activeTab]) {
      setActiveTab('terminal');
    }
  }, [activeTab, settings]);

  const handleQuickGenerateReport = (symbol: string) => {
    setTargetAssetForAction(symbol);
    setActiveTab('reports');
  };

  const handleUseStrategyForEntry = (asset: string, strategy: StrategyPlaybook) => {
    setTargetAssetForAction(asset);
    setTargetStrategyForAction(strategy.id);
    setActiveTab('entries');
  };

  const activeDocs = documents.filter((d) => d.isActive);
  const useOnlineOnly =
    activeDocs.length === 0 ||
    (activeDocs.length === 1 && activeDocs[0].id === 'doc-builtin-web-sources');
  const combinedActiveContent = activeDocs
    .map((d) => `=== ${d.name} ===\n${d.content}`)
    .join('\n\n');

  const activeDocSummaryLabel =
    activeDocs.length === 0
      ? 'Webs Financieras Online'
      : activeDocs.length === 1
      ? activeDocs[0].name
      : `${activeDocs.length} Bases Activas`;

  return (
    <div
      data-theme={settings.theme}
      className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#0c0906] text-[#f5ede6] flex flex-col font-sans selection:bg-amber-600 selection:text-white transition-colors duration-300"
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        activeDocsCount={activeDocs.length}
        totalDocsCount={documents.length}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        mt5State={mt5State}
      />

      <main
        className={`flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 overflow-x-hidden ${
          settings.compactCards ? 'py-3' : 'py-4 sm:py-6'
        }`}
      >
        {activeTab === 'terminal' && (
          <MarketTerminal
            instruments={instruments}
            session={session}
            onRefreshFeed={refreshFeed}
            onRequestEntry={handleQuickRequestEntry}
            onGenerateReport={handleQuickGenerateReport}
            onOpenScanner={() => setActiveTab('scanner')}
            initialAsset={targetAssetForAction}
            settings={settings}
          />
        )}

        {activeTab === 'scanner' && (
          <MultiIndexScanner
            defaultBalance={settings.defaultBalance}
            defaultRisk={settings.defaultRisk}
            language={settings.language}
            marketMode={settings.instrumentMarketMode}
            enabledSymbols={settings.enabledSymbols}
            onSelectAssetInChart={(symbol) => {
              setTargetAssetForAction(symbol);
              setActiveTab('terminal');
            }}
            onOpenInSetupEngine={(symbol) => {
              setTargetAssetForAction(symbol);
              setActiveTab('entries');
            }}
            mt5State={mt5State}
            onRefreshMt5={refreshMt5Status}
            onOpenMt5Hub={() => setActiveTab('mt5')}
          />
        )}

        {activeTab === 'entries' && (
          <TradeSetupEngine
            initialAsset={targetAssetForAction}
            initialStrategyId={targetStrategyForAction}
            session={session}
            documents={documents}
            onAddCustomDoc={handleAddCustomDoc}
            onOpenKnowledgeTab={() => setActiveTab('knowledge')}
            onSelectAssetInChart={(symbol) => {
              setTargetAssetForAction(symbol);
              setActiveTab('terminal');
            }}
            defaultBalance={settings.defaultBalance}
            defaultRisk={settings.defaultRisk}
            language={settings.language}
            marketMode={settings.instrumentMarketMode}
            enabledSymbols={settings.enabledSymbols}
            mt5State={mt5State}
            onRefreshMt5={refreshMt5Status}
            onOpenMt5Hub={() => setActiveTab('mt5')}
          />
        )}

        {activeTab === 'mt5' && (
          <MT5ExecutionHub
            mt5State={mt5State}
            onRefreshMt5={refreshMt5Status}
            language={settings.language}
            defaultBalance={settings.defaultBalance}
            onNavigateToEntries={() => setActiveTab('entries')}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'strategies' && (
          <StrategiesPlaybook
            language={settings.language}
            onUseStrategyForEntry={handleUseStrategyForEntry}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator
            initialAsset={targetAssetForAction}
            session={session}
            activeDocName={activeDocSummaryLabel}
            customDocContent={combinedActiveContent}
            useOnlineOnly={useOnlineOnly}
            onOpenKnowledgeTab={() => setActiveTab('knowledge')}
            language={settings.language}
            marketMode={settings.instrumentMarketMode}
            enabledSymbols={settings.enabledSymbols}
          />
        )}

        {activeTab === 'knowledge' && (
          <DocumentManager
            documents={documents}
            onToggleDocActive={handleToggleDocActive}
            onActivateAllDocs={handleActivateAllDocs}
            onDeactivateAllDocs={handleDeactivateAllDocs}
            onAddCustomDoc={handleAddCustomDoc}
            onDeleteDoc={handleDeleteDoc}
            language={settings.language}
          />
        )}

        {activeTab === 'newschat' && (
          <NewsGeminiChat
            language={settings.language}
            session={session}
            initialAsset={targetAssetForAction}
            customDocContent={combinedActiveContent}
            marketMode={settings.instrumentMarketMode}
            enabledSymbols={settings.enabledSymbols}
          />
        )}

        {activeTab === 'calculator' && (
          <PropFirmCalculator
            language={settings.language}
            defaultBalance={settings.defaultBalance}
            defaultRisk={settings.defaultRisk}
            fxRates={fxRates}
            marketMode={settings.instrumentMarketMode}
            enabledSymbols={settings.enabledSymbols}
            instruments={instruments}
            mt5State={mt5State}
            onRefreshMt5={refreshMt5Status}
            onOpenMt5Hub={() => setActiveTab('mt5')}
          />
        )}
      </main>

      {settings.showFooter && (
        <footer className="border-t border-[#3b271a] bg-[#120d09]/90 py-5 mt-12 text-xs font-mono text-amber-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-300/80">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-white">TRstudio</span>
              <span>•</span>
              <span>
                {settings.instrumentMarketMode === 'futures_only'
                  ? settings.language === 'en'
                    ? 'Institutional Futures (CME / Eurex / COMEX) • Multi-Scanner • 19 Financial Portals'
                    : 'Futuros Institucionales (CME / Eurex / COMEX) • Escáner de Mejor Entrada • 19 Webs Financieras'
                  : settings.language === 'en'
                  ? '12 Primary CFD Indices, Gold & FX • Multi-Index Scanner • 19 Financial Portals'
                  : '12 Índices CFD Primarios, Oro y FX • Escáner de Mejor Entrada • 19 Webs Financieras'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-amber-300/60">
              <span>4H / 1H / 30M / 15M / 5M</span>
              <span>•</span>
              <span>
                {settings.language === 'en' ? 'New York Time' : 'Horario Nueva York'} (
                {settings.timeFormat === '12h' ? '12h AM/PM' : '24h'})
              </span>
            </div>
          </div>
        </footer>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />
    </div>
  );
}
