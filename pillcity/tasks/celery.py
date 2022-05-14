import os
from celery import Celery
from celery.utils.log import get_task_logger

celery = Celery(
    'tasks',
    broker=os.environ['REDIS_URL'],
    include=[
        'pillcity.tasks.generate_link_preview'
    ]
)
logger = get_task_logger(__name__)
