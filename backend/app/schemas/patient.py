from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PatientBase(BaseModel):
    name: str
    date_of_birth: str
    gender: str
    blood_type: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    citizenship_number: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None


class PatientResponse(PatientBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AllergyResponse(BaseModel):
    id: str
    allergen_name: str
    allergen_type: str
    reaction: str
    severity: str
    onset_date: Optional[str] = None
    is_active: bool


class MedicalRecordResponse(BaseModel):
    id: str
    date: str
    type: str
    title: str
    diagnosis: Optional[str] = None
    icd_code: Optional[str] = None
    doctor: Optional[str] = None
    hospital: Optional[str] = None
    notes: Optional[str] = None


class LabReportResponse(BaseModel):
    id: str
    test: str
    result: str
    date: str
    is_abnormal: bool
    file_url: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: str
    date: str
    doctor: str
    hospital: str
    items: List[dict]
    notes: Optional[str] = None
    status: str


class VaccinationResponse(BaseModel):
    id: str
    vaccine: str
    date: str
    next_due: Optional[str] = None
    batch_number: Optional[str] = None
    administered_by: Optional[str] = None
    location: Optional[str] = None
