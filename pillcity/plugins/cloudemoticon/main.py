import logging
import requests
import json
from typing import Optional
from flask import Blueprint, jsonify
from pillcity.plugin_core import PillCityPlugin


class CloudEmoticon(PillCityPlugin):
    def _poll_emoticons(self):
        resp = requests.get("https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/kt-favorites.json")
        resp = resp.json()
        logging.info(f"Polled {len(resp['categories'])} categories")
        resp = json.dumps(resp)
        self.get_context().redis_set("emoticons", resp)

    def init(self):
        self._poll_emoticons()

    def job(self):
        logging.info("Polling latest emoticons")
        self._poll_emoticons()

    def job_interval_seconds(self) -> int:
        return 60

    def flask_blueprint(self) -> Optional[Blueprint]:
        api = Blueprint(__name__, __name__)

        @api.route('/emoticons', methods=['GET'])
        def _get_emoticons():
            s = self.get_context().redis_get("emoticons")
            return jsonify(json.loads(s))

        return api
