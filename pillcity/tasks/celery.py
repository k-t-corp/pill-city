import os
import celery
from celery.utils.log import get_task_logger
from pillcity.plugins import get_plugins

app = celery.Celery(
    'tasks',
    broker=os.environ['REDIS_URL'],
    include=[
        'pillcity.tasks.generate_link_preview',
        'pillcity.tasks.process_image'
    ]
)
logger = get_task_logger(__name__)

# Set up plugin jobs
for plugin_name, plugin in get_plugins().items():
    celery_task_name = f"pillcity.plugins.{plugin_name}.job"

    class _Task(celery.Task):
        name = celery_task_name

        def run(self, *args, **kwargs):
            plugin.job()
    app.register_task(_Task)

    if plugin.job_interval_seconds() >= 60:
        # TODO: app.on_after_configure.connect just doesn't seem to work?
        app.conf.beat_schedule[plugin_name] = {
            'task': celery_task_name,
            'schedule': float(plugin.job_interval_seconds())  # int will mean minutes instead of seconds
        }

app.conf.timezone = 'UTC'
