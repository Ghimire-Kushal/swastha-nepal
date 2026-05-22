-- =============================================================================
-- Swastha Nepal AI — PostgreSQL Schema
-- Generated from: prisma/schema.prisma
-- Run via Prisma Migrate: npx prisma migrate dev --name init
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enum Types ───────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM (
  'patient', 'doctor', 'nurse', 'lab_technician',
  'pharmacist', 'hospital_admin', 'government_admin'
);

CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

CREATE TYPE "BloodType" AS ENUM (
  'A_POS', 'A_NEG', 'B_POS', 'B_NEG',
  'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG'
);

CREATE TYPE "AppointmentStatus" AS ENUM (
  'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE "AppointmentType" AS ENUM ('in_person', 'telemedicine', 'home_visit');

CREATE TYPE "PrescriptionStatus" AS ENUM ('active', 'dispensed', 'expired', 'cancelled');

CREATE TYPE "LabReportStatus" AS ENUM ('pending', 'processing', 'completed', 'cancelled');

CREATE TYPE "AllergenType" AS ENUM ('drug', 'food', 'environmental', 'latex', 'other');

CREATE TYPE "AllergenSeverity" AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');

CREATE TYPE "DeliveryType" AS ENUM ('normal', 'cesarean', 'assisted');

CREATE TYPE "MannerOfDeath" AS ENUM ('natural', 'accident', 'suicide', 'homicide', 'undetermined');

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- users: base account for all roles
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  phone            VARCHAR(20),
  password_hash    TEXT NOT NULL,
  role             "UserRole" NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- patients: extended profile for patient role
CREATE TABLE patients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth       DATE,
  gender              "Gender",
  blood_type          "BloodType",
  address             TEXT,
  district            VARCHAR(50),
  province            VARCHAR(50),
  citizenship_number  VARCHAR(50) UNIQUE,
  guardian_name       VARCHAR(100),
  guardian_phone      VARCHAR(20),
  profile_photo_url   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- doctors: extended profile for doctor role
CREATE TABLE doctors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number    VARCHAR(50) NOT NULL UNIQUE,
  specialization    VARCHAR(100) NOT NULL,
  subspecialization VARCHAR(100),
  qualifications    TEXT[] NOT NULL DEFAULT '{}',
  experience_years  INTEGER NOT NULL DEFAULT 0,
  consultation_fee  DECIMAL(10, 2),
  available_days    TEXT[] NOT NULL DEFAULT '{}',
  available_from    VARCHAR(5),   -- HH:MM
  available_to      VARCHAR(5),   -- HH:MM
  bio               TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialization ON doctors (specialization);
CREATE INDEX idx_doctors_is_verified    ON doctors (is_verified);

-- medical_records: diagnoses, visit notes, procedures
CREATE TABLE medical_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id      UUID REFERENCES doctors(id) ON DELETE SET NULL,
  record_type    VARCHAR(50) NOT NULL,   -- 'diagnosis' | 'procedure' | 'visit_note' | 'referral'
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  diagnosis      TEXT,
  icd_code       VARCHAR(20),
  symptoms       TEXT[] NOT NULL DEFAULT '{}',
  notes          TEXT,
  attachments    TEXT[] NOT NULL DEFAULT '{}',
  visit_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  follow_up_date TIMESTAMPTZ,
  is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient_id ON medical_records (patient_id);
CREATE INDEX idx_medical_records_doctor_id  ON medical_records (doctor_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records (visit_date);
CREATE INDEX idx_medical_records_icd_code   ON medical_records (icd_code);

-- prescriptions: medication orders from doctors
CREATE TABLE prescriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  status           "PrescriptionStatus" NOT NULL DEFAULT 'active',
  prescribed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,
  pharmacy_notes   TEXT,
  dispensed_at     TIMESTAMPTZ,
  dispensed_by     UUID REFERENCES users(id) ON DELETE SET NULL,   -- pharmacist
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions (patient_id);
CREATE INDEX idx_prescriptions_doctor_id  ON prescriptions (doctor_id);
CREATE INDEX idx_prescriptions_status     ON prescriptions (status);

-- prescription_items: individual medicines within a prescription
CREATE TABLE prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name   VARCHAR(200) NOT NULL,
  generic_name    VARCHAR(200),
  dosage          VARCHAR(100) NOT NULL,
  frequency       VARCHAR(100) NOT NULL,   -- e.g. 'Twice daily after meals'
  duration        VARCHAR(100),            -- e.g. '7 days'
  route           VARCHAR(50),             -- e.g. 'oral' | 'topical' | 'IV'
  instructions    TEXT,
  quantity        INTEGER,
  refills_allowed INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescription_items_prescription_id ON prescription_items (prescription_id);

-- lab_reports: diagnostic test results
CREATE TABLE lab_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  ordered_by          UUID REFERENCES doctors(id) ON DELETE SET NULL,
  processed_by        UUID REFERENCES users(id) ON DELETE SET NULL,   -- lab technician
  medical_record_id   UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  test_name           VARCHAR(200) NOT NULL,
  test_code           VARCHAR(50),
  category            VARCHAR(100),   -- 'hematology' | 'biochemistry' | 'microbiology' | etc.
  sample_type         VARCHAR(100),   -- 'blood' | 'urine' | 'stool' | 'swab'
  sample_collected_at TIMESTAMPTZ,
  result              TEXT,
  result_value        DECIMAL(15, 4),
  reference_range     VARCHAR(100),
  unit                VARCHAR(50),
  status              "LabReportStatus" NOT NULL DEFAULT 'pending',
  is_abnormal         BOOLEAN NOT NULL DEFAULT FALSE,
  notes               TEXT,
  report_url          TEXT,           -- URL to uploaded PDF report
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_reports_patient_id  ON lab_reports (patient_id);
CREATE INDEX idx_lab_reports_ordered_by  ON lab_reports (ordered_by);
CREATE INDEX idx_lab_reports_status      ON lab_reports (status);
CREATE INDEX idx_lab_reports_is_abnormal ON lab_reports (is_abnormal);

-- vaccinations: immunisation records
CREATE TABLE vaccinations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  administered_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  vaccine_name     VARCHAR(200) NOT NULL,
  vaccine_brand    VARCHAR(100),
  lot_number       VARCHAR(100),
  dose_number      INTEGER NOT NULL DEFAULT 1,
  total_doses      INTEGER NOT NULL DEFAULT 1,
  administered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_dose_due    TIMESTAMPTZ,
  site             VARCHAR(100),   -- 'left arm' | 'right thigh'
  route            VARCHAR(50),    -- 'intramuscular' | 'subcutaneous' | 'oral'
  facility         VARCHAR(200),
  adverse_reactions TEXT,
  certificate_url  TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_patient_id   ON vaccinations (patient_id);
CREATE INDEX idx_vaccinations_vaccine_name ON vaccinations (vaccine_name);
CREATE INDEX idx_vaccinations_administered_at ON vaccinations (administered_at);

-- allergies: known patient allergies
CREATE TABLE allergies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  allergen_type "AllergenType" NOT NULL,
  allergen_name VARCHAR(200) NOT NULL,
  reaction      VARCHAR(500) NOT NULL,
  severity      "AllergenSeverity" NOT NULL,
  onset_date    DATE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allergies_patient_id ON allergies (patient_id);
CREATE INDEX idx_allergies_severity   ON allergies (severity);
CREATE INDEX idx_allergies_is_active  ON allergies (is_active);

-- appointments: scheduled visits between patients and doctors
CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  status           "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
  type             "AppointmentType" NOT NULL DEFAULT 'in_person',
  reason           VARCHAR(500),
  notes            TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location         TEXT,
  video_link       TEXT,   -- URL for telemedicine sessions
  reminder_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_of     UUID REFERENCES appointments(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_scheduled ON appointments (patient_id, scheduled_at);
CREATE INDEX idx_appointments_doctor_scheduled  ON appointments (doctor_id, scheduled_at);
CREATE INDEX idx_appointments_status            ON appointments (status);
CREATE INDEX idx_appointments_scheduled_at      ON appointments (scheduled_at);

-- emergency_info: critical health data for the Emergency QR feature
CREATE TABLE emergency_info (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  blood_type            "BloodType",
  organ_donor           BOOLEAN NOT NULL DEFAULT FALSE,
  critical_conditions   TEXT[] NOT NULL DEFAULT '{}',
  current_medications   TEXT[] NOT NULL DEFAULT '{}',
  -- JSON: [{ name, relationship, phone, isPrimary }]
  emergency_contacts    JSONB NOT NULL DEFAULT '[]',
  insurance_provider    VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  advance_directive     TEXT,
  qr_hash               VARCHAR(64) UNIQUE,   -- SHA-256 hash for QR code URL
  last_updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- birth_records: newborn registration and vital statistics
CREATE TABLE birth_records (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID UNIQUE REFERENCES patients(id) ON DELETE SET NULL,
  registered_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  birth_certificate_number VARCHAR(100) UNIQUE,
  child_name              VARCHAR(100) NOT NULL,
  date_of_birth           TIMESTAMPTZ NOT NULL,
  place_of_birth          VARCHAR(200),
  hospital_facility       VARCHAR(200),
  gender                  "Gender",
  weight_kg               DECIMAL(5, 3),
  height_cm               DECIMAL(5, 2),
  apgar_score             INTEGER CHECK (apgar_score BETWEEN 0 AND 10),
  delivery_type           "DeliveryType",
  father_name             VARCHAR(100),
  mother_name             VARCHAR(100) NOT NULL,
  father_citizenship      VARCHAR(50),
  mother_citizenship      VARCHAR(50),
  district                VARCHAR(50),
  province                VARCHAR(50),
  attending_doctor        VARCHAR(100),
  complications           TEXT,
  is_registered           BOOLEAN NOT NULL DEFAULT FALSE,
  registration_date       DATE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_birth_records_date_of_birth ON birth_records (date_of_birth);
CREATE INDEX idx_birth_records_district      ON birth_records (district);
CREATE INDEX idx_birth_records_is_registered ON birth_records (is_registered);

-- death_records: mortality statistics and death certificates
CREATE TABLE death_records (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID UNIQUE REFERENCES patients(id) ON DELETE SET NULL,
  registered_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  death_certificate_number VARCHAR(100) UNIQUE,
  deceased_name           VARCHAR(100) NOT NULL,
  date_of_death           TIMESTAMPTZ NOT NULL,
  place_of_death          VARCHAR(200),
  hospital_facility       VARCHAR(200),
  primary_cause           VARCHAR(500) NOT NULL,
  secondary_causes        TEXT[] NOT NULL DEFAULT '{}',
  icd_code                VARCHAR(20),
  manner_of_death         "MannerOfDeath",
  age_at_death            INTEGER,
  gender                  "Gender",
  district                VARCHAR(50),
  province                VARCHAR(50),
  attending_doctor        VARCHAR(100),
  informant_name          VARCHAR(100),
  informant_relationship  VARCHAR(50),
  autopsy_performed       BOOLEAN NOT NULL DEFAULT FALSE,
  autopsy_findings        TEXT,
  is_registered           BOOLEAN NOT NULL DEFAULT FALSE,
  registration_date       DATE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_death_records_date_of_death  ON death_records (date_of_death);
CREATE INDEX idx_death_records_district       ON death_records (district);
CREATE INDEX idx_death_records_manner_of_death ON death_records (manner_of_death);
CREATE INDEX idx_death_records_is_registered  ON death_records (is_registered);

-- audit_logs: immutable trail of all system actions for compliance
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(100) NOT NULL,    -- 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN'
  resource_type VARCHAR(100) NOT NULL,   -- table name: 'medical_records', 'prescriptions', etc.
  resource_id   UUID,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    VARCHAR(45),             -- supports IPv4 and IPv6
  user_agent    TEXT,
  session_id    VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id              ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_resource             ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_action               ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at           ON audit_logs (created_at DESC);

-- ─── Updated-at Trigger ───────────────────────────────────────────────────────
-- Automatically update updated_at on row modification

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','patients','doctors','medical_records','prescriptions',
    'lab_reports','vaccinations','allergies','appointments',
    'emergency_info','birth_records','death_records'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();', tbl, tbl
    );
  END LOOP;
END;
$$;
