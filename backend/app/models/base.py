from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from ..database import Base


class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    nurse = "nurse"
    lab_technician = "lab_technician"
    pharmacist = "pharmacist"
    hospital_admin = "hospital_admin"
    government_admin = "government_admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.patient)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    blood_type = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    district = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    citizenship_number = Column(String, nullable=True)
    guardian_name = Column(String, nullable=True)
    guardian_phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(String, primary_key=True)
    patient_id = Column(String, nullable=False, index=True)
    uploaded_by = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_public_id = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
