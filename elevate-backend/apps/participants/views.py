"""
Participant Views
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Participant
from .serializers import ParticipantSerializer
from apps.attempts.models import Attempt
from apps.attempts.serializers import AttemptListSerializer


class ParticipantAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin viewset for viewing participants.
    """
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search by email or name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(email__icontains=search) |
                models.Q(name__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get all attempts for a participant"""
        participant = self.get_object()
        
        attempts = Attempt.objects.filter(
            participant=participant
        ).select_related('contest').order_by('-created_at')
        
        serializer = AttemptListSerializer(attempts, many=True)
        return Response({
            'participant': ParticipantSerializer(participant).data,
            'attempts': serializer.data
        })


# Import models
from django.db import models

