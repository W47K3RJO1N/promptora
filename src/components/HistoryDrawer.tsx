import React from 'react';
import {
  X,
  Trash2,
  Download,
  RotateCcw,
  Clock,
  ArrowRight,
  Layers,
  FileText,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const handleExportAll = () => {
    if (history.length === 0) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptora-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/30 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            <h3 className="font-display font-semibold text-stone-900 text-sm">
              Optimization History
            </h3>
            <span className="text-xs font-mono text-stone-400">
              ({history.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportAll}
                  className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                  title="Export history as JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearAll}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-stone-600">No session history yet</p>
              <p className="text-xs text-stone-400 mt-1">
                Optimized prompts will appear here automatically.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-stone-50/70 hover:bg-emerald-50/40 border border-stone-200/80 rounded-lg transition-all group relative"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5 font-mono">
                  <span className="text-emerald-900 font-semibold">{item.model}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-200/60 text-stone-700 px-1.5 py-0.5 rounded-xs capitalize">
                      {item.strength}
                    </span>
                    <span className="text-emerald-800 font-bold">
                      {item.reductionPercentage > 0 ? `-${item.reductionPercentage}%` : `${item.reductionPercentage}%`}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-800 line-clamp-2 font-mono mb-2">
                  {item.optimizedPrompt}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px]">
                  <span className="text-stone-400">
                    {item.originalTokens} → {item.optimizedTokens} tokens ({item.originalTokens - item.optimizedTokens} saved)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      className="px-2 py-0.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 rounded-sm transition-colors flex items-center gap-1"
                      title="Load into workspace"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/50 text-[11px] text-stone-500 text-center">
          Local-first storage · Prompts remain strictly in your browser/session
        </div>

      </div>
    </div>
  );
};
