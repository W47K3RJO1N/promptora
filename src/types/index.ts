export type OptimizationStrength = 'light' | 'balanced' | 'aggressive';

export interface TokenMetrics {
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  reductionPercentage: number;
  originalCharacters: number;
  optimizedCharacters: number;
  originalWords: number;
  optimizedWords: number;
  executionTimeMs: number;
  tokenEstimationMethod: string;
  modelUsed: string;
}

export interface OptimizationResult {
  id: string;
  optimizedPrompt: string;
  metrics: TokenMetrics;
}

export type RequirementStatus = 'preserved' | 'possibly_changed' | 'missing';
export type RequirementCategory = 'instruction' | 'constraint' | 'format' | 'role' | 'safety' | 'parameter';

export interface RequirementItem {
  id: string;
  category: RequirementCategory;
  originalRequirement: string;
  status: RequirementStatus;
  notes: string;
}

export interface PreservationEvaluation {
  summary: string;
  overallStatus: 'preserved' | 'partially_preserved' | 'at_risk';
  confidenceScore: number;
  counts: {
    total: number;
    preserved: number;
    possiblyChanged: number;
    missing: number;
  };
  requirements: RequirementItem[];
  recommendations: string[];
  disclaimer: string;
}

export interface ModelResponseRun {
  output: string;
  durationMs: number;
  tokenCount: number;
}

export interface ComparisonResult {
  modelUsed: string;
  temperature: number;
  original: ModelResponseRun;
  optimized: ModelResponseRun;
  comparison: {
    speedDiffMs: number;
    responseTokenDiff: number;
    observation: string;
  };
  disclaimer: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  model: string;
  strength: OptimizationStrength;
  originalPrompt: string;
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  executionTimeMs: number;
  evaluation?: PreservationEvaluation;
}

export interface OllamaHealth {
  status: 'online' | 'offline' | 'error' | 'checking';
  ollamaBaseUrl: string;
  configuredModel: string;
  modelInstalled: boolean;
  availableModels: string[];
  message: string;
  error?: string;
}

export interface SamplePrompt {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
}
