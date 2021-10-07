import os
import logging
from celery import Celery

app = Celery('tasks', broker=os.environ['REDIS_URL'])
logger = logging.getLogger('tasks')


@app.task
def generate_link_preview(url):
    logger.info(f'Generating link preview for url {url}')
