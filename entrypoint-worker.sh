#!/bin/bash

python release.py && celery -A mini_gplus.tasks.tasks worker --loglevel=INFO