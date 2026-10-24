import React, { useState } from 'react';
import {
  Play,
  RotateCw,
  Clock,
  Terminal,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { ComparisonResult } from '../types';

interface ResponseTestingProps {
  comparison: ComparisonResult | null;
  isLoading: boolean;
  onRunTest: (temperature: number) => void;
  canTest: boolean;
  model: string;
}

export const ResponseTesting: React.FC<ResponseTestingProps> = ({
  comparison,
  isLoading,
  onRunTest,
  canTest,
  model,
}) => {
  const [temperature, setTemperature] = useState<number>(0.7);

  return (
    <div id="comparison" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-800" />
              <h3 className="text-lg font-display font-semibold text-stone-900">
                Before & After Response Testing
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Signature verification test: Runs both original and compressed prompts through local model <span className="font-mono text-stone-700 font-semibold">{model}</span> under identical generation parameters to evaluate actual model output side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Sampling Temperature Control */}
            <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60">
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              <span>Temp:</span>
              <span className="font-mono font-semibold text-stone-800">{temperature}</span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-16 h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-emerald-800"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={() => onRunTest(temperature)}
              disabled={isLoading || !canTest}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs ${
                isLoading || !canTest
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-900 text-white hover:bg-emerald-800'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Dual Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />
                  <span>{comparison ? 'Re-run Comparison' : 'Run Response Test'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {!comparison && !isLoading && (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900">
              Optional Response Test Not Yet Initiated
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              To verify that the compressed prompt delivers the exact output and format you need, click "Run Response Test". Both prompts will be sent to your local Ollama instance under equivalent conditions.
            </p>
            {canTest && (
              <button
                onClick={() => onRunTest(temperature)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                Launch Output Comparison
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-14 text-center">
            <div className="w-8 h-8 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-stone-900">
              Running Dual Local Model Inferences
            </span>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Querying {model} with both prompt variations to capture real outputs and measure execution time...
            </p>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && !isLoading && (
          <div className="mt-6 space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-between">
                <span className="text-xs text-stone-500">Latency Delta:</span>
                <span className="font-mono text-xs font-semibold text-stone-900">
                  {comparison.comparison.speedDiffMs > 0
                    ? `${comparison.comparison.speedDiffMs}ms faster (optimized)`
                    : comparison.comparison.speedDiffMs < 0
                    ? `${Math.abs(comparison.comparison.speedDiffMs)}ms slower (optimized)`
                    : 'Equal response speed'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-between">
                <span className="text-xs text-stone-500">Response Token Delta:</span>
                <span className="font-mono text-xs font-semibold text-stone-900">
                  {comparison.comparison.responseTokenDiff > 0
                    ? `${comparison.comparison.responseTokenDiff} fewer output tokens`
                    : comparison.comparison.responseTokenDiff < 0
                    ? `${Math.abs(comparison.comparison.responseTokenDiff)} more output tokens`
                    : 'Identical output token count'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-between">
                <span className="text-xs text-stone-500">Model & Sampling:</span>
                <span className="font-mono text-xs font-semibold text-stone-900">
                  {comparison.modelUsed} (T={comparison.temperature})
                </span>
              </div>
            </div>

            {/* Side-by-Side Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Original Response */}
              <div className="border border-stone-200 rounded-lg overflow-hidden flex flex-col bg-stone-50/30">
                <div className="px-4 py-2.5 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    Output from Original Prompt
                  </span>
                  <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{comparison.original.durationMs}ms</span>
                    <span>·</span>
                    <span>~{comparison.original.tokenCount} tokens</span>
                  </div>
                </div>
                <div className="p-4 flex-1 font-mono text-xs text-stone-800 leading-relaxed overflow-y-auto max-h-[380px] whitespace-pre-wrap select-text">
                  {comparison.original.output || '(Model generated empty output)'}
                </div>
              </div>

              {/* Optimized Response */}
              <div className="border border-stone-200 rounded-lg overflow-hidden flex flex-col bg-stone-50/30">
                <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950">
                    Output from Optimized Prompt
                  </span>
                  <div className="flex items-center gap-2 text-emerald-800 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{comparison.optimized.durationMs}ms</span>
                    <span>·</span>
                    <span>~{comparison.optimized.tokenCount} tokens</span>
                  </div>
                </div>
                <div className="p-4 flex-1 font-mono text-xs text-stone-800 leading-relaxed overflow-y-auto max-h-[380px] whitespace-pre-wrap select-text">
                  {comparison.optimized.output || '(Model generated empty output)'}
                </div>
              </div>

            </div>

            {/* User Evaluation Guidance & Disclaimer */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-stone-800">
                <HelpCircle className="w-4 h-4 text-stone-500" />
                <span>How to inspect your before-and-after results:</span>
              </div>
              <p>
                {comparison.comparison.observation}
              </p>
              <p className="text-stone-500 text-[11px] pt-1">
                {comparison.disclaimer}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
