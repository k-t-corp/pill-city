import React, {useCallback, useEffect, useRef, useState} from 'react'
import './Settings.css'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
const FormData = require('form-data');

export default (props) => {
  const [image, updateImage] = useState()
  const imgRef = useRef(null);
  const [loading, updateLoading] = useState(true)
  const [showCrop, updateShowCrop] = useState(false)
  const [crop, setCrop] = useState({aspect: 1});
  const [upImage, updateUpImage] = useState()

  useEffect(async () => {
    const me = await props.api.getMe()
    updateImage(me.avatar_url)
    updateLoading(false)
  }, [])

  const changeAvatarOnClick = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      updateUpImage(URL.createObjectURL(img))
      updateShowCrop(true)
    }
  }

  /**
   * @param {HTMLImageElement} image - Image File Object
   * @param {Object} crop - crop Object
   * @param {String} fileName - Name of the returned file in Promise
   */
  function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  }

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  return (
    <div className="settings-wrapper">
      <div className="settings-user-info">
        <div className="settings-avatar-wrapper">
          <img className="settings-avatar-img" src={image} alt="user-avatar"/>
        </div>
        {showCrop ?
          <div>
            <ReactCrop src={upImage}
                       crop={crop}
                       onImageLoaded={onLoad}
                       onChange={newCrop => {
                         setCrop(newCrop)
                       }}/>
            <div onClick={async () => {
              const croppedImg = await getCroppedImg(imgRef.current, crop, "new-avatar");
              updateImage(URL.createObjectURL(croppedImg))
              let data = new FormData();
              data.append('file', croppedImg, croppedImg.name);

              try {
                await props.api.updateAvatar(data)
                updateShowCrop(false)
              } catch (e) {
                console.log(e)
              }
            }
            }>update
            </div>
          </div> : null}
        <input className="settings-change-avatar-button"
               accept="image/*"
               type="file"
               name="new-avatar"
               onChange={changeAvatarOnClick}/>
      </div>
    </div>
  )
}
