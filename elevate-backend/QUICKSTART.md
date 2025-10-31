# Elevate Contest Platform - Quick Start Guide

Get the backend running in 5 minutes!

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional but recommended)

## Option 1: Docker Compose (Recommended)

### Step 1: Clone and Setup

```bash
cd elevate-backend
cp env.example .env
```

### Step 2: Configure Environment

Edit `.env` and set:

```env
SECRET_KEY=your-super-secret-key-change-this
DB_PASSWORD=strong-password-here
OPENAI_API_KEY=your-openai-key  # Optional
JUDGE0_HOST=https://judge0-ce.p.rapidapi.com  # Or local Judge0
```

### Step 3: Start All Services

```bash
docker-compose up -d
```

This starts:

- PostgreSQL database
- Redis cache
- Django API server
- Celery workers (2 instances)
- Celery beat scheduler

### Step 4: Run Migrations

```bash
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py createsuperuser
```

### Step 5: Access the Application

- API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
- API Docs: http://localhost:8000/api/docs/
- Health Check: http://localhost:8000/api/v1/monitoring/health/

## Option 2: Manual Setup

### Step 1: Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Setup Database

```bash
# Create PostgreSQL database
createdb elevate_contest

# Or using psql
psql -U postgres
CREATE DATABASE elevate_contest;
\q
```

### Step 4: Configure Environment

```bash
cp env.example .env
# Edit .env with your settings
```

### Step 5: Run Migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

### Step 6: Start Services

```bash
# Terminal 1: API Server
python manage.py runserver

# Terminal 2: Celery Worker
celery -A config worker -l info

# Terminal 3: Celery Beat
celery -A config beat -l info
```

## Quick Test

### 1. Get API Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### 2. Create a Contest

```bash
curl -X POST http://localhost:8000/api/v1/admin/contests/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Python Test",
    "description": "Test your Python skills",
    "start_at": "2024-11-01T10:00:00Z",
    "end_at": "2024-11-01T12:00:00Z",
    "duration_minutes": 120
  }'
```

### 3. Add a Question

```bash
curl -X POST http://localhost:8000/api/v1/admin/questions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contest": "CONTEST_ID",
    "type": "mcq",
    "content": {
      "question": "What is 2+2?",
      "options": ["2", "3", "4", "5"],
      "correct_answer": 2
    },
    "scoring": {"max_marks": 2},
    "difficulty": 1
  }'
```

### 4. Publish Contest

```bash
curl -X POST http://localhost:8000/api/v1/admin/contests/CONTEST_ID/publish/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Take Contest (as Candidate)

```bash
curl -X POST http://localhost:8000/api/v1/contest/CONTEST_ID/start/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "name": "John Doe"
  }'
```

## Project Structure

```
elevate-backend/
├── apps/
│   ├── contests/      # Contest management
│   ├── questions/     # Question types (MCQ, Coding, Subjective)
│   ├── participants/  # Participant management
│   ├── attempts/      # Attempt and response tracking
│   ├── grading/       # Grading engine + Judge0
│   ├── ai_generation/ # AI question generation
│   └── monitoring/    # Health checks & logging
├── config/            # Django settings & URLs
├── docs/              # Comprehensive documentation
├── Dockerfile         # Docker image
├── docker-compose.yml # Multi-container setup
└── requirements.txt   # Python dependencies
```

## Key Features

✅ **Multi-format Questions**: MCQ, Coding, Subjective
✅ **Auto-grading**: MCQ & Coding (via Judge0)
✅ **Manual Grading**: For subjective answers
✅ **AI Generation**: GPT-4 powered question creation
✅ **Real-time Monitoring**: 10k+ concurrent users
✅ **Proctoring**: Tab blur, IP tracking, heartbeats
✅ **Auto-save**: Every 5 seconds
✅ **Scalable**: Redis caching, Celery workers

## Common Commands

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run tests
pytest

# Check code quality
flake8
black .

# Database backup
pg_dump elevate_contest > backup.sql

# Database restore
psql elevate_contest < backup.sql
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 PID
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready
# Or restart it
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux
```

### Celery Not Processing Tasks

```bash
# Check Redis connection
redis-cli ping  # Should return PONG

# Clear Celery queue
celery -A config purge

# Restart workers
docker-compose restart celery_worker
```

### Judge0 Errors

```bash
# Test Judge0 connection
curl http://localhost:2358/about

# Use RapidAPI instead (edit .env):
JUDGE0_RAPID_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_RAPID_API_KEY=your-rapidapi-key
```

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:

- AWS/GCP/Azure deployment
- Kubernetes setup
- Load balancing
- Monitoring & alerts
- Backup strategies

## API Documentation

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- Full API Guide: [docs/API.md](docs/API.md)

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  React   │────▶│   API    │────▶│   DB     │
│ Frontend │     │  Django  │     │Postgres  │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                      ├────────▶ Redis (Cache)
                      │
                      ├────────▶ Celery Workers
                      │           └─▶ Judge0
                      │           └─▶ OpenAI
                      │
                      └────────▶ Monitoring
```

## Next Steps

1. **Read the Docs**: Check [README.md](README.md) for full details
2. **Explore APIs**: Visit http://localhost:8000/api/docs/
3. **Configure Judge0**: Set up code execution
4. **Add AI Key**: Enable question generation
5. **Load Testing**: Test with 10k users using Locust

## Support

- 📧 Email: support@elevatecareer.ai
- 📖 Docs: Full documentation in `docs/` folder
- 🐛 Issues: Report bugs via your issue tracker

## License

Proprietary - All rights reserved

---

**You're ready to go! 🚀**

Start creating contests and let candidates showcase their skills!
