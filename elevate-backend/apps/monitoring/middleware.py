"""
Request Logging Middleware
"""
import time
import logging
import json
from django.utils import timezone

logger = logging.getLogger('apps.monitoring')


class RequestLoggingMiddleware:
    """
    Middleware to log all API requests with timing and metadata.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Start timer
        start_time = time.time()
        
        # Get request info
        request_id = request.META.get('HTTP_X_REQUEST_ID', 'unknown')
        
        # Process request
        response = self.get_response(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Log request
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'request_id': request_id,
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration_ms': round(duration_ms, 2),
            'user': str(request.user) if request.user.is_authenticated else 'anonymous',
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200]
        }
        
        # Log based on status code
        if response.status_code >= 500:
            logger.error(json.dumps(log_data))
        elif response.status_code >= 400:
            logger.warning(json.dumps(log_data))
        else:
            logger.info(json.dumps(log_data))
        
        # Add headers
        response['X-Request-ID'] = request_id
        response['X-Response-Time'] = f"{duration_ms}ms"
        
        return response
    
    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

