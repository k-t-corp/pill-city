from redis import Redis


class PillCityPluginContext(object):
    def __init__(self, plugin_name: str, _redis: Redis):
        self.plugin_name = plugin_name  # type: str
        self._redis = _redis  # type: Redis

    def redis_get(self, key: str) -> str:
        return self._redis.hget(f'plugin.{self.plugin_name}', key)

    def redis_set(self, key: str, value: str):
        self._redis.hset(f'plugin.{self.plugin_name}', key, value)

    def mongo_get(self, user_id: str):
        pass

    def mongo_set(self, user_id: str, value):
        pass
