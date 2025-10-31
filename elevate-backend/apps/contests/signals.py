"""
Contest signals
"""
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Contest
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Contest)
def contest_saved(sender, instance, created, **kwargs):
    """Handle contest save events"""
    if created:
        logger.info(f"New contest created: {instance.name} (ID: {instance.id})")
    else:
        logger.info(f"Contest updated: {instance.name} (ID: {instance.id})")


@receiver(pre_delete, sender=Contest)
def contest_deleted(sender, instance, **kwargs):
    """Handle contest deletion"""
    logger.warning(f"Contest deleted: {instance.name} (ID: {instance.id})")

