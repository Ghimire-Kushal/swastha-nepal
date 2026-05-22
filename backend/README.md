# Swastha Nepal AI — FastAPI Backend

REST API backend for the Swastha Nepal AI platform.

## Quick start

```bash
cd backend

# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, etc.

# 4. Run development server
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register new user |
| `POST` | `/api/v1/auth/login` | Public | Login, get JWT |
| `POST` | `/api/v1/auth/logout` | Any | Logout (discard token) |
| `GET`  | `/api/v1/patients/me` | Patient | Own profile |
| `PATCH`| `/api/v1/patients/me` | Patient | Update profile |
| `GET`  | `/api/v1/patients/me/allergies` | Patient | Allergies |
| `GET`  | `/api/v1/patients/me/medical-records` | Patient | Medical history |
| `GET`  | `/api/v1/patients/me/prescriptions` | Patient | Prescriptions |
| `GET`  | `/api/v1/patients/me/lab-reports` | Patient | Lab reports |
| `GET`  | `/api/v1/patients/me/vaccinations` | Patient | Vaccinations |
| `GET`  | `/api/v1/patients/{id}` | Doctor/Admin | Patient by ID |
| `GET`  | `/api/v1/doctors/me/profile` | Doctor | Own profile |
| `GET`  | `/api/v1/doctors/me/stats` | Doctor | Dashboard stats |
| `GET`  | `/api/v1/doctors/me/patients` | Doctor | Patient list |
| `POST` | `/api/v1/doctors/me/patients/{id}/diagnosis` | Doctor | Add diagnosis |
| `POST` | `/api/v1/doctors/me/patients/{id}/prescriptions` | Doctor | Create prescription |
| `POST` | `/api/v1/doctors/me/patients/{id}/certificate` | Doctor | Issue certificate |
| `GET`  | `/api/v1/doctors/alerts` | Doctor | Disease alerts |
| `POST` | `/api/v1/ai/analyze` | Any (streaming) | AI health analysis |
| `POST` | `/api/v1/ai/analyze/sync` | Any | AI analysis (full JSON) |
| `POST` | `/api/v1/translate/` | Any | Translate text |
| `GET`  | `/api/v1/translate/dictionary` | Any | Medical dictionary |

## Notes

- JWT tokens are compatible with the Next.js frontend (same `JWT_SECRET`).
- Database endpoints currently return mock data — swap with SQLAlchemy queries once DB is seeded.
- AI endpoints require `ANTHROPIC_API_KEY`.
- Rate limiting: plug in `slowapi` for production.
