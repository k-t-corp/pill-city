import React, {useCallback, useRef, useState} from "react";
import FormData from "form-data";
import ReactCrop, {Crop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './UpdateAvatar.css'
import {useAppDispatch} from "../../store/hooks";
import {loadMe} from "../../store/meSlice";

const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  if (typeof crop.width === "number") {
    canvas.width = crop.width;
  }
  if (typeof crop.height === "number") {
    canvas.height = crop.height;
  }
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw Error('2d canvas is null??')
  }

  ctx.drawImage(
    image,
    (crop.x as number) * scaleX,
    (crop.y as number) * scaleY,
    (crop.width as number) * scaleX,
    (crop.height as number) * scaleY,
    0,
    0,
    (crop.width as number),
    (crop.height as number),
  );

  // As a blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob === null) {
        reject()
      }
      resolve(blob as Blob);
    }, 'image/*', 1);
  });
}

interface Props {
  api: any
  dismiss: () => void
  beforeUpdate: () => void
  afterUpdate: () => void
}

export default (props: Props) => {
  const [objectUrl, updateObjectUrl] = useState("")
  const onUpload = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      const newObjectUrl = URL.createObjectURL(img)
      updateObjectUrl(newObjectUrl)
    }
  }

  const avatarImageRef = useRef<HTMLImageElement>();
  const onImageLoaded = useCallback((img) => {
    avatarImageRef.current = img;
  }, []);

  const [crop, updateCrop] = useState<Crop>({
    unit: '%',
    aspect: 1,
    x: 0,
    y: 0,
    width: 100,
  });
  const [sendPost, updateSendPost] = useState(true)

  const dispatch = useAppDispatch()

  return (
    <div className="settings-avatar-content">
      {objectUrl === "" &&
        <div className="settings-avatar-placeholder">
          Click "Upload"
        </div>
      }
      {objectUrl !== "" &&
        <ReactCrop
          src={objectUrl}
          crop={crop}
          minWidth={50}
          onImageLoaded={onImageLoaded}
          onChange={newCrop => {
            updateCrop(newCrop)
          }}
        />
      }
      <div className="settings-avatar-controls">
        <div
          className="settings-avatar-button settings-avatar-cancel-button"
          onClick={props.dismiss}
        >Cancel</div>
        <label
          htmlFor="avatar"
          className="settings-avatar-button settings-avatar-upload-button"
        >
          Upload
        </label>
        <input
          id="avatar"
          accept="image/*"
          type="file"
          name="new-avatar"
          onChange={onUpload}
        />
        <div
          className="settings-avatar-button settings-avatar-confirm-button"
          onClick={async () => {
            if (!avatarImageRef.current) {
              return
            }

            props.beforeUpdate()
            const croppedImg = await getCroppedImg(avatarImageRef.current, crop);
            const data = new FormData();
            data.append('file', croppedImg, 'new-avatar');
            data.append('update_post', sendPost ? '1' : '0')
            await props.api.updateAvatar(data)
            await dispatch(loadMe())
            props.afterUpdate()
          }}
        >Confirm</div>
        <input
          className="settings-avatar-send-post-checkbox"
          type="checkbox"
          checked={sendPost}
          onChange={() => {updateSendPost(!sendPost)}}
        />
        <span
          className="settings-avatar-send-post-checkbox-label"
          onClick={() => {updateSendPost(!sendPost)}}
        >Send a post for this avatar change</span>
      </div>
    </div>
  )
}
