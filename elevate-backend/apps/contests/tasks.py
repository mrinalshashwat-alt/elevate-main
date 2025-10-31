"""
Contest-related Celery tasks
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def update_contest_statuses():
    """
    Periodic task to update contest statuses based on timing.
    """
    from .models import Contest, ContestStatus
    
    now = timezone.now()
    updated = 0
    
    # Mark as ongoing if started
    started = Contest.objects.filter(
        status=ContestStatus.PUBLISHED,
        start_at__lte=now,
        end_at__gt=now
    )
    updated += started.update(status=ContestStatus.ONGOING)
    
    # Mark as closed if ended
    ended = Contest.objects.filter(
        status__in=[ContestStatus.PUBLISHED, ContestStatus.ONGOING],
        end_at__lte=now
    )
    updated += ended.update(status=ContestStatus.CLOSED)
    
    logger.info(f"Updated {updated} contest statuses")
    return {'updated': updated}


@shared_task
def send_contest_reminders():
    """
    Send reminders to participants about upcoming contests.
    """
    from .models import Contest, ContestStatus
    from datetime import timedelta
    
    # Find contests starting in 1 hour
    upcoming = Contest.objects.filter(
        status=ContestStatus.PUBLISHED,
        start_at__gte=timezone.now(),
        start_at__lte=timezone.now() + timedelta(hours=1)
    )
    
    # TODO: Implement email sending logic
    logger.info(f"Found {upcoming.count()} contests starting soon")
    return {'contests': upcoming.count()}

