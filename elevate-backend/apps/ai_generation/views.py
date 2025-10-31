"""
AI Generation Views
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AIJob, AIJobStatus
from .serializers import AIJobSerializer, AIJobCreateSerializer
from .tasks import generate_ai_questions


class AIJobViewSet(viewsets.ModelViewSet):
    """
    Viewset for AI question generation jobs.
    """
    queryset = AIJob.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AIJobCreateSerializer
        return AIJobSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by requesting admin
        if not self.request.user.is_superuser:
            queryset = queryset.filter(admin=self.request.user)
        
        # Filter by type
        job_type = self.request.query_params.get('type')
        if job_type:
            queryset = queryset.filter(type=job_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create AI job and trigger async generation"""
        job = serializer.save(admin=self.request.user)
        
        # Trigger async task
        generate_ai_questions.delay(str(job.id))
        
        return job
    
    @action(detail=False, methods=['post'])
    def generate_mcq(self, request):
        """Generate MCQ questions"""
        serializer = AIJobCreateSerializer(data={
            'type': 'mcq',
            'input_prompt': request.data
        })
        
        if serializer.is_valid():
            job = self.perform_create(serializer)
            return Response(
                AIJobSerializer(job).data,
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def generate_code(self, request):
        """Generate coding questions"""
        serializer = AIJobCreateSerializer(data={
            'type': 'coding',
            'input_prompt': request.data
        })
        
        if serializer.is_valid():
            job = self.perform_create(serializer)
            return Response(
                AIJobSerializer(job).data,
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def generate_subjective(self, request):
        """Generate subjective questions"""
        serializer = AIJobCreateSerializer(data={
            'type': 'subjective',
            'input_prompt': request.data
        })
        
        if serializer.is_valid():
            job = self.perform_create(serializer)
            return Response(
                AIJobSerializer(job).data,
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

