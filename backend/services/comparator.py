"""
Before-and-after response comparator.
Runs both original and optimized prompts through the same local model,
measuring execution duration, response tokens, and generating objective comparisons.
"""

import time
from backend.services.ollama_client import OllamaClient
from backend.services.tokenizer import count_tokens
from backend.schemas import CompareResponse, ResponseRun, ComparisonSummary

async def compare_prompt_responses(
    client: OllamaClient,
    original_prompt: str,
    optimized_prompt: str,
    model: str,
    temperature: float = 0.7,
) -> CompareResponse:
    """Executes original and optimized prompts and returns side-by-side results."""
    # Run original prompt
    t0_orig = time.time()
    orig_res = await client.generate(
        model=model,
        prompt=original_prompt,
        options={"temperature": temperature, "top_p": 0.9},
    )
    orig_duration_ms = int((time.time() - t0_orig) * 1000)
    orig_output = orig_res.get("response", "").strip()
    orig_tokens = count_tokens(orig_output)["count"]

    # Run optimized prompt
    t0_opt = time.time()
    opt_res = await client.generate(
        model=model,
        prompt=optimized_prompt,
        options={"temperature": temperature, "top_p": 0.9},
    )
    opt_duration_ms = int((time.time() - t0_opt) * 1000)
    opt_output = opt_res.get("response", "").strip()
    opt_tokens = count_tokens(opt_output)["count"]

    return CompareResponse(
        model_used=model,
        temperature=temperature,
        original=ResponseRun(
            output=orig_output,
            duration_ms=orig_duration_ms,
            token_count=orig_tokens,
        ),
        optimized=ResponseRun(
            output=opt_output,
            duration_ms=opt_duration_ms,
            token_count=opt_tokens,
        ),
        comparison=ComparisonSummary(
            speed_diff_ms=orig_duration_ms - opt_duration_ms,
            response_token_diff=orig_tokens - opt_tokens,
            observation="Both runs completed using identical local model generation parameters. Review side-by-side to verify quality and constraint satisfaction.",
        ),
        disclaimer="Output comparison is executed live with your local Ollama model. Non-zero temperature may cause natural variations.",
    )
