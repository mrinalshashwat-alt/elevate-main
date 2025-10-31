"""
Admin URLs for contest management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.contests.views import ContestAdminViewSet

router = DefaultRouter()
router.register(r'contests', ContestAdminViewSet, basename='admin-contest')

urlpatterns = [
    path('', include(router.urls)),
]

