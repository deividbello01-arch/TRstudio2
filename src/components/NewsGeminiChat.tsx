import React, { useState, useRef, useEffect } from 'react';
import {
  Newspaper,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { AppLanguage, ExternalSourceAttribution, KillzoneSession } from '../types/trading';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  nyTime?: string;
  sources?: ExternalSourceAttribution[];
}

interface NewsGeminiChatProps {
  language?: AppLanguage;
  session: KillzoneSession | null;
  initialAsset?: string;
  customDocContent?: string;
}

export const NewsGeminiChat: React.FC<NewsGeminiChatProps> = ({
  language = 'es',
  session,
  initialAsset = 'NAS100',
  customDocContent,
}) => {
  const isEn = language === 'en';
  const [selectedAsset, setSelectedAsset] = useState<string>(initialAsset || 'NAS100');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: isEn
        ? 'Hello! I am the **TRstudio Gemini News & Macro Analyst**. Ask me any question about economic news (CPI, NFP, FOMC, Fed Interest Rates, Powell speeches, US10Y Treasury yields, DXY, or geopolitical events) and how they affect **NAS100, US30, XAUUSD (Gold), or EURUSD** right now.'
        : '¡Hola! Soy el **Analista Gemini de Noticias y Macro de TRstudio**. Pregúntame cualquier duda sobre noticias económicas (CPI/Inflación, NFP/Empleo, FOMC, Tasas de la Fed, discursos de Powell, Bonos US10Y, DXY o eventos geopolíticos) y cómo afectan tus operaciones en **NAS100, US30, XAUUSD (Oro) o EURUSD**.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = isEn
    ? [
        `How do today's macro news & US10Y yields impact ${selectedAsset}?`,
        'What happens to Gold (XAUUSD) and NAS100 when CPI inflation comes out higher than expected?',
        'How should I trade or protect my account during NFP or FOMC Powell speeches?',
        'Why is DXY moving right now and how does it affect EURUSD and Gold?',
        'What are the high-impact red-folder news hours (NY time) when I should avoid entering?',
      ]
    : [
        `¿Cómo afectan las noticias macro de hoy y el bono US10Y a ${selectedAsset}?`,
        '¿Qué pasa con el Oro (XAUUSD) y el NAS100 cuando el CPI (Inflación) sale más alto de lo esperado?',
        '¿Cómo debo operar o proteger mi cuenta durante el NFP o cuando habla Powell (FOMC)?',
        '¿Por qué se mueve el DXY ahora mismo y cómo impacta al EURUSD y al Oro?',
        '¿Cuáles son los horarios de noticias de carpeta roja (Hora NY) donde debo evitar abrir entradas?',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend ?? input).trim();
    if (!queryText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: historyPayload,
          asset: selectedAsset,
          customDocument: customDocContent,
          useOnlineOnly: true,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(isEn ? 'Error querying Gemini news chat' : 'Error al consultar el chat de noticias');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || (isEn ? 'No response received.' : 'Sin respuesta.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nyTime: data.nyTime,
        sources: data.externalSources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: isEn
            ? `Could not complete request: ${err.message || 'Connection error'}`
            : `No se pudo completar la consulta: ${err.message || 'Error de conexión'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: isEn
          ? 'Chat cleared. Ask me any question about macroeconomic news, central banks, or how an event impacts your trading.'
          : 'Chat reiniciado. Pregúntame cualquier duda sobre noticias macroeconómicas, bancos centrales o cómo afecta un evento a tu operativa.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-1.5" />;
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        return (
          <h4 key={i} className="font-mono font-bold text-amber-400 text-xs sm:text-sm mt-2 mb-1">
            {trimmed.replace(/^#{2,3}\s+/, '')}
          </h4>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h5 key={i} className="font-mono font-bold text-white text-xs mt-1.5 mb-0.5">
            {trimmed.replace(/^####\s+/, '')}
          </h5>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 pl-1.5 my-0.5">
            <span className="text-amber-400 font-bold">•</span>
            <span>{trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '')}</span>
          </div>
        );
      }
      if (trimmed === '---') {
        return <hr key={i} className="border-[#3b271a] my-2" />;
      }
      return (
        <p key={i} className="my-0.5 leading-relaxed">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {isEn
                    ? 'Gemini Chat — News & Macro Doubts'
                    : 'Chat Gemini — Dudas sobre Noticias y Macro'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini
                </span>
              </div>
              <p className="text-xs text-amber-200/60 mt-0.5">
                {isEn
                  ? 'Ask about CPI, NFP, FOMC, Fed rates, US10Y yields, or breaking financial news and their impact on your trades.'
                  : 'Resuelve dudas sobre CPI, NFP, FOMC, tasas de la Fed, bonos US10Y o noticias de última hora y cómo afectan tus entradas.'}
              </p>
            </div>
          </div>

          {/* Asset Focus & Clear Button */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-amber-200/70">
              {isEn ? 'Asset Focus:' : 'Activo:'}
            </span>
            {['NAS100', 'US30', 'XAUUSD', 'EURUSD'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setSelectedAsset(sym)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                  selectedAsset === sym
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-600'
                }`}
              >
                {sym}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-[#24170f] hover:bg-rose-950/80 text-amber-200 hover:text-rose-200 border border-[#4d3221] transition ml-1"
              title={isEn ? 'Clear chat' : 'Limpiar conversación'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick News Question Chips */}
        <div className="mt-4 pt-3 border-t border-[#3b271a]">
          <div className="text-[10px] font-mono uppercase text-amber-300/70 mb-2 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-amber-400" />
            <span>
              {isEn
                ? 'Quick Questions about News & Market Impact:'
                : 'Preguntas Rápidas sobre Noticias e Impacto en el Mercado:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#120c08] hover:bg-[#24170f] text-amber-200/90 hover:text-white border border-[#3b271a] hover:border-amber-500/60 transition font-mono disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Top Status Bar inside Chat */}
        <div className="px-4 py-2.5 bg-[#120c08] border-b border-[#3b271a] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">
              {isEn ? `News & Macro Feed (${selectedAsset})` : `Consultor de Noticias Macro (${selectedAsset})`}
            </span>
          </div>
          {session && (
            <div className="flex items-center gap-2 text-[11px] text-amber-200/70">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>
                {session.name} ({session.nyTime} NY)
              </span>
            </div>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0f0a07]/60">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl p-3.5 text-xs sm:text-sm ${
                    isUser
                      ? 'bg-amber-600 text-white font-medium rounded-br-none shadow-md'
                      : 'bg-[#18110b] border border-[#3b271a] text-amber-100/95 rounded-bl-none shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono opacity-75">
                    <span className="font-bold uppercase">
                      {isUser
                        ? isEn
                          ? 'You'
                          : 'Tú'
                        : isEn
                        ? 'Gemini News Analyst'
                        : 'Gemini Analista de Noticias'}
                    </span>
                    <span>{msg.nyTime || msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm">{renderFormattedContent(msg.content)}</div>

                  {/* External News Sources Links */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#3b271a] flex flex-wrap gap-1.5">
                      {msg.sources.slice(0, 4).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#120c08] hover:bg-[#24170f] text-amber-300 border border-[#3b271a] flex items-center gap-1 transition"
                        >
                          <span>{src.media}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-[#18110b] border border-[#3b271a] rounded-2xl rounded-bl-none p-3.5 text-xs font-mono text-amber-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>
                  {isEn
                    ? 'Gemini is analyzing macro news, yields & market impact...'
                    : 'Gemini está analizando las noticias macro, bonos e impacto en el mercado...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#120c08] border-t border-[#3b271a] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isEn
                ? 'Ask any question about economic news (e.g., How does CPI or Fed rate affect Gold/Nasdaq today?)...'
                : 'Escribe tu duda sobre noticias (ej. ¿Cómo afecta hoy el CPI o la Fed al Oro o Nasdaq?)...'
            }
            className="flex-1 bg-[#18110b] border border-[#3b271a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEn ? 'Ask Gemini' : 'Preguntar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
