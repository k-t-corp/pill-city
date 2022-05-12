import requests
import json
from typing import Optional
from flask import Blueprint, jsonify
from pillcity.plugin_core import PillCityPlugin


class CloudEmoticon(PillCityPlugin):
    def init(self):
        resp = requests.get("https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/kt-favorites.json")
        resp = resp.json()
        self.get_context().redis_set("emoticons", json.dumps(resp))

    def job(self):
        pass

    def flask_blueprint(self) -> Optional[Blueprint]:
        api = Blueprint(__name__, __name__)

        @api.route('/emoticons', methods=['GET'])
        def _get_emoticons():
            s = self.get_context().redis_get("emoticons")
            return jsonify(json.loads(s))

        return api
