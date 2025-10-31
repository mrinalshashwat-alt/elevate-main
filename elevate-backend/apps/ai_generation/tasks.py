"""
AI Generation Celery Tasks
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def generate_ai_questions(self, job_id):
    """
    Async task to generate questions using AI.
    """
    from .models import AIJob, AIJobStatus
    from .services.openai_service import OpenAIService
    
    try:
        job = AIJob.objects.get(id=job_id)
        
        # Update status
        job.status = AIJobStatus.PROCESSING
        job.started_at = timezone.now()
        job.save()
        
        # Get input parameters
        job_type = job.type
        input_params = job.input_prompt
        
        # Initialize AI service
        ai_service = OpenAIService()
        
        # Generate questions based on type
        questions = []
        
        if job_type == 'mcq':
            questions = ai_service.generate_mcq_questions(
                topic=input_params.get('topic'),
                difficulty=input_params.get('difficulty', 3),
                count=input_params.get('count', 5),
                options_count=input_params.get('options_count', 4)
            )
        
        elif job_type == 'coding':
            for _ in range(input_params.get('count', 1)):
                question = ai_service.generate_coding_question(
                    topic=input_params.get('topic'),
                    difficulty=input_params.get('difficulty', 3),
                    include_test_cases=input_params.get('include_test_cases', 5)
                )
                questions.append(question)
        
        elif job_type == 'subjective':
            for _ in range(input_params.get('count', 3)):
                question = ai_service.generate_subjective_question(
                    topic=input_params.get('topic'),
                    difficulty=input_params.get('difficulty', 3),
                    expected_length=input_params.get('expected_length', 300)
                )
                questions.append(question)
        
        # Save output
        job.output = {
            'questions': questions,
            'metadata': {
                'generated_count': len(questions),
                'model': job.model_name
            }
        }
        job.status = AIJobStatus.COMPLETED
        job.completed_at = timezone.now()
        job.save()
        
        logger.info(f"Generated {len(questions)} questions for job {job_id}")
        return {'success': True, 'count': len(questions)}
        
    except AIJob.DoesNotExist:
        logger.error(f"AI Job {job_id} not found")
        return {'success': False, 'error': 'Job not found'}
    except Exception as e:
        logger.error(f"Error in AI generation job {job_id}: {str(e)}")
        
        # Update job status
        try:
            job.status = AIJobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = timezone.now()
            job.save()
        except:
            pass
        
        # Retry if not exceeded
        raise self.retry(exc=e, countdown=120)

