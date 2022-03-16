from werkzeug.exceptions import HTTPException


class UnauthorizedAccess(HTTPException):
    pass


class BadRequest(HTTPException):
    pass


class NotFound(HTTPException):
    pass


class Conflict(HTTPException):
    pass
