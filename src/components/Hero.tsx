import React from 'react';
import { Sparkles, Terminal, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onLoadExample: () => void;
  onScrollToWorkspace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoadExample, onScrollToWorkspace }) => {
  const isHostedDeployment = import.meta.env.VITE_DEPLOYMENT_MODE === 'hosted';

  return (
    <section className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-stone-200/60 bg-gradient-to-b from-[#F2F7F2]/50 to-[#F8FAF7]">
      <div className="max-w-5xl mx-auto">
        
        {/* Unboxed Metadata Line with typographic separators */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800 mb-3 tracking-wide">
          <span>{isHostedDeployment ? 'Hosted Ollama Inference' : 'Local Ollama Inference'}</span>
          <span aria-hidden="true" className="text-emerald-400">·</span>
          <span>Gemma 3: 4B Engine</span>
          <span aria-hidden="true" className="text-emerald-400">·</span>
          <span>{isHostedDeployment ? 'Authenticated Hosted API' : 'Zero Cloud Telemetry'}</span>
          <span aria-hidden="true" className="text-emerald-400">·</span>
          <span>Open Source (MIT)</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-bold text-stone-900 tracking-tight leading-[1.15]">
              Say more with less.
            </h1>
            <p className="mt-2 text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
              Trim conversational noise, repetition, and fluff from your AI prompts.
              Preserve 100% of your constraints, schemas, and deliverables with local model verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLoadExample}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200/80 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Load Sample Prompt</span>
            </button>
            <button
              onClick={onScrollToWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <span>Jump to Optimizer</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 pt-5 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Measurable Savings</span>
              <p className="text-stone-500 mt-0.5">Calculated token reductions using Gemma BPE tokenization.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Meaning Preservation Check</span>
              <p className="text-stone-500 mt-0.5">Automated checklist auditing preserved vs missing constraints.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Dual Response Testing</span>
              <p className="text-stone-500 mt-0.5">Test real model outputs before and after compression side-by-side.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
