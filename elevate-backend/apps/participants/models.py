"""
Participant Model
Represents a user taking the contest.
"""
from django.db import models
import uuid


class Participant(models.Model):
    """
    Participant/Candidate taking contests.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Info
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Additional Info
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        Additional participant information:
        {
            "college": "XYZ University",
            "graduation_year": 2024,
            "resume_url": "https://...",
            "linkedin": "https://linkedin.com/in/...",
            "github": "https://github.com/..."
        }
        """
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics
    total_contests = models.IntegerField(default=0)
    total_score = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'participants'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    def update_statistics(self):
        """Update denormalized statistics"""
        from apps.attempts.models import AttemptStatus
        
        completed_attempts = self.attempts.filter(
            status=AttemptStatus.GRADED
        )
        
        self.total_contests = completed_attempts.values('contest').distinct().count()
        
        from django.db.models import Avg
        avg_score = completed_attempts.aggregate(avg=Avg('total_score'))['avg']
        self.total_score = avg_score or 0.0
        
        self.save(update_fields=['total_contests', 'total_score'])

