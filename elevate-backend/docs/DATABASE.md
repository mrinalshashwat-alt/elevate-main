# Database Schema Documentation

## Overview

The Elevate Contest Platform uses PostgreSQL 15+ with JSONB fields for flexible schema design.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CONTEST                              │
│  • id (UUID, PK)                                            │
│  • name, description, instructions                          │
│  • start_at, end_at, duration_minutes                       │
│  • status (draft/published/ongoing/closed)                  │
│  • settings (JSONB)                                         │
│  • created_by (FK → auth_user)                             │
│  • total_participants, total_submissions, average_score     │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────────────────────────────────────────┐
│                        QUESTION                              │
│  • id (UUID, PK)                                            │
│  • contest (FK → Contest)                                   │
│  • type (mcq/coding/subjective)                            │
│  • content (JSONB) - question-specific data                │
│  • scoring (JSONB) - marks configuration                   │
│  • difficulty (1-5)                                         │
│  • tags (JSONB Array)                                       │
│  • source (manual/upload/ai)                               │
│  • provenance (JSONB) - AI tracking                        │
│  • order (int)                                              │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ N:M (via Response)
           ▼
┌─────────────────────────────────────────────────────────────┐
│                        RESPONSE                              │
│  • id (UUID, PK)                                            │
│  • attempt (FK → Attempt)                                   │
│  • question (FK → Question)                                 │
│  • answer (JSONB)                                           │
│  • score, is_graded                                         │
│  • execution_result (JSONB) - for coding                   │
│  • feedback (text)                                          │
│  • graded_by (FK → auth_user)                              │
│  • time_spent_seconds                                       │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ N:1
           ▼
┌─────────────────────────────────────────────────────────────┐
│                         ATTEMPT                              │
│  • id (UUID, PK)                                            │
│  • contest (FK → Contest)                                   │
│  • participant (FK → Participant)                           │
│  • status (not_started/ongoing/submitted/grading/graded)   │
│  • started_at, expires_at, finished_at                     │
│  • time_extension_minutes                                   │
│  • heartbeat_at, tab_blur_count                            │
│  • ip_address, user_agent                                   │
│  • proctoring_data (JSONB)                                 │
│  • mcq_score, code_score, subjective_score, total_score    │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ N:1
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      PARTICIPANT                             │
│  • id (UUID, PK)                                            │
│  • name, email (UNIQUE), phone                             │
│  • metadata (JSONB) - additional info                      │
│  • total_contests, total_score                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         AI_JOB                               │
│  • id (UUID, PK)                                            │
│  • admin (FK → auth_user)                                   │
│  • type (mcq/coding/subjective)                            │
│  • input_prompt (JSONB)                                     │
│  • model_name (varchar)                                     │
│  • status (pending/processing/completed/failed)            │
│  • output (JSONB)                                           │
│  • error_message (text)                                     │
│  • created_at, started_at, completed_at                    │
└─────────────────────────────────────────────────────────────┘
```

## Table Definitions

### Contest

Stores contest configuration and metadata.

| Column             | Type         | Constraints            | Description                                              |
| ------------------ | ------------ | ---------------------- | -------------------------------------------------------- |
| id                 | UUID         | PK                     | Unique identifier                                        |
| name               | VARCHAR(255) | NOT NULL, INDEXED      | Contest name                                             |
| description        | TEXT         |                        | Contest description                                      |
| instructions       | TEXT         |                        | Instructions for participants                            |
| start_at           | TIMESTAMP    | NOT NULL, INDEXED      | Contest start time (UTC)                                 |
| end_at             | TIMESTAMP    | NOT NULL, INDEXED      | Contest end time (UTC)                                   |
| duration_minutes   | INTEGER      | NOT NULL, CHECK > 0    | Duration per attempt in minutes                          |
| status             | VARCHAR(20)  | NOT NULL, INDEXED      | Current status (draft/published/ongoing/closed/archived) |
| settings           | JSONB        | NOT NULL, DEFAULT '{}' | Configuration settings                                   |
| created_by         | UUID         | FK → auth_user(id)     | Admin who created                                        |
| created_at         | TIMESTAMP    | NOT NULL, AUTO         | Creation timestamp                                       |
| updated_at         | TIMESTAMP    | NOT NULL, AUTO         | Last update timestamp                                    |
| total_participants | INTEGER      | DEFAULT 0              | Denormalized count                                       |
| total_submissions  | INTEGER      | DEFAULT 0              | Denormalized count                                       |
| average_score      | FLOAT        | DEFAULT 0.0            | Denormalized average                                     |

**Indexes:**

- `idx_contest_status_start` ON (status, start_at)
- `idx_contest_created_at` ON (created_at DESC)

**Settings JSON Schema:**

```json
{
  "shuffle_questions": boolean,
  "shuffle_options": boolean,
  "allowed_languages": ["python3", "cpp", "java"],
  "default_language": "python3",
  "show_results_immediately": boolean,
  "allow_late_submission": boolean,
  "late_submission_penalty": number,
  "proctoring_enabled": boolean,
  "tab_blur_limit": number,
  "require_webcam": boolean,
  "passing_percentage": number,
  "negative_marking": boolean,
  "negative_marking_percentage": number
}
```

### Question

Polymorphic question model supporting multiple types.

| Column               | Type        | Constraints                         | Description                           |
| -------------------- | ----------- | ----------------------------------- | ------------------------------------- |
| id                   | UUID        | PK                                  | Unique identifier                     |
| contest              | UUID        | FK → Contest(id), NOT NULL, INDEXED | Parent contest                        |
| type                 | VARCHAR(20) | NOT NULL, INDEXED                   | Question type (mcq/coding/subjective) |
| content              | JSONB       | NOT NULL                            | Type-specific content                 |
| scoring              | JSONB       | NOT NULL, DEFAULT '{}'              | Scoring configuration                 |
| difficulty           | INTEGER     | NOT NULL, 1-5, INDEXED              | Difficulty level                      |
| tags                 | JSONB       | DEFAULT '[]'                        | Array of tags                         |
| source               | VARCHAR(20) | NOT NULL, INDEXED                   | How created (manual/upload/ai)        |
| provenance           | JSONB       | DEFAULT '{}'                        | AI generation tracking                |
| order                | INTEGER     | NOT NULL, DEFAULT 0                 | Display order                         |
| created_at           | TIMESTAMP   | NOT NULL, AUTO                      | Creation timestamp                    |
| updated_at           | TIMESTAMP   | NOT NULL, AUTO                      | Last update                           |
| attempt_count        | INTEGER     | DEFAULT 0                           | Times attempted                       |
| correct_count        | INTEGER     | DEFAULT 0                           | Times answered correctly              |
| average_time_seconds | FLOAT       | DEFAULT 0.0                         | Average time spent                    |

**Unique Constraints:**

- UNIQUE (contest, order)

**Indexes:**

- `idx_question_contest_type` ON (contest, type)
- `idx_question_contest_order` ON (contest, order)
- `idx_question_difficulty` ON (difficulty)

**Content JSON Schema by Type:**

MCQ:

```json
{
  "question": "string",
  "options": ["option1", "option2", "option3", "option4"],
  "correct_answer": 0, // index
  "explanation": "string (optional)",
  "hints": ["hint1", "hint2"] // optional
}
```

Coding:

```json
{
  "title": "string",
  "problem_statement": "string",
  "input_format": "string",
  "output_format": "string",
  "constraints": "string",
  "sample_input": "string",
  "sample_output": "string",
  "test_cases": [
    {
      "input": "string",
      "output": "string",
      "is_hidden": boolean,
      "points": number
    }
  ],
  "time_limit_ms": 2000,
  "memory_limit_mb": 256,
  "starter_code": {
    "python3": "string",
    "cpp": "string",
    "java": "string"
  }
}
```

Subjective:

```json
{
  "question": "string",
  "expected_length": 500, // words
  "rubric": "string",
  "sample_answer": "string (optional)"
}
```

**Scoring JSON Schema:**

```json
{
  "max_marks": number,
  "partial_marks_enabled": boolean,
  "negative_marks": number,
  "time_bonus": number
}
```

### Participant

Represents a candidate taking contests.

| Column         | Type         | Constraints               | Description                   |
| -------------- | ------------ | ------------------------- | ----------------------------- |
| id             | UUID         | PK                        | Unique identifier             |
| name           | VARCHAR(255) | NOT NULL                  | Full name                     |
| email          | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Email address                 |
| phone          | VARCHAR(20)  |                           | Phone number                  |
| metadata       | JSONB        | DEFAULT '{}'              | Additional information        |
| created_at     | TIMESTAMP    | NOT NULL, AUTO            | Registration timestamp        |
| updated_at     | TIMESTAMP    | NOT NULL, AUTO            | Last update                   |
| total_contests | INTEGER      | DEFAULT 0                 | Total contests participated   |
| total_score    | FLOAT        | DEFAULT 0.0               | Average score across contests |

**Indexes:**

- `idx_participant_email` ON (email)

**Metadata JSON Schema:**

```json
{
  "college": "string",
  "graduation_year": number,
  "resume_url": "string",
  "linkedin": "string",
  "github": "string"
}
```

### Attempt

Tracks a participant's attempt at a contest.

| Column                 | Type        | Constraints                             | Description             |
| ---------------------- | ----------- | --------------------------------------- | ----------------------- |
| id                     | UUID        | PK                                      | Unique identifier       |
| contest                | UUID        | FK → Contest(id), NOT NULL, INDEXED     | Contest being attempted |
| participant            | UUID        | FK → Participant(id), NOT NULL, INDEXED | Participant             |
| status                 | VARCHAR(20) | NOT NULL, INDEXED                       | Current status          |
| started_at             | TIMESTAMP   | NULLABLE                                | When attempt started    |
| expires_at             | TIMESTAMP   | NULLABLE, INDEXED                       | Expiry time             |
| finished_at            | TIMESTAMP   | NULLABLE                                | Submission time         |
| time_extension_minutes | INTEGER     | DEFAULT 0                               | Extra time granted      |
| heartbeat_at           | TIMESTAMP   | NULLABLE                                | Last activity ping      |
| tab_blur_count         | INTEGER     | DEFAULT 0                               | Tab blur violations     |
| ip_address             | INET        | NULLABLE                                | IP address              |
| user_agent             | TEXT        |                                         | Browser user agent      |
| proctoring_data        | JSONB       | DEFAULT '{}'                            | Proctoring information  |
| mcq_score              | FLOAT       | DEFAULT 0.0                             | MCQ total score         |
| code_score             | FLOAT       | DEFAULT 0.0                             | Coding total score      |
| subjective_score       | FLOAT       | DEFAULT 0.0                             | Subjective total score  |
| total_score            | FLOAT       | DEFAULT 0.0                             | Combined score          |
| created_at             | TIMESTAMP   | NOT NULL, AUTO                          | Creation timestamp      |
| updated_at             | TIMESTAMP   | NOT NULL, AUTO                          | Last update             |

**Unique Constraints:**

- UNIQUE (participant, contest)

**Indexes:**

- `idx_attempt_contest_status` ON (contest, status)
- `idx_attempt_participant_contest` ON (participant, contest)
- `idx_attempt_status_expires` ON (status, expires_at)

**Status Values:**

- `not_started`: Created but not begun
- `ongoing`: In progress
- `submitted`: Submitted by participant
- `grading`: Being graded
- `graded`: Grading complete
- `invalidated`: Disqualified

**Proctoring Data JSON Schema:**

```json
{
  "screenshots": ["url1", "url2"],
  "webcam_snapshots": ["url1", "url2"],
  "violations": [
    {
      "type": "tab_switch",
      "timestamp": "2024-10-22T10:30:00Z",
      "count": 5
    }
  ],
  "invalidation_reason": "string (optional)"
}
```

### Response

Stores answers to individual questions.

| Column             | Type      | Constraints                          | Description              |
| ------------------ | --------- | ------------------------------------ | ------------------------ |
| id                 | UUID      | PK                                   | Unique identifier        |
| attempt            | UUID      | FK → Attempt(id), NOT NULL, INDEXED  | Parent attempt           |
| question           | UUID      | FK → Question(id), NOT NULL, INDEXED | Question being answered  |
| answer             | JSONB     | DEFAULT '{}'                         | The answer data          |
| score              | FLOAT     | DEFAULT 0.0                          | Awarded score            |
| is_graded          | BOOLEAN   | DEFAULT FALSE, INDEXED               | Grading status           |
| graded_at          | TIMESTAMP | NULLABLE                             | When graded              |
| graded_by          | UUID      | FK → auth_user(id), NULLABLE         | Who graded (manual)      |
| execution_result   | JSONB     | DEFAULT '{}'                         | Code execution results   |
| feedback           | TEXT      |                                      | Manual grading feedback  |
| time_spent_seconds | INTEGER   | DEFAULT 0                            | Time spent on question   |
| attempt_count      | INTEGER   | DEFAULT 0                            | Number of times answered |
| created_at         | TIMESTAMP | NOT NULL, AUTO                       | First save timestamp     |
| updated_at         | TIMESTAMP | NOT NULL, AUTO                       | Last save timestamp      |

**Unique Constraints:**

- UNIQUE (attempt, question)

**Indexes:**

- `idx_response_attempt_question` ON (attempt, question)
- `idx_response_is_graded` ON (is_graded)

**Answer JSON Schema by Type:**

MCQ:

```json
{
  "selected_option": number  // index of selected option
}
```

Coding:

```json
{
  "code": "string",
  "language": "python3",
  "submission_id": "judge0_token"
}
```

Subjective:

```json
{
  "text": "string"
}
```

**Execution Result JSON Schema:**

```json
{
  "test_cases_passed": number,
  "total_test_cases": number,
  "execution_time_ms": number,
  "memory_used_mb": number,
  "test_case_results": [
    {
      "passed": boolean,
      "time_ms": number,
      "memory_mb": number,
      "error": "string (if failed)",
      "expected": "string",
      "got": "string"
    }
  ]
}
```

### AIJob

Tracks AI question generation jobs.

| Column        | Type         | Constraints                           | Description             |
| ------------- | ------------ | ------------------------------------- | ----------------------- |
| id            | UUID         | PK                                    | Unique identifier       |
| admin         | UUID         | FK → auth_user(id), NOT NULL, INDEXED | Requesting admin        |
| type          | VARCHAR(20)  | NOT NULL, INDEXED                     | Generation type         |
| input_prompt  | JSONB        | NOT NULL                              | Input parameters        |
| model_name    | VARCHAR(100) | NOT NULL                              | AI model used           |
| status        | VARCHAR(20)  | NOT NULL, INDEXED                     | Job status              |
| output        | JSONB        | DEFAULT '{}'                          | Generated questions     |
| error_message | TEXT         |                                       | Error details if failed |
| created_at    | TIMESTAMP    | NOT NULL, AUTO, INDEXED               | Job creation            |
| started_at    | TIMESTAMP    | NULLABLE                              | Processing start        |
| completed_at  | TIMESTAMP    | NULLABLE                              | Processing end          |

**Indexes:**

- `idx_aijob_admin_status` ON (admin, status)
- `idx_aijob_type_status` ON (type, status)
- `idx_aijob_created_at` ON (created_at DESC)

## Query Patterns

### Get Active Contests

```sql
SELECT * FROM contests
WHERE status = 'published'
  AND start_at <= NOW()
  AND end_at >= NOW()
ORDER BY start_at;
```

### Get Leaderboard

```sql
SELECT
  p.name,
  p.email,
  a.total_score,
  a.finished_at,
  RANK() OVER (ORDER BY a.total_score DESC) as rank
FROM attempts a
JOIN participants p ON a.participant = p.id
WHERE a.contest = ?
  AND a.status = 'graded'
ORDER BY a.total_score DESC;
```

### Get Pending Subjective Responses

```sql
SELECT r.*, q.content, p.email
FROM responses r
JOIN questions q ON r.question = q.id
JOIN attempts a ON r.attempt = a.id
JOIN participants p ON a.participant = p.id
WHERE q.type = 'subjective'
  AND r.is_graded = FALSE
  AND a.status = 'submitted'
ORDER BY r.created_at;
```

### Calculate Contest Statistics

```sql
SELECT
  COUNT(DISTINCT a.participant) as total_participants,
  COUNT(*) FILTER (WHERE a.status = 'graded') as total_submissions,
  AVG(a.total_score) as average_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.total_score) as median_score
FROM attempts a
WHERE a.contest = ?;
```

## Performance Optimization

### Partitioning Strategy

Large tables can be partitioned:

```sql
-- Partition attempts by contest
CREATE TABLE attempts_partition OF attempts
PARTITION BY LIST (contest);

-- Partition responses by attempt
CREATE TABLE responses_partition OF responses
PARTITION BY HASH (attempt);
```

### Read Replicas

- Primary: All writes
- Replica 1: Analytics queries
- Replica 2: Results export

### Indexing Strategy

1. **B-tree indexes** for exact lookups and ranges
2. **GIN indexes** for JSONB columns with frequent queries
3. **Partial indexes** for common filters

Example:

```sql
-- Index for ongoing attempts only
CREATE INDEX idx_ongoing_attempts
ON attempts(expires_at)
WHERE status = 'ongoing';

-- GIN index for tag searches
CREATE INDEX idx_question_tags
ON questions USING GIN(tags);
```

## Backup and Recovery

### Backup Strategy

- Full backup: Daily at 2 AM UTC
- Incremental: Every 6 hours
- Point-in-time recovery enabled
- Retention: 30 days

### Recovery Procedures

```bash
# Restore from backup
pg_restore -d elevate_contest backup_file.dump

# Point-in-time recovery
pg_restore -d elevate_contest -t '2024-10-22 10:00:00' backup_file.dump
```
