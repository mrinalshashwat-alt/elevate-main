# Elevate Contest Platform - Backend

A high-performance, scalable backend system for conducting coding, MCQ, and subjective assessments with support for 10,000+ concurrent participants.

## 🚀 Features

### Core Capabilities

- **Multi-format Assessment**: Support for Coding, MCQ, and Subjective questions
- **Real-time Contest Management**: Live monitoring of 10,000+ concurrent participants
- **Automated Grading**: Judge0 integration for code execution with auto-grading for MCQ
- **Manual Grading**: Comprehensive tools for evaluating subjective responses
- **AI Question Generation**: Generate questions using OpenAI GPT-4 or Anthropic Claude
- **Proctoring**: Tab blur detection, IP tracking, and heartbeat monitoring
- **Auto-save**: Automatic answer persistence every 5 seconds
- **Time Management**: Dynamic time extensions and expiry handling

### Admin Features

- Contest creation and configuration
- Bulk question upload (CSV/JSON)
- AI-powered question generation
- Live participant monitoring
- Manual grading interface
- Results export and analytics
- Leaderboard generation

### Candidate Features

- Seamless contest participation
- Real-time code execution
- Auto-save functionality
- Multi-language support (Python, C++, Java)
- Time tracking and warnings

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Next)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────┐
│   Load Balancer (Nginx)         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Django REST Framework         │
│   - API Endpoints               │
│   - JWT Authentication          │
│   - Rate Limiting               │
└────┬────────────────────────┬───┘
     │                        │
     ▼                        ▼
┌─────────────┐      ┌──────────────┐
│ PostgreSQL  │      │ Redis Cache  │
│ (Primary +  │      │ - Sessions   │
│  Replicas)  │      │ - Queue      │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Celery Workers │
                   │ - Grading      │
                   │ - AI Gen       │
                   └────────┬───────┘
                            │
                ┌───────────┴────────────┐
                ▼                        ▼
        ┌──────────────┐        ┌──────────────┐
        │   Judge0 API │        │  OpenAI API  │
        │ Code Exec    │        │  Question Gen│
        └──────────────┘        └──────────────┘
```

### Component Responsibilities

#### API Layer (Django REST Framework)

- Request handling and validation
- Authentication and authorization
- Rate limiting and throttling
- Response serialization

#### Database Layer (PostgreSQL)

- Primary: Write operations
- Replicas: Read operations for analytics and reports
- JSONB fields for flexible schema

#### Cache Layer (Redis)

- Session storage
- Autosave queue
- Rate limiting counters
- Leaderboard caching

#### Async Workers (Celery)

- Code grading via Judge0
- AI question generation
- Email notifications
- Report generation
- Statistics updates

## 🛠️ Tech Stack

### Core Framework

- **Django 4.2** - Web framework
- **Django REST Framework 3.14** - API framework
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and message broker

### Async Processing

- **Celery 5.3** - Distributed task queue
- **Celery Beat** - Periodic task scheduler

### External Services

- **Judge0** - Code execution engine
- **OpenAI GPT-4** - AI question generation
- **Sentry** - Error tracking
- **Prometheus** - Metrics collection

### Key Libraries

- `djangorestframework-simplejwt` - JWT authentication
- `django-cors-headers` - CORS handling
- `django-filter` - Advanced filtering
- `drf-yasg` - API documentation
- `celery` - Task queue
- `redis` - Caching
- `psycopg2` - PostgreSQL adapter
- `requests` - HTTP client
- `pandas` - Data processing

## 🚦 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Judge0 instance (local or cloud)
- OpenAI API key (optional, for AI features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/elevate-backend.git
cd elevate-backend
```

#### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Setup Environment Variables

```bash
cp env.example .env
# Edit .env with your configuration
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/elevate_contest
REDIS_URL=redis://localhost:6379/0
JUDGE0_HOST=http://localhost:2358
OPENAI_API_KEY=your-openai-key
SECRET_KEY=your-secret-key
```

#### 5. Database Setup

```bash
# Create database
createdb elevate_contest

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

#### 6. Run Development Server

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A config worker -l info

# Terminal 3: Celery beat (periodic tasks)
celery -A config beat -l info
```

The API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/api/docs/`

### Quick Start Guide

1. **Create a Contest**

```bash
POST /api/v1/admin/contests/
{
  "name": "Python Assessment 2024",
  "description": "Test your Python skills",
  "start_at": "2024-11-01T10:00:00Z",
  "end_at": "2024-11-01T12:00:00Z",
  "duration_minutes": 120
}
```

2. **Add Questions**

```bash
POST /api/v1/admin/questions/
{
  "contest_id": "uuid",
  "type": "mcq",
  "content": {
    "question": "What is 2+2?",
    "options": ["2", "3", "4", "5"],
    "correct_answer": 2
  },
  "scoring": {"max_marks": 10}
}
```

3. **Publish Contest**

```bash
POST /api/v1/admin/contests/{id}/publish/
```

4. **Participant Takes Contest**

```bash
POST /api/v1/contest/{id}/start/
{
  "email": "candidate@example.com",
  "name": "John Doe"
}
```

## 📊 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│   Contest    │───┬───│   Question   │
└──────────────┘   │   └──────────────┘
       │           │
       │           │   ┌──────────────┐
       │           └───│   Response   │
       │               └──────────────┘
       │                      │
       │               ┌──────────────┐
       └───────────────│   Attempt    │
                       └──────────────┘
                              │
                       ┌──────────────┐
                       │ Participant  │
                       └──────────────┘
```

### Core Models

#### Contest

- Stores contest configuration, timing, and settings
- Supports multiple question types
- Tracks participant statistics

#### Question

- Polymorphic model supporting MCQ, Coding, and Subjective
- JSONB content field for type-specific data
- Test cases for coding questions

#### Participant

- User taking the contest
- Email-based identification
- Statistics tracking

#### Attempt

- Links participant to contest
- Tracks timing, status, and proctoring data
- Stores aggregated scores

#### Response

- Individual question answers
- Stores execution results for code
- Manual grading support

#### AIJob

- Tracks AI question generation requests
- Stores prompts and generated output
- Status and error tracking

See [DATABASE.md](docs/DATABASE.md) for detailed schema documentation.

## 📡 API Documentation

### Authentication

All API endpoints (except contest start) require JWT authentication:

```bash
# Get token
POST /api/v1/auth/token/
{
  "username": "admin",
  "password": "password"
}

# Use token
Authorization: Bearer <access_token>
```

### Admin Endpoints

#### Contest Management

- `POST /api/v1/admin/contests/` - Create contest
- `GET /api/v1/admin/contests/` - List contests
- `GET /api/v1/admin/contests/{id}/` - Get contest details
- `PATCH /api/v1/admin/contests/{id}/` - Update contest
- `POST /api/v1/admin/contests/{id}/publish/` - Publish contest
- `GET /api/v1/admin/contests/{id}/results/` - Get results
- `GET /api/v1/admin/contests/{id}/export.csv` - Export results

#### Question Management

- `POST /api/v1/admin/questions/` - Create question
- `POST /api/v1/admin/questions/upload/csv` - Bulk upload CSV
- `POST /api/v1/admin/questions/upload/json` - Bulk upload JSON
- `GET /api/v1/admin/questions/` - List questions
- `PATCH /api/v1/admin/questions/{id}/` - Update question
- `DELETE /api/v1/admin/questions/{id}/` - Delete question

#### AI Generation

- `POST /api/v1/admin/ai/generate-mcq/` - Generate MCQ questions
- `POST /api/v1/admin/ai/generate-code/` - Generate coding questions
- `POST /api/v1/admin/ai/generate-subjective/` - Generate subjective questions
- `GET /api/v1/admin/ai/jobs/` - List AI jobs
- `GET /api/v1/admin/ai/jobs/{id}/` - Get job status

#### Participant Monitoring

- `GET /api/v1/admin/participants/` - List participants
- `GET /api/v1/admin/participants/{id}/attempts/` - Get attempts
- `POST /api/v1/admin/attempts/{id}/extend/` - Extend time
- `POST /api/v1/admin/attempts/{id}/invalidate/` - Invalidate attempt

#### Grading

- `POST /api/v1/admin/grading/responses/{id}/` - Manual grade
- `POST /api/v1/admin/grading/regrade/{attempt_id}/` - Regrade attempt
- `GET /api/v1/admin/grading/pending/` - Get pending subjective responses

### Candidate Endpoints

- `POST /api/v1/contest/{id}/start/` - Start contest
- `POST /api/v1/attempt/{id}/save/` - Autosave answer
- `POST /api/v1/attempt/{id}/submit/` - Submit contest
- `POST /api/v1/attempt/{id}/code/execute/` - Execute code
- `GET /api/v1/attempt/{id}/code/result/{job_id}/` - Get execution result
- `POST /api/v1/attempt/{id}/heartbeat/` - Update heartbeat

See [API.md](docs/API.md) for complete API documentation with examples.

## ⚙️ Configuration

### Django Settings

Key settings in `config/settings.py`:

```python
# Performance
MAX_CONCURRENT_USERS = 10000
RATE_LIMIT_PER_MINUTE = 60
AUTOSAVE_INTERVAL_SECONDS = 5

# Contest
DEFAULT_CONTEST_DURATION_MINUTES = 120
MAX_TIME_EXTENSION_MINUTES = 30
DEFAULT_CODING_LANGUAGE = 'python3'

# Caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/0',
    }
}
```

### Celery Configuration

```python
# Worker concurrency
celery -A config worker -c 10

# Queue priorities
CELERY_TASK_ROUTES = {
    'apps.grading.tasks.grade_mcq': {'queue': 'high_priority'},
    'apps.grading.tasks.grade_coding': {'queue': 'normal'},
    'apps.ai_generation.tasks.generate': {'queue': 'low_priority'},
}
```

### Judge0 Configuration

```env
JUDGE0_HOST=http://localhost:2358
JUDGE0_API_KEY=your-key

# Or use RapidAPI
JUDGE0_RAPID_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_RAPID_API_KEY=your-rapidapi-key
```

## 💻 Development

### Project Structure

```
elevate-backend/
├── config/                 # Django project configuration
│   ├── settings.py        # Main settings
│   ├── urls.py            # URL routing
│   ├── celery.py          # Celery config
│   └── wsgi.py            # WSGI application
├── apps/                   # Application modules
│   ├── contests/          # Contest management
│   ├── questions/         # Question management
│   ├── participants/      # Participant management
│   ├── attempts/          # Attempt and response handling
│   ├── grading/           # Grading engine
│   ├── ai_generation/     # AI question generation
│   └── monitoring/        # Monitoring and logging
├── docs/                   # Documentation
│   ├── API.md             # API documentation
│   ├── DATABASE.md        # Database schema
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── ARCHITECTURE.md    # Architecture details
├── tests/                  # Test suite
├── fixtures/               # Sample data
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
└── README.md              # This file
```

### Code Style

We follow PEP 8 with Black formatting:

```bash
# Format code
black .

# Lint
flake8

# Type checking
mypy apps/
```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=apps --cov-report=html

# Specific app
pytest apps/contests/tests/

# Fast tests only
pytest -m "not slow"
```

### Database Migrations

```bash
# Create migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Rollback
python manage.py migrate app_name migration_name
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure proper `SECRET_KEY`
- [ ] Setup PostgreSQL with replication
- [ ] Configure Redis persistence
- [ ] Setup Nginx/Apache reverse proxy
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure Sentry for error tracking
- [ ] Setup log aggregation
- [ ] Configure backup strategy
- [ ] Enable monitoring (Prometheus/Grafana)
- [ ] Setup CDN for static files
- [ ] Configure rate limiting
- [ ] Enable security headers

### Docker Deployment

```bash
# Build image
docker build -t elevate-backend .

# Run with docker-compose
docker-compose up -d

# Scale workers
docker-compose up -d --scale celery_worker=5
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Scale deployment
kubectl scale deployment api --replicas=10
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guide.

## 🧪 Testing

### Test Coverage

- Unit tests: 90%+ coverage
- Integration tests for API endpoints
- Load testing for 10k concurrent users
- End-to-end grading tests

### Load Testing

```bash
# Using Locust
locust -f tests/load/locustfile.py --users 10000 --spawn-rate 100

# Using Apache Bench
ab -n 10000 -c 1000 http://localhost:8000/api/v1/attempt/save/
```

### Performance Benchmarks

| Endpoint        | p50    | p95    | p99    | RPS  |
| --------------- | ------ | ------ | ------ | ---- |
| /contest/start  | 45ms   | 120ms  | 280ms  | 500  |
| /attempt/save   | 15ms   | 35ms   | 80ms   | 5000 |
| /attempt/submit | 80ms   | 200ms  | 450ms  | 300  |
| /code/execute   | 1200ms | 2500ms | 4000ms | 100  |

## 📊 Monitoring

### Metrics Collected

- Request rate and latency
- Database query performance
- Celery queue depth
- Cache hit ratio
- Error rate and types
- Active participants
- System resources (CPU, memory, disk)

### Dashboards

- **Grafana**: Real-time metrics visualization
- **Sentry**: Error tracking and alerts
- **Django Admin**: Business metrics

### Alerts

- p95 latency > 400ms
- Error rate > 1%
- Queue depth > 1000
- DB connection pool exhausted
- Disk usage > 85%

## 🔒 Security

### Authentication

- JWT tokens with short expiration
- Refresh token rotation
- IP-based rate limiting

### Data Protection

- Encryption at rest (PostgreSQL)
- Encryption in transit (HTTPS/TLS)
- Sensitive data masking in logs

### Input Validation

- Request size limits
- SQL injection prevention (ORM)
- XSS protection
- CSRF tokens

### Proctoring

- Tab blur detection
- IP tracking
- Heartbeat monitoring
- Screenshot capture (optional)

## 📝 License

Proprietary - All rights reserved

## 👥 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📧 Support

- Email: support@elevatecareer.ai
- Slack: #elevate-backend
- Docs: https://docs.elevatecareer.ai

## 🗺️ Roadmap

### Phase 1 (Current)

- [x] Core contest functionality
- [x] MCQ and coding questions
- [x] Judge0 integration
- [x] Basic AI generation

### Phase 2

- [ ] Advanced proctoring (webcam, screen recording)
- [ ] Real-time collaboration features
- [ ] Video questions
- [ ] Advanced analytics

### Phase 3

- [ ] Multi-tenancy support
- [ ] White-labeling
- [ ] Adaptive testing
- [ ] ML-based question recommendation

---

**Built with ❤️ by the Elevate Team**
