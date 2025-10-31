"""
Question Models
Supports MCQ, Coding, and Subjective question types.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class QuestionType(models.TextChoices):
    """Types of questions supported"""
    MCQ = 'mcq', 'Multiple Choice'
    CODING = 'coding', 'Coding'
    SUBJECTIVE = 'subjective', 'Subjective'


class QuestionSource(models.TextChoices):
    """How the question was created"""
    MANUAL = 'manual', 'Manual Entry'
    UPLOAD = 'upload', 'Bulk Upload'
    AI = 'ai', 'AI Generated'


class Difficulty(models.IntegerChoices):
    """Difficulty levels"""
    VERY_EASY = 1, 'Very Easy'
    EASY = 2, 'Easy'
    MEDIUM = 3, 'Medium'
    HARD = 4, 'Hard'
    VERY_HARD = 5, 'Very Hard'


class Question(models.Model):
    """
    Polymorphic question model supporting MCQ, Coding, and Subjective types.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relations
    contest = models.ForeignKey(
        'contests.Contest',
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    # Question Type
    type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        db_index=True
    )
    
    # Content (polymorphic JSON field)
    content = models.JSONField(
        help_text="""
        Question content based on type:
        
        MCQ:
        {
            "question": "What is...?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,  # Index of correct option
            "explanation": "Because...",
            "hints": ["hint1", "hint2"]
        }
        
        CODING:
        {
            "title": "Two Sum",
            "problem_statement": "Given an array...",
            "input_format": "First line...",
            "output_format": "Print...",
            "constraints": "1 <= n <= 10^5",
            "sample_input": "...",
            "sample_output": "...",
            "test_cases": [
                {"input": "...", "output": "...", "is_hidden": false, "points": 10},
                {"input": "...", "output": "...", "is_hidden": true, "points": 20}
            ],
            "time_limit_ms": 2000,
            "memory_limit_mb": 256,
            "starter_code": {
                "python3": "def solution():\\n    pass",
                "cpp": "#include<iostream>\\n...",
                "java": "class Solution {\\n...}"
            }
        }
        
        SUBJECTIVE:
        {
            "question": "Explain the concept of...",
            "expected_length": 500,  # words
            "rubric": "Should cover: point1, point2...",
            "sample_answer": "A good answer would..."
        }
        """
    )
    
    # Scoring
    scoring = models.JSONField(
        default=dict,
        help_text="""
        Scoring configuration:
        {
            "max_marks": 10,
            "partial_marks_enabled": true,
            "negative_marks": 2,
            "time_bonus": 5  # bonus marks for fast completion
        }
        """
    )
    
    # Metadata
    difficulty = models.IntegerField(
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM,
        db_index=True
    )
    tags = models.JSONField(
        default=list,
        help_text="Tags for categorization: ['arrays', 'dynamic-programming']"
    )
    source = models.CharField(
        max_length=20,
        choices=QuestionSource.choices,
        default=QuestionSource.MANUAL
    )
    
    # AI Generation Tracking
    provenance = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        For AI-generated questions:
        {
            "ai_job_id": "uuid",
            "model": "gpt-4",
            "prompt": "Generate a question about...",
            "generated_at": "2024-01-01T00:00:00Z",
            "reviewed_by": "admin_id",
            "reviewed_at": "2024-01-02T00:00:00Z"
        }
        """
    )
    
    # Display Order
    order = models.IntegerField(
        default=0,
        help_text="Display order in contest (0-indexed)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistics (denormalized)
    attempt_count = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    average_time_seconds = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'questions'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['contest', 'type']),
            models.Index(fields=['contest', 'order']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['source']),
        ]
        unique_together = [['contest', 'order']]
    
    def __str__(self):
        title = self.get_title()
        return f"{self.type.upper()}: {title[:50]}"
    
    def get_title(self):
        """Extract title/question text based on type"""
        if self.type == QuestionType.MCQ:
            return self.content.get('question', 'Untitled MCQ')
        elif self.type == QuestionType.CODING:
            return self.content.get('title', 'Untitled Coding Problem')
        elif self.type == QuestionType.SUBJECTIVE:
            return self.content.get('question', 'Untitled Subjective')[:100]
        return "Untitled Question"
    
    def get_max_marks(self):
        """Get maximum marks for this question"""
        return self.scoring.get('max_marks', 0)
    
    def validate_answer(self, answer):
        """
        Validate answer format based on question type.
        Returns (is_valid, error_message)
        """
        if self.type == QuestionType.MCQ:
            if not isinstance(answer, dict) or 'selected_option' not in answer:
                return False, "MCQ answer must have 'selected_option'"
            option_count = len(self.content.get('options', []))
            if not (0 <= answer['selected_option'] < option_count):
                return False, f"Invalid option index. Must be 0-{option_count-1}"
            return True, None
            
        elif self.type == QuestionType.CODING:
            if not isinstance(answer, dict):
                return False, "Coding answer must be a dictionary"
            if 'code' not in answer or 'language' not in answer:
                return False, "Coding answer must have 'code' and 'language'"
            return True, None
            
        elif self.type == QuestionType.SUBJECTIVE:
            if not isinstance(answer, dict) or 'text' not in answer:
                return False, "Subjective answer must have 'text' field"
            return True, None
        
        return False, "Unknown question type"
    
    def get_test_cases(self):
        """Get test cases for coding questions"""
        if self.type != QuestionType.CODING:
            return []
        return self.content.get('test_cases', [])
    
    def get_public_test_cases(self):
        """Get only non-hidden test cases"""
        return [tc for tc in self.get_test_cases() if not tc.get('is_hidden', False)]
    
    def calculate_accuracy(self):
        """Calculate success rate for this question"""
        if self.attempt_count == 0:
            return 0.0
        return (self.correct_count / self.attempt_count) * 100
    
    def update_statistics(self):
        """Update denormalized statistics from responses"""
        from apps.attempts.models import Response
        from django.db.models import Count, Avg, Q
        
        responses = Response.objects.filter(question=self)
        
        self.attempt_count = responses.count()
        
        if self.type == QuestionType.MCQ:
            # For MCQ, count fully correct answers
            self.correct_count = responses.filter(
                score=self.get_max_marks()
            ).count()
        elif self.type == QuestionType.CODING:
            # For coding, count those with full marks
            self.correct_count = responses.filter(
                score=self.get_max_marks()
            ).count()
        
        # Average time spent
        avg_time = responses.aggregate(
            avg=Avg('time_spent_seconds')
        )['avg']
        self.average_time_seconds = avg_time or 0.0
        
        self.save(update_fields=['attempt_count', 'correct_count', 'average_time_seconds'])

