# define Python user-defined exceptions

# Base class for other exceptions
class Error(Exception):
    def __init__(self, message='An error has occurred'):
        self.message = message
    
    def __str__(self):
        return self.message

# Invoked when user attempts to access resources they do not permission to.
class AccessError(Error):
    def __init__(self, message='unable to access.'):
        super().__init__(message)
    
    def __str__(self):
        return f'Access Error: {self.message}'

# Invoked when user passes in invalid arguments to access resources
class InputError(Error):
    def __init__(self, message='an invalid input was provided'):
        super().__init__(message)
    
    def __str__(self):
        return f'Input Error: {self.message}'
    
# When the token does not match any corresponding user, cannot be decrypted or expired.
class InvalidTokenError(InputError):
    def __init__(self, message='an invalid token was provided'):
        self.message = message
        super().__init__(self.message)

# Invoked when attempting to add an already existing resource to a unique set
class AlreadyExistError(InputError):
    def __init__(self, type: str='type', value=''):
        super().__init__(f'{type} == {value} already exists')

# Invoked when attempting to access a resource that does not exist
class DoesNotExistError(InputError):
    def __init__(self, type: str='type', value=''):
        super().__init__(f'{type} with value {value} does not exists')