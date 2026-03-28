import os
import time
from dataclasses import dataclass

import structlog

from app.domain.errors import LLMConfigError, LLMError

logger = structlog.get_logger()


@dataclass
class LLMResponse:
    raw_text: str
    model: str
    tokens_used: int
    latency_ms: int
    cost_cents: float


# Cost per 1K tokens (approximate)
COST_MAP = {
    "gpt-4o": {"input": 0.25, "output": 1.0},
    "gpt-4o-mini": {"input": 0.015, "output": 0.06},
    "claude-sonnet-4-20250514": {"input": 0.3, "output": 1.5},
}


class LLMService:
    """Abstracts LLM provider calls (OpenAI/Anthropic) with retry and logging."""

    def __init__(self):
        self.provider = os.getenv("ECHOLOG_LLM_PROVIDER", "openai")
        self._validate_config()

    def _validate_config(self) -> None:
        if self.provider == "openai":
            key = os.getenv("OPENAI_API_KEY")
            if not key or key == "your-key-here":
                raise LLMConfigError(
                    "OPENAI_API_KEY not set in .env — add your API key and restart the server"
                )
        elif self.provider == "anthropic":
            key = os.getenv("ANTHROPIC_API_KEY")
            if not key or key == "your-key-here":
                raise LLMConfigError(
                    "ANTHROPIC_API_KEY not set in .env — add your API key and restart the server"
                )
        else:
            raise LLMConfigError(
                f"Unknown LLM provider: {self.provider}. "
                "Set ECHOLOG_LLM_PROVIDER to 'openai' or 'anthropic'"
            )

    def call(self, system_prompt: str, user_content: str) -> LLMResponse:
        start = time.perf_counter()
        max_retries = 1

        for attempt in range(max_retries + 1):
            try:
                if self.provider == "openai":
                    return self._call_openai(system_prompt, user_content, start)
                else:
                    return self._call_anthropic(system_prompt, user_content, start)
            except LLMError:
                raise
            except Exception as e:
                if attempt < max_retries and _is_retryable(e):
                    wait = 2**attempt
                    logger.warning(
                        "llm_retry",
                        attempt=attempt + 1,
                        wait_seconds=wait,
                        error=str(e),
                    )
                    time.sleep(wait)
                    continue
                raise LLMError(f"LLM call failed: {e}", provider=self.provider) from e

        raise LLMError("LLM call failed after retries", provider=self.provider)

    def _call_openai(self, system_prompt: str, user_content: str, start: float) -> LLMResponse:
        from openai import OpenAI

        client = OpenAI(timeout=30.0)
        model = os.getenv("OPENAI_MODEL", "gpt-4o")

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        raw_text = response.choices[0].message.content or ""
        tokens_used = response.usage.total_tokens if response.usage else 0
        prompt_tokens = response.usage.prompt_tokens if response.usage else 0
        completion_tokens = response.usage.completion_tokens if response.usage else 0
        latency_ms = round((time.perf_counter() - start) * 1000)
        cost_cents = _calculate_cost(model, prompt_tokens, completion_tokens)

        logger.info(
            "llm_call_completed",
            provider="openai",
            model=model,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            cost_cents=cost_cents,
        )

        return LLMResponse(
            raw_text=raw_text,
            model=model,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            cost_cents=cost_cents,
        )

    def _call_anthropic(self, system_prompt: str, user_content: str, start: float) -> LLMResponse:
        from anthropic import Anthropic

        client = Anthropic(timeout=30.0)
        model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

        response = client.messages.create(
            model=model,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}],
        )

        raw_text = response.content[0].text if response.content else ""
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        tokens_used = input_tokens + output_tokens
        latency_ms = round((time.perf_counter() - start) * 1000)
        cost_cents = _calculate_cost(model, input_tokens, output_tokens)

        logger.info(
            "llm_call_completed",
            provider="anthropic",
            model=model,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            cost_cents=cost_cents,
        )

        return LLMResponse(
            raw_text=raw_text,
            model=model,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            cost_cents=cost_cents,
        )


def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    costs = COST_MAP.get(model, {"input": 0.25, "output": 1.0})
    return round(
        (input_tokens / 1000 * costs["input"] + output_tokens / 1000 * costs["output"]),
        4,
    )


def _is_retryable(error: Exception) -> bool:
    error_str = str(error).lower()
    return any(code in error_str for code in ["500", "502", "503", "529", "overloaded"])
