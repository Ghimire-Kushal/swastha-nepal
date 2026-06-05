Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('patient', 'doctor', 'nurse', 'lab_technician', 'pharmacist', 'hospital_admin', 'government_admin');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('in_person', 'telemedicine', 'home_visit');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('active', 'dispensed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "LabReportStatus" AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AllergenType" AS ENUM ('drug', 'food', 'environmental', 'latex', 'other');

-- CreateEnum
CREATE TYPE "AllergenSeverity" AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('normal', 'cesarean', 'assisted');

-- CreateEnum
CREATE TYPE "MannerOfDeath" AS ENUM ('natural', 'accident', 'suicide', 'homicide', 'undetermined');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender",
    "blood_type" "BloodType",
    "address" TEXT,
    "district" VARCHAR(50),
    "province" VARCHAR(50),
    "citizenship_number" VARCHAR(50),
    "guardian_name" VARCHAR(100),
    "guardian_phone" VARCHAR(20),
    "profile_photo_url" TEXT,
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'unverified',
    "verification_doc_type" VARCHAR(30),
    "verification_doc_url" TEXT,
    "verification_doc_number" VARCHAR(100),
    "verification_note" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "license_number" VARCHAR(50) NOT NULL,
    "specialization" VARCHAR(100) NOT NULL,
    "subspecialization" VARCHAR(100),
    "qualifications" TEXT[],
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "consultation_fee" DECIMAL(10,2),
    "available_days" TEXT[],
    "available_from" VARCHAR(5),
    "available_to" VARCHAR(5),
    "bio" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID,
    "record_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "icd_code" VARCHAR(20),
    "symptoms" TEXT[],
    "notes" TEXT,
    "attachments" TEXT[],
    "visit_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follow_up_date" TIMESTAMPTZ(6),
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "medical_record_id" UUID,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'active',
    "prescribed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ(6),
    "pharmacy_notes" TEXT,
    "dispensed_at" TIMESTAMPTZ(6),
    "dispensed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" UUID NOT NULL,
    "prescription_id" UUID NOT NULL,
    "medicine_name" VARCHAR(200) NOT NULL,
    "generic_name" VARCHAR(200),
    "dosage" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "duration" VARCHAR(100),
    "route" VARCHAR(50),
    "instructions" TEXT,
    "quantity" INTEGER,
    "refills_allowed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_reports" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "ordered_by" UUID,
    "processed_by" UUID,
    "medical_record_id" UUID,
    "test_name" VARCHAR(200) NOT NULL,
    "test_code" VARCHAR(50),
    "category" VARCHAR(100),
    "sample_type" VARCHAR(100),
    "sample_collected_at" TIMESTAMPTZ(6),
    "result" TEXT,
    "result_value" DECIMAL(15,4),
    "reference_range" VARCHAR(100),
    "unit" VARCHAR(50),
    "status" "LabReportStatus" NOT NULL DEFAULT 'pending',
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "report_url" TEXT,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "administered_by" UUID,
    "vaccine_name" VARCHAR(200) NOT NULL,
    "vaccine_brand" VARCHAR(100),
    "lot_number" VARCHAR(100),
    "dose_number" INTEGER NOT NULL DEFAULT 1,
    "total_doses" INTEGER NOT NULL DEFAULT 1,
    "administered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_dose_due" TIMESTAMPTZ(6),
    "site" VARCHAR(100),
    "route" VARCHAR(50),
    "facility" VARCHAR(200),
    "adverse_reactions" TEXT,
    "certificate_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "recorded_by" UUID,
    "allergen_type" "AllergenType" NOT NULL,
    "allergen_name" VARCHAR(200) NOT NULL,
    "reaction" VARCHAR(500) NOT NULL,
    "severity" "AllergenSeverity" NOT NULL,
    "onset_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "type" "AppointmentType" NOT NULL DEFAULT 'in_person',
    "reason" VARCHAR(500),
    "notes" TEXT,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "location" TEXT,
    "video_link" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_of" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_info" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "blood_type" "BloodType",
    "organ_donor" BOOLEAN NOT NULL DEFAULT false,
    "critical_conditions" TEXT[],
    "current_medications" TEXT[],
    "emergency_contacts" JSONB NOT NULL DEFAULT '[]',
    "insurance_provider" VARCHAR(200),
    "insurance_policy_number" VARCHAR(100),
    "advance_directive" TEXT,
    "qr_hash" VARCHAR(64),
    "last_updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "emergency_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birth_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID,
    "registered_by" UUID,
    "birth_certificate_number" VARCHAR(100),
    "child_name" VARCHAR(100) NOT NULL,
    "date_of_birth" TIMESTAMPTZ(6) NOT NULL,
    "place_of_birth" VARCHAR(200),
    "hospital_facility" VARCHAR(200),
    "gender" "Gender",
    "weight_kg" DECIMAL(5,3),
    "height_cm" DECIMAL(5,2),
    "apgar_score" INTEGER,
    "delivery_type" "DeliveryType",
    "father_name" VARCHAR(100),
    "mother_name" VARCHAR(100) NOT NULL,
    "father_citizenship" VARCHAR(50),
    "mother_citizenship" VARCHAR(50),
    "district" VARCHAR(50),
    "province" VARCHAR(50),
    "attending_doctor" VARCHAR(100),
    "complications" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registration_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "birth_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "death_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID,
    "registered_by" UUID,
    "death_certificate_number" VARCHAR(100),
    "deceased_name" VARCHAR(100) NOT NULL,
    "date_of_death" TIMESTAMPTZ(6) NOT NULL,
    "place_of_death" VARCHAR(200),
    "hospital_facility" VARCHAR(200),
    "primary_cause" VARCHAR(500) NOT NULL,
    "secondary_causes" TEXT[],
    "icd_code" VARCHAR(20),
    "manner_of_death" "MannerOfDeath",
    "age_at_death" INTEGER,
    "gender" "Gender",
    "district" VARCHAR(50),
    "province" VARCHAR(50),
    "attending_doctor" VARCHAR(100),
    "informant_name" VARCHAR(100),
    "informant_relationship" VARCHAR(50),
    "autopsy_performed" BOOLEAN NOT NULL DEFAULT false,
    "autopsy_findings" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registration_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "death_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_citizenship_number_key" ON "patients"("citizenship_number");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_license_number_key" ON "doctors"("license_number");

-- CreateIndex
CREATE INDEX "doctors_specialization_idx" ON "doctors"("specialization");

-- CreateIndex
CREATE INDEX "doctors_is_verified_idx" ON "doctors"("is_verified");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_idx" ON "medical_records"("doctor_id");

-- CreateIndex
CREATE INDEX "medical_records_visit_date_idx" ON "medical_records"("visit_date");

-- CreateIndex
CREATE INDEX "medical_records_icd_code_idx" ON "medical_records"("icd_code");

-- CreateIndex
CREATE INDEX "prescriptions_patient_id_idx" ON "prescriptions"("patient_id");

-- CreateIndex
CREATE INDEX "prescriptions_doctor_id_idx" ON "prescriptions"("doctor_id");

-- CreateIndex
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateIndex
CREATE INDEX "prescription_items_prescription_id_idx" ON "prescription_items"("prescription_id");

-- CreateIndex
CREATE INDEX "lab_reports_patient_id_idx" ON "lab_reports"("patient_id");

-- CreateIndex
CREATE INDEX "lab_reports_ordered_by_idx" ON "lab_reports"("ordered_by");

-- CreateIndex
CREATE INDEX "lab_reports_status_idx" ON "lab_reports"("status");

-- CreateIndex
CREATE INDEX "lab_reports_is_abnormal_idx" ON "lab_reports"("is_abnormal");

-- CreateIndex
CREATE INDEX "vaccinations_patient_id_idx" ON "vaccinations"("patient_id");

-- CreateIndex
CREATE INDEX "vaccinations_vaccine_name_idx" ON "vaccinations"("vaccine_name");

-- CreateIndex
CREATE INDEX "vaccinations_administered_at_idx" ON "vaccinations"("administered_at");

-- CreateIndex
CREATE INDEX "allergies_patient_id_idx" ON "allergies"("patient_id");

-- CreateIndex
CREATE INDEX "allergies_severity_idx" ON "allergies"("severity");

-- CreateIndex
CREATE INDEX "allergies_is_active_idx" ON "allergies"("is_active");

-- CreateIndex
CREATE INDEX "appointments_patient_id_scheduled_at_idx" ON "appointments"("patient_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_scheduled_at_idx" ON "appointments"("doctor_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_scheduled_at_idx" ON "appointments"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_info_patient_id_key" ON "emergency_info"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_info_qr_hash_key" ON "emergency_info"("qr_hash");

-- CreateIndex
CREATE UNIQUE INDEX "birth_records_patient_id_key" ON "birth_records"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "birth_records_birth_certificate_number_key" ON "birth_records"("birth_certificate_number");

-- CreateIndex
CREATE INDEX "birth_records_date_of_birth_idx" ON "birth_records"("date_of_birth");

-- CreateIndex
CREATE INDEX "birth_records_district_idx" ON "birth_records"("district");

-- CreateIndex
CREATE INDEX "birth_records_is_registered_idx" ON "birth_records"("is_registered");

-- CreateIndex
CREATE UNIQUE INDEX "death_records_patient_id_key" ON "death_records"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "death_records_death_certificate_number_key" ON "death_records"("death_certificate_number");

-- CreateIndex
CREATE INDEX "death_records_date_of_death_idx" ON "death_records"("date_of_death");

-- CreateIndex
CREATE INDEX "death_records_district_idx" ON "death_records"("district");

-- CreateIndex
CREATE INDEX "death_records_manner_of_death_idx" ON "death_records"("manner_of_death");

-- CreateIndex
CREATE INDEX "death_records_is_registered_idx" ON "death_records"("is_registered");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_dispensed_by_fkey" FOREIGN KEY ("dispensed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_ordered_by_fkey" FOREIGN KEY ("ordered_by") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_follow_up_of_fkey" FOREIGN KEY ("follow_up_of") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_info" ADD CONSTRAINT "emergency_info_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_records" ADD CONSTRAINT "birth_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_records" ADD CONSTRAINT "birth_records_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "death_records" ADD CONSTRAINT "death_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "death_records" ADD CONSTRAINT "death_records_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

