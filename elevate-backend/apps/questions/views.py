"""
Question Views
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import csv
import json
from io import StringIO, TextIOWrapper

from .models import Question
from .serializers import (
    QuestionSerializer,
    QuestionListSerializer,
    BulkQuestionUploadSerializer
)
from apps.contests.models import Contest


class QuestionAdminViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for question management.
    """
    queryset = Question.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        return QuestionSerializer
    
    def get_queryset(self):
        queryset = Question.objects.all()
        
        # Filter by contest
        contest_id = self.request.query_params.get('contest', None)
        if contest_id:
            queryset = queryset.filter(contest_id=contest_id)
        
        # Filter by type
        question_type = self.request.query_params.get('type', None)
        if question_type:
            queryset = queryset.filter(type=question_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset.order_by('contest', 'order')
    
    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        """Bulk upload questions from CSV"""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        csv_file = request.FILES['file']
        contest_id = request.data.get('contest')
        
        if not contest_id:
            return Response(
                {'error': 'Contest ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify contest exists
        try:
            contest = Contest.objects.get(id=contest_id)
        except Contest.DoesNotExist:
            return Response(
                {'error': 'Contest not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Read CSV
            decoded_file = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(StringIO(decoded_file))
            
            created_questions = []
            errors = []
            
            for row_num, row in enumerate(csv_reader, start=1):
                try:
                    question_data = self._parse_csv_row(row, contest_id)
                    serializer = QuestionSerializer(data=question_data)
                    
                    if serializer.is_valid():
                        question = serializer.save()
                        created_questions.append(question)
                    else:
                        errors.append({
                            'row': row_num,
                            'errors': serializer.errors
                        })
                except Exception as e:
                    errors.append({
                        'row': row_num,
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'created': len(created_questions),
                'errors': errors
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to process CSV: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def upload_json(self, request):
        """Bulk upload questions from JSON"""
        serializer = BulkQuestionUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                questions = serializer.save()
                return Response({
                    'success': True,
                    'created': len(questions),
                    'questions': QuestionListSerializer(questions, many=True).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _parse_csv_row(self, row, contest_id):
        """Parse CSV row into question data"""
        question_type = row.get('type', 'mcq').lower()
        
        if question_type == 'mcq':
            content = {
                'question': row['question'],
                'options': [
                    row.get('option1', ''),
                    row.get('option2', ''),
                    row.get('option3', ''),
                    row.get('option4', '')
                ],
                'correct_answer': int(row.get('correct_answer', 0)),
                'explanation': row.get('explanation', '')
            }
        elif question_type == 'subjective':
            content = {
                'question': row['question'],
                'expected_length': int(row.get('expected_length', 300)),
                'rubric': row.get('rubric', '')
            }
        else:
            # For coding, would need more complex parsing
            content = json.loads(row.get('content', '{}'))
        
        return {
            'contest': contest_id,
            'type': question_type,
            'content': content,
            'scoring': {
                'max_marks': float(row.get('max_marks', 1))
            },
            'difficulty': int(row.get('difficulty', 3)),
            'tags': row.get('tags', '').split(',') if row.get('tags') else [],
            'order': int(row.get('order', 0))
        }

