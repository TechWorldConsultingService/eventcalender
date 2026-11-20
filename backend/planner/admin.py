from django.contrib import admin

from .models import Event, Task, WeekNote


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'date', 'start_time', 'category')
    list_filter = ('category', 'date')
    search_fields = ('title', 'description')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'date', 'priority', 'completed')
    list_filter = ('completed', 'priority')


admin.site.register(WeekNote)
