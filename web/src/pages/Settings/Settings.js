import React, {useCallback, useEffect, useRef, useState} from 'react'
import './Settings.css'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const FormData = require('form-data');

export default (props) => {
  const [image, updateImage] = useState()
  const imgRef = useRef(null);
  const [loading, updateLoading] = useState(true)
  const [modalOpened, updateModalOpened] = useState(false)
  const [me, updateMe] = useState("")
  const [crop, setCrop] = useState(
    {
      unit: '%',
      aspect: 1,
      x: 0,
      y: 0,
      width: 100,
    });
  const [upImage, updateUpImage] = useState()

  useEffect(async () => {
    const meProfile = await props.api.getMe()
    updateMe(meProfile)
    updateImage(meProfile.avatar_url)
    updateLoading(false)
  }, [])

  const changeAvatarOnClick = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      updateUpImage(URL.createObjectURL(img))
      updateModalOpened(true)
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

  const inputAvatarElement = document.getElementById("settings-change-avatar-button")

  if (loading) {
    return (
      <div>
        loading
      </div>
    )} else {
    return (
      <div className="settings-wrapper">
        <div className="settings-user-info">
          <div className="settings-avatar-box">
            <div className="settings-avatar-wrapper">
              <img className="settings-avatar-img" src={image} alt="user-avatar"/>
            </div>
            <label className="settings-change-avatar-button-wrapper">
              <input id="settings-change-avatar-button"
                     accept="image/*"
                     type="file"
                     name="new-avatar"
                     onChange={changeAvatarOnClick}/>
              <svg className="settings-change-avatar-button-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </label>
          </div>
          <div className="settings-user-name">
            {me.id}
          </div>
          {modalOpened ?
            <div className="settings-avatar-modal">
              <div className="settings-avatar-modal-content">
                <ReactCrop src={upImage}
                           crop={crop}
                           minWidth={50}
                           onImageLoaded={onLoad}
                           onChange={newCrop => {
                             setCrop(newCrop)
                           }}/>
                <div className="settings-modal-buttons">
                  <div className="settings-modal-cancel-button"
                       onClick={() => {
                         inputAvatarElement.value = ''
                         updateModalOpened(false)
                       }}>
                    Cancel
                  </div>
                  <div className="settings-modal-update-button"
                       onClick={async () => {
                         const croppedImg = await getCroppedImg(imgRef.current, crop, "new-avatar");
                         updateImage(URL.createObjectURL(croppedImg))
                         let data = new FormData();
                         data.append('file', croppedImg, croppedImg.name);

                         try {
                           await props.api.updateAvatar(data)
                           inputAvatarElement.value = ''
                           updateModalOpened(false)
                         } catch (e) {
                           console.log(e)
                         }
                       }
                       }>
                    Update
                  </div>
                </div>
              </div>
            </div>
            : null}
        </div>
      </div>
    )
  }
}
