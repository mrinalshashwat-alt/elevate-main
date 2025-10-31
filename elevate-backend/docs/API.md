# API Documentation

Complete API reference for the Elevate Contest Platform.

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.elevatecareer.ai/api/v1
```

## Authentication

All admin endpoints require JWT authentication. Contest start endpoint accepts anonymous requests.

### Get Access Token

```http
POST /api/v1/auth/token/
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Use Token

```http
GET /api/v1/admin/contests/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Admin APIs

### Contest Management

#### Create Contest

```http
POST /api/v1/admin/contests/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Python Assessment 2024",
  "description": "Advanced Python programming test",
  "instructions": "Read each question carefully...",
  "start_at": "2024-11-01T10:00:00Z",
  "end_at": "2024-11-01T14:00:00Z",
  "duration_minutes": 120,
  "settings": {
    "shuffle_questions": true,
    "shuffle_options": true,
    "allowed_languages": ["python3", "cpp", "java"],
    "default_language": "python3",
    "show_results_immediately": false,
    "proctoring_enabled": true,
    "tab_blur_limit": 5,
    "passing_percentage": 60,
    "negative_marking": true,
    "negative_marking_percentage": 25
  }
}
```

Response `201 Created`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Python Assessment 2024",
  "status": "draft",
  "created_at": "2024-10-22T10:00:00Z",
  ...
}
```

#### List Contests

```http
GET /api/v1/admin/contests/?status=published&ordering=-created_at
```

Query Parameters:

- `status`: Filter by status (draft, published, ongoing, closed)
- `ordering`: Sort by field (-created_at, start_at, name)
- `search`: Search in name and description
- `page`: Page number
- `page_size`: Results per page (default: 100)

Response `200 OK`:

```json
{
  "count": 25,
  "next": "http://api.../contests/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Contest 1",
      "status": "published",
      "start_at": "2024-11-01T10:00:00Z",
      "total_participants": 156,
      ...
    }
  ]
}
```

#### Get Contest Details

```http
GET /api/v1/admin/contests/{id}/
```

Response `200 OK`:

```json
{
  "id": "uuid",
  "name": "Python Assessment 2024",
  "description": "...",
  "status": "published",
  "start_at": "2024-11-01T10:00:00Z",
  "end_at": "2024-11-01T14:00:00Z",
  "duration_minutes": 120,
  "settings": {...},
  "question_distribution": {
    "mcq": 10,
    "coding": 5,
    "subjective": 3
  },
  "total_marks": 100,
  "total_participants": 156,
  "total_submissions": 142,
  "average_score": 67.5
}
```

#### Update Contest

```http
PATCH /api/v1/admin/contests/{id}/
Content-Type: application/json

{
  "name": "Updated Contest Name",
  "duration_minutes": 150
}
```

#### Publish Contest

```http
POST /api/v1/admin/contests/{id}/publish/
```

Response `200 OK`:

```json
{
  "status": "published",
  "message": "Contest published successfully"
}
```

#### Get Contest Results

```http
GET /api/v1/admin/contests/{id}/results/?ordering=-total_score
```

Response `200 OK`:

```json
{
  "results": [
    {
      "rank": 1,
      "participant": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total_score": 95.5,
      "mcq_score": 40,
      "code_score": 45.5,
      "subjective_score": 10,
      "time_taken_minutes": 98,
      "finished_at": "2024-11-01T11:38:00Z"
    },
    ...
  ]
}
```

#### Export Results

```http
GET /api/v1/admin/contests/{id}/export.csv
```

Returns CSV file with all results.

### Question Management

#### Create Question

**MCQ Question:**

```http
POST /api/v1/admin/questions/
Content-Type: application/json

{
  "contest": "contest-uuid",
  "type": "mcq",
  "content": {
    "question": "What is the output of print(2**3)?",
    "options": ["6", "8", "9", "23"],
    "correct_answer": 1,
    "explanation": "2**3 means 2 to the power of 3, which is 8"
  },
  "scoring": {
    "max_marks": 2,
    "negative_marks": 0.5
  },
  "difficulty": 2,
  "tags": ["python", "operators", "basics"]
}
```

**Coding Question:**

```http
POST /api/v1/admin/questions/
Content-Type: application/json

{
  "contest": "contest-uuid",
  "type": "coding",
  "content": {
    "title": "Two Sum",
    "problem_statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "input_format": "First line: n (array length)\nSecond line: n space-separated integers\nThird line: target integer",
    "output_format": "Two space-separated indices",
    "constraints": "2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
    "sample_input": "4\n2 7 11 15\n9",
    "sample_output": "0 1",
    "test_cases": [
      {
        "input": "4\n2 7 11 15\n9",
        "output": "0 1",
        "is_hidden": false,
        "points": 10
      },
      {
        "input": "3\n3 2 4\n6",
        "output": "1 2",
        "is_hidden": true,
        "points": 15
      }
    ],
    "time_limit_ms": 2000,
    "memory_limit_mb": 256,
    "starter_code": {
      "python3": "def two_sum(nums, target):\n    # Your code here\n    pass",
      "cpp": "#include<vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}"
    }
  },
  "scoring": {
    "max_marks": 25,
    "partial_marks_enabled": true
  },
  "difficulty": 3,
  "tags": ["arrays", "hash-table", "two-pointers"]
}
```

**Subjective Question:**

```http
POST /api/v1/admin/questions/
Content-Type: application/json

{
  "contest": "contest-uuid",
  "type": "subjective",
  "content": {
    "question": "Explain the difference between Process and Thread in operating systems. Provide real-world examples.",
    "expected_length": 300,
    "rubric": "Should cover: definition of process, definition of thread, key differences, memory allocation, real-world examples"
  },
  "scoring": {
    "max_marks": 10
  },
  "difficulty": 3,
  "tags": ["operating-systems", "concepts"]
}
```

#### Bulk Upload Questions (CSV)

```http
POST /api/v1/admin/questions/upload/csv
Content-Type: multipart/form-data

file: questions.csv
contest: contest-uuid
```

CSV Format for MCQ:

```csv
type,question,option1,option2,option3,option4,correct_answer,max_marks,difficulty,tags
mcq,"What is 2+2?","2","3","4","5",2,2,1,"math,basics"
```

#### Bulk Upload Questions (JSON)

```http
POST /api/v1/admin/questions/upload/json
Content-Type: application/json

{
  "contest": "contest-uuid",
  "questions": [
    {
      "type": "mcq",
      "content": {...},
      "scoring": {...}
    },
    ...
  ]
}
```

Response:

```json
{
  "success": true,
  "created": 25,
  "errors": []
}
```

### AI Question Generation

#### Generate MCQ Questions

```http
POST /api/v1/admin/ai/generate-mcq/
Content-Type: application/json

{
  "topic": "Python Lists and Tuples",
  "difficulty": 3,
  "count": 5,
  "options_count": 4,
  "include_explanation": true
}
```

Response `202 Accepted`:

```json
{
  "job_id": "ai-job-uuid",
  "status": "pending",
  "message": "AI generation started"
}
```

#### Generate Coding Questions

```http
POST /api/v1/admin/ai/generate-code/
Content-Type: application/json

{
  "topic": "Dynamic Programming",
  "difficulty": 4,
  "count": 2,
  "include_test_cases": 5,
  "languages": ["python3", "cpp"]
}
```

#### Generate Subjective Questions

```http
POST /api/v1/admin/ai/generate-subjective/
Content-Type: application/json

{
  "topic": "Machine Learning Algorithms",
  "difficulty": 3,
  "count": 3,
  "expected_length": 300
}
```

#### Get AI Job Status

```http
GET /api/v1/admin/ai/jobs/{job_id}/
```

Response:

```json
{
  "id": "uuid",
  "type": "mcq",
  "status": "completed",
  "output": {
    "questions": [
      {
        "content": {...},
        "scoring": {...}
      }
    ],
    "metadata": {
      "tokens_used": 1500,
      "processing_time": 8.5
    }
  },
  "created_at": "2024-10-22T10:00:00Z",
  "completed_at": "2024-10-22T10:00:08Z"
}
```

#### List AI Jobs

```http
GET /api/v1/admin/ai/jobs/?status=completed
```

### Participant Monitoring

#### List Participants

```http
GET /api/v1/admin/participants/?contest=contest-uuid
```

Response:

```json
{
  "results": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "attempt": {
        "status": "ongoing",
        "started_at": "2024-10-22T10:00:00Z",
        "time_remaining_seconds": 3600,
        "tab_blur_count": 2
      }
    }
  ]
}
```

#### Extend Time

```http
POST /api/v1/admin/attempts/{attempt_id}/extend/
Content-Type: application/json

{
  "minutes": 15,
  "reason": "Technical issue reported"
}
```

#### Invalidate Attempt

```http
POST /api/v1/admin/attempts/{attempt_id}/invalidate/
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

### Grading

#### Manual Grade Subjective Response

```http
POST /api/v1/admin/grading/responses/{response_id}/
Content-Type: application/json

{
  "score": 8.5,
  "feedback": "Good explanation but missing examples"
}
```

#### Get Pending Subjective Responses

```http
GET /api/v1/admin/grading/pending/?contest=contest-uuid
```

#### Regrade Attempt

```http
POST /api/v1/admin/grading/regrade/{attempt_id}/
```

## Candidate APIs

### Start Contest

```http
POST /api/v1/contest/{contest_id}/start/
Content-Type: application/json

{
  "email": "candidate@example.com",
  "name": "Jane Smith",
  "phone": "+1234567890"
}
```

Response `201 Created`:

```json
{
  "attempt_id": "uuid",
  "token": "jwt-token",
  "expires_at": "2024-10-22T12:00:00Z",
  "contest": {
    "name": "Python Assessment",
    "duration_minutes": 120,
    "total_questions": 18
  },
  "questions": [
    {
      "id": "uuid",
      "type": "mcq",
      "order": 0,
      "content": {
        "question": "...",
        "options": ["A", "B", "C", "D"]
      },
      "max_marks": 2
    },
    ...
  ]
}
```

### Autosave Answer

```http
POST /api/v1/attempt/{attempt_id}/save/
Authorization: Bearer <attempt-token>
Content-Type: application/json

{
  "question_id": "uuid",
  "answer": {
    "selected_option": 2
  }
}
```

For coding:

```json
{
  "question_id": "uuid",
  "answer": {
    "code": "def solution():\n    return 42",
    "language": "python3"
  }
}
```

Response `200 OK`:

```json
{
  "saved": true,
  "time_remaining_seconds": 3542
}
```

### Submit Contest

```http
POST /api/v1/attempt/{attempt_id}/submit/
Authorization: Bearer <attempt-token>
```

Response:

```json
{
  "submitted": true,
  "finished_at": "2024-10-22T11:45:00Z",
  "message": "Your responses have been submitted successfully"
}
```

### Execute Code

```http
POST /api/v1/attempt/{attempt_id}/code/execute/
Authorization: Bearer <attempt-token>
Content-Type: application/json

{
  "question_id": "uuid",
  "code": "def solution(nums, target):\n    ...",
  "language": "python3",
  "test_case_index": 0
}
```

Response `202 Accepted`:

```json
{
  "job_id": "judge0-token",
  "status": "processing"
}
```

### Get Execution Result

```http
GET /api/v1/attempt/{attempt_id}/code/result/{job_id}/
Authorization: Bearer <attempt-token>
```

Response:

```json
{
  "status": "completed",
  "result": {
    "passed": true,
    "output": "0 1",
    "expected": "0 1",
    "execution_time_ms": 145,
    "memory_used_mb": 12.5
  }
}
```

### Heartbeat

```http
POST /api/v1/attempt/{attempt_id}/heartbeat/
Authorization: Bearer <attempt-token>
Content-Type: application/json

{
  "tab_blur_event": false
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": {
    "email": ["Enter a valid email address"]
  }
}
```

### 401 Unauthorized

```json
{
  "error": "authentication_failed",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "permission_denied",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Contest not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again in 60 seconds"
}
```

### 500 Internal Server Error

```json
{
  "error": "server_error",
  "message": "An internal error occurred",
  "request_id": "req-uuid"
}
```

## Rate Limiting

| Endpoint        | Limit                  |
| --------------- | ---------------------- |
| /contest/start  | 10/minute per IP       |
| /attempt/save   | 100/minute per attempt |
| /code/execute   | 30/minute per attempt  |
| Admin endpoints | 1000/hour per user     |

## Webhooks

Configure webhooks to receive notifications:

### Events

- `contest.started`
- `contest.finished`
- `attempt.submitted`
- `grading.completed`

### Payload

```json
{
  "event": "attempt.submitted",
  "timestamp": "2024-10-22T11:45:00Z",
  "data": {
    "attempt_id": "uuid",
    "contest_id": "uuid",
    "participant_email": "user@example.com"
  }
}
```
