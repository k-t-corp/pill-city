import os
import re
import sentry_sdk
from os import urandom
from pymongo import monitoring
from pymongo.uri_parser import parse_uri
from flask import Flask, jsonify, request
from flask_mongoengine import MongoEngine, MongoEngineSessionInterface
from flask_restful import Api
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from sentry_sdk.integrations.flask import FlaskIntegration
from mini_gplus.daos.user import sign_in, sign_up
from mini_gplus.daos.user_cache import populate_user_cache
from mini_gplus.daos.invitation_code import check_invitation_code, claim_invitation_code
from mini_gplus.resources.users import Users, User, MyAvatar, MyProfilePic, Me
from mini_gplus.resources.posts import Profile, Home, PostMedia, Posts, Post
from mini_gplus.resources.comments import NestedComments, Comments, NestedComment, Comment
from mini_gplus.resources.reactions import Reactions, Reaction
from mini_gplus.resources.circles import Circles, CircleMember, Circle
from mini_gplus.resources.followings import Following
from mini_gplus.resources.notifications import Notifications, NotificationRead, NotificationsAllRead
from mini_gplus.resources.invitations_codes import InvitationCode, InvitationCodes, ClearMediaUrlCache

# sentry
if os.getenv('SENTRY_DSN'):
    print('Enabling sentry')
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        integrations=[FlaskIntegration()],
        # no performance monitoring
        traces_sample_rate=0
    )
else:
    print('Not enabling sentry')

app = Flask(__name__)

app.secret_key = urandom(24)


# database profiling
class CommandLogger(monitoring.CommandListener):
    def started(self, event):
        pass

    def succeeded(self, event):
        print(f"pymongo event {event.request_id} with command {event.command_name} "
              f"in ns {event.reply.get('cursor', {}).get('ns', '')} replied "
              f"in {event.duration_micros // 1000} milliseconds")

    def failed(self, event):
        pass


if os.getenv('PROFILE'):
    print("Enabling pymongo profiling")
    monitoring.register(CommandLogger())


# database
mongodb_uri = os.environ['MONGODB_URI']
mongodb_db = parse_uri(mongodb_uri)['database']
app.config['MONGODB_SETTINGS'] = {
    'host': mongodb_uri,
    'db': mongodb_db,
}
db = MongoEngine(app)
app.session_interface = MongoEngineSessionInterface(db)

app.config['MAX_CONTENT_LENGTH'] = 40 * 1024 * 1024  # 40MB max upload size

# jwt
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
JWTManager(app)

app.config['BUNDLE_ERRORS'] = True

# cors
CORS(app, resources={r"/api/*": {"origins": "*"}})


# open registration
is_open_registration = os.environ.get('OPEN_REGISTRATION', 'false') == 'true'
if is_open_registration:
    print('Open registration')
else:
    print("Invite-only")

# git commit
# TODO: this only works on heroku https://devcenter.heroku.com/articles/dyno-metadata
git_commit = os.getenv('HEROKU_SLUG_COMMIT', None)
if git_commit:
    git_commit = git_commit[: 7]
print(f'Git commit {git_commit}')

populate_user_cache()


@app.route('/', methods=['GET'])
def _root():
    return 'pill.city api'


# auth
@app.route('/api/signIn', methods=['POST'])
def _sign_in():
    """
    Signs in a user by giving out access token
    """
    if not request.is_json:
        return jsonify({"message": "missing JSON in request"}), 400
    user_id = request.json.get('id', None)
    password = request.json.get('password', None)
    if not user_id:
        return jsonify({"message": {"id": "id is required"}}), 400
    if not password:
        return jsonify({"message": {"password": "password is required"}}), 400
    user = sign_in(user_id, password)
    if not user:
        return jsonify({"message": "invalid id or password"}), 401
    access_token = create_access_token(identity=user_id)
    return jsonify(access_token=access_token), 200


def check_user_id(user_id):
    if len(user_id) > 15:
        return False
    if not re.match("^[A-Za-z0-9_-]+$", user_id):
        return False
    return True


@app.route('/api/signUp', methods=['POST'])
def _sign_up():
    """
    Signs up a new user
    """
    user_id = request.json.get('id', None)
    password = request.json.get('password', None)
    if not user_id:
        return jsonify({"message": {"id": "id is required"}}), 400
    if not check_user_id(user_id):
        return jsonify({"message": {"id": "illegal id"}}), 400
    if not password:
        return jsonify({"message": {"password": "password is required"}}), 400
    if not is_open_registration:
        invitation_code = request.json.get('invitation_code', None)
        if not invitation_code:
            return jsonify({"message": {"invitation_code": "invitation code is required"}}), 403
        if not check_invitation_code(invitation_code):
            return jsonify({"message": {"invitation_code": "invalid invitation code"}}), 403
        if not claim_invitation_code(invitation_code):
            return jsonify({"message": {"invitation_code": "failed to claim invitation code"}}), 500
    successful = sign_up(user_id, password)
    if successful:
        return {'id': user_id}, 201
    else:
        return {'msg': f'ID {user_id} is already taken'}, 409


@app.route('/api/isOpenRegistration', methods=['GET'])
def _is_open_registration():
    return {
        "is_open_registration": is_open_registration
    }


@app.route('/api/gitCommit')
def _git_commit():
    return {
        'git_commit': git_commit
    }


# api
api = Api(app, errors={
    'UnauthorizedAccess': {
        'status': 401,
    },
    'BadRequest': {
        'status': 400,
    },
    'NotFound': {
        'status': 404,
    }
})

api.add_resource(MyAvatar, '/api/me/avatar')
api.add_resource(MyProfilePic, '/api/me/profilePic/<string:user_profile_pic>')
api.add_resource(Me, '/api/me')

api.add_resource(Users, '/api/users')
api.add_resource(User, '/api/user/<string:user_id>')

api.add_resource(Profile, '/api/profile/<string:profile_user_id>')
api.add_resource(Home, '/api/home')

api.add_resource(NestedComment, '/api/posts/<string:post_id>/comment/<string:comment_id>/comment/<string:nested_comment_id>')
api.add_resource(NestedComments, '/api/posts/<string:post_id>/comment/<string:comment_id>/comment')
api.add_resource(Comment, '/api/posts/<string:post_id>/comment/<string:comment_id>')
api.add_resource(Comments, '/api/posts/<string:post_id>/comment')
api.add_resource(Reactions, '/api/posts/<string:post_id>/reactions')
api.add_resource(Reaction, '/api/posts/<string:post_id>/reaction/<string:reaction_id>')
api.add_resource(PostMedia, '/api/posts/media')
api.add_resource(Posts, '/api/posts')
api.add_resource(Post, '/api/post/<string:post_id>')

api.add_resource(Circles, '/api/circles')
api.add_resource(CircleMember, '/api/circle/<string:circle_id>/membership/<string:member_user_id>')
api.add_resource(Circle, '/api/circle/<string:circle_id>')

api.add_resource(Following, '/api/following/<string:following_user_id>')

api.add_resource(NotificationRead, '/api/notification/<string:notification_id>/read')
api.add_resource(NotificationsAllRead, '/api/notifications/read')
api.add_resource(Notifications, '/api/notifications')

api.add_resource(InvitationCodes, '/api/invitationCodes')
api.add_resource(InvitationCode, '/api/invitationCode')
api.add_resource(ClearMediaUrlCache, '/api/clearMediaUrlCache')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
