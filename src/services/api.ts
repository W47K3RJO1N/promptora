import {
  OptimizationResult,
  OptimizationStrength,
  PreservationEvaluation,
  ComparisonResult,
  OllamaHealth,
  HistoryItem,
} from '../types';

export class PromptoraApi {
  private static authTokenProvider: (() => Promise<string | null>) | null = null;

  static setAuthTokenProvider(provider: () => Promise<string | null>): void {
    PromptoraApi.authTokenProvider = provider;
  }

  private static async request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    const token = await PromptoraApi.authTokenProvider?.();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
  }

  static async checkHealth(ollamaUrl?: string, model?: string): Promise<OllamaHealth> {
    const params = new URLSearchParams();
    if (ollamaUrl) params.append('ollama_url', ollamaUrl);
    if (model) params.append('model', model);

    try {
      const res = await PromptoraApi.request(`/api/health?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        status: 'offline',
        ollamaBaseUrl: ollamaUrl || 'http://localhost:11434',
        configuredModel: model || 'gemma3:4b',
        modelInstalled: false,
        availableModels: [],
        message: 'Cannot reach backend or Ollama.',
        error: err.message,
      };
    }
  }

  static async getModels(ollamaUrl?: string): Promise<string[]> {
    const params = new URLSearchParams();
    if (ollamaUrl) params.append('ollama_url', ollamaUrl);

    try {
      const res = await PromptoraApi.request(`/api/models?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || []).map((m: any) => m.name);
    } catch {
      return [];
    }
  }

  static async optimizePrompt(params: {
    prompt: string;
    strength: OptimizationStrength;
    preserveFormatting: boolean;
    customInstructions?: string;
    model?: string;
    ollamaUrl?: string;
  }): Promise<OptimizationResult> {
    const res = await PromptoraApi.request('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `Optimization failed (HTTP ${res.status})`);
    }

    return await res.json();
  }

  static async evaluatePreservation(params: {
    originalPrompt: string;
    optimizedPrompt: string;
    model?: string;
    ollamaUrl?: string;
  }): Promise<PreservationEvaluation> {
    const res = await PromptoraApi.request('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `Evaluation failed (HTTP ${res.status})`);
    }

    return await res.json();
  }

  static async compareResponses(params: {
    originalPrompt: string;
    optimizedPrompt: string;
    model?: string;
    ollamaUrl?: string;
    temperature?: number;
  }): Promise<ComparisonResult> {
    const res = await PromptoraApi.request('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || `Comparison failed (HTTP ${res.status})`);
    }

    return await res.json();
  }

  static async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await PromptoraApi.request('/api/history');
      if (!res.ok) return [];
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  }

  static async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      const res = await PromptoraApi.request(`/api/history/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async clearHistory(): Promise<boolean> {
    try {
      const res = await PromptoraApi.request('/api/history', { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }
}
