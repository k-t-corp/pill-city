from typing import Optional
from flask import Blueprint, jsonify
from pillcity.plugin_core import PillCityServerPlugin


class CloudEmoticon(PillCityServerPlugin):
    def get_name(self) -> str:
        return 'cloudemoticon'

    def init(self):
        pass

    def job(self):
        pass

    def flask_blueprint(self) -> Optional[Blueprint]:
        api = Blueprint(self.get_name(), __name__)

        @api.route('/emoticons', methods=['GET'])
        def _get_emoticons():
            return jsonify([])

        return api
