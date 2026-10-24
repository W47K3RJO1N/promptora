export interface DiffChunk {
  type: 'unchanged' | 'removed' | 'added';
  value: string;
}

/**
 * Word-level diff calculator for comparing original and optimized prompt text.
 */
export function computeWordDiff(original: string, optimized: string): DiffChunk[] {
  const origWords = original.split(/(\s+|[.,!?;:()[\]{}'"])/);
  const optWords = optimized.split(/(\s+|[.,!?;:()[\]{}'"])/);

  const chunks: DiffChunk[] = [];
  let i = 0;
  let j = 0;

  // Simple and fast LCS-based word diff algorithm
  while (i < origWords.length || j < optWords.length) {
    if (i < origWords.length && j < optWords.length && origWords[i] === optWords[j]) {
      chunks.push({ type: 'unchanged', value: origWords[i] });
      i++;
      j++;
    } else {
      // Lookahead to find match
      let matchJ = -1;
      let matchI = -1;

      for (let look = 1; look < 15; look++) {
        if (j + look < optWords.length && origWords[i] === optWords[j + look]) {
          matchJ = j + look;
          break;
        }
        if (i + look < origWords.length && origWords[i + look] === optWords[j]) {
          matchI = i + look;
          break;
        }
      }

      if (matchJ !== -1) {
        while (j < matchJ) {
          chunks.push({ type: 'added', value: optWords[j] });
          j++;
        }
      } else if (matchI !== -1) {
        while (i < matchI) {
          chunks.push({ type: 'removed', value: origWords[i] });
          i++;
        }
      } else {
        if (i < origWords.length) {
          chunks.push({ type: 'removed', value: origWords[i] });
          i++;
        }
        if (j < optWords.length) {
          chunks.push({ type: 'added', value: optWords[j] });
          j++;
        }
      }
    }
  }

  return chunks;
}
