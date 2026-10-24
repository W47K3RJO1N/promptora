import React, { useState } from 'react';
import {
  X,
  Server,
  Cpu,
  RefreshCw,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { OllamaHealth } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: OllamaHealth;
  onRefreshHealth: () => void;
  currentModel: string;
  onSelectModel: (model: string) => void;
  ollamaUrl: string;
  ollamaUrlLocked: boolean;
  onUpdateOllamaUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  health,
  onRefreshHealth,
  currentModel,
  onSelectModel,
  ollamaUrl,
  ollamaUrlLocked,
  onUpdateOllamaUrl,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [customModelInput, setCustomModelInput] = useState('');
  const [activeTab, setActiveTab] = useState<'connection' | 'commands' | 'about'>('connection');

  if (!isOpen) return null;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const isOnline = health.status === 'online';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-800" />
            <h3 className="font-display font-semibold text-stone-900 text-sm">
              Ollama & Engine Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-5 text-xs font-medium text-stone-600 gap-4">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'connection'
                ? 'border-emerald-800 text-emerald-950 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Connection & Model
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'commands'
                ? 'border-emerald-800 text-emerald-950 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Terminal Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-2.5 transition-colors border-b-2 ${
              activeTab === 'about'
                ? 'border-emerald-800 text-emerald-950 font-semibold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            About Promptora
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {activeTab === 'connection' && (
            <>
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                  isOnline
                    ? health.modelInstalled
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                {isOnline ? (
                  health.modelInstalled ? (
                    <CheckCircle className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  )
                ) : (
                  <Server className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">
                    {isOnline
                      ? health.modelInstalled
                        ? 'Ollama Connected & Ready'
                        : `Ollama Connected (Model '${currentModel}' not found)`
                      : 'Ollama Unreachable'}
                  </div>
                  <p className="mt-0.5 text-stone-600 leading-relaxed">
                    {health.message}
                  </p>
                </div>
                <button
                  onClick={onRefreshHealth}
                  className="p-1.5 hover:bg-black/5 rounded-md transition-colors shrink-0"
                  title="Check connection again"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ollama Base URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Ollama Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => onUpdateOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    disabled={ollamaUrlLocked}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg outline-hidden focus:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    onClick={onRefreshHealth}
                    disabled={ollamaUrlLocked}
                    className="px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors shrink-0"
                  >
                    Test URL
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">
                  {ollamaUrlLocked
                    ? 'The server endpoint is configured by the deployment administrator.'
                    : <>Default: <code className="font-mono">http://localhost:11434</code>.</>}
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Selected Model</span>
                  {health.availableModels.length > 0 && (
                    <span className="font-mono text-[11px] text-emerald-800 font-normal">
                      {health.availableModels.length} models available
                    </span>
                  )}
                </label>

                {/* Available models dropdown */}
                {health.availableModels.length > 0 ? (
                  <select
                    value={currentModel}
                    onChange={(e) => onSelectModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-200 rounded-lg outline-hidden focus:border-emerald-700"
                  >
                    {health.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs text-stone-600">
                    No models currently reported by Ollama. Default model is set to{' '}
                    <code className="font-mono font-semibold text-stone-800">gemma3:4b</code>.
                  </div>
                )}

                {/* Custom model override */}
                <div className="pt-1 flex gap-2">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="Or enter model name (e.g. gemma3:4b, llama3.2, mistral)"
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg outline-hidden"
                  />
                  <button
                    onClick={() => {
                      if (customModelInput.trim()) {
                        onSelectModel(customModelInput.trim());
                        setCustomModelInput('');
                      }
                    }}
                    disabled={!customModelInput.trim()}
                    className="px-3 py-1.5 text-xs font-medium bg-emerald-900 text-white hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 rounded-lg transition-colors shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4 text-xs text-stone-700">
              <p>
                Run these commands in your Windows PowerShell, macOS Terminal, or Linux Bash to prepare your local Ollama environment:
              </p>

              {/* Command 1 */}
              <div className="space-y-1">
                <span className="font-semibold text-stone-800">
                  1. Pull Recommended Model (Gemma 3: 4B)
                </span>
                <div className="flex items-center justify-between p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg">
                  <span>ollama pull gemma3:4b</span>
                  <button
                    onClick={() => copyCommand('ollama pull gemma3:4b')}
                    className="p-1 hover:bg-stone-800 rounded transition-colors"
                  >
                    {copiedCmd === 'ollama pull gemma3:4b' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command 2 */}
              <div className="space-y-1">
                <span className="font-semibold text-stone-800">
                  2. Start Ollama Daemon
                </span>
                <div className="flex items-center justify-between p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg">
                  <span>ollama serve</span>
                  <button
                    onClick={() => copyCommand('ollama serve')}
                    className="p-1 hover:bg-stone-800 rounded transition-colors"
                  >
                    {copiedCmd === 'ollama serve' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command 3 */}
              <div className="space-y-1">
                <span className="font-semibold text-stone-800">
                  3. Windows CORS Config (if web browser blocks localhost)
                </span>
                <div className="flex items-center justify-between p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg">
                  <span>$env:OLLAMA_ORIGINS="*" ; ollama serve</span>
                  <button
                    onClick={() => copyCommand('$env:OLLAMA_ORIGINS="*" ; ollama serve')}
                    className="p-1 hover:bg-stone-800 rounded transition-colors"
                  >
                    {copiedCmd === '$env:OLLAMA_ORIGINS="*" ; ollama serve' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Python backend command */}
              <div className="space-y-1 pt-2 border-t border-stone-200">
                <span className="font-semibold text-stone-800">
                  4. Start Python FastAPI Backend
                </span>
                <div className="flex items-center justify-between p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg">
                  <span>uvicorn backend.main:app --reload --port 8000</span>
                  <button
                    onClick={() => copyCommand('uvicorn backend.main:app --reload --port 8000')}
                    className="p-1 hover:bg-stone-800 rounded transition-colors"
                  >
                    {copiedCmd === 'uvicorn backend.main:app --reload --port 8000' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="flex items-center gap-2 text-stone-900 font-semibold">
                <span>Promptora Architecture</span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] font-mono text-emerald-800">v1.0.0 (Open Source)</span>
              </div>
              <p>
                {ollamaUrlLocked
                  ? 'This hosted deployment sends prompts to its configured Ollama service through the Promptora server. Avoid entering sensitive data unless you trust the deployment and model host.'
                  : 'In local mode, your prompts and evaluations are processed through your self-hosted Ollama server and are not sent to a hosted Promptora service.'}
              </p>
              <div className="pt-2 border-t border-stone-200 flex flex-col gap-1.5">
                <a
                  href="https://github.com/tokenwise/tokenwise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-900 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>Download Ollama</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
