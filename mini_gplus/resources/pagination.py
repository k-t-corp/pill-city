from flask_restful import reqparse

pagination_parser = reqparse.RequestParser()
pagination_parser.add_argument('from_id', type=str, required=False, location='args')
