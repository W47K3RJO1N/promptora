"""
Automated unit and integration tests for Promptora backend.
Uses mocked Ollama responses to test all edge cases without downloading weights.
"""

import pytest
from unittest.mock import AsyncMock, patch
import httpx

from backend.services.tokenizer import count_tokens, calculate_reduction_percentage
from backend.services.ollama_client import OllamaClient
from backend.services.optimizer import optimize_prompt, build_optimizer_prompt
from backend.services.evaluator import evaluate_preservation
from backend.services.comparator import compare_prompt_responses

# 1. Tokenizer & Reduction Percentage Tests
def test_reduction_percentage_calculation():
    # Standard reduction: 100 -> 60 = 40% reduction
    reduction = calculate_reduction_percentage(100, 60)
    assert reduction == 40.0

    # Half reduction: 200 -> 100 = 50% reduction
    assert calculate_reduction_percentage(200, 100) == 50.0

    # Zero tokens original handles safely
    assert calculate_reduction_percentage(0, 0) == 0.0

    # Negative savings (longer prompt)
    negative_savings = calculate_reduction_percentage(50, 75)
    assert negative_savings == -50.0

def test_token_counting():
    empty_stats = count_tokens("")
    assert empty_stats["count"] == 0
    assert empty_stats["character_count"] == 0

    prompt = "You are an expert Python developer. Write a clean FastAPI endpoint."
    stats = count_tokens(prompt)
    assert stats["count"] > 5
    assert stats["word_count"] == 11
    assert stats["character_count"] == len(prompt)

# 2. Optimization Prompt Builder Tests
def test_build_optimizer_prompt_modes():
    light_prompt, t_light = build_optimizer_prompt("Test prompt", "light", True)
    assert "LIGHT" in light_prompt
    assert t_light == 0.15

    agg_prompt, t_agg = build_optimizer_prompt("Test prompt", "aggressive", False)
    assert "AGGRESSIVE" in agg_prompt
    assert t_agg == 0.3

# 3. Successful Optimization with Mocked Ollama
@pytest.mark.asyncio
async def test_successful_optimization():
    client = OllamaClient()
    mock_response = {
        "response": "Expert developer: Create clean FastAPI endpoint with pydantic validation.",
        "done": True,
    }

    with patch.object(client, "generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = mock_response
        result = await optimize_prompt(
            client=client,
            prompt="I really want you to please act as an expert developer and can you kindly write a clean FastAPI endpoint with pydantic validation please?",
            model="gemma3:4b",
            strength="balanced",
            preserve_formatting=True,
        )

        assert result.optimized_prompt == mock_response["response"]
        assert result.metrics.original_tokens > result.metrics.optimized_tokens
        assert result.metrics.tokens_saved > 0
        assert result.metrics.reduction_percentage > 0

# 4. Empty and Invalid Model Response Handling
@pytest.mark.asyncio
async def test_empty_model_response():
    client = OllamaClient()
    with patch.object(client, "generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = {"response": "  "}
        with pytest.raises(ValueError) as excinfo:
            await optimize_prompt(
                client=client,
                prompt="Some prompt",
                model="gemma3:4b",
            )
        assert "empty response" in str(excinfo.value)

# 5. Ollama Unavailable (ConnectError)
@pytest.mark.asyncio
async def test_ollama_unavailable():
    client = OllamaClient()
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused")):
        health = await client.check_health()
        assert health["status"] == "offline"
        assert "Run `ollama serve`" in health["message"]

# 6. Model Missing Detection
@pytest.mark.asyncio
async def test_model_missing():
    client = OllamaClient()
    mock_tags = {
        "models": [
            {"name": "llama3:latest"},
            {"name": "mistral:7b"}
        ]
    }
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(200, json=mock_tags)

        health = await client.check_health(configured_model="gemma3:4b")
        assert health["status"] == "online"
        assert health["model_installed"] is False
        assert "not downloaded" in health["message"]

# 7. Meaning Preservation Check Evaluation Test
@pytest.mark.asyncio
async def test_evaluate_preservation():
    client = OllamaClient()
    mock_eval = {
        "response": '{"summary": "All core constraints preserved.", "overall_status": "preserved", "confidence_score": 95, "requirements": [{"id": "req-1", "category": "instruction", "original_requirement": "Return JSON", "status": "preserved", "notes": "Explicitly requested"}], "recommendations": []}'
    }
    with patch.object(client, "generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = mock_eval
        res = await evaluate_preservation(
            client=client,
            original_prompt="Return JSON only.",
            optimized_prompt="Output strict JSON.",
            model="gemma3:4b",
        )
        assert res.overall_status == "preserved"
        assert res.counts.preserved == 1
        assert res.counts.missing == 0
        assert len(res.requirements) == 1

# 8. Comparison Testing
@pytest.mark.asyncio
async def test_compare_prompt_responses():
    client = OllamaClient()
    with patch.object(client, "generate", new_callable=AsyncMock) as mock_generate:
        mock_generate.side_effect = [
            {"response": "Output from original prompt with verbose reply."},
            {"response": "Output from concise optimized prompt."}
        ]
        res = await compare_prompt_responses(
            client=client,
            original_prompt="Original prompt text",
            optimized_prompt="Concise prompt text",
            model="gemma3:4b",
        )
        assert res.original.output == "Output from original prompt with verbose reply."
        assert res.optimized.output == "Output from concise optimized prompt."
        assert res.comparison.observation is not None
