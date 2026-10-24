import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  HelpCircle,
  RotateCw,
  Search,
  Filter,
  Info,
} from 'lucide-react';
import { PreservationEvaluation, RequirementItem } from '../types';

interface MeaningPreservationCheckProps {
  evaluation: PreservationEvaluation | null;
  isLoading: boolean;
  onEvaluate: () => void;
  onRegenerateStricter: () => void;
  canEvaluate: boolean;
}

export const MeaningPreservationCheck: React.FC<MeaningPreservationCheckProps> = ({
  evaluation,
  isLoading,
  onEvaluate,
  onRegenerateStricter,
  canEvaluate,
}) => {
  const [filter, setFilter] = useState<'all' | 'preserved' | 'possibly_changed' | 'missing'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRequirements = (evaluation?.requirements || []).filter((req) => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    return true;
  });

  const getStatusBadge = (status: RequirementItem['status']) => {
    switch (status) {
      case 'preserved':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preserved</span>
          </span>
        );
      case 'possibly_changed':
        return (
          <span className="inline-flex items-center gap-1 text-amber-800 font-medium text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Possibly Changed</span>
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 text-red-800 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Missing</span>
          </span>
        );
    }
  };

  return (
    <div id="preservation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800" />
              <h3 className="text-lg font-display font-semibold text-stone-900">
                Meaning & Constraint Preservation Audit
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Signature verification pipeline: Audits key requirements, constraints, schemas, and deliverables to ensure nothing essential was dropped during compression.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEvaluate}
              disabled={isLoading || !canEvaluate}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                isLoading || !canEvaluate
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-xs'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing Requirements...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{evaluation ? 'Re-run Audit' : 'Run Preservation Check'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!evaluation && !isLoading && (
          <div className="py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900">
              Audit Not Run Yet
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Once an optimized prompt is generated, run this check to extract individual requirements and confirm they survived compression without alteration.
            </p>
            {canEvaluate && (
              <button
                onClick={onEvaluate}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                Start Preservation Check Now
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-stone-900">
              Extracting and Verifying Requirements
            </span>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Comparing original constraints against the optimized prompt using local model inference...
            </p>
          </div>
        )}

        {evaluation && !isLoading && (
          <div className="mt-6 space-y-6">
            
            {/* Status Summary Banner */}
            <div
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                evaluation.overallStatus === 'preserved'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : evaluation.overallStatus === 'partially_preserved'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                  : 'bg-red-50/60 border-red-200 text-red-950'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Overall Status: {evaluation.overallStatus.replace('_', ' ')}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs font-mono">
                    {evaluation.confidenceScore}% heuristic confidence
                  </span>
                </div>
                <p className="text-sm text-stone-700">
                  {evaluation.summary}
                </p>
              </div>

              {/* Action if items are missing/changed */}
              {(evaluation.counts.missing > 0 || evaluation.counts.possiblyChanged > 0) && (
                <button
                  onClick={onRegenerateStricter}
                  className="px-3.5 py-2 text-xs font-semibold bg-emerald-900 text-white hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                >
                  Regenerate with Stricter Constraints
                </button>
              )}
            </div>

            {/* Counts Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 text-center">
                <span className="text-[11px] font-medium text-stone-500">Total Requirements</span>
                <div className="text-xl font-bold font-mono text-stone-800 mt-1">
                  {evaluation.counts.total}
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 text-center">
                <span className="text-[11px] font-medium text-emerald-800">Preserved</span>
                <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                  {evaluation.counts.preserved}
                </div>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 text-center">
                <span className="text-[11px] font-medium text-amber-800">Possibly Changed</span>
                <div className="text-xl font-bold font-mono text-amber-900 mt-1">
                  {evaluation.counts.possiblyChanged}
                </div>
              </div>
              <div className="p-3 bg-red-50/50 rounded-lg border border-red-200/60 text-center">
                <span className="text-[11px] font-medium text-red-800">Missing</span>
                <div className="text-xl font-bold font-mono text-red-900 mt-1">
                  {evaluation.counts.missing}
                </div>
              </div>
            </div>

            {/* Interactive Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({evaluation.counts.total})
                </button>
                <button
                  onClick={() => setFilter('preserved')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === 'preserved' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Preserved ({evaluation.counts.preserved})
                </button>
                <button
                  onClick={() => setFilter('possibly_changed')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === 'possibly_changed' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Changed ({evaluation.counts.possiblyChanged})
                </button>
                <button
                  onClick={() => setFilter('missing')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filter === 'missing' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Missing ({evaluation.counts.missing})
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-stone-200 rounded-md px-2.5 py-1 text-stone-700 outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="instruction">Instructions</option>
                <option value="constraint">Constraints</option>
                <option value="format">Formats & Schemas</option>
                <option value="role">Roles & Personas</option>
                <option value="safety">Safety Rules</option>
                <option value="parameter">Parameters</option>
              </select>
            </div>

            {/* Requirements Checklist Table */}
            <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-200/80">
              {filteredRequirements.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500">
                  No requirements match the selected filter.
                </div>
              ) : (
                filteredRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                      req.status === 'missing'
                        ? 'bg-red-50/20'
                        : req.status === 'possibly_changed'
                        ? 'bg-amber-50/20'
                        : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-400">
                          {req.id}
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                          {req.category}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-stone-900">
                        {req.originalRequirement}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {req.notes}
                      </p>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Honest Disclaimer */}
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-stone-800">
                  Honest Evaluation Disclaimer:
                </span>{' '}
                <span>
                  {evaluation.disclaimer}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
