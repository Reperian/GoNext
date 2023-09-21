import jwt
from ..exceptions import InvalidTokenError
from ..database.database import db_find_login

# Generates a token from the user id


def gen_token(uid):
    encoded = jwt.encode({'uid': uid},"testSecret",algorithm='HS256')
    return encoded

# Decodes a token


def decode_token(token):
    try:
        decoded = jwt.decode(bytes(token, 'utf-8'), 'testSecret', algorithms=['HS256'])
        return decoded['uid']
    except:
        raise InvalidTokenError("bad token")

# Determines if inputted login details are valid


def valid_login(email, password):
    return db_find_login(email, password)


