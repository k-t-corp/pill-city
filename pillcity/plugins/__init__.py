import os
from typing import Dict
from redis import Redis
from pillcity.plugin_core import PillCityPlugin, PillCityPluginContext
from .cloudemoticon import CloudEmoticon

PLUGINS = {
    "cloudemoticon": CloudEmoticon
}


def get_plugins() -> Dict[str, PillCityPlugin]:
    r = Redis.from_url(os.environ['REDIS_URL'])
    res = {}
    for name, clazz in PLUGINS.items():
        context = PillCityPluginContext(name, r)
        plugin = clazz(context)
        res[name] = plugin

    return res
