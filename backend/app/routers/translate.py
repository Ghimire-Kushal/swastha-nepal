from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx

from ..dependencies import get_current_user

router = APIRouter(prefix="/translate", tags=["Translation"])

MYMEMORY_URL = "https://api.mymemory.translated.net/get"

MEDICAL_DICTIONARY = {
    "hypertension": "उच्च रक्तचाप",
    "diabetes": "मधुमेह",
    "anemia": "रक्तअल्पता",
    "tuberculosis": "क्षयरोग",
    "dengue": "डेंगु",
    "typhoid": "टाइफाइड",
    "malaria": "औलो",
    "prescription": "प्रिस्क्रिप्सन",
    "diagnosis": "निदान",
    "allergy": "एलर्जी",
    "blood pressure": "रक्तचाप",
    "heart rate": "हृदय दर",
    "fever": "ज्वरो",
    "cough": "खोकी",
    "headache": "टाउको दुख्नु",
    "dizziness": "रिंगटा",
    "nausea": "वाकवाकी",
    "vitamin d deficiency": "भिटामिन डी अभाव",
    "cholesterol": "कोलेस्ट्रोल",
    "kidney": "मिर्गौला",
    "liver": "कलेजो",
    "lungs": "फोक्सो",
    "heart": "मुटु",
}


class TranslateRequest(BaseModel):
    text: str
    from_lang: str = "en"
    to_lang: str = "ne"


class TranslateResponse(BaseModel):
    original: str
    translated: str
    source: str  # "dictionary" or "mymemory"


@router.post("/", response_model=TranslateResponse)
async def translate(
    body: TranslateRequest,
    user: dict = Depends(get_current_user),
):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long — max 1000 characters")

    # Check medical dictionary first for exact matches
    lower = text.lower()
    if lower in MEDICAL_DICTIONARY and body.from_lang == "en" and body.to_lang == "ne":
        return TranslateResponse(original=text, translated=MEDICAL_DICTIONARY[lower], source="dictionary")

    # Fall back to MyMemory free API
    lang_pair = f"{body.from_lang}|{body.to_lang}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(MYMEMORY_URL, params={"q": text[:500], "langpair": lang_pair})
            data = resp.json()
            translated = data.get("responseData", {}).get("translatedText", text)
            return TranslateResponse(original=text, translated=translated, source="mymemory")
    except Exception:
        return TranslateResponse(original=text, translated=text, source="fallback")


@router.get("/dictionary", response_model=dict)
async def get_medical_dictionary(user: dict = Depends(get_current_user)):
    """Return the full built-in medical term dictionary."""
    return {"terms": MEDICAL_DICTIONARY, "count": len(MEDICAL_DICTIONARY)}
