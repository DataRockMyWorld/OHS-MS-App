from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that normalises all error responses
    to a consistent shape: { "detail": "...", "code": "..." }
    """
    response = exception_handler(exc, context)

    if response is not None:
        return response

    logger.exception("Unhandled exception in API view", exc_info=exc)
    return Response(
        {'detail': 'An unexpected error occurred. Please try again.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
