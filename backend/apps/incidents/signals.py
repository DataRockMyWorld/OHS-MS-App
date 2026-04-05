from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Incident, IncidentStatusHistory
from .constants import IncidentStatus


@receiver(post_save, sender=Incident)
def create_initial_status_history(sender, instance, created, **kwargs):
    """
    Write the first status history record when a new incident is created.
    Subsequent transitions are written by IncidentService.transition_status().
    """
    if created:
        IncidentStatusHistory.objects.create(
            incident=instance,
            organization=instance.organization,
            from_status='',
            to_status=IncidentStatus.DRAFT,
            changed_by=instance.reported_by,
            comment='Incident created as draft.',
        )
