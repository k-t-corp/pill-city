#!/usr/bin/env bash
set -o allexport
source .env
celery -A pillcity.tasks worker --loglevel=INFO
