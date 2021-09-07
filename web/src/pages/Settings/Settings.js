import React, {useCallback, useEffect, useRef, useState} from 'react'
import './Settings.css'
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {removeAccessToken} from "../../api/AuthStorage";

const FormData = require('form-data');

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [me, updateMe] = useState("")
  const [avatarImageUrl, updateAvatarImageUrl] = useState()
  const avatarImageRef = useRef(null);
  const [avatarModalOpened, updateAvatarModalOpened] = useState(false)
  const [crop, setCrop] = useState(
    {
      unit: '%',
      aspect: 1,
      x: 0,
      y: 0,
      width: 100,
    });
  const [uploadedAvatarImage, updateUploadedAvatarImage] = useState()
  const profilePicOptions = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]
  const [profilePic, updateProfilePic] = useState()
  const [profileModalOpened, updateProfileModalOpened] = useState(false)
  const [profileModalSelectedPic, updateProfileModalSelectedPic] = useState()
  const profileModalOptionsElem = () => {
    let optionElem = []
    for (let i = 0; i < profilePicOptions.length; i++) {
      const selected = profileModalSelectedPic === profilePicOptions[i] ? "settings-profile-selection-option-selected" : null
      optionElem.push(
        <div className={`settings-profile-selection-option ${selected}`} key={i}
             onClick={() => updateProfileModalSelectedPic(profilePicOptions[i])}>
          <img className="settings-profile-selection-option-img"
               src={`${process.env.PUBLIC_URL}/${profilePicOptions[i]}`} alt=""/>
        </div>
      )
    }
    return optionElem
  }

  useEffect(async () => {
    const meProfile = await props.api.getMe()
    updateMe(meProfile)
    updateAvatarImageUrl(meProfile.avatar_url)
    updateProfilePic(meProfile.profile_pic)
    updateProfileModalSelectedPic(meProfile.profile_pic)
    updateLoading(false)
  }, [])

  const changeAvatarOnClick = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      updateUploadedAvatarImage(URL.createObjectURL(img))
      updateAvatarModalOpened(true)
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
      }, 'image/*', 1);
    });
  }

  const onLoad = useCallback((img) => {
    avatarImageRef.current = img;
  }, []);

  const inputAvatarElement = document.getElementById("settings-change-avatar-button")

  const handleSignOut = () => {
    removeAccessToken()
    window.location.href = "/signin"
  }

  if (loading) {
    return (
      <div>
        loading
      </div>
    )
  } else {
    return (
      <div className="settings-wrapper">
        <div className="settings-user-info">
          <div className="settings-banner-wrapper" style={{
            backgroundColor: "#9dd0ff",
            backgroundImage: `url(${process.env.PUBLIC_URL}/${profilePic})`
          }}>
            <div className="settings-change-profile-pic-button-wrapper">
              <div className="settings-change-profile-pic-button" onClick={() => updateProfileModalOpened(true)}>
                <svg className="settings-change-avatar-button-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="settings-avatar-box">
            <div className="settings-avatar-wrapper">
              <img className="settings-avatar-img" src={avatarImageUrl} alt="user-avatar"/>
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
          <div className="settings-signout-button" onClick={() => {handleSignOut()}}>
            <div className="settings-signout-button-label">
              Sign out
            </div>
             &nbsp;
            <svg className="settings-signout-button-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          {profileModalOpened ?
            <div className="settings-profile-pic-modal">
              <div className="settings-profile-pic-modal-content">
                <div id="settings-profile-pic-modal-preview" style={{
                  backgroundColor: "#9dd0ff",
                  backgroundImage: `url(${process.env.PUBLIC_URL}/${profileModalSelectedPic})`,
                }}/>
                <div className="settings-profile-pic-modal-selections">
                  {profileModalOptionsElem()}
                </div>
                <div className="settings-modal-buttons">
                  <div className="settings-modal-cancel-button"
                       onClick={() => {
                         updateProfileModalOpened(false)
                       }}>
                    Cancel
                  </div>
                  <div className="settings-modal-update-button"
                       onClick={async () => {
                         try {
                           await props.api.updateProfilePic(profileModalSelectedPic)
                           updateProfileModalOpened(false)
                           updateProfilePic(profileModalSelectedPic)
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
          {avatarModalOpened ?
            <div className="settings-avatar-modal">
              <div className="settings-avatar-modal-content">
                <ReactCrop src={uploadedAvatarImage}
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
                         updateAvatarModalOpened(false)
                       }}>
                    Cancel
                  </div>
                  <div className="settings-modal-update-button"
                       onClick={async () => {
                         const croppedImg = await getCroppedImg(avatarImageRef.current, crop, "new-avatar");
                         updateAvatarImageUrl(URL.createObjectURL(croppedImg))
                         let data = new FormData();
                         data.append('file', croppedImg, croppedImg.name);

                         try {
                           await props.api.updateAvatar(data)
                           inputAvatarElement.value = ''
                           updateAvatarModalOpened(false)
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
