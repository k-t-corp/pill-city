import os
from os import urandom
from pymongo.uri_parser import parse_uri
from flask import Flask, request, jsonify
from flask_mongoengine import MongoEngine, MongoEngineSessionInterface
from flask_restful import Api
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from mini_gplus.resources import UserList, Me, PostList
from mini_gplus.models import User


app = Flask(__name__)
app.secret_key = urandom(24)
mongodb_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:19023/minigplus')
mongodb_db = parse_uri(mongodb_uri)['database']
app.config['MONGODB_SETTINGS'] = {
    'db': mongodb_db,
    'host': mongodb_uri
}
db = MongoEngine(app)
app.session_interface = MongoEngineSessionInterface(db)


##################
# Authentication #
##################
app.config['JWT_SECRET_KEY'] = '123456'  # TODO: read from env
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
JWTManager(app)


@app.route('/api/auth', methods=['POST'])
def auth():
    if not request.is_json:
        return jsonify({"message": "missing JSON in request"}), 400
    _id = request.json.get('id', None)
    password = request.json.get('password', None)
    if not _id:
        return jsonify({"message": {"id": "id is required"}}), 400
    if not password:
        return jsonify({"message": {"password": "password is required"}}), 400
    user_checked = User.check(_id, password)
    if not user_checked:
        return jsonify({"message": "invalid id or password"}), 401
    access_token = create_access_token(identity=_id)
    return jsonify(access_token=access_token), 200


########
# APIs #
########
app.config['BUNDLE_ERRORS'] = True
CORS(app, resources={r"/api/*": {"origins": "*"}})

api = Api(app)
api.add_resource(UserList, '/api/users')
api.add_resource(PostList, '/api/posts')
api.add_resource(Me, '/api/me')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
