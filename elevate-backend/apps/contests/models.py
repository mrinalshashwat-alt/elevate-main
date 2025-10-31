"""
Contest Model
Represents a coding/MCQ/subjective contest with configuration and timing.
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
import uuid


class ContestStatus(models.TextChoices):
    """Contest lifecycle states"""
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ONGOING = 'ongoing', 'Ongoing'
    CLOSED = 'closed', 'Closed'
    ARCHIVED = 'archived', 'Archived'


class Contest(models.Model):
    """
    Main contest model storing configuration, timing, and settings.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Info
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True, help_text="Instructions for participants")
    
    # Timing
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(db_index=True)
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in minutes for each attempt"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=ContestStatus.choices,
        default=ContestStatus.DRAFT,
        db_index=True
    )
    
    # Settings (JSON field for flexibility)
    settings = models.JSONField(
        default=dict,
        help_text="""
        Configuration settings:
        {
            "shuffle_questions": true/false,
            "shuffle_options": true/false,
            "allowed_languages": ["python3", "cpp", "java"],
            "default_language": "python3",
            "show_results_immediately": true/false,
            "allow_late_submission": true/false,
            "late_submission_penalty": 10,
            "proctoring_enabled": true/false,
            "tab_blur_limit": 5,
            "require_webcam": true/false,
            "passing_percentage": 60,
            "negative_marking": true/false,
            "negative_marking_percentage": 25
        }
        """
    )
    
    # Metadata
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contests'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics (denormalized for performance)
    total_participants = models.IntegerField(default=0)
    total_submissions = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'contests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_at']),
            models.Index(fields=['status', 'end_at']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    @property
    def is_active(self):
        """Check if contest is currently active"""
        now = timezone.now()
        return (
            self.status == ContestStatus.PUBLISHED and
            self.start_at <= now <= self.end_at
        )
    
    @property
    def is_upcoming(self):
        """Check if contest hasn't started yet"""
        return self.status == ContestStatus.PUBLISHED and timezone.now() < self.start_at
    
    @property
    def is_finished(self):
        """Check if contest has ended"""
        return timezone.now() > self.end_at
    
    @property
    def time_remaining(self):
        """Get remaining time in seconds"""
        if not self.is_active:
            return 0
        delta = self.end_at - timezone.now()
        return max(0, int(delta.total_seconds()))
    
    def get_total_questions(self):
        """Get count of all questions in contest"""
        return self.questions.count()
    
    def get_question_distribution(self):
        """Get breakdown of question types"""
        from apps.questions.models import QuestionType
        questions = self.questions.values('type').annotate(
            count=models.Count('id')
        )
        return {q['type']: q['count'] for q in questions}
    
    def get_total_marks(self):
        """Calculate total marks available"""
        from django.db.models import Sum
        return self.questions.aggregate(
            total=Sum('scoring__max_marks')
        )['total'] or 0
    
    def update_statistics(self):
        """Update denormalized statistics"""
        from apps.attempts.models import AttemptStatus
        
        completed_attempts = self.attempts.filter(
            status=AttemptStatus.GRADED
        )
        
        self.total_participants = self.attempts.values('participant').distinct().count()
        self.total_submissions = completed_attempts.count()
        
        if self.total_submissions > 0:
            from django.db.models import Avg
            self.average_score = completed_attempts.aggregate(
                avg=Avg('total_score')
            )['avg'] or 0.0
        
        self.save(update_fields=['total_participants', 'total_submissions', 'average_score'])

