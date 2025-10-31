"""
Attempt Views - Candidate endpoints for taking contests
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Attempt, Response as AttemptResponse, AttemptStatus
from .serializers import (
    AttemptSerializer,
    ResponseSerializer,
    ResponseCreateSerializer
)
from apps.questions.models import Question


class AttemptPermission(permissions.BasePermission):
    """Custom permission to check if user owns the attempt"""
    
    def has_object_permission(self, request, view, obj):
        # Check if JWT token contains the attempt_id
        attempt_id = request.auth.get('attempt_id') if request.auth else None
        return str(obj.id) == attempt_id


class AttemptViewSet(viewsets.GenericViewSet):
    """
    Viewset for participant attempt actions.
    """
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated, AttemptPermission]
    
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Autosave answer for a question"""
        attempt = self.get_object()
        
        # Check if attempt is ongoing
        if attempt.status != AttemptStatus.ONGOING:
            return Response(
                {'error': 'Attempt is not ongoing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expired
        if attempt.is_expired:
            attempt.status = AttemptStatus.SUBMITTED
            attempt.finished_at = timezone.now()
            attempt.save()
            
            return Response(
                {'error': 'Time has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate input
        serializer = ResponseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        question_id = serializer.validated_data['question_id']
        answer = serializer.validated_data['answer']
        
        # Get question
        try:
            question = Question.objects.get(
                id=question_id,
                contest=attempt.contest
            )
        except Question.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update response
        response, created = AttemptResponse.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'answer': answer,
                'attempt_count': models.F('attempt_count') + 1
            }
        )
        
        # Update heartbeat
        attempt.heartbeat_at = timezone.now()
        attempt.save(update_fields=['heartbeat_at'])
        
        return Response({
            'saved': True,
            'time_remaining_seconds': attempt.time_remaining_seconds
        })
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Final submission of attempt"""
        attempt = self.get_object()
        
        if attempt.status != AttemptStatus.ONGOING:
            return Response(
                {'error': 'Attempt is not ongoing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            attempt.submit()
            
            return Response({
                'submitted': True,
                'finished_at': attempt.finished_at,
                'message': 'Your responses have been submitted successfully'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def heartbeat(self, request, pk=None):
        """Update heartbeat and track tab blur events"""
        attempt = self.get_object()
        
        if attempt.status != AttemptStatus.ONGOING:
            return Response({'status': 'inactive'})
        
        # Update heartbeat
        attempt.heartbeat_at = timezone.now()
        
        # Track tab blur
        if request.data.get('tab_blur_event', False):
            attempt.tab_blur_count += 1
            
            # Check if exceeded limit
            tab_blur_limit = attempt.contest.settings.get('tab_blur_limit', 999)
            if attempt.tab_blur_count > tab_blur_limit:
                attempt.invalidate("Exceeded tab blur limit")
                return Response({
                    'status': 'invalidated',
                    'reason': 'Exceeded tab blur limit'
                })
        
        attempt.save(update_fields=['heartbeat_at', 'tab_blur_count'])
        
        return Response({
            'status': 'active',
            'time_remaining_seconds': attempt.time_remaining_seconds,
            'tab_blur_count': attempt.tab_blur_count
        })
    
    @action(detail=True, methods=['post'])
    def execute_code(self, request, pk=None):
        """Execute code for a question"""
        attempt = self.get_object()
        
        if attempt.status != AttemptStatus.ONGOING:
            return Response(
                {'error': 'Attempt is not ongoing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get parameters
        question_id = request.data.get('question_id')
        code = request.data.get('code')
        language = request.data.get('language', 'python3')
        test_case_index = request.data.get('test_case_index', 0)
        
        if not question_id or not code:
            return Response(
                {'error': 'question_id and code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get question
        try:
            question = Question.objects.get(
                id=question_id,
                contest=attempt.contest,
                type='coding'
            )
        except Question.DoesNotExist:
            return Response(
                {'error': 'Coding question not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get test case
        test_cases = question.get_public_test_cases()
        if test_case_index >= len(test_cases):
            return Response(
                {'error': 'Invalid test case index'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        test_case = test_cases[test_case_index]
        
        # Execute code using Judge0
        from apps.grading.services.judge0_service import Judge0Service
        
        judge0 = Judge0Service()
        job_id = judge0.submit_code(
            code=code,
            language=language,
            stdin=test_case['input'],
            expected_output=test_case['output']
        )
        
        return Response({
            'job_id': job_id,
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['get'], url_path='code/result/(?P<job_id>[^/.]+)')
    def get_code_result(self, request, pk=None, job_id=None):
        """Get result of code execution"""
        attempt = self.get_object()
        
        from apps.grading.services.judge0_service import Judge0Service
        
        judge0 = Judge0Service()
        result = judge0.get_result(job_id)
        
        return Response(result)


# Admin views for attempt management
class AttemptAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin viewset for monitoring attempts"""
    queryset = Attempt.objects.all().select_related('participant', 'contest')
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by contest
        contest_id = self.request.query_params.get('contest')
        if contest_id:
            queryset = queryset.filter(contest_id=contest_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        """Extend time for an attempt"""
        attempt = self.get_object()
        
        minutes = request.data.get('minutes', 0)
        reason = request.data.get('reason', '')
        
        try:
            attempt.extend_time(minutes)
            
            # Log the extension
            if not attempt.proctoring_data:
                attempt.proctoring_data = {}
            
            if 'time_extensions' not in attempt.proctoring_data:
                attempt.proctoring_data['time_extensions'] = []
            
            attempt.proctoring_data['time_extensions'].append({
                'minutes': minutes,
                'reason': reason,
                'granted_by': request.user.username,
                'granted_at': timezone.now().isoformat()
            })
            attempt.save()
            
            return Response({
                'success': True,
                'new_expiry': attempt.expires_at,
                'total_extension_minutes': attempt.time_extension_minutes
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def invalidate(self, request, pk=None):
        """Invalidate an attempt"""
        attempt = self.get_object()
        reason = request.data.get('reason', 'Invalidated by admin')
        
        attempt.invalidate(reason)
        
        return Response({
            'success': True,
            'status': 'invalidated',
            'reason': reason
        })


# Fix import
from django.db import models

