import React, { useState } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2,
  FileCheck,
  Power,
  PowerOff,
  Database,
  CheckSquare,
  Square
} from 'lucide-react';
import { CustomDocument, AppLanguage } from '../types/trading';

interface DocumentManagerProps {
  documents: CustomDocument[];
  onToggleDocActive: (id: string) => void;
  onActivateAllDocs: () => void;
  onDeactivateAllDocs: () => void;
  onAddCustomDoc: (name: string, content: string, description: string) => void;
  onDeleteDoc: (id: string) => void;
  language?: AppLanguage;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onToggleDocActive,
  onActivateAllDocs,
  onDeactivateAllDocs,
  onAddCustomDoc,
  onDeleteDoc,
  language = 'es',
}) => {
  const isEn = language === 'en';
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'doc-builtin-web-sources');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');

  const inspectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCustomName(file.name.replace(/\.[^/.]+$/, ''));
        setCustomText(text);
        setCustomDescription(
          isEn ? `Uploaded analysis: ${file.name}` : `Análisis subido: ${file.name}`
        );
        setShowUploadModal(true);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCustomDoc = () => {
    if (!customName.trim() || !customText.trim()) return;
    onAddCustomDoc(
      customName,
      customText,
      customDescription ||
        (isEn
          ? 'Custom analysis for calculating entries'
          : 'Análisis personalizado para calcular entradas')
    );
    setShowUploadModal(false);
    setCustomName('');
    setCustomText('');
    setCustomDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Analysis Controls */}
      <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-700/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEn ? 'Knowledge Bases & Custom Analyses' : 'Bases & Análisis Operativos'}
              </h2>
              <p className="text-xs text-amber-200/60">
                {isEn
                  ? 'Built-in top financial web sources online. Add your own analyses or trading rules here to choose them when requesting entries.'
                  : 'Base online de mejores webs financieras integrada. Agrega aquí tus propios análisis o reglas para elegirlos al pedir entradas.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onActivateAllDocs}
              className="px-2.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold transition"
            >
              {isEn ? 'Activate All' : 'Activar Todas'}
            </button>
            <button
              type="button"
              onClick={onDeactivateAllDocs}
              className="px-2.5 py-2 rounded-xl bg-[#24170f] hover:bg-[#312015] text-amber-200/80 border border-[#4d3221] text-xs font-mono transition"
            >
              {isEn ? 'Deactivate All' : 'Desactivar Todas'}
            </button>

            <label className="px-3 py-2 rounded-xl bg-[#24170f] hover:bg-[#312015] text-amber-200 border border-[#4d3221] text-xs font-medium cursor-pointer transition flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Upload File (.txt / .md)' : 'Subir Archivo (.txt / .md)'}</span>
              <input type="file" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? 'Add Analysis / Base' : 'Agregar Análisis / Base'}</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-4 pt-4 border-t border-[#3b271a] grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((doc) => {
            const isInspected = selectedDocId === doc.id;
            const isActive = doc.isActive;

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-[#261910] border-emerald-500/60'
                    : 'bg-[#120c08] border-[#3b271a] opacity-80 hover:opacity-100'
                } ${isInspected ? 'ring-1 ring-amber-400' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDocActive(doc.id);
                      }}
                      className={`mt-0.5 p-1 rounded transition ${
                        isActive ? 'text-emerald-400' : 'text-amber-200/40'
                      }`}
                    >
                      {isActive ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">{doc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18110b] text-amber-300/80 border border-[#3b271a]">
                          {doc.type === 'builtin'
                            ? isEn
                              ? 'Online Base'
                              : 'Base Online'
                            : isEn
                            ? 'Custom Analysis'
                            : 'Análisis Propio'}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/60 mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDocActive(doc.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-[#1a120b] text-amber-200/60 border-[#3b271a]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Power className="w-3 h-3" />
                          <span>{isEn ? 'ACTIVE' : 'ACTIVA'}</span>
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-3 h-3" />
                          <span>{isEn ? 'INACTIVE' : 'INACTIVA'}</span>
                        </>
                      )}
                    </button>

                    {doc.type === 'custom' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(doc.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#1a120b] hover:bg-rose-950 text-amber-200/50 hover:text-rose-400 border border-[#3b271a] transition"
                        title={isEn ? 'Delete analysis' : 'Eliminar análisis'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Content Viewer */}
      {inspectedDoc && (
        <div className="bg-[#18110b] border border-[#3b271a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#3b271a] bg-[#120c08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-white font-mono">{inspectedDoc.name}</span>
            </div>
            <span className="text-[11px] font-mono text-amber-200/60">
              {inspectedDoc.isActive ? (isEn ? 'Active' : 'Activa') : isEn ? 'Inactive' : 'Inactiva'}
            </span>
          </div>

          <div className="p-4 max-h-[420px] overflow-y-auto font-mono text-xs text-amber-100/90 leading-relaxed bg-[#0f0a07] whitespace-pre-wrap">
            {inspectedDoc.content}
          </div>
        </div>
      )}

      {/* Modal to Add Analysis / Base */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18110b] border border-[#3b271a] rounded-xl p-5 w-full max-w-xl shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Add Analysis or Strategy' : 'Agregar Análisis o Estrategia'}</span>
            </h3>
            <p className="text-xs text-amber-200/70 mb-4">
              {isEn
                ? 'Write your analysis, levels, or strategy so you can select it when calculating trade entries.'
                : 'Escribe tu análisis, niveles o estrategia para poder seleccionarlo al calcular tus entradas.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-amber-200 mb-1">
                  {isEn ? 'Analysis Name' : 'Nombre del Análisis'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={
                    isEn ? 'Ex: My Nasdaq 9:30 AM Open Analysis' : 'Ej: Mi Análisis Nasdaq Apertura 9:30 AM'
                  }
                  className="w-full bg-[#100b07] border border-[#3b271a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-200 mb-1">
                  {isEn ? 'Short note (optional)' : 'Nota breve (opcional)'}
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Ex: Long setups on 15M FVG with 5M confirmation'
                      : 'Ej: Compras en FVG 15M con confirmación en 5M'
                  }
                  className="w-full bg-[#100b07] border border-[#3b271a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-200 mb-1">
                  {isEn ? 'Analysis / Rules Content' : 'Contenido del Análisis / Reglas'}
                </label>
                <textarea
                  rows={8}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Write the conditions, levels, or structure of your analysis here...'
                      : 'Escribe aquí las condiciones, niveles o estructura de tu análisis...'
                  }
                  className="w-full bg-[#100b07] border border-[#3b271a] rounded-lg p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg bg-[#24170f] hover:bg-[#312015] text-amber-200 text-xs font-medium transition border border-[#3b271a]"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={handleSaveCustomDoc}
                disabled={!customName.trim() || !customText.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isEn ? 'Save Analysis' : 'Guardar Análisis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
