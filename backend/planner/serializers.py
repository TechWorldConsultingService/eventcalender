from rest_framework import serializers

from .models import Event, Task, WeekNote


class EventSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(source='tasks.count', read_only=True)

    class Meta:
        model = Event
        exclude = ('owner',)

    def validate(self, attrs):
        start, end = attrs.get('start_time'), attrs.get('end_time')
        if start and end and end < start:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return attrs


class TaskSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True, default=None)

    class Meta:
        model = Task
        exclude = ('owner',)

    def validate_event(self, event):
        if event and event.owner != self.context['request'].user:
            raise serializers.ValidationError('Event not found.')
        return event


class WeekNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeekNote
        fields = ('id', 'date', 'content', 'updated_at')
