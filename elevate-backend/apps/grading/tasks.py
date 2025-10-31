"""
Celery Tasks for Grading
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def grade_attempt(self, attempt_id):
    """
    Grade an entire attempt (all responses).
    Triggers individual response grading tasks.
    """
    from apps.attempts.models import Attempt, AttemptStatus
    from apps.questions.models import QuestionType
    
    try:
        attempt = Attempt.objects.get(id=attempt_id)
        
        # Update status
        attempt.status = AttemptStatus.GRADING
        attempt.save()
        
        # Get all responses
        responses = attempt.responses.all()
        
        for response in responses:
            if response.question.type == QuestionType.MCQ:
                # Auto-grade MCQ immediately
                response.auto_grade()
            elif response.question.type == QuestionType.CODING:
                # Trigger async coding grading
                grade_coding_response.delay(str(response.id))
            # Subjective questions remain ungraded until manual review
        
        # Update attempt scores
        attempt.update_scores()
        
        # Mark as graded if no pending coding responses
        pending_coding = responses.filter(
            question__type=QuestionType.CODING,
            is_graded=False
        ).exists()
        
        if not pending_coding:
            attempt.status = AttemptStatus.GRADED
            attempt.save()
        
        logger.info(f"Graded attempt {attempt_id}")
        return {'success': True, 'attempt_id': attempt_id}
        
    except Attempt.DoesNotExist:
        logger.error(f"Attempt {attempt_id} not found")
        return {'success': False, 'error': 'Attempt not found'}
    except Exception as e:
        logger.error(f"Error grading attempt {attempt_id}: {str(e)}")
        # Retry task
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def grade_coding_response(self, response_id):
    """
    Grade a coding response using Judge0.
    """
    from apps.attempts.models import Response
    from apps.grading.services import Judge0Service
    
    try:
        response = Response.objects.get(id=response_id)
        
        # Get code and language from answer
        code = response.answer.get('code')
        language = response.answer.get('language', 'python3')
        
        if not code:
            logger.warning(f"No code found in response {response_id}")
            response.is_graded = True
            response.score = 0
            response.save()
            return {'success': False, 'error': 'No code submitted'}
        
        # Get test cases
        test_cases = response.question.get_test_cases()
        
        if not test_cases:
            logger.error(f"No test cases for question {response.question.id}")
            return {'success': False, 'error': 'No test cases'}
        
        # Execute code against all test cases
        judge0 = Judge0Service()
        result = judge0.execute_test_cases(code, language, test_cases)
        
        # Store execution result
        response.execution_result = result
        
        # Calculate score based on test cases passed
        total_points = sum(tc.get('points', 1) for tc in test_cases)
        earned_points = 0
        
        for i, tc_result in enumerate(result['test_case_results']):
            if tc_result.get('passed', False):
                earned_points += test_cases[i].get('points', 1)
        
        # Calculate final score
        max_marks = response.question.get_max_marks()
        response.score = (earned_points / total_points) * max_marks if total_points > 0 else 0
        
        # Mark as graded
        response.is_graded = True
        response.graded_at = timezone.now()
        response.save()
        
        # Update attempt scores
        response.attempt.update_scores()
        
        # Check if all responses are graded
        pending = response.attempt.responses.filter(is_graded=False).exists()
        if not pending:
            from apps.attempts.models import AttemptStatus
            response.attempt.status = AttemptStatus.GRADED
            response.attempt.save()
        
        logger.info(f"Graded coding response {response_id}: {response.score}/{max_marks}")
        return {
            'success': True,
            'response_id': response_id,
            'score': response.score,
            'max_marks': max_marks
        }
        
    except Response.DoesNotExist:
        logger.error(f"Response {response_id} not found")
        return {'success': False, 'error': 'Response not found'}
    except Exception as e:
        logger.error(f"Error grading coding response {response_id}: {str(e)}")
        raise self.retry(exc=e, countdown=60)


@shared_task
def cleanup_expired_attempts():
    """
    Periodic task to auto-submit expired attempts.
    """
    from apps.attempts.models import Attempt, AttemptStatus
    
    expired_attempts = Attempt.objects.filter(
        status=AttemptStatus.ONGOING,
        expires_at__lt=timezone.now()
    )
    
    count = 0
    for attempt in expired_attempts:
        try:
            attempt.submit()
            count += 1
        except Exception as e:
            logger.error(f"Error auto-submitting attempt {attempt.id}: {str(e)}")
    
    logger.info(f"Auto-submitted {count} expired attempts")
    return {'cleaned': count}


@shared_task
def generate_leaderboards():
    """
    Periodic task to generate and cache leaderboards.
    """
    from apps.contests.models import Contest, ContestStatus
    from apps.attempts.models import Attempt, AttemptStatus
    from django.core.cache import cache
    
    active_contests = Contest.objects.filter(
        status__in=[ContestStatus.PUBLISHED, ContestStatus.ONGOING]
    )
    
    for contest in active_contests:
        # Get top 100 participants
        top_attempts = Attempt.objects.filter(
            contest=contest,
            status=AttemptStatus.GRADED
        ).select_related('participant').order_by('-total_score', 'finished_at')[:100]
        
        leaderboard = []
        for rank, attempt in enumerate(top_attempts, start=1):
            leaderboard.append({
                'rank': rank,
                'name': attempt.participant.name,
                'email': attempt.participant.email,
                'score': attempt.total_score,
                'finished_at': attempt.finished_at.isoformat() if attempt.finished_at else None
            })
        
        # Cache for 5 minutes
        cache_key = f'leaderboard_{contest.id}'
        cache.set(cache_key, leaderboard, 300)
    
    logger.info(f"Generated leaderboards for {active_contests.count()} contests")
    return {'contests_processed': active_contests.count()}

