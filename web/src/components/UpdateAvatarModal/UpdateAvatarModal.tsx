import React, {useCallback, useRef, useState} from "react";
import FormData from "form-data";
import ReactCrop, {Crop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './UpdateAvatarModal.css'

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
  uploadedAvatarObjectUrl: string
  api: any
  updateUpdatingAvatar: (updating: boolean) => void
  updateAvatarUrl: (url: string) => void
  dismiss: () => void
}

export default (props: Props) => {
  const avatarImageRef = useRef<HTMLImageElement>();
  const [crop, updateCrop] = useState<Crop>({
    unit: '%',
    aspect: 1,
    x: 0,
    y: 0,
    width: 100,
  });

  const onLoad = useCallback((img) => {
    avatarImageRef.current = img;
  }, []);

  return (
    <div className="settings-avatar-modal">
      <div className="settings-avatar-modal-content">
        <ReactCrop
          src={props.uploadedAvatarObjectUrl}
          crop={crop}
          minWidth={50}
          onImageLoaded={onLoad}
          onChange={newCrop => {
           updateCrop(newCrop)
          }}
        />
        <div className="settings-modal-buttons">
          <div
            className="settings-modal-cancel-button"
            onClick={() => {
             props.dismiss()
            }}
          >Cancel</div>
          <div
            onClick={async () => {
              if (!avatarImageRef.current) {
                return
              }
              props.updateUpdatingAvatar(true)

              const croppedImg = await getCroppedImg(avatarImageRef.current, crop);
              const data = new FormData();
              data.append('file', croppedImg, 'new-avatar');
              // TODO: checkbox
              data.append('update_post', '1')
              await props.api.updateAvatar(data)

              props.updateAvatarUrl(URL.createObjectURL(croppedImg))
              props.dismiss()
              props.updateUpdatingAvatar(false)
            }}
          >Update</div>
        </div>
      </div>
    </div>
  )
}
