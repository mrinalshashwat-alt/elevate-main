"""
Custom exception handler for DRF
"""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging
import uuid

logger = logging.getLogger('apps.monitoring')


def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs errors and returns standardized format.
    """
    # Call DRF's default exception handler first
    response = drf_exception_handler(exc, context)
    
    # Generate request ID
    request = context.get('request')
    request_id = str(uuid.uuid4())
    
    if response is not None:
        # Standardize error response
        error_data = {
            'error': exc.__class__.__name__,
            'message': str(exc),
            'request_id': request_id
        }
        
        # Add details if available
        if hasattr(response, 'data'):
            if isinstance(response.data, dict):
                error_data['details'] = response.data
            else:
                error_data['details'] = {'detail': response.data}
        
        response.data = error_data
        
        # Log error
        logger.error(f"API Error: {exc.__class__.__name__} - {str(exc)}", extra={
            'request_id': request_id,
            'path': request.path if request else 'unknown',
            'method': request.method if request else 'unknown'
        })
    
    else:
        # Unhandled exception
        logger.exception(f"Unhandled exception: {str(exc)}", extra={
            'request_id': request_id
        })
        
        response = Response(
            {
                'error': 'server_error',
                'message': 'An internal server error occurred',
                'request_id': request_id
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response

