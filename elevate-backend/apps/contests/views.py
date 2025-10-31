"""
Contest Views
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, F, Count, Avg
import csv
from io import StringIO

from .models import Contest, ContestStatus
from .serializers import (
    ContestListSerializer,
    ContestDetailSerializer,
    ContestCreateSerializer,
    ContestPublicSerializer,
    ContestResultSerializer
)
from apps.attempts.models import Attempt, AttemptStatus
from apps.participants.models import Participant


class ContestAdminViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for contest management.
    """
    queryset = Contest.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContestListSerializer
        elif self.action == 'create':
            return ContestCreateSerializer
        return ContestDetailSerializer
    
    def get_queryset(self):
        queryset = Contest.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a contest"""
        contest = self.get_object()
        
        # Validate contest has questions
        if contest.get_total_questions() == 0:
            return Response(
                {'error': 'Cannot publish contest without questions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contest.status = ContestStatus.PUBLISHED
        contest.save()
        
        return Response({
            'status': 'published',
            'message': 'Contest published successfully'
        })
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a contest"""
        contest = self.get_object()
        contest.status = ContestStatus.CLOSED
        contest.save()
        
        return Response({
            'status': 'closed',
            'message': 'Contest closed successfully'
        })
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get contest results and leaderboard"""
        contest = self.get_object()
        
        # Get all graded attempts
        attempts = Attempt.objects.filter(
            contest=contest,
            status=AttemptStatus.GRADED
        ).select_related('participant').order_by('-total_score', 'finished_at')
        
        results = []
        for rank, attempt in enumerate(attempts, start=1):
            time_taken = 0
            if attempt.started_at and attempt.finished_at:
                delta = attempt.finished_at - attempt.started_at
                time_taken = int(delta.total_seconds() / 60)
            
            results.append({
                'rank': rank,
                'participant': {
                    'id': str(attempt.participant.id),
                    'name': attempt.participant.name,
                    'email': attempt.participant.email
                },
                'total_score': attempt.total_score,
                'mcq_score': attempt.mcq_score,
                'code_score': attempt.code_score,
                'subjective_score': attempt.subjective_score,
                'time_taken_minutes': time_taken,
                'finished_at': attempt.finished_at
            })
        
        serializer = ContestResultSerializer(results, many=True)
        return Response({
            'contest': ContestListSerializer(contest).data,
            'results': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def export_results(self, request, pk=None):
        """Export results to CSV"""
        contest = self.get_object()
        
        # Get results
        attempts = Attempt.objects.filter(
            contest=contest,
            status=AttemptStatus.GRADED
        ).select_related('participant').order_by('-total_score')
        
        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Rank', 'Name', 'Email', 'Total Score', 'MCQ Score',
            'Coding Score', 'Subjective Score', 'Time Taken (min)',
            'Finished At'
        ])
        
        # Data
        for rank, attempt in enumerate(attempts, start=1):
            time_taken = 0
            if attempt.started_at and attempt.finished_at:
                delta = attempt.finished_at - attempt.started_at
                time_taken = int(delta.total_seconds() / 60)
            
            writer.writerow([
                rank,
                attempt.participant.name,
                attempt.participant.email,
                attempt.total_score,
                attempt.mcq_score,
                attempt.code_score,
                attempt.subjective_score,
                time_taken,
                attempt.finished_at.isoformat() if attempt.finished_at else ''
            ])
        
        # Return CSV response
        from django.http import HttpResponse
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{contest.name}_results.csv"'
        return response
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get contest statistics"""
        contest = self.get_object()
        
        attempts = Attempt.objects.filter(contest=contest)
        
        stats = {
            'total_registered': attempts.count(),
            'started': attempts.filter(status__in=[AttemptStatus.ONGOING, AttemptStatus.SUBMITTED, AttemptStatus.GRADED]).count(),
            'submitted': attempts.filter(status__in=[AttemptStatus.SUBMITTED, AttemptStatus.GRADED]).count(),
            'graded': attempts.filter(status=AttemptStatus.GRADED).count(),
            'ongoing': attempts.filter(status=AttemptStatus.ONGOING).count(),
            'average_score': attempts.filter(status=AttemptStatus.GRADED).aggregate(Avg('total_score'))['total_score__avg'] or 0,
            'question_distribution': contest.get_question_distribution(),
            'total_marks': contest.get_total_marks()
        }
        
        return Response(stats)


class ContestCandidateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public viewset for candidates to view and start contests.
    """
    queryset = Contest.objects.filter(status=ContestStatus.PUBLISHED)
    serializer_class = ContestPublicSerializer
    permission_classes = [permissions.AllowAny]
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def start(self, request, pk=None):
        """Start a contest for a participant"""
        contest = self.get_object()
        
        # Check if contest is active
        if not contest.is_active:
            return Response(
                {'error': 'Contest is not currently active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create participant
        email = request.data.get('email')
        name = request.data.get('name')
        phone = request.data.get('phone', '')
        
        if not email or not name:
            return Response(
                {'error': 'Email and name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant, created = Participant.objects.get_or_create(
            email=email,
            defaults={'name': name, 'phone': phone}
        )
        
        # Check if participant already has an attempt
        existing_attempt = Attempt.objects.filter(
            contest=contest,
            participant=participant
        ).first()
        
        if existing_attempt:
            if existing_attempt.status == AttemptStatus.GRADED:
                return Response(
                    {'error': 'You have already completed this contest'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif existing_attempt.status == AttemptStatus.ONGOING:
                # Return existing attempt
                return self._build_attempt_response(existing_attempt, contest)
        
        # Create new attempt
        attempt = Attempt.objects.create(
            contest=contest,
            participant=participant,
            status=AttemptStatus.NOT_STARTED,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Start the attempt
        attempt.start()
        
        return self._build_attempt_response(attempt, contest)
    
    def _build_attempt_response(self, attempt, contest):
        """Build response with attempt details and questions"""
        from apps.questions.serializers import QuestionPublicSerializer
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Generate JWT token for this attempt
        refresh = RefreshToken.for_user(attempt.participant)
        refresh['attempt_id'] = str(attempt.id)
        
        # Get questions
        questions = contest.questions.all().order_by('order')
        
        # Shuffle if enabled
        if contest.settings.get('shuffle_questions', False):
            import random
            questions = list(questions)
            random.shuffle(questions)
        
        return Response({
            'attempt_id': str(attempt.id),
            'token': str(refresh.access_token),
            'expires_at': attempt.expires_at,
            'time_remaining_seconds': attempt.time_remaining_seconds,
            'contest': {
                'name': contest.name,
                'description': contest.description,
                'instructions': contest.instructions,
                'duration_minutes': contest.duration_minutes,
                'total_questions': len(questions),
                'settings': contest.settings
            },
            'questions': QuestionPublicSerializer(questions, many=True).data
        }, status=status.HTTP_201_CREATED)
    
    def _get_client_ip(self, request):
        """Get client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

