import os
import unittest.mock
import fakeredis

patch_env = unittest.mock.patch.dict(os.environ, {
    "REDIS_URL": "redis://localhost.fake",
    "OFFICIAL": "official"
})
patch_env.start()

r = fakeredis.FakeRedis()
import mini_gplus.daos.user_cache
patch_redis = unittest.mock.patch.object(mini_gplus.daos.user_cache, 'r', r)
patch_redis.start()
