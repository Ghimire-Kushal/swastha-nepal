from pydantic import BaseModel
from typing import Optional, List


class DiagnosisCreate(BaseModel):
    patient_id: str
    record_type: str = "diagnosis"
    title: str
    diagnosis: str
    icd_code: Optional[str] = None
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None


class PrescriptionItemSchema(BaseModel):
    medicine: str
    dose: str
    frequency: str
    duration: str
    quantity: str
    instructions: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: str
    items: List[PrescriptionItemSchema]
    notes: Optional[str] = None


class CertificateCreate(BaseModel):
    patient_id: str
    cert_type: str
    reason: Optional[str] = None
    valid_days: Optional[int] = None


class DoctorProfileResponse(BaseModel):
    id: str
    name: str
    license_number: str
    specialization: str
    hospital: str
    experience_years: int
    is_verified: bool


class DoctorStatsResponse(BaseModel):
    patients_today: int
    patients_week: int
    prescriptions_week: int
    pending_reports: int


class DiseaseAlertResponse(BaseModel):
    id: str
    disease: str
    severity: str
    district: str
    cases: int
    date: str
    message: str
