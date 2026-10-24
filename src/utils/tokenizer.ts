/**
 * Fast client-side BPE tokenizer estimation matching Gemma 3 SentencePiece profile.
 */
export function estimateTokensClient(text: string): { tokens: number; words: number; chars: number } {
  if (!text || !text.trim()) {
    return { tokens: 0, words: 0, chars: 0 };
  }

  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  // Pattern matching word stems, punctuation, whitespace
  const tokenRegex = /'s|'t|'re|'ve|'m|'ll|'d|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu;
  const matches = text.match(tokenRegex);
  
  let count = matches ? matches.length : Math.ceil(chars / 3.8);
  const symbols = (text.match(/[{}[\]()<>=!+\-*/&|:;,"'`~^@#$%\\]/g) || []).length;
  count += Math.floor(symbols * 0.25);

  return {
    tokens: Math.max(1, count),
    words,
    chars,
  };
}

export function calculatePercentageReduction(original: number, optimized: number): number {
  if (original <= 0) return 0;
  const diff = original - optimized;
  return Number(((diff / original) * 100).toFixed(1));
}
