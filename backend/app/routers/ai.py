from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, Optional
import json

from ..dependencies import get_current_user
from ..config import settings

router = APIRouter(prefix="/ai", tags=["AI Analysis"])

SYSTEM_PROMPT = """You are a medical AI assistant for Swastha Nepal AI, specializing in Nepal's healthcare context.

Nepal-specific health priorities:
- High prevalence: Hypertension, Type 2 Diabetes, Vitamin D deficiency, Iron-deficiency anaemia
- Seasonal: Dengue (July-October), Typhoid, Cholera during monsoon
- Altitude sickness above 2,500m
- Limited specialist access in rural areas — prioritize primary care referrals

Always respond with a structured JSON object:
{
  "riskLevel": "low|medium|high|emergency",
  "riskScore": 0-100,
  "summary": "brief 2-3 sentence summary",
  "abnormalFindings": ["list of abnormal findings"],
  "risks": [{"condition": "name", "probability": "low/medium/high", "rationale": "explanation"}],
  "specialists": [{"type": "specialist", "urgency": "routine/urgent/emergency", "reason": "why"}],
  "advice": ["actionable advice items"],
  "aiConfidence": "low|medium|high",
  "disclaimer": "This analysis is informational only..."
}"""


class AIAnalysisRequest(BaseModel):
    patient_name: str
    age: int
    gender: str
    blood_type: Optional[str] = None
    conditions: Optional[list[str]] = []
    medications: Optional[list[str]] = []
    allergies: Optional[list[Any]] = []
    vital_signs: Optional[dict] = {}
    lab_highlights: Optional[list[Any]] = []
    medical_history: Optional[list[Any]] = []


@router.post("/analyze")
async def analyze_patient(
    body: AIAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    if not settings.anthropic_api_key or settings.anthropic_api_key.startswith("sk-ant-YOUR"):
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set ANTHROPIC_API_KEY in .env"
        )

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        user_message = f"Analyze this patient's health data:\n\n{json.dumps(body.model_dump(), indent=2)}"

        def generate():
            with client.messages.stream(
                model="claude-opus-4-7",
                max_tokens=2048,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            ) as stream:
                for text in stream.text_stream:
                    yield text

        return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/sync")
async def analyze_patient_sync(
    body: AIAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    """Non-streaming version — returns full JSON response."""
    if not settings.anthropic_api_key or settings.anthropic_api_key.startswith("sk-ant-YOUR"):
        # Return mock response when API key not configured
        return {
            "riskLevel": "medium",
            "riskScore": 52,
            "summary": "AI analysis unavailable — API key not configured.",
            "abnormalFindings": [],
            "risks": [],
            "specialists": [],
            "advice": ["Configure ANTHROPIC_API_KEY to enable real AI analysis."],
            "aiConfidence": "low",
            "disclaimer": "This is a mock response for development."
        }

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        user_message = f"Analyze this patient:\n\n{json.dumps(body.model_dump(), indent=2)}"
        message = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        text = message.content[0].text
        # Try to parse JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end]) if start >= 0 else {"raw": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
