from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CorrectiveAction


@receiver(post_save, sender=CorrectiveAction)
def notify_ca_assigned(sender, instance, created, **kwargs):
    """
    Fire a notification when a corrective action is assigned (or reassigned).
    We track the previous assigned_to by comparing update_fields.
    """
    if instance.assigned_to_id is None:
        return

    # Only notify on create (if assigned at creation) or if assigned_to was
    # explicitly saved (update_fields contains 'assigned_to').
    update_fields = kwargs.get('update_fields')
    if not created and update_fields is not None and 'assigned_to' not in update_fields:
        return

    from apps.accounts.models import Notification, NotificationType

    Notification.objects.create(
        user_id=instance.assigned_to_id,
        organization_id=instance.organization_id,
        notification_type=NotificationType.CA_ASSIGNED,
        title='Corrective action assigned to you',
        body=f'You have been assigned: {instance.title}',
        link=f'/corrective-actions/{instance.id}',
    )
