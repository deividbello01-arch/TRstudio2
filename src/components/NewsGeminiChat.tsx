import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { AppLanguage, ExternalSourceAttribution, KillzoneSession, InstrumentMarketMode } from '../types/trading';
import { getEnabledTradeableInstruments, FUTURES_CONTRACT_MAP } from '../lib/instruments';

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
  marketMode?: InstrumentMarketMode;
  enabledSymbols?: string[];
}

export const NewsGeminiChat: React.FC<NewsGeminiChatProps> = ({
  language = 'es',
  session,
  initialAsset = 'NAS100',
  customDocContent,
  marketMode = 'all_programmed',
  enabledSymbols,
}) => {
  const isEn = language === 'en';
  const visibleInstruments = getEnabledTradeableInstruments(enabledSymbols, marketMode);
  const [selectedAsset, setSelectedAsset] = useState<string>(initialAsset || 'NAS100');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: isEn
        ? 'Hello! I am **Gemini**, a general-purpose AI assistant. You can ask me anything you need (general questions, explanations, calculations, summaries, or ideas), and if you ask about economic news (CPI, NFP, FOMC, interest rates, yields) or markets, I also have live context to answer.'
        : '¡Hola! Soy **Gemini**, una inteligencia artificial de propósito general. Puedes preguntarme cualquier tema, duda general, cálculo, resumen o explicación; y si me preguntas sobre noticias económicas (CPI, NFP, FOMC, tasas de interés) o mercados, también cuento con contexto en tiempo real para responderte.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = isEn
    ? [
        `How do today's news & macro data affect ${selectedAsset}?`,
        'What happens to Gold and indices when CPI inflation comes out higher than expected?',
        'Explain in simple terms how central bank interest rates work.',
        'Help me calculate compound growth or organize a study/work plan.',
      ]
    : [
        `¿Cómo afectan las noticias de hoy a ${selectedAsset}?`,
        '¿Qué pasa con el Oro y los índices cuando el CPI (Inflación) sale alto?',
        'Explícame de forma sencilla cómo funcionan las tasas de interés de los bancos centrales.',
        'Ayúdame a hacer un cálculo rápido, resumir un tema o resolver cualquier duda general.',
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
        throw new Error(isEn ? 'Error querying Gemini' : 'Error al consultar Gemini');
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
          ? 'Conversation cleared. How can I help you today? Ask me any general question or about news and markets.'
          : 'Conversación reiniciada. ¿En qué te puedo ayudar hoy? Pregúntame cualquier duda general o sobre noticias y mercados.',
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
            <span className="break-words min-w-0">{trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '')}</span>
          </div>
        );
      }
      if (trimmed === '---') {
        return <hr key={i} className="border-[#3b271a] my-2" />;
      }
      return (
        <p key={i} className="my-0.5 leading-relaxed break-words">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-3.5 sm:p-5 shadow-xl w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-700/60 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white font-mono">
                  {isEn ? 'Gemini AI Assistant' : 'Asistente IA Gemini'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isEn ? 'Neutral AI + News' : 'IA Neutral + Noticias'}
                </span>
              </div>
              <p className="text-xs text-amber-200/60 mt-0.5">
                {isEn
                  ? 'General-purpose AI assistant. Ask anything or consult about macroeconomic news and market impact.'
                  : 'Asistente de IA neutral para cualquier consulta general, y preparado para responder si preguntas sobre noticias o mercados.'}
              </p>
            </div>
          </div>

          {/* Asset Focus & Clear Button */}
          <div className="flex items-center gap-1.5 w-full md:w-auto min-w-0 overflow-x-auto touch-pan-x pb-1 md:pb-0">
            <span className="text-[11px] font-mono text-amber-200/70 shrink-0">
              {isEn ? 'Ref:' : 'Ref:'}
            </span>
            {visibleInstruments.map((inst) => {
              const fut = FUTURES_CONTRACT_MAP[inst.symbol];
              return (
                <button
                  key={inst.symbol}
                  type="button"
                  onClick={() => setSelectedAsset(inst.symbol)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition shrink-0 ${
                    selectedAsset === inst.symbol
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-[#120c08] text-amber-200/70 border-[#3b271a] hover:border-amber-600'
                  }`}
                >
                  {marketMode === 'futures_only' && fut
                    ? `${inst.symbol} (${fut.futuresTicker})`
                    : inst.symbol}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-[#24170f] hover:bg-rose-950/80 text-amber-200 hover:text-rose-200 border border-[#4d3221] transition ml-1 shrink-0"
              title={isEn ? 'Clear chat' : 'Limpiar conversación'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="mt-3.5 pt-3 border-t border-[#3b271a]">
          <div className="text-[10px] font-mono uppercase text-amber-300/70 mb-2 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-amber-400 shrink-0" />
            <span>
              {isEn
                ? 'Quick Suggestions (General & News):'
                : 'Sugerencias Rápidas (General y Noticias):'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#120c08] hover:bg-[#24170f] text-amber-200/90 hover:text-white border border-[#3b271a] hover:border-amber-500/60 transition font-mono disabled:opacity-50 break-words max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[460px] sm:h-[520px] w-full min-w-0">
        {/* Top Status Bar inside Chat */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-[#120c08] border-b border-[#3b271a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold">Gemini AI</span>
          </div>
          {session && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/70">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                {session.name} ({session.nyTime} NY)
              </span>
            </div>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 bg-[#0f0a07]/60 min-w-0">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-3xl rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm break-words ${
                    isUser
                      ? 'bg-amber-600 text-white font-medium rounded-br-none shadow-md'
                      : 'bg-[#18110b] border border-[#3b271a] text-amber-100/95 rounded-bl-none shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono opacity-75">
                    <span className="font-bold uppercase">
                      {isUser ? (isEn ? 'You' : 'Tú') : 'Gemini'}
                    </span>
                    <span>{msg.nyTime || msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm break-words">
                    {renderFormattedContent(msg.content)}
                  </div>

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
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span>
                  {isEn ? 'Gemini is thinking...' : 'Gemini está respondiendo...'}
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
          className="p-2.5 sm:p-3 bg-[#120c08] border-t border-[#3b271a] flex items-center gap-2 min-w-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isEn
                ? 'Ask Gemini anything (general questions, news, macro, calculations)...'
                : 'Escribe cualquier pregunta a Gemini (dudas generales, noticias, cálculos)...'
            }
            className="flex-1 min-w-0 bg-[#18110b] border border-[#3b271a] rounded-xl px-3 sm:px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEn ? 'Send' : 'Enviar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
