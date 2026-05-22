from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"
    nurse = "nurse"
    lab_technician = "lab_technician"
    pharmacist = "pharmacist"
    hospital_admin = "hospital_admin"
    government_admin = "government_admin"


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.patient
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserInfo"


class UserInfo(BaseModel):
    id: str
    name: str
    email: str
    role: str


TokenResponse.model_rebuild()


class RefreshRequest(BaseModel):
    token: str
