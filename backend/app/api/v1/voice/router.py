"""Voice agent / radio commands API router endpoints."""

from typing import Any
from fastapi import APIRouter, Security, UploadFile, File
from app.security.rbac import require_operator

router = APIRouter(tags=["Voice Dispatch Radio"])


@router.post("/transcribe", response_model=dict[str, Any], status_code=210)
async def transcribe_operator_radio_audio(
    file: UploadFile = File(..., description="The WAV or MP3 audio file recording from operator walkie-talkie"),
    current_user: Any = Security(require_operator)
) -> dict[str, Any]:
    """Transcribe operator radio transmission and extract operational intents (requires Operator role)."""
    # Mock voice translation matching Whisper SDK outputs
    filename = file.filename or "audio.wav"
    return {
        "audio_file": filename,
        "transcription": "Requesting medics unit 1 to section 108 stand immediately.",
        "intent_extracted": "medical_dispatch",
        "parameters": {
            "location": "Section 108",
            "unit": "Medics Team 1"
        },
        "confidence_score": 0.96
    }
