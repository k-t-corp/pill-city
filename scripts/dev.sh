#!/usr/bin/env bash

docker-compose down
docker-compose up -d
set -o allexport
source .env
FLASK_ENVIRONMENT=development ./venv/bin/python app.py
docker-compose down
