from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ['*']

# Show full error details in development
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [  # noqa
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]

# Use local file storage in development
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
