from flask_restful import Resource, fields, marshal_with, reqparse
from .users import user_fields

media_set_fields = {
    'id': fields.String(attribute='eid'),
    'owner': fields.Nested(user_fields),
    'name': fields.String,
    # 'media_list': MediaList()
}
