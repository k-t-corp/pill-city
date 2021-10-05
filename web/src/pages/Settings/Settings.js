import React, {useEffect, useState} from 'react'
import {removeAccessToken} from "../../api/AuthStorage";
import LoadingModal from "../../components/LoadingModal/LoadingModal";
import About from "../../components/About/About";
import {useHistory} from "react-router-dom";
import './Settings.css'
import UpdateAvatarModal from "../../components/UpdateAvatarModal/UpdateAvatarModal";

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [me, updateMe] = useState("")

  const [avatarUrl, updateAvatarUrl] = useState()
  const [uploadedAvatarObjectUrl, updateUploadedAvatarObjectUrl] = useState()
  const [avatarModalOpened, updateAvatarModalOpened] = useState(false)
  const [updatingAvatar, updateUpdatingAvatar] = useState(false)

  const profilePicOptions = ["pill1.png", "pill2.png", "pill3.png", "pill4.png", "pill5.png", "pill6.png"]
  const [profilePic, updateProfilePic] = useState()
  const [profileModalOpened, updateProfileModalOpened] = useState(false)
  const [profileModalSelectedPic, updateProfileModalSelectedPic] = useState()

  const history = useHistory()

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
    updateAvatarUrl(meProfile.avatar_url)
    updateProfilePic(meProfile.profile_pic)
    updateProfileModalSelectedPic(meProfile.profile_pic)
    updateLoading(false)
  }, [])

  const changeAvatarOnClick = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      updateUploadedAvatarObjectUrl(URL.createObjectURL(img))
      updateAvatarModalOpened(true)
    }
  }

  const handleSignOut = () => {
    removeAccessToken()
    history.push("/signin")
  }

  const dismissAvatarModal = () => {
    updateAvatarModalOpened(false)
  }

  if (loading) {
    return <LoadingModal title="Loading..."/>
  }
  else if (updatingAvatar) {
    return <LoadingModal title="Updating your avatar..."/>
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
              <img className="settings-avatar-img" src={avatarUrl} alt="user-avatar"/>
            </div>
            <label className="settings-change-avatar-button-wrapper">
              <input
                accept="image/*"
                type="file"
                name="new-avatar"
                onChange={changeAvatarOnClick}
              />
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
          <About api={props.api}/>
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
                  <div
                    onClick={async () => {
                     try {
                       await props.api.updateProfilePic(profileModalSelectedPic)
                       updateProfileModalOpened(false)
                       updateProfilePic(profileModalSelectedPic)
                     } catch (e) {
                       console.log(e)
                     }}
                    }>Update</div>
                </div>
              </div>
            </div>
            : null}
          {avatarModalOpened &&
            <UpdateAvatarModal
              uploadedAvatarObjectUrl={uploadedAvatarObjectUrl}
              api={props.api}
              updateUpdatingAvatar={updateUpdatingAvatar}
              updateAvatarUrl={updateAvatarUrl}
              dismiss={dismissAvatarModal}
            />
          }
        </div>
      </div>
    )
  }
}
