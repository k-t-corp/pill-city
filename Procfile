web: gunicorn app:app
worker: celery -A mini_gplus.tasks.tasks worker --loglevel=INFO
release: python release.py
