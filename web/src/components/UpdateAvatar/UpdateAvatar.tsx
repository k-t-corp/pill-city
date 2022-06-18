import React, {useCallback, useRef, useState} from "react";
import FormData from "form-data";
import ReactCrop, {Crop} from 'react-image-crop';
import {useAppDispatch} from "../../store/hooks";
import {loadMe} from "../../store/meSlice";
import 'react-image-crop/dist/ReactCrop.css';
import api from "../../api/Api";
import './UpdateAvatar.css'
import PillCheckbox from "../PillCheckbox/PillCheckbox";
import PillButtons from "../PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../PillButtons/PillButton";
import PillForm from "../PillForm/PillForm";
import convertHeicFileToPng from "../../utils/convertHeicFileToPng";


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
  dismiss: () => void
  beforeUpdate: () => void
  afterUpdate: () => void
}

export default (props: Props) => {
  const [objectUrl, updateObjectUrl] = useState("")
  const onUpload = async (event: any) => {
    if (event.target.files && event.target.files[0]) {
      let f = event.target.files[0];
      f = f.name.endsWith(".heic") ? await convertHeicFileToPng(f) : f
      const newObjectUrl = URL.createObjectURL(f)
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

  const onDrop = (e: any) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      let img = e.dataTransfer.files[0];
      const newObjectUrl = URL.createObjectURL(img)
      updateObjectUrl(newObjectUrl)
    }
  }

  const dispatch = useAppDispatch()

  return (
    <PillForm>
      {objectUrl === "" ?
        <>
          <label
            htmlFor="upload"
            className="settings-avatar-drop-zone"
            onDragOver={(e: any) => {e.preventDefault()}}
            onDragEnter={(e: any) => {e.preventDefault()}}
            onDragLeave={(e: any) => {e.preventDefault()}}
            onDrop={onDrop}
          >
            Drop or click here to upload media
          </label>
          <input
            id="upload"
            accept="image/*"
            type="file"
            onChange={onUpload}
          />
        </> :
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
      <PillButtons>
        <PillButton
          text='Cancel'
          variant={PillButtonVariant.Neutral}
          onClick={props.dismiss}
        />
        <PillButton
          text='Confirm'
          variant={PillButtonVariant.Positive}
          onClick={async () => {
            if (!avatarImageRef.current) {
              return
            }

            props.beforeUpdate()
            const croppedImg = await getCroppedImg(avatarImageRef.current, crop);
            const data = new FormData();
            data.append('file', croppedImg, 'new-avatar');
            data.append('update_post', sendPost ? '1' : '0')
            await api.updateAvatar(data)
            await dispatch(loadMe())
            props.afterUpdate()
          }}
        />
        <PillCheckbox
          checked={sendPost}
          onChange={updateSendPost}
          label='Send a post for this avatar change'
        />
      </PillButtons>
    </PillForm>
  )
}
