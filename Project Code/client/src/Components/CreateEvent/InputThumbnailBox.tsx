interface props {
  image: string
}

function InputThumbnailBox({ ...props }: props) {
  return <>
    <img className="CE-Thumbnail" src={props.image} alt="thumbnail"></img>
  </>
}

export default InputThumbnailBox;