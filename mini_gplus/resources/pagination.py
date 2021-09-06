from flask_restful import reqparse

pagination_parser = reqparse.RequestParser()
pagination_parser.add_argument('from_created_at_ms', type=int, required=False, location='args')
pagination_parser.add_argument('from_id', type=str, required=False, location='args')
