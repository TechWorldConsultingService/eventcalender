from datetime import date, timedelta

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Event, Task, WeekNote
from .serializers import EventSerializer, TaskSerializer, WeekNoteSerializer


class OwnedViewSet(viewsets.ModelViewSet):
    """Only ever shows the logged-in user's own rows. Supports ?start=&end= date filters."""

    model = None

    def get_queryset(self):
        qs = self.model.objects.filter(owner=self.request.user)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class EventViewSet(OwnedViewSet):
    model = Event
    serializer_class = EventSerializer


class TaskViewSet(OwnedViewSet):
    model = Task
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('event')
        completed = self.request.query_params.get('completed')
        if completed in ('true', 'false'):
            qs = qs.filter(completed=(completed == 'true'))
        return qs


class WeekNoteViewSet(OwnedViewSet):
    model = WeekNote
    serializer_class = WeekNoteSerializer

    def create(self, request, *args, **kwargs):
        # Upsert: one note per user per day
        note, _ = WeekNote.objects.update_or_create(
            owner=request.user,
            date=request.data.get('date'),
            defaults={'content': request.data.get('content', '')},
        )
        return Response(WeekNoteSerializer(note).data)


@api_view(['GET'])
def dashboard(request):
    user = request.user
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # Monday
    week_end = week_start + timedelta(days=6)

    tasks = Task.objects.filter(owner=user)
    events = Event.objects.filter(owner=user)
    week_tasks = tasks.filter(date__range=(week_start, week_end))

    week_breakdown = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        day_tasks = [t for t in week_tasks if t.date == d]
        week_breakdown.append({
            'date': d.isoformat(),
            'total': len(day_tasks),
            'done': sum(1 for t in day_tasks if t.completed),
        })

    total_week = week_tasks.count()
    done_week = week_tasks.filter(completed=True).count()

    by_category = {}
    for e in events.filter(date__gte=today):
        by_category[e.category] = by_category.get(e.category, 0) + 1

    return Response({
        'today': today.isoformat(),
        'stats': {
            'total_events': events.count(),
            'upcoming_events': events.filter(date__gte=today).count(),
            'total_tasks': tasks.count(),
            'pending_tasks': tasks.filter(completed=False).count(),
            'completed_tasks': tasks.filter(completed=True).count(),
            'overdue_tasks': tasks.filter(completed=False, date__lt=today).count(),
            'week_progress': round(done_week * 100 / total_week) if total_week else 0,
        },
        'today_tasks': TaskSerializer(tasks.filter(date=today), many=True).data,
        'today_events': EventSerializer(events.filter(date=today), many=True).data,
        'upcoming_events': EventSerializer(events.filter(date__gte=today)[:6], many=True).data,
        'upcoming_tasks': TaskSerializer(
            tasks.filter(completed=False, date__gte=today).order_by('date')[:8], many=True
        ).data,
        'overdue_tasks': TaskSerializer(
            tasks.filter(completed=False, date__lt=today).order_by('-date')[:5], many=True
        ).data,
        'week_breakdown': week_breakdown,
        'events_by_category': by_category,
    })
