"""
Question Serializers
"""
from rest_framework import serializers
from .models import Question, QuestionType
from django.core.exceptions import ValidationError as DjangoValidationError


class QuestionSerializer(serializers.ModelSerializer):
    """Base question serializer"""
    title = serializers.SerializerMethodField()
    accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 
                           'attempt_count', 'correct_count', 'average_time_seconds']
    
    def get_title(self, obj):
        return obj.get_title()
    
    def get_accuracy(self, obj):
        return obj.calculate_accuracy()
    
    def validate(self, data):
        """Validate question content based on type"""
        question_type = data.get('type')
        content = data.get('content', {})
        
        if question_type == QuestionType.MCQ:
            self._validate_mcq_content(content)
        elif question_type == QuestionType.CODING:
            self._validate_coding_content(content)
        elif question_type == QuestionType.SUBJECTIVE:
            self._validate_subjective_content(content)
        
        return data
    
    def _validate_mcq_content(self, content):
        """Validate MCQ question content"""
        required_fields = ['question', 'options', 'correct_answer']
        for field in required_fields:
            if field not in content:
                raise serializers.ValidationError(
                    f"MCQ question must have '{field}' in content"
                )
        
        options = content.get('options', [])
        if len(options) < 2:
            raise serializers.ValidationError(
                "MCQ must have at least 2 options"
            )
        
        correct_answer = content.get('correct_answer')
        if not (0 <= correct_answer < len(options)):
            raise serializers.ValidationError(
                f"correct_answer must be between 0 and {len(options)-1}"
            )
    
    def _validate_coding_content(self, content):
        """Validate coding question content"""
        required_fields = ['title', 'problem_statement', 'test_cases']
        for field in required_fields:
            if field not in content:
                raise serializers.ValidationError(
                    f"Coding question must have '{field}' in content"
                )
        
        test_cases = content.get('test_cases', [])
        if len(test_cases) == 0:
            raise serializers.ValidationError(
                "Coding question must have at least one test case"
            )
        
        # Validate test case structure
        for i, tc in enumerate(test_cases):
            if 'input' not in tc or 'output' not in tc:
                raise serializers.ValidationError(
                    f"Test case {i} must have 'input' and 'output'"
                )
    
    def _validate_subjective_content(self, content):
        """Validate subjective question content"""
        if 'question' not in content:
            raise serializers.ValidationError(
                "Subjective question must have 'question' in content"
            )


class QuestionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for question lists"""
    title = serializers.SerializerMethodField()
    max_marks = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'type', 'title', 'difficulty', 'tags', 'max_marks',
            'order', 'attempt_count', 'correct_count'
        ]
    
    def get_title(self, obj):
        return obj.get_title()
    
    def get_max_marks(self, obj):
        return obj.get_max_marks()


class QuestionPublicSerializer(serializers.ModelSerializer):
    """Public-facing question serializer (hides answers)"""
    max_marks = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'type', 'content', 'scoring', 'order', 'max_marks']
    
    def get_max_marks(self, obj):
        return obj.get_max_marks()
    
    def to_representation(self, instance):
        """Remove correct answers from public view"""
        data = super().to_representation(instance)
        
        # Remove correct answer from MCQ
        if instance.type == QuestionType.MCQ:
            content = data.get('content', {})
            content.pop('correct_answer', None)
            content.pop('explanation', None)
            data['content'] = content
        
        # Hide hidden test cases for coding
        elif instance.type == QuestionType.CODING:
            content = data.get('content', {})
            test_cases = content.get('test_cases', [])
            # Only show public test cases
            content['test_cases'] = [
                tc for tc in test_cases if not tc.get('is_hidden', False)
            ]
            data['content'] = content
        
        return data


class BulkQuestionUploadSerializer(serializers.Serializer):
    """Serializer for bulk question upload"""
    contest = serializers.UUIDField()
    questions = QuestionSerializer(many=True)
    
    def validate_contest(self, value):
        """Check if contest exists"""
        from apps.contests.models import Contest
        try:
            Contest.objects.get(id=value)
        except Contest.DoesNotExist:
            raise serializers.ValidationError("Contest not found")
        return value
    
    def create(self, validated_data):
        """Create multiple questions"""
        contest_id = validated_data['contest']
        questions_data = validated_data['questions']
        
        created_questions = []
        for q_data in questions_data:
            q_data['contest_id'] = contest_id
            question = Question.objects.create(**q_data)
            created_questions.append(question)
        
        return created_questions

