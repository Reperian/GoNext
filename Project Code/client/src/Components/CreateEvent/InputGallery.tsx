import { getRootURL } from "../../utils/utils";
import ImageDropZone from "../ImageDropZone";

interface props {
  images: Array<string>
  setImages: Function
}

function InputGallery({...props}: props) {
  // appends image to gallery
  function uploadGallery(file: string) {
    props.setImages([...props.images, file]);
  }
  // Deletes a image string from any given index of the gallery 
  function deleteImage(index: number) {
    props.setImages([
      ...props.images.slice(0, index),
      ...props.images.slice(index + 1)
    ]);
  }

  return <>
    <div className="CE-gallery">
      {
        props.images.map((image: string, index: number) => {
          return (
            <div key={index} className="CE-imageGallery-wrapper">
              <img src={`${getRootURL()}images/get?id=${image}`} className="CE-imageGallery-background" alt=''></img>
              <img src={`${getRootURL()}images/get?id=${image}`} className="CE-imageGallery" alt=''></img>
              <div className="CE-imageGallery deletable"  onClick={() => deleteImage(index)}></div>
            </div>
          )
        })

      }
      <div className="CE-addImageGallery">
        <ImageDropZone addImageUrl={uploadGallery}/>
      </div>
    </div>
  </>
}

export default InputGallery;