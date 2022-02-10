#!/bin/bash

celery -A mini_gplus.tasks.tasks worker --loglevel=INFO