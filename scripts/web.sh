#!/usr/bin/env bash
set -o allexport
source .env
FLASK_ENVIRONMENT=development python app.py