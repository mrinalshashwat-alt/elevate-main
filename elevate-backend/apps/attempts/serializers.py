"""
Attempt and Response Serializers
"""
from rest_framework import serializers
from .models import Attempt, Response, AttemptStatus


class ResponseSerializer(serializers.ModelSerializer):
    """Serializer for response (answer)"""
    
    class Meta:
        model = Response
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'score', 
                           'is_graded', 'graded_at', 'graded_by']


class ResponseCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating responses"""
    question_id = serializers.UUIDField()
    answer = serializers.JSONField()
    
    def validate(self, data):
        """Validate answer format"""
        from apps.questions.models import Question
        
        try:
            question = Question.objects.get(id=data['question_id'])
        except Question.DoesNotExist:
            raise serializers.ValidationError("Question not found")
        
        # Validate answer format for this question type
        is_valid, error = question.validate_answer(data['answer'])
        if not is_valid:
            raise serializers.ValidationError(error)
        
        return data


class AttemptSerializer(serializers.ModelSerializer):
    """Serializer for attempt"""
    participant_name = serializers.CharField(source='participant.name', read_only=True)
    participant_email = serializers.CharField(source='participant.email', read_only=True)
    contest_name = serializers.CharField(source='contest.name', read_only=True)
    
    class Meta:
        model = Attempt
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttemptDetailSerializer(serializers.ModelSerializer):
    """Detailed attempt with responses"""
    responses = ResponseSerializer(many=True, read_only=True)
    participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Attempt
        fields = '__all__'
    
    def get_participant(self, obj):
        return {
            'id': str(obj.participant.id),
            'name': obj.participant.name,
            'email': obj.participant.email
        }


class AttemptListSerializer(serializers.ModelSerializer):
    """Simplified serializer for attempt lists"""
    participant_name = serializers.CharField(source='participant.name')
    participant_email = serializers.CharField(source='participant.email')
    
    class Meta:
        model = Attempt
        fields = [
            'id', 'participant_name', 'participant_email', 'status',
            'started_at', 'expires_at', 'finished_at', 'time_remaining_seconds',
            'tab_blur_count', 'total_score', 'mcq_score', 'code_score',
            'subjective_score'
        ]

