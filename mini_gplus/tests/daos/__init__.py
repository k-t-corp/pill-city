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
import mini_gplus.daos.cache
patch_redis = unittest.mock.patch.object(mini_gplus.daos.cache, 'r', r)
patch_redis.start()

c = None
import mini_gplus.tasks.tasks
patch_celery = unittest.mock.patch.object(mini_gplus.tasks.tasks, 'app', c)
patch_celery.start()
