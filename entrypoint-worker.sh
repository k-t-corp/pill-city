#!/bin/bash

celery -A pillcity.tasks.tasks worker --loglevel=INFO