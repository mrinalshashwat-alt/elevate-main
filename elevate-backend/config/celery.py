import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('elevate_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    'cleanup-expired-attempts': {
        'task': 'apps.attempts.tasks.cleanup_expired_attempts',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'update-contest-statuses': {
        'task': 'apps.contests.tasks.update_contest_statuses',
        'schedule': crontab(minute='*/1'),  # Every minute
    },
    'generate-leaderboards': {
        'task': 'apps.grading.tasks.generate_leaderboards',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

