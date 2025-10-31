"""
Admin Grading URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.grading.views import GradingViewSet

router = DefaultRouter()
router.register(r'', GradingViewSet, basename='grading')

urlpatterns = [
    path('', include(router.urls)),
]

