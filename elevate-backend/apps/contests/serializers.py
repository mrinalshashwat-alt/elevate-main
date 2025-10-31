"""
Contest Serializers
"""
from rest_framework import serializers
from .models import Contest, ContestStatus
from django.utils import timezone


class ContestListSerializer(serializers.ModelSerializer):
    """Serializer for contest list view"""
    question_count = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = Contest
        fields = [
            'id', 'name', 'description', 'status', 'start_at', 'end_at',
            'duration_minutes', 'question_count', 'is_active', 'is_upcoming',
            'total_participants', 'total_submissions', 'average_score',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'total_participants', 
                           'total_submissions', 'average_score']
    
    def get_question_count(self, obj):
        return obj.get_total_questions()


class ContestDetailSerializer(serializers.ModelSerializer):
    """Detailed contest serializer for admin"""
    question_distribution = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Contest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by',
                           'total_participants', 'total_submissions', 'average_score']
    
    def get_question_distribution(self, obj):
        return obj.get_question_distribution()
    
    def get_total_marks(self, obj):
        return obj.get_total_marks()
    
    def validate(self, data):
        """Validate contest timing"""
        start_at = data.get('start_at')
        end_at = data.get('end_at')
        
        if start_at and end_at:
            if end_at <= start_at:
                raise serializers.ValidationError(
                    "End time must be after start time"
                )
            
            # Check if start time is in the past (for new contests)
            if not self.instance and start_at < timezone.now():
                raise serializers.ValidationError(
                    "Start time cannot be in the past"
                )
        
        return data


class ContestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contests"""
    
    class Meta:
        model = Contest
        fields = [
            'name', 'description', 'instructions', 'start_at', 'end_at',
            'duration_minutes', 'settings'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ContestPublicSerializer(serializers.ModelSerializer):
    """Public contest info for participants"""
    total_questions = serializers.SerializerMethodField()
    time_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Contest
        fields = [
            'id', 'name', 'description', 'instructions', 'duration_minutes',
            'total_questions', 'time_remaining'
        ]
    
    def get_total_questions(self, obj):
        return obj.get_total_questions()


class ContestResultSerializer(serializers.Serializer):
    """Serializer for contest results"""
    rank = serializers.IntegerField()
    participant = serializers.DictField()
    total_score = serializers.FloatField()
    mcq_score = serializers.FloatField()
    code_score = serializers.FloatField()
    subjective_score = serializers.FloatField()
    time_taken_minutes = serializers.IntegerField()
    finished_at = serializers.DateTimeField()

