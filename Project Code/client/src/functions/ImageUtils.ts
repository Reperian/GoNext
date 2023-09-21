import { AxiosResponse } from "axios";
import restAPI from "../http-common";

const __SupportedTypes = new Set([
    'png', 'jpg', 'jpeg', 'gif'
]);

/**
 * Uploads an image that is of a supported type and returns the image id
 */
async function uploadImage(file: File) {
    const type =  file.type.split('/')[1];
    if (!__SupportedTypes.has(type)) {
        throw new Error('Unsupported file type: ' + type);
    }
    const data = new FormData();
    data.append("file", file, file.name)
    let response: AxiosResponse<any, any>;
    try {
        response  = await restAPI.post(`/images/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err) {
      console.error(err);
    }
    return response.data.image_id;
}

async function deleteImage(id: number) {

}
export {uploadImage, deleteImage}