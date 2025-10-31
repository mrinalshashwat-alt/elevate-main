"""
Admin Participant URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.participants.views import ParticipantAdminViewSet

router = DefaultRouter()
router.register(r'', ParticipantAdminViewSet, basename='admin-participant')

urlpatterns = [
    path('', include(router.urls)),
]

