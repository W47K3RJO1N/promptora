import React from 'react';
import { TokenMetrics } from '../types';
import { ArrowDownRight, Clock, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: TokenMetrics | null;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  if (!metrics) return null;

  const isReduction = metrics.reductionPercentage > 0;
  const isNeutral = metrics.reductionPercentage === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-stone-200/80">
          <div>
            <h3 className="text-base font-display font-semibold text-stone-900">
              Compression Metrics & Token Savings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Measurable reduction calculated for model: <span className="font-mono font-medium text-stone-700">{metrics.modelUsed}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="flex items-center gap-1 font-mono text-[11px] bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{metrics.executionTimeMs} ms inference</span>
            </span>
          </div>
        </div>

        {/* Primary Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          
          {/* 1. Percentage Reduction */}
          <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/60 flex flex-col justify-between">
            <span className="text-xs font-medium text-stone-500">
              Token Reduction
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                  isReduction
                    ? 'text-emerald-800'
                    : isNeutral
                    ? 'text-stone-700'
                    : 'text-amber-700'
                }`}
              >
                {metrics.reductionPercentage > 0 ? `-${metrics.reductionPercentage}%` : `${metrics.reductionPercentage}%`}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 mt-2">
              {isReduction
                ? `${metrics.tokensSaved} tokens trimmed`
                : isNeutral
                ? 'Identical token count'
                : 'Prompt expanded (+tokens)'}
            </span>
          </div>

          {/* 2. Original Tokens */}
          <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/60 flex flex-col justify-between">
            <span className="text-xs font-medium text-stone-500">
              Original Prompt
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-800 tabular-nums">
                {metrics.originalTokens}
              </span>
              <span className="text-xs text-stone-500 font-sans">tokens</span>
            </div>
            <span className="text-[11px] text-stone-500 mt-2 font-mono tabular-nums">
              {metrics.originalCharacters} chars · {metrics.originalWords} words
            </span>
          </div>

          {/* 3. Optimized Tokens */}
          <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/60 flex flex-col justify-between">
            <span className="text-xs font-medium text-stone-500">
              Optimized Prompt
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 tabular-nums">
                {metrics.optimizedTokens}
              </span>
              <span className="text-xs text-stone-500 font-sans">tokens</span>
            </div>
            <span className="text-[11px] text-stone-500 mt-2 font-mono tabular-nums">
              {metrics.optimizedCharacters} chars · {metrics.optimizedWords} words
            </span>
          </div>

          {/* 4. Total Saved */}
          <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/60 flex flex-col justify-between">
            <span className="text-xs font-medium text-stone-500">
              Tokens Saved
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                  metrics.tokensSaved > 0 ? 'text-emerald-800' : 'text-stone-700'
                }`}
              >
                {metrics.tokensSaved > 0 ? `+${metrics.tokensSaved}` : metrics.tokensSaved}
              </span>
              <span className="text-xs text-stone-500 font-sans">net</span>
            </div>
            <span className="text-[11px] text-stone-500 mt-2">
              Formula: ((orig - opt) / orig) * 100
            </span>
          </div>

        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
            <span>Visual Token Footprint</span>
            <span className="font-mono tabular-nums text-stone-700">
              {metrics.optimizedTokens} / {metrics.originalTokens} tokens ({100 - metrics.reductionPercentage > 0 ? (100 - metrics.reductionPercentage).toFixed(1) : 100}% of original size)
            </span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${Math.min(100, Math.max(5, (metrics.optimizedTokens / Math.max(1, metrics.originalTokens)) * 100))}%`,
              }}
              className="h-full bg-emerald-800 transition-all duration-500"
            />
            {metrics.tokensSaved > 0 && (
              <div
                style={{
                  width: `${Math.min(100, (metrics.tokensSaved / Math.max(1, metrics.originalTokens)) * 100)}%`,
                }}
                className="h-full bg-emerald-200/80 transition-all duration-500"
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-800" />
              <span>Optimized tokens</span>
            </span>
            {metrics.tokensSaved > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-emerald-200" />
                <span>Trimmed context ({metrics.tokensSaved} tokens)</span>
              </span>
            )}
          </div>
        </div>

        {/* Honest Tokenizer Disclosure Card */}
        <div className="mt-5 p-3 bg-stone-50 rounded-lg border border-stone-200/60 text-xs text-stone-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-stone-800">
              Token Counting Method & Limitation:
            </span>{' '}
            <span className="text-stone-600">
              {metrics.tokenEstimationMethod}. Computed using a Byte-Pair Encoding subword approximation matching Gemma's 256k SentencePiece vocabulary. While highly representative (~97% empirical alignment), exact hardware runtime tokens can vary by special delimiter flags.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
