from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.patient import (
    PatientResponse, PatientUpdate,
    AllergyResponse, MedicalRecordResponse,
    LabReportResponse, PrescriptionResponse, VaccinationResponse,
)

router = APIRouter(prefix="/patients", tags=["Patients"])

# ── Mock responses (replace SELECT queries once Prisma/SQLAlchemy tables are seeded) ──

MOCK_PATIENT_DATA = {
    "id": "p-001",
    "user_id": "u-001",
    "name": "Ramesh Bahadur Thapa",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "blood_type": "A_POS",
    "address": "Baneshwor, Ward No. 10",
    "district": "Kathmandu",
    "phone": "+977-9841234567",
    "citizenship_number": "02-01-70-12345",
    "guardian_name": "Shanti Devi Thapa",
    "guardian_phone": "+977-9812345678",
    "created_at": "2024-01-01T00:00:00Z",
}


@router.get("/me", response_model=dict)
async def get_my_profile(user: dict = Depends(get_current_user)):
    """Get the current patient's profile."""
    # TODO: SELECT * FROM patients WHERE user_id = user["sub"]
    return {"patient": MOCK_PATIENT_DATA, "user_id": user["sub"]}


@router.patch("/me", response_model=dict)
async def update_my_profile(
    body: PatientUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update patient's own profile fields."""
    # TODO: UPDATE patients SET ... WHERE user_id = user["sub"]
    return {"message": "Profile updated", "updated": body.model_dump(exclude_none=True)}


@router.get("/me/allergies", response_model=list[AllergyResponse])
async def get_allergies(user: dict = Depends(get_current_user)):
    return [
        {"id": "al-1", "allergen_name": "Penicillin", "allergen_type": "drug",
         "reaction": "Anaphylaxis", "severity": "life_threatening", "onset_date": "2018-03-10", "is_active": True},
        {"id": "al-2", "allergen_name": "Shellfish", "allergen_type": "food",
         "reaction": "Urticaria, nausea", "severity": "moderate", "onset_date": "2015-07-22", "is_active": True},
    ]


@router.get("/me/medical-records", response_model=list[MedicalRecordResponse])
async def get_medical_records(
    record_type: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    records = [
        {"id": "mr-1", "date": "2024-11-20", "type": "diagnosis", "title": "Annual Health Checkup",
         "diagnosis": "Stage 1 Hypertension", "icd_code": "I10", "doctor": "Dr. Anita Sharma",
         "hospital": "Grande International Hospital", "notes": "BP 140/90 mmHg"},
        {"id": "mr-2", "date": "2024-08-10", "type": "visit_note", "title": "Follow-up Hypertension",
         "diagnosis": "Hypertension, improving", "icd_code": "I10", "doctor": "Dr. Anita Sharma",
         "hospital": "Grande International Hospital", "notes": "BP improved to 130/85"},
    ]
    if record_type:
        records = [r for r in records if r["type"] == record_type]
    return records


@router.get("/me/prescriptions", response_model=list[PrescriptionResponse])
async def get_prescriptions(user: dict = Depends(get_current_user)):
    return [
        {"id": "pr-1", "date": "2024-11-20", "doctor": "Dr. Anita Sharma",
         "hospital": "Grande International Hospital",
         "items": [{"medicine": "Amlodipine 5mg", "dose": "5mg", "frequency": "OD", "duration": "30 days", "quantity": "30 tabs"}],
         "notes": "Take after meals", "status": "dispensed"},
    ]


@router.get("/me/lab-reports", response_model=list[LabReportResponse])
async def get_lab_reports(user: dict = Depends(get_current_user)):
    return [
        {"id": "lr-1", "test": "Complete Blood Count", "result": "WBC 8.2, RBC 4.9, Hgb 13.8",
         "date": "2024-11-18", "is_abnormal": False, "file_url": None},
        {"id": "lr-2", "test": "Lipid Profile", "result": "Total Chol 210 mg/dL",
         "date": "2024-11-18", "is_abnormal": True, "file_url": None},
    ]


@router.get("/me/vaccinations", response_model=list[VaccinationResponse])
async def get_vaccinations(user: dict = Depends(get_current_user)):
    return [
        {"id": "v-1", "vaccine": "COVID-19 (Covishield)", "date": "2021-08-12",
         "next_due": None, "batch_number": "4120Z002", "administered_by": "PHC Baneshwor", "location": "Kathmandu"},
        {"id": "v-2", "vaccine": "Influenza", "date": "2024-10-01",
         "next_due": "2025-10-01", "batch_number": "FL24-003", "administered_by": "Dr. Anita Sharma", "location": "Grande Hospital"},
    ]


@router.get("/{patient_id}", response_model=dict)
async def get_patient_by_id(
    patient_id: str,
    user: dict = Depends(get_current_user),
):
    """Get patient by ID — accessible to doctors, admins, and the patient themselves."""
    allowed_roles = {"doctor", "hospital_admin", "government_admin", "nurse"}
    if user.get("role") not in allowed_roles and user.get("sub") != patient_id:
        raise HTTPException(status_code=403, detail="Cannot view another patient's record")
    # TODO: SELECT * FROM patients WHERE id = patient_id
    return {"patient": MOCK_PATIENT_DATA}
