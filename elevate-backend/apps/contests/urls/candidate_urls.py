"""
Candidate URLs for contest participation
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.contests.views import ContestCandidateViewSet

router = DefaultRouter()
router.register(r'', ContestCandidateViewSet, basename='candidate-contest')

urlpatterns = [
    path('', include(router.urls)),
]

