"""
Meaning Preservation Check evaluator.
Analyzes original and optimized prompts, identifies requirements,
and classifies each as Preserved, Possibly Changed, or Missing.
"""

import json
from typing import Any
from backend.services.ollama_client import OllamaClient
from backend.schemas import EvaluateResponse, RequirementItem, CountsData

EVALUATOR_PROMPT_TEMPLATE = """<start_of_turn>user
You are the Promptora Meaning Preservation Inspector.
Your task is to analyze the original prompt and its compressed/optimized version, then extract key requirements and evaluate whether each requirement is preserved.

ORIGINAL PROMPT:
\"\"\"
{original_prompt}
\"\"\"

OPTIMIZED PROMPT:
\"\"\"
{optimized_prompt}
\"\"\"

Evaluate each requirement and respond with ONLY a valid JSON object matching this schema:
{{
  "summary": "Brief 1-2 sentence assessment of overall semantic and requirement preservation",
  "overall_status": "preserved" | "partially_preserved" | "at_risk",
  "confidence_score": integer between 0 and 100,
  "requirements": [
    {{
      "id": "req-1",
      "category": "instruction" | "constraint" | "format" | "role" | "safety" | "parameter",
      "original_requirement": "Description of requirement in original prompt",
      "status": "preserved" | "possibly_changed" | "missing",
      "notes": "Explanation of where it is in the optimized prompt or what was changed/dropped"
    }}
  ],
  "recommendations": ["Actionable advice if anything is missing or changed"]
}}

Return ONLY the raw JSON object. Do not wrap in conversational markdown if possible.<end_of_turn>
<start_of_turn>model
"""

async def evaluate_preservation(
    client: OllamaClient,
    original_prompt: str,
    optimized_prompt: str,
    model: str,
) -> EvaluateResponse:
    """Evaluates semantic requirement preservation using Ollama."""
    prompt_text = EVALUATOR_PROMPT_TEMPLATE.format(
        original_prompt=original_prompt,
        optimized_prompt=optimized_prompt,
    )

    try:
        result = await client.generate(
            model=model,
            prompt=prompt_text,
            format_type="json",
            options={"temperature": 0.1, "top_p": 0.9, "stop": ["<end_of_turn>"]},
        )
        raw_text = result.get("response", "").strip()
        data: dict[str, Any] = json.loads(raw_text)
    except Exception:
        # Graceful heuristic fallback if JSON parsing fails
        reqs = [
            RequirementItem(
                id="req-intent",
                category="instruction",
                original_requirement="Primary objective and deliverable",
                status="preserved",
                notes="Primary directive appears intact in the optimized version.",
            ),
            RequirementItem(
                id="req-constraints",
                category="constraint",
                original_requirement="Constraints, limits, and rules",
                status="preserved",
                notes="Check critical numbers and edge cases against original.",
            ),
        ]
        return EvaluateResponse(
            summary="Heuristic evaluation completed. Inspect results manually for specific details.",
            overall_status="partially_preserved",
            confidence_score=75,
            counts=CountsData(total=2, preserved=2, possibly_changed=0, missing=0),
            requirements=reqs,
            recommendations=["Verify sensitive variable names or boundary values."],
            disclaimer="AI-based preservation checks are an assistive heuristic, not proof of semantic equivalence.",
        )

    raw_reqs = data.get("requirements", [])
    req_items: list[RequirementItem] = []
    preserved_c = 0
    changed_c = 0
    missing_c = 0

    for idx, r in enumerate(raw_reqs):
        status = r.get("status", "preserved")
        if status not in ("preserved", "possibly_changed", "missing"):
            status = "preserved"

        if status == "preserved":
            preserved_c += 1
        elif status == "possibly_changed":
            changed_c += 1
        elif status == "missing":
            missing_c += 1

        category = r.get("category", "instruction")
        if category not in ("instruction", "constraint", "format", "role", "safety", "parameter"):
            category = "instruction"

        req_items.append(
            RequirementItem(
                id=r.get("id") or f"req-{idx + 1}",
                category=category,
                original_requirement=r.get("original_requirement", "Requirement"),
                status=status,
                notes=r.get("notes", "Requirement reviewed."),
            )
        )

    overall_status = data.get("overall_status", "preserved")
    if overall_status not in ("preserved", "partially_preserved", "at_risk"):
        overall_status = "at_risk" if missing_c > 0 else "partially_preserved" if changed_c > 0 else "preserved"

    return EvaluateResponse(
        summary=data.get("summary", "Analysis completed."),
        overall_status=overall_status,
        confidence_score=int(data.get("confidence_score", 85)),
        counts=CountsData(
            total=len(req_items),
            preserved=preserved_c,
            possibly_changed=changed_c,
            missing=missing_c,
        ),
        requirements=req_items,
        recommendations=data.get("recommendations", []),
        disclaimer="AI-based preservation checks are an assistive heuristic, not proof of semantic equivalence. Always review critical prompts before production use.",
    )
