"""
URL configuration for elevate-backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Elevate Contest Platform API",
        default_version='v1',
        description="""
        Backend API for the Elevate Contest Platform supporting:
        - Coding Questions with Judge0 integration
        - Multiple Choice Questions (MCQ)
        - Subjective Questions
        - AI-powered question generation
        - Real-time contest management
        - Auto and manual grading
        """,
        terms_of_service="https://www.elevatecareer.ai/terms/",
        contact=openapi.Contact(email="support@elevatecareer.ai"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # API Routes
    path('api/v1/admin/', include('apps.contests.urls.admin_urls')),
    path('api/v1/admin/questions/', include('apps.questions.urls.admin_urls')),
    path('api/v1/admin/ai/', include('apps.ai_generation.urls')),
    path('api/v1/admin/participants/', include('apps.participants.urls.admin_urls')),
    path('api/v1/admin/grading/', include('apps.grading.urls.admin_urls')),
    
    path('api/v1/contest/', include('apps.contests.urls.candidate_urls')),
    path('api/v1/attempt/', include('apps.attempts.urls')),
    
    # Monitoring
    path('api/v1/monitoring/', include('apps.monitoring.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# Custom error handlers
handler404 = 'apps.monitoring.views.handler404'
handler500 = 'apps.monitoring.views.handler500'

