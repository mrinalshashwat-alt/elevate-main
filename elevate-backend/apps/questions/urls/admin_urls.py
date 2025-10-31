"""
Admin URLs for question management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.questions.views import QuestionAdminViewSet

router = DefaultRouter()
router.register(r'', QuestionAdminViewSet, basename='admin-question')

urlpatterns = [
    path('', include(router.urls)),
]

