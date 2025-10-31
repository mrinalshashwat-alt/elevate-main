"""
Attempt and Response Models
Tracks participant attempts and their answers.
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid


class AttemptStatus(models.TextChoices):
    """Attempt lifecycle states"""
    NOT_STARTED = 'not_started', 'Not Started'
    ONGOING = 'ongoing', 'Ongoing'
    SUBMITTED = 'submitted', 'Submitted'
    GRADING = 'grading', 'Being Graded'
    GRADED = 'graded', 'Graded'
    INVALIDATED = 'invalidated', 'Invalidated'


class Attempt(models.Model):
    """
    Represents one participant's attempt at a contest.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relations
    contest = models.ForeignKey(
        'contests.Contest',
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    participant = models.ForeignKey(
        'participants.Participant',
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=AttemptStatus.choices,
        default=AttemptStatus.NOT_STARTED,
        db_index=True
    )
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    time_extension_minutes = models.IntegerField(default=0)
    
    # Monitoring
    heartbeat_at = models.DateTimeField(null=True, blank=True)
    tab_blur_count = models.IntegerField(default=0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Proctoring Data
    proctoring_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        Proctoring information:
        {
            "screenshots": ["url1", "url2"],
            "webcam_snapshots": ["url1", "url2"],
            "violations": [
                {"type": "tab_switch", "timestamp": "...", "count": 5},
                {"type": "face_not_detected", "timestamp": "..."}
            ]
        }
        """
    )
    
    # Scores (denormalized for performance)
    mcq_score = models.FloatField(default=0.0)
    code_score = models.FloatField(default=0.0)
    subjective_score = models.FloatField(default=0.0)
    total_score = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attempts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['contest', 'status']),
            models.Index(fields=['participant', 'contest']),
            models.Index(fields=['status', 'expires_at']),
            models.Index(fields=['-created_at']),
        ]
        unique_together = [['participant', 'contest']]
    
    def __str__(self):
        return f"{self.participant.email} - {self.contest.name} ({self.status})"
    
    def start(self):
        """Start the attempt"""
        if self.status != AttemptStatus.NOT_STARTED:
            raise ValueError("Attempt already started")
        
        self.status = AttemptStatus.ONGOING
        self.started_at = timezone.now()
        self.expires_at = self.started_at + timedelta(
            minutes=self.contest.duration_minutes + self.time_extension_minutes
        )
        self.heartbeat_at = timezone.now()
        self.save()
    
    def submit(self):
        """Submit the attempt"""
        if self.status != AttemptStatus.ONGOING:
            raise ValueError("Can only submit ongoing attempts")
        
        self.status = AttemptStatus.SUBMITTED
        self.finished_at = timezone.now()
        self.save()
        
        # Trigger grading
        from apps.grading.tasks import grade_attempt
        grade_attempt.delay(str(self.id))
    
    def extend_time(self, minutes):
        """Extend attempt time"""
        from django.conf import settings
        
        if minutes > settings.MAX_TIME_EXTENSION_MINUTES:
            raise ValueError(f"Cannot extend more than {settings.MAX_TIME_EXTENSION_MINUTES} minutes")
        
        self.time_extension_minutes += minutes
        if self.expires_at:
            self.expires_at += timedelta(minutes=minutes)
        self.save()
    
    def invalidate(self, reason=""):
        """Invalidate the attempt"""
        self.status = AttemptStatus.INVALIDATED
        if reason:
            self.proctoring_data['invalidation_reason'] = reason
        self.save()
    
    @property
    def time_remaining_seconds(self):
        """Get remaining time in seconds"""
        if not self.expires_at or self.status != AttemptStatus.ONGOING:
            return 0
        delta = self.expires_at - timezone.now()
        return max(0, int(delta.total_seconds()))
    
    @property
    def is_expired(self):
        """Check if attempt has expired"""
        return (
            self.expires_at and
            timezone.now() > self.expires_at and
            self.status == AttemptStatus.ONGOING
        )
    
    def update_scores(self):
        """Recalculate scores from responses"""
        from apps.questions.models import QuestionType
        from django.db.models import Sum, Q
        
        responses = self.responses.all()
        
        self.mcq_score = responses.filter(
            question__type=QuestionType.MCQ
        ).aggregate(total=Sum('score'))['total'] or 0.0
        
        self.code_score = responses.filter(
            question__type=QuestionType.CODING
        ).aggregate(total=Sum('score'))['total'] or 0.0
        
        self.subjective_score = responses.filter(
            question__type=QuestionType.SUBJECTIVE
        ).aggregate(total=Sum('score'))['total'] or 0.0
        
        self.total_score = self.mcq_score + self.code_score + self.subjective_score
        
        self.save(update_fields=['mcq_score', 'code_score', 'subjective_score', 'total_score'])


class Response(models.Model):
    """
    Stores a participant's answer to a specific question.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relations
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    question = models.ForeignKey(
        'questions.Question',
        on_delete=models.CASCADE,
        related_name='responses'
    )
    
    # Answer (polymorphic based on question type)
    answer = models.JSONField(
        default=dict,
        help_text="""
        Answer format by type:
        
        MCQ: {"selected_option": 2}
        CODING: {
            "code": "def solution():\\n...",
            "language": "python3",
            "submission_id": "judge0_token"
        }
        SUBJECTIVE: {"text": "The answer is..."}
        """
    )
    
    # Grading
    score = models.FloatField(default=0.0)
    is_graded = models.BooleanField(default=False)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_responses'
    )
    
    # Execution Results (for coding questions)
    execution_result = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        Code execution results:
        {
            "test_cases_passed": 8,
            "total_test_cases": 10,
            "execution_time_ms": 145,
            "memory_used_mb": 12.5,
            "test_case_results": [
                {"passed": true, "time_ms": 12, "memory_mb": 10},
                {"passed": false, "error": "Wrong Answer", "expected": "5", "got": "4"}
            ]
        }
        """
    )
    
    # Feedback (for manual grading)
    feedback = models.TextField(blank=True)
    
    # Metadata
    time_spent_seconds = models.IntegerField(default=0)
    attempt_count = models.IntegerField(default=0)  # How many times answered
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'responses'
        ordering = ['attempt', 'question__order']
        indexes = [
            models.Index(fields=['attempt', 'question']),
            models.Index(fields=['is_graded']),
        ]
        unique_together = [['attempt', 'question']]
    
    def __str__(self):
        return f"{self.attempt.participant.email} - Q{self.question.order}"
    
    def auto_grade(self):
        """Auto-grade MCQ and trigger coding grading"""
        from apps.questions.models import QuestionType
        
        if self.question.type == QuestionType.MCQ:
            # Auto-grade MCQ
            correct_answer = self.question.content.get('correct_answer')
            selected = self.answer.get('selected_option')
            
            if selected == correct_answer:
                self.score = self.question.get_max_marks()
            else:
                # Negative marking if enabled
                if self.question.scoring.get('negative_marks'):
                    self.score = -self.question.scoring.get('negative_marks', 0)
                else:
                    self.score = 0
            
            self.is_graded = True
            self.graded_at = timezone.now()
            self.save()
            
        elif self.question.type == QuestionType.CODING:
            # Trigger async Judge0 grading
            from apps.grading.tasks import grade_coding_response
            grade_coding_response.delay(str(self.id))
    
    def manual_grade(self, score, feedback="", graded_by=None):
        """Manually grade subjective answer"""
        max_marks = self.question.get_max_marks()
        if score > max_marks:
            raise ValueError(f"Score cannot exceed {max_marks}")
        
        self.score = score
        self.feedback = feedback
        self.is_graded = True
        self.graded_at = timezone.now()
        self.graded_by = graded_by
        self.save()
        
        # Update attempt scores
        self.attempt.update_scores()

