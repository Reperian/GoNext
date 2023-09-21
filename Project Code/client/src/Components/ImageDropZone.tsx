import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { uploadImage } from "../functions/ImageUtils";
import ImageIcon from "../Images/image.svg";

import "../css/ImageDropZone.scss";

interface IProps {
  title?: string;
  addImageUrl?: Function;
}

export default function DragAndDropImageUploader({ addImageUrl, title="" }: IProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener(
      "dragenter",
      (e) => {
        setIsDragging(true);
      },
      { signal: controller.signal }
    );
    document.addEventListener(
      "drop",
      (e) => {
        setIsDragging(false);
      },
      { signal: controller.signal }
    );
    document.addEventListener(
      "mouseup",
      (e) => {
        setIsDragging(false);
      },
      { signal: controller.signal }
    );
    return () => {
      controller.abort();
    };
  }, []);

  async function onDrop(file: File) {
    addImageUrl(await uploadImage(file));
  }

  return (
    <>
      <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles[0])}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              draggable: "false",
              onDragStartCapture: () => setIsDragging(true),
              onDragEnd: () => setIsDragging(false),
            })}
            className={`dropzone ${isDragging ? "dropzone__highlight" : ""}`}
          >
            <h2 className="text-center">{title}</h2>
            <br></br>
            <input {...getInputProps()} />
            <img draggable="false" src={ImageIcon} alt="img icon" className="upload-img-icon" />
            <p >Drag & drop or click to add image</p>
            <p>JPEG, PNG, GIF no larger than 10MB</p>
          </div>
        )}
      </Dropzone>
    </>
  );
}
