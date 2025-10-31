# Deployment Guide

Complete guide for deploying the Elevate Contest Platform backend to production.

## Table of Contents

- [Infrastructure Requirements](#infrastructure-requirements)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Providers](#cloud-providers)
- [Production Configuration](#production-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

## Infrastructure Requirements

### Minimum Requirements (1000 concurrent users)

- **API Servers**: 2x instances (4 vCPU, 8GB RAM)
- **Database**: PostgreSQL 15 (4 vCPU, 16GB RAM, 100GB SSD)
- **Redis**: Single instance (2 vCPU, 4GB RAM)
- **Celery Workers**: 3x instances (2 vCPU, 4GB RAM)
- **Load Balancer**: Nginx or managed LB

### Recommended for 10k Concurrent Users

- **API Servers**: 8-10x instances (8 vCPU, 16GB RAM each)
- **Database**: PostgreSQL cluster with replication
  - Primary: 8 vCPU, 32GB RAM, 500GB SSD
  - Replicas: 2x (8 vCPU, 32GB RAM, 500GB SSD)
- **Redis**: Redis Cluster (3 masters, 3 replicas, 4GB RAM each)
- **Celery Workers**: 10-15x instances (4 vCPU, 8GB RAM)
- **Load Balancer**: Multi-zone managed LB

## Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "120"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: elevate_contest
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 2
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery_worker:
    build: .
    command: celery -A config worker -l info -c 4
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
      - redis
    deploy:
      replicas: 3

  celery_beat:
    build: .
    command: celery -A config beat -l info
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - static_volume:/staticfiles
      - media_volume:/media
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### Deploy with Docker

```bash
# Build and start services
docker-compose up -d --build

# Run migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# View logs
docker-compose logs -f api

# Scale workers
docker-compose up -d --scale celery_worker=5
```

## Kubernetes Deployment

### Namespace and ConfigMap

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: elevate-contest

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: elevate-config
  namespace: elevate-contest
data:
  DEBUG: "False"
  ALLOWED_HOSTS: "api.elevatecareer.ai"
  MAX_CONCURRENT_USERS: "10000"
```

### Secrets

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: elevate-secrets
  namespace: elevate-contest
type: Opaque
stringData:
  SECRET_KEY: "your-secret-key"
  DB_PASSWORD: "your-db-password"
  OPENAI_API_KEY: "your-openai-key"
  JUDGE0_API_KEY: "your-judge0-key"
```

### Database Deployment

```yaml
# postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: elevate-contest
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: elevate_contest
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: elevate-secrets
                  key: DB_PASSWORD
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: elevate-contest
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  clusterIP: None
```

### API Deployment

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: elevate-contest
spec:
  replicas: 10
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: elevate-backend:latest
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: elevate-config
            - secretRef:
                name: elevate-secrets
          resources:
            requests:
              cpu: "2"
              memory: "4Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
          livenessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: elevate-contest
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8000
  type: LoadBalancer
```

### Celery Workers Deployment

```yaml
# celery-worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
  namespace: elevate-contest
spec:
  replicas: 10
  selector:
    matchLabels:
      app: celery-worker
  template:
    metadata:
      labels:
        app: celery-worker
    spec:
      containers:
        - name: worker
          image: elevate-backend:latest
          command: ["celery", "-A", "config", "worker", "-l", "info", "-c", "4"]
          envFrom:
            - configMapRef:
                name: elevate-config
            - secretRef:
                name: elevate-secrets
          resources:
            requests:
              cpu: "2"
              memory: "4Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
```

### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: elevate-contest
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 5
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create secrets
kubectl apply -f secrets.yaml

# Deploy database
kubectl apply -f postgres.yaml

# Deploy Redis
kubectl apply -f redis.yaml

# Deploy API
kubectl apply -f api-deployment.yaml

# Deploy Celery workers
kubectl apply -f celery-worker.yaml

# Deploy autoscaler
kubectl apply -f hpa.yaml

# Check status
kubectl get pods -n elevate-contest

# View logs
kubectl logs -f deployment/api -n elevate-contest
```

## Cloud Providers

### AWS Deployment

#### Architecture

- **EC2**: API servers (t3.2xlarge)
- **RDS**: PostgreSQL Multi-AZ (db.r5.2xlarge)
- **ElastiCache**: Redis cluster
- **ALB**: Application Load Balancer
- **S3**: Static files and media
- **CloudWatch**: Monitoring
- **ECS/EKS**: Container orchestration

#### Terraform Configuration

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "elevate-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
}

# RDS PostgreSQL
module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "elevate-db"

  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.r5.2xlarge"
  allocated_storage = 500

  db_name  = "elevate_contest"
  username = "postgres"
  password = var.db_password

  multi_az = true

  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name

  backup_retention_period = 30
  backup_window          = "03:00-06:00"
  maintenance_window     = "Mon:00:00-Mon:03:00"
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "elevate-redis"
  description          = "Redis cluster for Elevate"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.r5.large"
  num_cache_clusters   = 3

  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  automatic_failover_enabled = true
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "elevate-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "elevate-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "2048"
  memory                   = "4096"

  container_definitions = jsonencode([{
    name  = "api"
    image = "your-ecr-repo/elevate-backend:latest"
    portMappings = [{
      containerPort = 8000
      protocol      = "tcp"
    }]
    environment = [
      {
        name  = "DATABASE_URL"
        value = "postgresql://${module.db.db_instance_username}:${var.db_password}@${module.db.db_instance_address}:5432/${module.db.db_instance_name}"
      }
    ]
  }])
}
```

### Google Cloud Platform

```bash
# Deploy to Google Cloud Run
gcloud run deploy elevate-api \
  --image gcr.io/your-project/elevate-backend \
  --platform managed \
  --region us-central1 \
  --memory 4Gi \
  --cpu 2 \
  --max-instances 20 \
  --allow-unauthenticated

# Cloud SQL PostgreSQL
gcloud sql instances create elevate-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-8-32768 \
  --region=us-central1 \
  --backup-start-time=02:00

# Memorystore Redis
gcloud redis instances create elevate-redis \
  --size=5 \
  --region=us-central1 \
  --tier=standard
```

## Production Configuration

### Environment Variables

```env
# Production .env file
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=api.elevatecareer.ai,elevatecareer.ai

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/elevate_contest

# Redis
REDIS_URL=redis://prod-redis:6379/0
CELERY_BROKER_URL=redis://prod-redis:6379/1

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com

# Monitoring
SENTRY_DSN=https://...
```

### Nginx Configuration

```nginx
# nginx.conf
upstream api {
    least_conn;
    server api1:8000 weight=1;
    server api2:8000 weight=1;
    server api3:8000 weight=1;
}

server {
    listen 80;
    server_name api.elevatecareer.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.elevatecareer.ai;

    ssl_certificate /etc/ssl/certs/elevate.crt;
    ssl_certificate_key /etc/ssl/private/elevate.key;

    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /static/ {
        alias /staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "django"
    static_configs:
      - targets: ["api:8000"]

  - job_name: "postgresql"
    static_configs:
      - targets: ["postgres-exporter:9187"]

  - job_name: "redis"
    static_configs:
      - targets: ["redis-exporter:9121"]
```

### Grafana Dashboard

Import dashboard ID: 12900 (Django Prometheus)

Key metrics to monitor:

- Request rate and latency
- Error rate
- DB connection pool
- Celery queue depth
- Redis memory usage

## Backup Strategy

```bash
# Automated PostgreSQL backup script
#!/bin/bash

BACKUP_DIR=/backups
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=elevate_contest

# Full backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/full_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/full_$DATE.sql.gz s3://elevate-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "full_*.sql.gz" -mtime +30 -delete
```

## Scaling

### Horizontal Scaling

```bash
# Scale API servers
kubectl scale deployment api --replicas=15

# Scale Celery workers
kubectl scale deployment celery-worker --replicas=20
```

### Vertical Scaling

Increase resources in deployment manifests and reapply.

## Troubleshooting

### Common Issues

**High latency:**

- Check database query performance
- Verify Redis connection
- Review Celery queue depth

**Database connection exhausted:**

```python
# settings.py
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'pool_size': 20,
            'max_overflow': 10
        }
    }
}
```

**Celery tasks stuck:**

```bash
# Inspect queue
celery -A config inspect active

# Purge queue
celery -A config purge

# Restart workers
kubectl rollout restart deployment/celery-worker
```

---

For more deployment help, contact DevOps team or see internal wiki.
