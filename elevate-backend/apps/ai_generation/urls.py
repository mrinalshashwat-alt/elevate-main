"""
AI Generation URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIJobViewSet

router = DefaultRouter()
router.register(r'jobs', AIJobViewSet, basename='ai-job')

urlpatterns = [
    path('', include(router.urls)),
]

