import os
import unittest.mock
import fakeredis

patch_env = unittest.mock.patch.dict(os.environ, {
    "REDIS_URL": "redis://localhost.fake",
    "OFFICIAL": "official",
    "GHOST": "ghost"
})
patch_env.start()

r = fakeredis.FakeRedis()
import pillcity.daos.cache
patch_redis = unittest.mock.patch.object(pillcity.daos.cache, 'r', r)
patch_redis.start()

c = None
import pillcity.tasks.tasks
patch_celery = unittest.mock.patch.object(pillcity.tasks.tasks, 'celery', c)
patch_celery.start()
