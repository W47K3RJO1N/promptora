import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Sliders,
  AlertTriangle,
  Code,
  FileText,
  FileCheck,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { OptimizationResult, OptimizationStrength, SamplePrompt } from '../types';
import { estimateTokensClient } from '../utils/tokenizer';
import { computeWordDiff } from '../utils/diff';

interface PromptWorkspaceProps {
  originalPrompt: string;
  setOriginalPrompt: (text: string) => void;
  optimizedPrompt: string;
  setOptimizedPrompt: (text: string) => void;
  strength: OptimizationStrength;
  setStrength: (s: OptimizationStrength) => void;
  preserveFormatting: boolean;
  setPreserveFormatting: (p: boolean) => void;
  customInstructions: string;
  setCustomInstructions: (inst: string) => void;
  isOptimizing: boolean;
  onOptimize: () => void;
  result: OptimizationResult | null;
  error: string | null;
  samplePrompts: SamplePrompt[];
  onOpenSettings: () => void;
}

export const PromptWorkspace: React.FC<PromptWorkspaceProps> = ({
  originalPrompt,
  setOriginalPrompt,
  optimizedPrompt,
  setOptimizedPrompt,
  strength,
  setStrength,
  preserveFormatting,
  setPreserveFormatting,
  customInstructions,
  setCustomInstructions,
  isOptimizing,
  onOptimize,
  result,
  error,
  samplePrompts,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Live client-side token and word metrics as user types
  const origStats = estimateTokensClient(originalPrompt);
  const optStats = estimateTokensClient(optimizedPrompt);

  const handleCopy = async () => {
    if (!optimizedPrompt) return;
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = optimizedPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleReplaceOriginal = () => {
    if (!optimizedPrompt) return;
    setOriginalPrompt(optimizedPrompt);
    setOptimizedPrompt('');
  };

  const handleExport = (format: 'txt' | 'md') => {
    if (!optimizedPrompt) return;
    const filename = `promptora-prompt-${Date.now()}.${format}`;
    const content =
      format === 'md'
        ? `# Promptora Optimized Prompt\n\n\`\`\`markdown\n${optimizedPrompt}\n\`\`\`\n\n---\n*Original Tokens: ${result?.metrics.originalTokens || origStats.tokens} | Optimized Tokens: ${result?.metrics.optimizedTokens || optStats.tokens}*`
        : optimizedPrompt;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isOptimizing && originalPrompt.trim()) {
        onOptimize();
      }
    }
  };

  const diffChunks = showDiff && optimizedPrompt ? computeWordDiff(originalPrompt, optimizedPrompt) : [];

  return (
    <div id="workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Workspace Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-stone-900">
            Prompt Workspace
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Craft, inspect, and compress system or user prompts side-by-side.
          </p>
        </div>

        {/* Strength Selector (Functional segmented tabs, single line) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setStrength('light')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
              strength === 'light'
                ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Minimal edits, removes only blatant redundancy"
          >
            Light
          </button>
          <button
            onClick={() => setStrength('balanced')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
              strength === 'balanced'
                ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Balances strong compression with natural readability"
          >
            Balanced
          </button>
          <button
            onClick={() => setStrength('aggressive')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
              strength === 'aggressive'
                ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Maximum compression to bare technical instruction core"
          >
            Aggressive
          </button>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Panel: Original Prompt */}
        <div className="flex flex-col bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Original Prompt
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs font-mono text-stone-500 tabular-nums">
                ~{origStats.tokens} tokens
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Load Example Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSampleMenu(!showSampleMenu)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Examples</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {showSampleMenu && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg border border-stone-200 shadow-lg py-1.5 z-20">
                    <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Select Sample Prompt
                    </div>
                    {samplePrompts.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setOriginalPrompt(s.prompt);
                          setShowSampleMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50/60 transition-colors flex flex-col"
                      >
                        <span className="font-semibold text-stone-900">{s.title}</span>
                        <span className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                          {s.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear button */}
              {originalPrompt && (
                <button
                  onClick={() => setOriginalPrompt('')}
                  className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="p-4 flex-1 flex flex-col min-h-[340px]">
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste or type your AI prompt here... (e.g. system instructions, persona framing, complex task directives with constraints)"
              className="w-full flex-1 resize-none bg-transparent font-mono text-xs sm:text-sm text-stone-800 leading-relaxed outline-hidden placeholder:text-stone-400 placeholder:font-sans"
              spellCheck={false}
            />

            {/* Live Count Bar */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
              <div className="flex items-center gap-3">
                <span>{origStats.chars} chars</span>
                <span>·</span>
                <span>{origStats.words} words</span>
                <span>·</span>
                <span className="text-emerald-800 font-semibold">~{origStats.tokens} est. tokens</span>
              </div>
              <span className="text-[11px] text-stone-400 font-sans hidden sm:inline">
                Ctrl + Enter to optimize
              </span>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="p-4 border-t border-stone-200/80 bg-stone-50/30 space-y-3">
            {/* Preservation Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={preserveFormatting}
                  onChange={(e) => setPreserveFormatting(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
                />
                <span>Preserve structural format, JSON schemas & tables</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide constraints' : 'Extra constraints'}</span>
              </button>
            </div>

            {/* Collapsible custom constraints */}
            {showAdvanced && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Optional instruction, e.g.: 'Keep tone strictly technical' or 'Preserve SQL dialect syntax'"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg outline-hidden focus:border-emerald-700 text-stone-800"
                />
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={onOptimize}
              disabled={isOptimizing || !originalPrompt.trim()}
              className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs ${
                isOptimizing || !originalPrompt.trim()
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-900 text-white hover:bg-emerald-800 active:scale-[0.99]'
              }`}
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Compressing with local Ollama model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Optimize Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Optimized Result */}
        <div className="flex flex-col bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Optimized Prompt
              </span>
              {optimizedPrompt && (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs font-mono text-emerald-800 font-semibold tabular-nums">
                    {result ? result.metrics.optimizedTokens : optStats.tokens} tokens
                  </span>
                  {result && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span
                        className={`text-xs font-mono font-semibold tabular-nums ${
                          result.metrics.reductionPercentage >= 0 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {result.metrics.reductionPercentage > 0 ? '-' : ''}
                        {result.metrics.reductionPercentage}%
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Actions Toolbar */}
            {optimizedPrompt && (
              <div className="flex items-center gap-1.5">
                {/* Diff toggle */}
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    showDiff
                      ? 'bg-emerald-100 text-emerald-950 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                  title="Toggle word diff view"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1" />
                  <span>Diff</span>
                </button>

                {/* Replace original */}
                <button
                  onClick={handleReplaceOriginal}
                  className="px-2 py-1 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
                  title="Replace original prompt with this optimized version to iterate further"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  <span className="hidden sm:inline">Use as input</span>
                </button>

                {/* Export menu */}
                <button
                  onClick={() => handleExport('txt')}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-900 text-white hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Result Content Body */}
          <div className="p-4 flex-1 flex flex-col min-h-[340px]">
            {isOptimizing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-8 h-8 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-sm font-semibold text-stone-900">
                  Executing Prompt Optimization
                </span>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Gemma 3 is stripping conversational redundancies while safeguarding your structured output requirements.
                </p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-amber-50/40 rounded-lg border border-amber-200/80">
                <AlertTriangle className="w-8 h-8 text-amber-700 mb-2" />
                <span className="text-sm font-semibold text-stone-900">
                  Optimization Request Failed
                </span>
                <p className="text-xs text-stone-600 mt-1 max-w-md">
                  {error}
                </p>
                <div className="mt-4 p-3 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg text-left max-w-md w-full">
                  <div className="text-stone-400 mb-1"># Common fix if Ollama is local:</div>
                  <div>ollama serve</div>
                  <div>ollama pull gemma3:4b</div>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-emerald-900 hover:underline"
                >
                  Open Diagnostics & Settings →
                </button>
              </div>
            ) : optimizedPrompt ? (
              showDiff ? (
                /* Word Diff View */
                <div className="flex-1 font-mono text-xs sm:text-sm leading-relaxed p-2 bg-stone-50/40 rounded-lg overflow-y-auto max-h-[460px]">
                  <div className="text-[11px] font-sans text-stone-500 mb-3 pb-2 border-b border-stone-200 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-200 border border-red-300 rounded-xs" />
                      <span>Trimmed words</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-200 border border-emerald-300 rounded-xs" />
                      <span>Added/restructured words</span>
                    </span>
                  </div>
                  {diffChunks.map((chunk, idx) => {
                    if (chunk.type === 'removed') {
                      return (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-900 line-through decoration-red-400 rounded-xs px-0.5"
                        >
                          {chunk.value}
                        </span>
                      );
                    }
                    if (chunk.type === 'added') {
                      return (
                        <span key={idx} className="bg-emerald-100 text-emerald-950 font-semibold rounded-xs px-0.5">
                          {chunk.value}
                        </span>
                      );
                    }
                    return <span key={idx} className="text-stone-800">{chunk.value}</span>;
                  })}
                </div>
              ) : (
                /* Standard Prompt View */
                <textarea
                  value={optimizedPrompt}
                  onChange={(e) => setOptimizedPrompt(e.target.value)}
                  className="w-full flex-1 resize-none bg-transparent font-mono text-xs sm:text-sm text-stone-900 leading-relaxed outline-hidden"
                  spellCheck={false}
                />
              )
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-400">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <FileText className="w-5 h-5 text-stone-500" />
                </div>
                <span className="text-sm font-semibold text-stone-700">
                  Ready to optimize
                </span>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Paste your prompt on the left and click "Optimize Prompt", or select a sample from the Examples dropdown.
                </p>
              </div>
            )}

            {/* Metrics Snapshot Bar in Footer */}
            {optimizedPrompt && result && (
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 font-mono tabular-nums">
                <div className="flex items-center gap-3">
                  <span>{optStats.chars} chars</span>
                  <span>·</span>
                  <span>{optStats.words} words</span>
                  <span>·</span>
                  <span className="text-emerald-800 font-semibold">
                    Saved {result.metrics.tokensSaved} tokens
                  </span>
                </div>
                {result.metrics.executionTimeMs > 0 && (
                  <span className="text-stone-400 text-[11px]">
                    latency: {result.metrics.executionTimeMs}ms
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
