"""
AI Generation Models
Tracks AI-generated questions and jobs.
"""
from django.db import models
import uuid


class AIJobStatus(models.TextChoices):
    """AI job processing states"""
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'


class AIJobType(models.TextChoices):
    """Types of AI generation tasks"""
    MCQ = 'mcq', 'Generate MCQ'
    CODING = 'coding', 'Generate Coding Question'
    SUBJECTIVE = 'subjective', 'Generate Subjective Question'


class AIJob(models.Model):
    """
    Tracks AI question generation jobs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Who requested
    admin = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='ai_jobs'
    )
    
    # Job type
    type = models.CharField(
        max_length=20,
        choices=AIJobType.choices,
        db_index=True
    )
    
    # Input parameters
    input_prompt = models.JSONField(
        help_text="""
        Generation parameters:
        
        MCQ:
        {
            "topic": "Python Lists",
            "difficulty": 3,
            "count": 5,
            "options_count": 4
        }
        
        CODING:
        {
            "topic": "Dynamic Programming",
            "difficulty": 4,
            "count": 2,
            "include_test_cases": 5
        }
        
        SUBJECTIVE:
        {
            "topic": "Machine Learning Algorithms",
            "difficulty": 3,
            "count": 3,
            "expected_length": 300
        }
        """
    )
    
    # AI Configuration
    model_name = models.CharField(
        max_length=100,
        default='gpt-4-turbo-preview',
        help_text="AI model used (gpt-4, claude-3, etc.)"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=AIJobStatus.choices,
        default=AIJobStatus.PENDING,
        db_index=True
    )
    
    # Output
    output = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        Generated questions:
        {
            "questions": [
                {... question data ...},
                {... question data ...}
            ],
            "metadata": {
                "tokens_used": 1500,
                "cost": 0.03
            }
        }
        """
    )
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'ai_jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['admin', 'status']),
            models.Index(fields=['type', 'status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.type} - {self.status} ({self.admin.username})"
    
    @property
    def processing_time_seconds(self):
        """Calculate processing time"""
        if not self.started_at:
            return 0
        end_time = self.completed_at or timezone.now()
        delta = end_time - self.started_at
        return delta.total_seconds()

