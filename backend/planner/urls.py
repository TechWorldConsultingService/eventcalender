from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EventViewSet, TaskViewSet, WeekNoteViewSet, dashboard

router = DefaultRouter()
router.register('events', EventViewSet, basename='event')
router.register('tasks', TaskViewSet, basename='task')
router.register('notes', WeekNoteViewSet, basename='note')

urlpatterns = [
    path('dashboard/', dashboard, name='dashboard'),
    path('', include(router.urls)),
]
