from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Investigation


@receiver(post_save, sender=Investigation)
def notify_investigation_assigned(sender, instance, created, **kwargs):
    """
    Fire a notification when a lead investigator is assigned (or changed).
    """
    if instance.lead_investigator_id is None:
        return

    update_fields = kwargs.get('update_fields')
    if not created and update_fields is not None and 'lead_investigator' not in update_fields:
        return

    from apps.accounts.models import Notification, NotificationType

    Notification.objects.create(
        user_id=instance.lead_investigator_id,
        organization_id=instance.organization_id,
        notification_type=NotificationType.INVESTIGATION_ASSIGNED,
        title='Investigation assigned to you',
        body=f'You are the lead investigator for: {instance.title}',
        link=f'/investigations/{instance.id}',
    )
