import { getRootURL } from "../../utils/utils";
import ImageDropZone from "../ImageDropZone";

interface props {
  thumbnail: string
  setThumbnail: Function
}
function InputThumbnail({...props}: props) {
  // sets input thumbnail as string
  async function uploadThumbnail(file: string) {
    props.setThumbnail(file);
  }
  
  
  async function deleteThumbnail() {
    props.setThumbnail(null);
  }

  return <>
    <div className="event-banner-wrapper">
      { props.thumbnail === null &&<ImageDropZone addImageUrl={uploadThumbnail}/> }
      {
        props.thumbnail !== null &&  <>
          <img className="event-banner" src={`${getRootURL()}images/get?id=${props.thumbnail}`} alt="Thumbnail" ></img>
          <div className="event-banner deletable" onClick={deleteThumbnail}></div>
        </>
      }
    </div>

  </>
}

export default InputThumbnail;