"""
HTTPX client for communicating with local Ollama API instances.
Handles endpoints: /api/tags, /api/generate, /api/show.
"""

from typing import Any, Optional
import httpx
from backend.config import settings

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, timeout: Optional[float] = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.timeout = timeout or settings.timeout_seconds

    async def check_health(self, configured_model: Optional[str] = None) -> dict[str, Any]:
        """Checks if Ollama is accessible and whether the configured model is installed."""
        target_model = configured_model or settings.default_model
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    model_names = [m.get("name") or m.get("model") for m in models if isinstance(m, dict)]
                    installed = any(
                        target_model == name or target_model.startswith(name) or name.startswith(target_model)
                        for name in model_names
                    )
                    return {
                        "status": "online",
                        "ollama_base_url": self.base_url,
                        "configured_model": target_model,
                        "model_installed": installed,
                        "available_models": model_names,
                        "message": f"Ollama is running. Model '{target_model}' is {'ready' if installed else 'not downloaded'}.",
                    }
                return {
                    "status": "error",
                    "ollama_base_url": self.base_url,
                    "configured_model": target_model,
                    "model_installed": False,
                    "available_models": [],
                    "message": f"Ollama returned HTTP status {response.status_code}",
                }
        except httpx.ConnectError:
            return {
                "status": "offline",
                "ollama_base_url": self.base_url,
                "configured_model": target_model,
                "model_installed": False,
                "available_models": [],
                "error": "Cannot connect to local Ollama daemon",
                "message": f"Ollama is unreachable at {self.base_url}. Run `ollama serve` to start.",
            }
        except httpx.TimeoutException:
            return {
                "status": "offline",
                "ollama_base_url": self.base_url,
                "configured_model": target_model,
                "model_installed": False,
                "available_models": [],
                "error": "Connection timed out",
                "message": "Ollama connection timed out. Check system resource usage.",
            }

    async def list_models(self) -> list[dict[str, Any]]:
        """Retrieves list of local models installed in Ollama."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.base_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            return data.get("models", [])

    async def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        options: Optional[dict[str, Any]] = None,
        format_type: Optional[str] = None,
    ) -> dict[str, Any]:
        """Calls /api/generate on Ollama."""
        payload: dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
        }
        if system:
            payload["system"] = system
        if options:
            payload["options"] = options
        if format_type:
            payload["format"] = format_type

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.base_url}/api/generate", json=payload)
            resp.raise_for_status()
            return resp.json()
