"""
Pydantic schemas for Promptora API request and response validation.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field

# Optimization schemas
class OptimizeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=25000, description="The original prompt to optimize")
    strength: Literal["light", "balanced", "aggressive"] = Field(
        default="balanced", description="Optimization compression level"
    )
    preserve_formatting: bool = Field(
        default=True, description="Strictly preserve markdown formatting, schemas, and code blocks"
    )
    custom_instructions: Optional[str] = Field(
        default=None, max_length=1000, description="Optional extra optimization instructions"
    )
    model: Optional[str] = Field(default=None, description="Ollama model override")
    ollama_url: Optional[str] = Field(default=None, description="Ollama endpoint override")

class MetricsData(BaseModel):
    original_tokens: int
    optimized_tokens: int
    tokens_saved: int
    reduction_percentage: float
    original_characters: int
    optimized_characters: int
    original_words: int
    optimized_words: int
    execution_time_ms: int
    token_estimation_method: str
    model_used: str

class OptimizeResponse(BaseModel):
    id: str
    optimized_prompt: str
    metrics: MetricsData

# Evaluation schemas (Meaning Preservation Check)
class EvaluateRequest(BaseModel):
    original_prompt: str = Field(..., min_length=1, description="Original prompt text")
    optimized_prompt: str = Field(..., min_length=1, description="Optimized prompt text")
    model: Optional[str] = Field(default=None, description="Ollama model override")
    ollama_url: Optional[str] = Field(default=None, description="Ollama endpoint override")

class RequirementItem(BaseModel):
    id: str
    category: Literal["instruction", "constraint", "format", "role", "safety", "parameter"]
    original_requirement: str
    status: Literal["preserved", "possibly_changed", "missing"]
    notes: str

class CountsData(BaseModel):
    total: int
    preserved: int
    possibly_changed: int
    missing: int

class EvaluateResponse(BaseModel):
    summary: str
    overall_status: Literal["preserved", "partially_preserved", "at_risk"]
    confidence_score: int
    counts: CountsData
    requirements: list[RequirementItem]
    recommendations: list[str]
    disclaimer: str

# Comparison schemas (Before-and-after response testing)
class CompareRequest(BaseModel):
    original_prompt: str = Field(..., min_length=1, description="Original prompt text")
    optimized_prompt: str = Field(..., min_length=1, description="Optimized prompt text")
    model: Optional[str] = Field(default=None, description="Ollama model override")
    ollama_url: Optional[str] = Field(default=None, description="Ollama endpoint override")
    temperature: float = Field(default=0.7, ge=0.0, le=1.5)

class ResponseRun(BaseModel):
    output: str
    duration_ms: int
    token_count: int

class ComparisonSummary(BaseModel):
    speed_diff_ms: int
    response_token_diff: int
    observation: str

class CompareResponse(BaseModel):
    model_used: str
    temperature: float
    original: ResponseRun
    optimized: ResponseRun
    comparison: ComparisonSummary
    disclaimer: str

# Health & Model schemas
class HealthResponse(BaseModel):
    status: Literal["online", "offline", "error"]
    ollama_base_url: str
    configured_model: str
    model_installed: bool
    available_models: list[str]
    message: str
    error: Optional[str] = None

class ModelItem(BaseModel):
    name: str
    size: int
    modified_at: str

class ModelListResponse(BaseModel):
    models: list[ModelItem]

class HistoryItem(BaseModel):
    id: str
    timestamp: str
    model: str
    strength: str
    original_prompt: str
    optimized_prompt: str
    original_tokens: int
    optimized_tokens: int
    reduction_percentage: float
    execution_time_ms: int
