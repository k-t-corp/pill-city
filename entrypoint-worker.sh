#!/bin/bash

celery -A pillcity.tasks worker --loglevel=INFO