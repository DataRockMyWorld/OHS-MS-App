from django.apps import AppConfig


class CorrectiveActionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.corrective_actions'

    def ready(self):
        import apps.corrective_actions.signals  # noqa: F401
