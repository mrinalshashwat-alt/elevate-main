"""
Grading Views
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.attempts.models import Response as AttemptResponse, Attempt
from apps.attempts.serializers import ResponseSerializer
from apps.questions.models import QuestionType


class GradingViewSet(viewsets.GenericViewSet):
    """
    Viewset for manual grading operations.
    """
    queryset = AttemptResponse.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Manually grade a subjective response"""
        response = self.get_object()
        
        # Verify it's a subjective question
        if response.question.type != QuestionType.SUBJECTIVE:
            return Response(
                {'error': 'Only subjective questions can be manually graded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get score and feedback
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')
        
        if score is None:
            return Response(
                {'error': 'Score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            response.manual_grade(
                score=float(score),
                feedback=feedback,
                graded_by=request.user
            )
            
            return Response({
                'success': True,
                'response_id': str(response.id),
                'score': response.score,
                'max_marks': response.question.get_max_marks()
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending subjective responses for grading"""
        contest_id = request.query_params.get('contest')
        
        responses = AttemptResponse.objects.filter(
            question__type=QuestionType.SUBJECTIVE,
            is_graded=False,
            attempt__status='submitted'
        ).select_related('question', 'attempt__participant', 'attempt__contest')
        
        if contest_id:
            responses = responses.filter(attempt__contest_id=contest_id)
        
        # Serialize with additional context
        data = []
        for r in responses:
            data.append({
                'response_id': str(r.id),
                'question': r.question.get_title(),
                'answer': r.answer,
                'participant': {
                    'name': r.attempt.participant.name,
                    'email': r.attempt.participant.email
                },
                'contest': r.attempt.contest.name,
                'max_marks': r.question.get_max_marks(),
                'submitted_at': r.updated_at
            })
        
        return Response({'pending_responses': data})
    
    @action(detail=False, methods=['post'])
    def regrade(self, request):
        """Regrade an entire attempt"""
        attempt_id = request.data.get('attempt_id')
        
        if not attempt_id:
            return Response(
                {'error': 'attempt_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            attempt = Attempt.objects.get(id=attempt_id)
            
            # Trigger regrading
            from apps.grading.tasks import grade_attempt
            grade_attempt.delay(attempt_id)
            
            return Response({
                'success': True,
                'message': 'Regrading initiated',
                'attempt_id': attempt_id
            }, status=status.HTTP_202_ACCEPTED)
            
        except Attempt.DoesNotExist:
            return Response(
                {'error': 'Attempt not found'},
                status=status.HTTP_404_NOT_FOUND
            )

