import os
from ..exceptions import DoesNotExistError, InputError
from ..database.database import db_upload_image

from io import BytesIO
from uuid import uuid4
from PIL import Image



# Saves image bytes and returns id
def save_image(image_bytes: BytesIO):
    img = Image.open(image_bytes)
    imageID = uuid4()
    try:
        image_type = image_bytes.content_type.split('/')[-1].lower()
        full_id = f'{imageID}.{image_type}'
        # Save the image
        img.save(f'./GoNextApp/image-cache/{full_id}', image_type)
        db_upload_image(full_id)
        return full_id
    except:
        raise InputError('Image could not be saved')

# retrieves image data from id
def get_image(image_id: str):
    image_id = f'./GoNextApp/image-cache/{image_id}'
    content_type = image_id.split('.')[-1].lower()
    try: 
        with open(image_id, 'rb') as image:
            return {'data':image.read(), 'content_type':content_type}
    except:
        raise DoesNotExistError('Image', image_id)