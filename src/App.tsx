import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PromptWorkspace } from './components/PromptWorkspace';
import { MetricsDashboard } from './components/MetricsDashboard';
import { MeaningPreservationCheck } from './components/MeaningPreservationCheck';
import { ResponseTesting } from './components/ResponseTesting';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { PromptoraApi } from './services/api';
import {
  OptimizationResult,
  OptimizationStrength,
  PreservationEvaluation,
  ComparisonResult,
  OllamaHealth,
  HistoryItem,
  SamplePrompt,
} from './types';
import samplePromptsData from '../examples/sample_prompts.json';

export default function App() {
  // Navigation & section view
  const [activeSection, setActiveSection] = useState<'workspace' | 'preservation' | 'comparison'>('workspace');

  // Core Prompt State
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
  const [strength, setStrength] = useState<OptimizationStrength>('balanced');
  const [preserveFormatting, setPreserveFormatting] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Results & Operations
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  // Preservation Check State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [preservationResult, setPreservationResult] = useState<PreservationEvaluation | null>(null);

  // Before & After Response Testing State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // Ollama Connection & Settings State
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
  const [currentModel, setCurrentModel] = useState<string>('gemma3:4b');
  const [health, setHealth] = useState<OllamaHealth>({
    status: 'checking',
    ollamaBaseUrl: 'http://localhost:11434',
    configuredModel: 'gemma3:4b',
    modelInstalled: false,
    availableModels: [],
    message: 'Probing local Ollama connection...',
  });

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Sample prompts
  const samplePrompts = samplePromptsData as SamplePrompt[];

  // Health check prober
  const checkHealth = useCallback(async (url?: string, model?: string) => {
    setHealth((prev) => ({ ...prev, status: 'checking', message: 'Checking Ollama...' }));
    const h = await PromptoraApi.checkHealth(url || ollamaUrl, model || currentModel);
    setHealth(h);
    if (h.availableModels && h.availableModels.length > 0 && !h.availableModels.includes(currentModel)) {
      if (h.availableModels.some((m) => m.startsWith('gemma3'))) {
        const found = h.availableModels.find((m) => m.startsWith('gemma3'))!;
        setCurrentModel(found);
      }
    }
  }, [ollamaUrl, currentModel]);

  // Load history on mount
  const refreshHistory = useCallback(async () => {
    const list = await PromptoraApi.getHistory();
    setHistory(list);
  }, []);

  useEffect(() => {
    checkHealth();
    refreshHistory();

    // Pre-populate with first sample prompt for instant exploration
    if (samplePrompts.length > 0 && !originalPrompt) {
      setOriginalPrompt(samplePrompts[0].prompt);
    }
  }, []);

  // Main Optimization Handler
  const handleOptimize = async () => {
    if (!originalPrompt.trim()) return;

    setIsOptimizing(true);
    setOptimizationError(null);
    setPreservationResult(null);
    setComparisonResult(null);

    try {
      const res = await PromptoraApi.optimizePrompt({
        prompt: originalPrompt,
        strength,
        preserveFormatting,
        customInstructions: customInstructions.trim() || undefined,
        model: currentModel,
        ollamaUrl,
      });

      setOptimizationResult(res);
      setOptimizedPrompt(res.optimizedPrompt);
      refreshHistory();
    } catch (err: any) {
      console.error('Optimization error:', err);
      setOptimizationError(err.message || 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Run Preservation Check Handler
  const handleEvaluatePreservation = async () => {
    if (!originalPrompt || !optimizedPrompt) return;

    setIsEvaluating(true);
    try {
      const evalData = await PromptoraApi.evaluatePreservation({
        originalPrompt,
        optimizedPrompt,
        model: currentModel,
        ollamaUrl,
      });
      setPreservationResult(evalData);
      setActiveSection('preservation');
    } catch (err: any) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Regenerate with Stricter Constraints
  const handleRegenerateStricter = () => {
    setStrength('light');
    setPreserveFormatting(true);
    setCustomInstructions('Strictly preserve all constraints, entities, and requirements without omitting anything.');
    setActiveSection('workspace');
    setTimeout(() => {
      handleOptimize();
    }, 100);
  };

  // Run Before & After Response Test Handler
  const handleRunComparison = async (temperature: number) => {
    if (!originalPrompt || !optimizedPrompt) return;

    setIsComparing(true);
    try {
      const comp = await PromptoraApi.compareResponses({
        originalPrompt,
        optimizedPrompt,
        model: currentModel,
        ollamaUrl,
        temperature,
      });
      setComparisonResult(comp);
      setActiveSection('comparison');
    } catch (err: any) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  // History Actions
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setOriginalPrompt(item.originalPrompt);
    setOptimizedPrompt(item.optimizedPrompt);
    setStrength(item.strength);
    setCurrentModel(item.model);
    setOptimizationResult({
      id: item.id,
      optimizedPrompt: item.optimizedPrompt,
      metrics: {
        originalTokens: item.originalTokens,
        optimizedTokens: item.optimizedTokens,
        tokensSaved: item.originalTokens - item.optimizedTokens,
        reductionPercentage: item.reductionPercentage,
        originalCharacters: item.originalPrompt.length,
        optimizedCharacters: item.optimizedPrompt.length,
        originalWords: item.originalPrompt.trim().split(/\s+/).length,
        optimizedWords: item.optimizedPrompt.trim().split(/\s+/).length,
        executionTimeMs: item.executionTimeMs,
        tokenEstimationMethod: 'Gemma-compatible BPE tokenizer estimate',
        modelUsed: item.model,
      },
    });
    setIsHistoryOpen(false);
    setActiveSection('workspace');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await PromptoraApi.deleteHistoryItem(id);
    refreshHistory();
  };

  const handleClearHistory = async () => {
    await PromptoraApi.clearHistory();
    refreshHistory();
  };

  const handleScrollToWorkspace = () => {
    setActiveSection('workspace');
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadRandomExample = () => {
    const randomIdx = Math.floor(Math.random() * samplePrompts.length);
    setOriginalPrompt(samplePrompts[randomIdx].prompt);
    setOptimizedPrompt('');
    setOptimizationResult(null);
    setPreservationResult(null);
    setComparisonResult(null);
    handleScrollToWorkspace();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-stone-900 selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Top Bar Contract (1-line Brand wordmark, nav links, status) */}
      <Header
        health={health}
        onRefreshHealth={() => checkHealth()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        historyCount={history.length}
      />

      {/* Hero Section */}
      <Hero
        onLoadExample={handleLoadRandomExample}
        onScrollToWorkspace={handleScrollToWorkspace}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        
        {/* Workspace View */}
        {activeSection === 'workspace' && (
          <>
            <PromptWorkspace
              originalPrompt={originalPrompt}
              setOriginalPrompt={setOriginalPrompt}
              optimizedPrompt={optimizedPrompt}
              setOptimizedPrompt={setOptimizedPrompt}
              strength={strength}
              setStrength={setStrength}
              preserveFormatting={preserveFormatting}
              setPreserveFormatting={setPreserveFormatting}
              customInstructions={customInstructions}
              setCustomInstructions={setCustomInstructions}
              isOptimizing={isOptimizing}
              onOptimize={handleOptimize}
              result={optimizationResult}
              error={optimizationError}
              samplePrompts={samplePrompts}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Metrics Dashboard */}
            {optimizationResult && (
              <MetricsDashboard metrics={optimizationResult.metrics} />
            )}

            {/* In-page teaser cards leading to signature features */}
            {optimizationResult && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-stone-200 rounded-xl flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                        Signature Feature 1
                      </span>
                      <h4 className="text-base font-display font-semibold text-stone-900 mt-1">
                        Meaning & Constraint Preservation Audit
                      </h4>
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                        Verify that no critical variable, format constraint, or negative condition was dropped during token compression.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection('preservation');
                        if (!preservationResult) handleEvaluatePreservation();
                      }}
                      className="mt-4 px-3.5 py-2 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200/80 rounded-lg transition-colors self-start"
                    >
                      {preservationResult ? 'View Audit Checklist →' : 'Run Preservation Audit →'}
                    </button>
                  </div>

                  <div className="p-5 bg-white border border-stone-200 rounded-xl flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                        Signature Feature 2
                      </span>
                      <h4 className="text-base font-display font-semibold text-stone-900 mt-1">
                        Before & After Output Testing
                      </h4>
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                        Run both prompt versions through your local Ollama model under identical parameters to compare real responses side-by-side.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('comparison')}
                      className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors self-start shadow-xs"
                    >
                      {comparisonResult ? 'View Output Comparison →' : 'Launch Response Testing →'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Meaning Preservation Audit View */}
        {activeSection === 'preservation' && (
          <MeaningPreservationCheck
            evaluation={preservationResult}
            isLoading={isEvaluating}
            onEvaluate={handleEvaluatePreservation}
            onRegenerateStricter={handleRegenerateStricter}
            canEvaluate={!!originalPrompt && !!optimizedPrompt}
          />
        )}

        {/* Response Testing View */}
        {activeSection === 'comparison' && (
          <ResponseTesting
            comparison={comparisonResult}
            isLoading={isComparing}
            onRunTest={handleRunComparison}
            canTest={!!originalPrompt && !!optimizedPrompt}
            model={currentModel}
          />
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        health={health}
        onRefreshHealth={() => checkHealth()}
        currentModel={currentModel}
        onSelectModel={(m) => {
          setCurrentModel(m);
          checkHealth(ollamaUrl, m);
        }}
        ollamaUrl={ollamaUrl}
        ollamaUrlLocked={import.meta.env.PROD}
        onUpdateOllamaUrl={(u) => {
          setOllamaUrl(u);
          checkHealth(u, currentModel);
        }}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      {/* Minimal Open-Source Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-800">Promptora</span>
            <span>·</span>
            <span>Open-Source AI Prompt Optimizer</span>
            <span>·</span>
            <span>MIT Licensed</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <span>Powered by Ollama</span>
            <span>·</span>
            <span>Default: Gemma 3: 4B</span>
            <span>·</span>
            <a
              href="https://github.com/tokenwise/tokenwise"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-900 transition-colors underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
