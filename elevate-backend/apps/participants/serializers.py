"""
Participant Serializers
"""
from rest_framework import serializers
from .models import Participant


class ParticipantSerializer(serializers.ModelSerializer):
    """Serializer for participant"""
    
    class Meta:
        model = Participant
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_contests', 'total_score']

