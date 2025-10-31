"""
AI Generation Serializers
"""
from rest_framework import serializers
from .models import AIJob


class AIJobSerializer(serializers.ModelSerializer):
    """Serializer for AI job"""
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    processing_time = serializers.SerializerMethodField()
    
    class Meta:
        model = AIJob
        fields = '__all__'
        read_only_fields = ['id', 'admin', 'created_at', 'started_at', 'completed_at', 
                           'status', 'output', 'error_message']
    
    def get_processing_time(self, obj):
        """Get processing time in seconds"""
        return obj.processing_time_seconds


class AIJobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AI jobs"""
    
    class Meta:
        model = AIJob
        fields = ['type', 'input_prompt', 'model_name']
    
    def validate_input_prompt(self, value):
        """Validate input prompt structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Input prompt must be a JSON object")
        
        # Check for required fields based on type
        job_type = self.initial_data.get('type')
        
        if job_type == 'mcq':
            if 'topic' not in value:
                raise serializers.ValidationError("MCQ generation requires 'topic' in input")
        elif job_type == 'coding':
            if 'topic' not in value:
                raise serializers.ValidationError("Coding generation requires 'topic' in input")
        elif job_type == 'subjective':
            if 'topic' not in value:
                raise serializers.ValidationError("Subjective generation requires 'topic' in input")
        
        return value

