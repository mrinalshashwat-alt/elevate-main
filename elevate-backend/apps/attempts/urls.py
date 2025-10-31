"""
Attempt URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttemptViewSet, AttemptAdminViewSet

router = DefaultRouter()
router.register(r'admin', AttemptAdminViewSet, basename='admin-attempt')
router.register(r'', AttemptViewSet, basename='attempt')

urlpatterns = [
    path('', include(router.urls)),
]

