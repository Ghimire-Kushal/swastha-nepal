from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from ..dependencies import get_current_user
from ..schemas.doctor import (
    DiagnosisCreate, PrescriptionCreate, CertificateCreate,
    DoctorProfileResponse, DoctorStatsResponse, DiseaseAlertResponse,
)

router = APIRouter(prefix="/doctors", tags=["Doctors"])


def _require_doctor(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    return user


@router.get("/me/profile", response_model=dict)
async def get_doctor_profile(user: dict = Depends(_require_doctor)):
    return {
        "id": "d-001",
        "name": user.get("name", "Dr. Unknown"),
        "license_number": "NMC-2019-003421",
        "specialization": "General Medicine",
        "hospital": "Grande International Hospital",
        "experience_years": 8,
        "is_verified": True,
    }


@router.get("/me/stats", response_model=DoctorStatsResponse)
async def get_doctor_stats(user: dict = Depends(_require_doctor)):
    return {"patients_today": 12, "patients_week": 67, "prescriptions_week": 89, "pending_reports": 4}


@router.get("/me/patients", response_model=list[dict])
async def get_doctor_patients(
    q: Optional[str] = Query(None, description="Search by name, phone, or ID"),
    user: dict = Depends(_require_doctor),
):
    """Search/list patients assigned to this doctor."""
    patients = [
        {"id": "p-001", "name": "Ramesh Bahadur Thapa", "dob": "1990-05-15", "gender": "male",
         "blood_type": "A_POS", "phone": "+977-9841234567", "district": "Kathmandu",
         "conditions": ["Hypertension", "Vitamin D Deficiency"]},
        {"id": "p-002", "name": "Sita Kumari Adhikari", "dob": "1985-08-22", "gender": "female",
         "blood_type": "B_NEG", "phone": "+977-9812233445", "district": "Lalitpur",
         "conditions": ["Type 2 Diabetes", "Hypothyroidism"]},
    ]
    if q:
        q_lower = q.lower()
        patients = [p for p in patients if q_lower in p["name"].lower() or q_lower in p["phone"]]
    return patients


@router.post("/me/patients/{patient_id}/diagnosis", status_code=201)
async def add_diagnosis(
    patient_id: str,
    body: DiagnosisCreate,
    user: dict = Depends(_require_doctor),
):
    if body.patient_id != patient_id:
        raise HTTPException(status_code=400, detail="patient_id mismatch")
    # TODO: INSERT INTO medical_records ...
    return {"message": "Diagnosis recorded", "patient_id": patient_id, "title": body.title}


@router.post("/me/patients/{patient_id}/prescriptions", status_code=201)
async def create_prescription(
    patient_id: str,
    body: PrescriptionCreate,
    user: dict = Depends(_require_doctor),
):
    if body.patient_id != patient_id:
        raise HTTPException(status_code=400, detail="patient_id mismatch")
    # TODO: INSERT INTO prescriptions + prescription_items ...
    import uuid
    return {
        "message": "Prescription created",
        "prescription_id": str(uuid.uuid4()),
        "patient_id": patient_id,
        "items": len(body.items),
    }


@router.post("/me/patients/{patient_id}/certificate", status_code=201)
async def issue_certificate(
    patient_id: str,
    body: CertificateCreate,
    user: dict = Depends(_require_doctor),
):
    import uuid
    cert_number = f"CERT-{uuid.uuid4().hex[:8].upper()}"
    return {
        "message": "Certificate issued",
        "cert_number": cert_number,
        "patient_id": patient_id,
        "cert_type": body.cert_type,
    }


@router.get("/alerts", response_model=list[DiseaseAlertResponse])
async def get_disease_alerts(user: dict = Depends(_require_doctor)):
    return [
        {"id": "da-1", "disease": "Dengue Fever", "severity": "high", "district": "Kathmandu",
         "cases": 47, "date": "2025-05-20", "message": "Spike in dengue cases — enforce vector control"},
        {"id": "da-2", "disease": "Typhoid", "severity": "medium", "district": "Lalitpur",
         "cases": 12, "date": "2025-05-18", "message": "Waterborne outbreak — boil water advisory"},
    ]
