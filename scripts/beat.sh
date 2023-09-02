#!/usr/bin/env bash
set -o allexport
source .env
celery -A pillcity.tasks beat --loglevel=DEBUG --max-interval 30
