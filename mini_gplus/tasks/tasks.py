import os
from celery import Celery
from celery.utils.log import get_task_logger

app = Celery('tasks', broker=os.environ['REDIS_URL'])
logger = get_task_logger(__name__)


@app.task
def generate_link_preview(url):
    logger.info(f'Generating link preview for url {url}')
