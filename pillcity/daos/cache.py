import os
import redis

r = redis.from_url(os.environ['REDIS_URL'])
RMediaUrl = "mediaUrl"
