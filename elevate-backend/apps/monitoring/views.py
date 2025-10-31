"""
Monitoring and Health Check Views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.core.cache import cache
import redis
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for load balancers and monitoring.
    """
    checks = {
        'database': False,
        'cache': False,
        'overall': False
    }
    
    # Check database
    try:
        connection.ensure_connection()
        checks['database'] = True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
    
    # Check cache/Redis
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            checks['cache'] = True
    except Exception as e:
        logger.error(f"Cache health check failed: {str(e)}")
    
    # Overall status
    checks['overall'] = checks['database'] and checks['cache']
    
    if checks['overall']:
        return Response(checks, status=status.HTTP_200_OK)
    else:
        return Response(checks, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Readiness check for Kubernetes.
    """
    # Similar to health check but can include more app-specific checks
    return health_check(request)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Liveness check - just confirms the app is running.
    """
    return Response({'status': 'alive'}, status=status.HTTP_200_OK)


def handler404(request, exception=None):
    """Custom 404 handler"""
    from django.http import JsonResponse
    return JsonResponse({
        'error': 'not_found',
        'message': 'The requested resource was not found'
    }, status=404)


def handler500(request):
    """Custom 500 handler"""
    from django.http import JsonResponse
    return JsonResponse({
        'error': 'server_error',
        'message': 'An internal server error occurred'
    }, status=500)

