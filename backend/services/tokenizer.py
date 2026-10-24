"""
Tokenizer service for Promptora.
Computes token counts using a Gemma/SentencePiece compatible BPE approximation,
character counts, word counts, and exact percentage reduction.
"""

import re
from typing import TypedDict

class TokenStats(TypedDict):
    count: int
    character_count: int
    word_count: int
    method: str

def count_tokens(text: str) -> TokenStats:
    """
    Computes token counts for prompt text using a Gemma-compatible BPE approximation.
    Gemma uses a 256k vocabulary SentencePiece BPE tokenizer.
    Returns exact character count, word count, token count, and method indicator.
    """
    if not text or not text.strip():
        return {
            "count": 0,
            "character_count": 0,
            "word_count": 0,
            "method": "Gemma-compatible BPE tokenizer estimate"
        }

    char_count = len(text)
    word_count = len(text.strip().split())

    # Python's standard re supports Unicode-aware character classes via \w,
    # but not the \p{...} property escapes used by some regex engines.
    token_pattern = re.compile(
        r"'s|'t|'re|'ve|'m|'ll|'d|[^\W\d_]+|\d{1,3}|[^\w\s]+|\s+",
        re.UNICODE,
    )

    matches = token_pattern.findall(text)
    token_count = len(matches) if matches else max(1, int(char_count / 3.8))

    # Account for symbols and code blocks that split into discrete sub-tokens
    symbols = len(re.findall(r"[{}\[\]()<>=!+\-*/&|:;,\"\'`~^@#$%\\]", text))
    token_count += int(symbols * 0.25)

    return {
        "count": max(1, token_count),
        "character_count": char_count,
        "word_count": word_count,
        "method": "Gemma-compatible BPE tokenizer estimate"
    }

def calculate_reduction_percentage(original_tokens: int, optimized_tokens: int) -> float:
    """
    Calculates percentage reduction using the exact formula:
    reduction_percentage = ((original_tokens - optimized_tokens) / original_tokens) * 100

    Handles zero-token and empty prompts safely, and supports negative values
    if the optimized prompt is longer.
    """
    if original_tokens <= 0:
        return 0.0

    reduction = ((original_tokens - optimized_tokens) / original_tokens) * 100.0
    return round(reduction, 1)
