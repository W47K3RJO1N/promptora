"""
Main FastAPI Application for Promptora.
Open-Source AI Prompt Optimizer powered by Ollama.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
import httpx

from backend.config import settings
from backend.schemas import (
    OptimizeRequest, OptimizeResponse,
    EvaluateRequest, EvaluateResponse,
    CompareRequest, CompareResponse,
    HealthResponse, ModelListResponse, ModelItem,
    HistoryItem
)
from backend.services.ollama_client import OllamaClient
from backend.services.optimizer import optimize_prompt
from backend.services.evaluator import evaluate_preservation
from backend.services.comparator import compare_prompt_responses

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Promptora - Open-Source AI Prompt Optimizer"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history cache
history_cache: list[HistoryItem] = []

@app.get("/api/health", response_model=HealthResponse)
async def get_health(
    ollama_url: Optional[str] = Query(None),
    model: Optional[str] = Query(None)
):
    """Checks whether the backend and Ollama are available, reporting model readiness."""
    client = OllamaClient(base_url=ollama_url)
    health = await client.check_health(configured_model=model)
    return HealthResponse(**health)

@app.get("/api/models", response_model=ModelListResponse)
async def get_models(ollama_url: Optional[str] = Query(None)):
    """List locally available Ollama models."""
    client = OllamaClient(base_url=ollama_url)
    try:
        raw_models = await client.list_models()
        items = [
            ModelItem(
                name=m.get("name") or m.get("model", "unknown"),
                size=m.get("size", 0),
                modified_at=m.get("modified_at", ""),
            )
            for m in raw_models
        ]
        return ModelListResponse(models=items)
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot connect to local Ollama instance. Run `ollama serve`."
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@app.post("/api/optimize", response_model=OptimizeResponse)
async def post_optimize(req: OptimizeRequest):
    """Optimizes a prompt using the configured local Ollama model."""
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt cannot be empty.")

    target_model = req.model or settings.default_model
    client = OllamaClient(base_url=req.ollama_url)

    try:
        response = await optimize_prompt(
            client=client,
            prompt=req.prompt,
            model=target_model,
            strength=req.strength,
            preserve_formatting=req.preserve_formatting,
            custom_instructions=req.custom_instructions,
        )

        # Store in local history
        history_item = HistoryItem(
            id=response.id,
            timestamp=response.id,
            model=target_model,
            strength=req.strength,
            original_prompt=req.prompt,
            optimized_prompt=response.optimized_prompt,
            original_tokens=response.metrics.original_tokens,
            optimized_tokens=response.metrics.optimized_tokens,
            reduction_percentage=response.metrics.reduction_percentage,
            execution_time_ms=response.metrics.execution_time_ms,
        )
        history_cache.insert(0, history_item)
        if len(history_cache) > 50:
            history_cache.pop()

        return response
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot reach Ollama at {client.base_url}. Run `ollama serve` or check host settings."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Ollama request timed out. Model may still be loading into GPU/CPU memory."
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Optimization failed: {str(e)}")

@app.post("/api/evaluate", response_model=EvaluateResponse)
async def post_evaluate(req: EvaluateRequest):
    """Analyzes requirement preservation between original and optimized prompts."""
    target_model = req.model or settings.default_model
    client = OllamaClient(base_url=req.ollama_url)
    try:
        return await evaluate_preservation(
            client=client,
            original_prompt=req.original_prompt,
            optimized_prompt=req.optimized_prompt,
            model=target_model,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Preservation analysis failed: {str(e)}")

@app.post("/api/compare", response_model=CompareResponse)
async def post_compare(req: CompareRequest):
    """Executes both original and optimized prompts through the local model for side-by-side verification."""
    target_model = req.model or settings.default_model
    client = OllamaClient(base_url=req.ollama_url)
    try:
        return await compare_prompt_responses(
            client=client,
            original_prompt=req.original_prompt,
            optimized_prompt=req.optimized_prompt,
            model=target_model,
            temperature=req.temperature,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Comparison test failed: {str(e)}")

@app.get("/api/history")
async def get_history():
    """Returns recent optimization history."""
    return {"history": history_cache}

@app.delete("/api/history/{item_id}")
async def delete_history_item(item_id: str):
    """Deletes an item from history."""
    global history_cache
    history_cache = [item for item in history_cache if item.id != item_id]
    return {"success": True, "message": "History item removed."}

@app.delete("/api/history")
async def clear_history():
    """Clears all history."""
    global history_cache
    history_cache.clear()
    return {"success": True, "message": "All history cleared."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
