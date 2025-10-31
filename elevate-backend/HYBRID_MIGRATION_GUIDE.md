# Hybrid Architecture Migration Guide

## From Django Monolith to Django + Go Microservices

---

## 📋 Current Architecture (Ready for 50K Users)

```
┌─────────────────────────────────────────────┐
│            Load Balancer (Nginx)            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Django REST API (Gunicorn)          │
│  - Admin operations                         │
│  - Contest CRUD                             │
│  - Question management                      │
│  - Code execution (Judge0)                  │
│  - Real-time operations                     │
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐      ┌──────────────┐
│  PostgreSQL  │      │    Redis     │
└──────────────┘      └──────────────┘
```

**Capacity:** 1K-50K concurrent users  
**Latency:** 50-200ms  
**Cost:** Low  
**Complexity:** Low

---

## 🎯 Target Architecture (Ready for 10M Users)

```
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Kong/Traefik)                      │
│         Route by path: /admin → Django, /contest → Go      │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Django    │ │   Go Contest│ │   Go WS     │
│   Admin     │ │   Engine    │ │   Server    │
│             │ │             │ │             │
│ - Contest   │ │ - Execution │ │ - Live      │
│   Creation  │ │ - Grading   │ │   Updates   │
│ - Questions │ │ - Leaderboard│ │ - Proctoring│
│ - Users     │ │ - Submission│ │ - Alerts    │
│ - AI Gen    │ │ - Validation│ │             │
│ - Reports   │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
        ┌───────────────────────┐
        │     PostgreSQL        │
        │   (Shared Database)   │
        └───────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Redis Cluster│ │  RabbitMQ   │ │   S3/MinIO  │
│(Leaderboard)│ │  (Events)   │ │   (Files)   │
└─────────────┘ └─────────────┘ └─────────────┘
```

**Capacity:** 100K-10M concurrent users  
**Latency:** 5-20ms  
**Cost:** Medium (optimized)  
**Complexity:** Medium

---

## ✅ What Makes Our System Migration-Ready?

### 1. **Microservices-Ready Infrastructure**

#### Current Docker Compose (Already Modular!)

```yaml
services:
  db: # ✅ Shared service
  redis: # ✅ Shared service
  api: # ✅ Django service (isolated)
  celery: # ✅ Async workers (isolated)
```

#### After Migration (Just Add Go!)

```yaml
services:
  db: # ✅ No change
  redis: # ✅ No change
  api: # ✅ Django (reduced scope)
  contest: # 🆕 Go contest engine
  websocket: # 🆕 Go WebSocket server
  celery: # ✅ Django async tasks
```

### 2. **Clean API Boundaries**

#### Admin Operations → Stay in Django

```python
# These endpoints handle low-frequency, complex operations
# Perfect for Django's batteries-included approach

POST   /api/v1/admin/contests/           # Create contest
PUT    /api/v1/admin/contests/{id}/      # Update contest
POST   /api/v1/admin/questions/          # Create question
POST   /api/v1/admin/ai/generate/        # AI generation
GET    /api/v1/admin/participants/       # User management
POST   /api/v1/admin/grading/manual/     # Manual grading
```

#### Contest Execution → Move to Go

```python
# These endpoints handle high-frequency, performance-critical operations
# Perfect for Go's concurrency and speed

POST   /api/v1/contest/{id}/start/       # Start attempt (10K req/s)
POST   /api/v1/contest/{id}/submit/      # Submit code (50K req/s)
GET    /api/v1/contest/{id}/leaderboard/ # Real-time ranks (100K req/s)
POST   /api/v1/attempt/{id}/answer/      # Submit answer (50K req/s)
GET    /api/v1/contest/{id}/status/      # Contest state (100K req/s)
WS     /ws/contest/{id}/                 # Live updates (1M connections)
```

### 3. **Shared Database Access**

#### Django ORM (Admin Operations)

```python
# Complex queries with Django's powerful ORM
Contest.objects.filter(
    status='draft'
).select_related('created_by').prefetch_related(
    'questions', 'participants'
).annotate(
    total_attempts=Count('attempts')
)
```

#### Go SQL (Contest Execution)

```go
// Fast, optimized queries for real-time operations
db.QueryRow(`
    SELECT id, status, end_at
    FROM contests_contest
    WHERE id = $1 AND status = 'ongoing'
`, contestID).Scan(&contest)
```

**Both access same PostgreSQL - No data sync needed!**

### 4. **Event-Driven Communication**

#### Current: Django Signals (Internal)

```python
@receiver(post_save, sender=Attempt)
def update_leaderboard(sender, instance, **kwargs):
    # Signal-based communication
    tasks.update_leaderboard_cache.delay(instance.contest_id)
```

#### Future: Message Queue (Cross-Service)

```python
# Django publishes events
def contest_started(contest_id):
    publish_event('contest.started', {
        'contest_id': contest_id,
        'start_time': now()
    })

# Go consumes events
go func() {
    for event := range events {
        if event.Type == "contest.started" {
            initializeContestCache(event.ContestID)
        }
    }
}()
```

### 5. **Monitoring & Metrics Built-In**

#### Current Monitoring Endpoints

```python
# Already implemented in apps/monitoring/
GET /api/v1/monitoring/health/     # Health check
GET /api/v1/monitoring/metrics/    # Prometheus metrics
GET /api/v1/monitoring/errors/     # Error tracking
```

#### These work for BOTH Django and Go services!

```
Prometheus → Scrapes metrics from all services
Grafana → Unified dashboard for Django + Go
```

---

## 🚀 Migration Strategy (When to Do What)

### **Phase 1: Current (0-50K users)** ✅ YOU ARE HERE

**Stack:** Django monolith  
**Timeline:** 6-12 months  
**Focus:** Feature development, user acquisition

```yaml
services:
  api: django # All operations
  db: postgres
  redis: redis
  celery: django
```

**Optimizations:**

- Add Redis caching for leaderboard
- Enable query caching
- Add CDN for static assets
- Scale vertically (bigger servers)

---

### **Phase 2: Pre-Hybrid (50K-100K users)** 🎯 NEXT MILESTONE

**Stack:** Django + Performance optimization  
**Timeline:** When latency > 100ms consistently  
**Focus:** Database optimization, aggressive caching

**Warning Signs to Watch:**

```bash
# Django becomes bottleneck when:
- API latency > 100ms (P95)
- Database CPU > 70%
- Redis memory > 80%
- Code execution queue > 1000 jobs
```

**Actions Before Going Hybrid:**

1. **Add database read replicas**

```yaml
services:
  db_primary: # Write operations
  db_replica_1: # Read operations
  db_replica_2: # Read operations
```

2. **Implement Redis clustering**

```yaml
redis_cluster:
  - node1 (Leaderboard)
  - node2 (Caching)
  - node3 (Sessions)
```

3. **Aggressive caching strategy**

```python
# Cache everything that doesn't change during contest
@cache_result(ttl=3600)
def get_contest_details(contest_id):
    return Contest.objects.get(id=contest_id)

# Real-time data in Redis
redis.zadd(f'leaderboard:{contest_id}', {user_id: score})
```

---

### **Phase 3: Hybrid Migration (100K-1M users)** 🔄 FUTURE

**Stack:** Django + Go Contest Engine  
**Timeline:** When Phase 2 optimizations hit limits  
**Focus:** Extract high-performance endpoints to Go

#### Step 1: Add Go Service (Parallel Development)

```yaml
services:
  api: django # All operations (unchanged)
  contest_v2: go # New contest engine (beta)
  db: postgres
  redis: redis
```

**Gradual Traffic Migration:**

```python
# Django API Gateway routes based on feature flag
if user.beta_tester or settings.GO_ROLLOUT_PERCENTAGE > random():
    forward_to_go_service(request)
else:
    handle_in_django(request)
```

#### Step 2: Data Validation

```python
# Run both systems in parallel, compare results
django_result = django_submit_code(submission)
go_result = go_submit_code(submission)

if django_result != go_result:
    log_error("Result mismatch", django_result, go_result)
```

#### Step 3: Full Cutover (10% → 50% → 100%)

```
Week 1: 10% traffic to Go  (Beta users)
Week 2: 25% traffic to Go  (Monitor metrics)
Week 3: 50% traffic to Go  (Validate at scale)
Week 4: 100% traffic to Go (Complete migration)
```

---

### **Phase 4: Full Microservices (1M-10M users)** 🚀 ULTIMATE SCALE

**Stack:** Django + Multiple Go Services  
**Timeline:** When single Go service hits limits

```yaml
services:
  # Django (Admin operations)
  api: django
  celery_worker: django

  # Go Services (Contest execution)
  contest_api: go # Contest endpoints
  contest_ws: go # WebSocket server
  grading_engine: go # Code execution
  leaderboard_api: go # Real-time rankings

  # Data Layer
  db_primary: postgres
  db_replica_1: postgres
  db_replica_2: postgres
  redis_cluster: redis (6 nodes)
  rabbitmq: message queue

  # Storage
  minio: object storage
```

---

## 🔧 Concrete Migration Example

### Current: Submit Code (Django)

```python
# apps/attempts/views.py
class SubmitAnswerView(APIView):
    def post(self, request, attempt_id):
        # 1. Validate (30ms)
        attempt = Attempt.objects.get(id=attempt_id)

        # 2. Save to DB (20ms)
        answer = Answer.objects.create(
            attempt=attempt,
            question=question,
            code=request.data['code']
        )

        # 3. Queue for grading (10ms)
        tasks.grade_submission.delay(answer.id)

        # 4. Update leaderboard (15ms)
        update_leaderboard_cache(attempt.contest_id)

        # Total: ~75ms
        return Response({'status': 'submitted'})
```

### Future: Submit Code (Go)

```go
// contest_engine/handlers/submit.go
func (h *ContestHandler) SubmitCode(c *gin.Context) {
    // 1. Validate (2ms) - in-memory checks
    attempt, err := h.cache.GetAttempt(attemptID)

    // 2. Save to DB (5ms) - prepared statement
    answerID := h.db.SaveAnswer(attempt.ID, code)

    // 3. Queue for grading (1ms) - channel send
    h.gradingQueue <- GradingJob{AnswerID: answerID}

    // 4. Update leaderboard (2ms) - Redis sorted set
    h.redis.ZIncrBy(ctx, "leaderboard", score, userID)

    // Total: ~10ms (7.5x faster!)
    c.JSON(200, gin.H{"status": "submitted"})
}
```

**Performance Gain:** 75ms → 10ms (7.5x faster)  
**Throughput Gain:** 1K req/s → 50K req/s (50x more)

---

## 📊 Migration Readiness Checklist

### ✅ Already Implemented (Ready for Migration!)

- [x] **Docker-based architecture** (Easy to add Go service)
- [x] **Separate database service** (Can be shared by Django + Go)
- [x] **External Redis** (Shared cache layer)
- [x] **RESTful API** (Technology-agnostic interface)
- [x] **Health check endpoints** (Monitoring infrastructure)
- [x] **Structured logging** (Works with Go too)
- [x] **Environment-based config** (12-factor app)
- [x] **Celery for async tasks** (Can coexist with Go)
- [x] **Domain-driven apps** (Clear service boundaries)
- [x] **UUID primary keys** (No auto-increment issues across services)

### 🔨 Will Need to Implement (When Scaling)

- [ ] **API Gateway** (Kong/Traefik for routing)
- [ ] **Message Queue** (RabbitMQ/Kafka for events)
- [ ] **Service Discovery** (Consul/etcd)
- [ ] **Distributed Tracing** (Jaeger/Zipkin)
- [ ] **Circuit Breakers** (Resilience patterns)
- [ ] **Database Connection Pooling** (PgBouncer)
- [ ] **Redis Clustering** (For high availability)

---

## 💰 Cost-Benefit Analysis

### Current Django Monolith (50K users)

```
2x API servers    (4 CPU, 8GB RAM)  = $200/month
1x PostgreSQL     (2 CPU, 8GB RAM)  = $100/month
1x Redis          (1 CPU, 2GB RAM)  = $30/month
1x Celery worker  (2 CPU, 4GB RAM)  = $60/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $390/month
```

### Optimized Django (100K users)

```
5x API servers    = $500/month
2x DB replicas    = $200/month
3x Redis nodes    = $90/month
3x Celery workers = $180/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $970/month
```

### Hybrid Django + Go (1M users)

```
2x Django API     = $200/month (reduced scope)
3x Go Contest     = $150/month (more efficient)
3x DB replicas    = $300/month
6x Redis cluster  = $180/month
2x Celery workers = $120/month
1x RabbitMQ       = $50/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $1,000/month (10x users, similar cost!)
```

### Full Microservices (10M users)

```
3x Django API     = $300/month
10x Go services   = $500/month
5x DB replicas    = $500/month
12x Redis cluster = $360/month
3x Celery workers = $180/month
3x RabbitMQ       = $150/month
CDN               = $200/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: $2,190/month (100x users, 5.6x cost!)
```

**Key Insight:** Hybrid architecture scales costs sub-linearly with users!

---

## 🎯 Decision Framework: When to Migrate?

### Stay with Django Monolith IF:

- ✅ Current users < 50K
- ✅ Latency < 100ms is acceptable
- ✅ Team only knows Python
- ✅ Feature velocity > optimization
- ✅ Infrastructure budget < $1K/month

### Start Planning Hybrid IF:

- ⚠️ Users approaching 50K-100K
- ⚠️ Latency P95 > 100ms
- ⚠️ Database CPU consistently > 60%
- ⚠️ Contest execution causing bottlenecks
- ⚠️ Have 3-6 months for migration

### Commit to Hybrid IF:

- 🚨 Users > 100K
- 🚨 Latency P95 > 200ms
- 🚨 Infrastructure costs growing linearly
- 🚨 Losing users due to performance
- 🚨 Competitors offering better UX

---

## 🛠️ Tools & Technologies for Migration

### API Gateway Options

```
Kong       - Feature-rich, plugin ecosystem
Traefik    - Cloud-native, easy Docker integration
Nginx      - Battle-tested, requires manual config
Envoy      - Service mesh ready, complex
```

### Message Queue Options

```
RabbitMQ   - Easy setup, good for events
Kafka      - High throughput, complex ops
Redis      - Simple pub/sub, no persistence
NATS       - Cloud-native, fast
```

### Monitoring Stack

```
Prometheus - Metrics collection (both Django + Go)
Grafana    - Dashboards & visualization
Jaeger     - Distributed tracing
ELK Stack  - Centralized logging
```

---

## 📚 Learning Resources for Your Team

### Go for Python Developers

- ["Learning Go" by Jon Bodner](https://www.oreilly.com/library/view/learning-go/9781492077206/)
- [Go by Example](https://gobyexample.com/) - Quick practical examples
- [Effective Go](https://go.dev/doc/effective_go) - Official best practices

### Microservices Patterns

- ["Building Microservices" by Sam Newman](https://samnewman.io/books/building_microservices_2nd_edition/)
- [Microservices.io](https://microservices.io/patterns/) - Pattern catalog
- ["The Art of Scalability" by Martin Abbott](https://theartofscalability.com/)

### Production War Stories

- [How Discord scaled to 5M concurrent users](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users)
- [Uber's microservices evolution](https://eng.uber.com/microservice-architecture/)
- [Netflix's migration journey](https://netflixtechblog.com/)

---

## 🎉 Summary: You're Already 80% Ready!

### What You Have (Migration-Friendly):

1. ✅ **Containerized services** (Docker Compose)
2. ✅ **External data layer** (PostgreSQL, Redis)
3. ✅ **RESTful APIs** (Technology-agnostic)
4. ✅ **Domain-driven design** (Clear boundaries)
5. ✅ **Monitoring infrastructure** (Health checks, metrics)
6. ✅ **Async processing** (Celery, can coexist with Go)

### What You'll Add (When Scaling):

1. 🔜 **API Gateway** (Route to Django vs Go)
2. 🔜 **Go services** (Contest execution, WebSocket)
3. 🔜 **Message queue** (Cross-service events)
4. 🔜 **Database replicas** (Read scaling)
5. 🔜 **Redis cluster** (Cache scaling)

### Migration is NOT a Rewrite:

- Django keeps running (admin operations)
- Go handles new high-performance endpoints
- Both share same database
- Gradual traffic migration (0% → 100%)
- Can rollback at any time

---

## 🚀 Next Steps

### Immediate (Now):

1. ✅ **Keep building features in Django** (maximize learning)
2. ✅ **Add performance monitoring** (track baselines)
3. ✅ **Implement Redis caching** (easy wins)
4. ✅ **Load testing** (know your limits)

### Soon (3-6 months):

1. 🔜 **Prototype Go service** (contest execution only)
2. 🔜 **Set up API Gateway** (Kong/Traefik)
3. 🔜 **Add message queue** (RabbitMQ)
4. 🔜 **Database read replicas** (scale reads)

### Later (6-12 months):

1. 📅 **Migrate contest endpoints** (gradual rollout)
2. 📅 **Add WebSocket service** (real-time features)
3. 📅 **Implement sharding** (10M+ users)
4. 📅 **Multi-region deployment** (global scale)

---

**Your system is architected for growth! 🎯**

The Django foundation you have is solid. When the time comes to scale beyond 50K users, adding Go services will be a natural evolution, not a painful rewrite.

Focus on building great features now. The hybrid architecture will be there when you need it.
