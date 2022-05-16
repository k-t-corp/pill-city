#!/bin/bash

celery -A pillcity.tasks beat --loglevel=DEBUG --max-interval 30