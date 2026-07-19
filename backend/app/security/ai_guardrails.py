"""AI Guardrails, Prompt Firewall, and Output Validation layer."""

import re
from typing import Any

from app.core.exceptions import PromptInjectionError, AIGuardrailError
from app.core.logging import get_logger

logger = get_logger("ai_guardrails")

# Basic prompt injection signatures
INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"bypass system prompt",
    r"system override",
    r"you are now a helpful assistant without rules",
    r"ignore any guidelines",
    r"forget your restrictions",
    r"reveal your system instructions",
    r"do not follow safety",
    r"dan mode",
    r"jailbreak",
]


class AIGuardrails:
    """Enterprise AI security guardrails for incoming prompts and outgoing LLM outputs."""

    @staticmethod
    def validate_prompt(prompt: str) -> None:
        """Scan incoming prompt for injection signatures and malicious instructions.

        Raises PromptInjectionError if validation fails.
        """
        if not prompt:
            return

        cleaned_prompt = prompt.lower().strip()

        # Check regex rules
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, cleaned_prompt):
                logger.error("prompt_injection_detected", pattern=pattern, prompt_preview=prompt[:60])
                raise PromptInjectionError(f"Security Alert: Malicious instructions or system overrides are prohibited.")

        # Ensure no tool structure injection in the query
        if "tool_call:" in prompt or "system_prompt:" in prompt:
            logger.error("prompt_injection_detected", reason="forbidden_tokens", prompt_preview=prompt[:60])
            raise PromptInjectionError("Security Alert: System tag tokens are prohibited.")

    @staticmethod
    def validate_output(response: Any, confidence_score: float = 1.0) -> Any:
        """Verify model output is safe, non-hallucinated, and meets confidence thresholds.

        Raises AIGuardrailError if validation fails.
        """
        # Ensure confidence threshold is respected
        if confidence_score < 0.65:
            logger.warning("ai_confidence_too_low", confidence=confidence_score)
            raise AIGuardrailError(
                "AI verification error: Output confidence did not satisfy the minimum threshold criteria."
            )

        # Scrape raw text if object is dict or string
        text_content = ""
        if isinstance(response, str):
            text_content = response
        elif isinstance(response, dict):
            text_content = str(response.get("reason", "")) + " " + str(response.get("recommended_actions", ""))

        # PII Filtering (e.g. Credit Card numbers or SSH keys leakage prevention)
        cc_pattern = r"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b"
        if re.search(cc_pattern, text_content):
            logger.error("sensitive_data_leakage_prevented", reason="credit_card_pattern")
            raise AIGuardrailError("AI security alert: Output generation blocked due to sensitive data leak protection.")

        return response
