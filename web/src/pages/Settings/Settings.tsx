import React, {useEffect, useState} from 'react'
import {removeAccessToken} from "../../api/AuthStorage";
import About from "../../components/About/About";
import UpdateAvatar from "../../components/UpdateAvatar/UpdateAvatar";
import User from "../../models/User";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import Modal from 'react-modal';
import './Settings.css'
import UpdateBanner from "../../components/UpdateBanner/UpdateBanner";
import {loadMe} from "../../store/meSlice";
import {useMediaQuery} from "react-responsive";
import {validateEmail} from "../../utils/validators";

Modal.setAppElement('#root');

interface Props {
  api: any
}

const Settings = (props: Props) => {
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

  const [displayNameModalOpened, updateDisplayNameModalOpened] = useState(false)
  const [emailModalOpened, updateEmailModalOpened] = useState(false)
  const [avatarModalOpened, updateAvatarModalOpened] = useState(false)
  const [bannerModalOpened, updateBannerModalOpened] = useState(false)

  const [loading, updateLoading] = useState(true)
  const [displayName, updateDisplayName] = useState<string | undefined>()
  const [email, updateEmail] = useState<string | undefined>()
  const [emailValidated, updateEmailValidated] = useState(false)
  useEffect(() => {
    if (validateEmail(email)) {
      updateEmailValidated(true)
    } else {
      updateEmailValidated(false)
    }
  }, [email])

  useEffect(() => {
    (async () => {
      if (meLoading) {
        return
      }
      const myProfile = me as User
      updateDisplayName(myProfile.display_name)

      updateEmail(await props.api.getEmail())
      updateLoading(false)
    })()
  }, [meLoading])

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })
  console.log(isTabletOrMobile)
  let modalStyles
  if (isTabletOrMobile) {
    modalStyles = {
      content: {
        bottom: 'auto',
      },
    }
  } else {
    modalStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '800px'
      },
    }
  }

  const handleSignOut = () => {
    removeAccessToken()
    // This is needed so that the App component is fully reloaded
    // so that getting the first home page and auto refresh is disabled
    window.location.href = '/signin'
  }

  if (meLoading || loading) {
    return <div className="settings-wrapper">Loading...</div>
  }

  const dispatch = useAppDispatch()

  return (
    <div className="settings-wrapper">
      <div className="settings-row" onClick={() => {updateDisplayNameModalOpened(true)}}>
        <div className="settings-row-header">Display name</div>
        <div className="settings-row-content">{displayName || 'Click to update'}</div>
      </div>
      <div className="settings-row" onClick={() => {updateEmailModalOpened(true)}}>
        <div className="settings-row-header">Email</div>
        <div className="settings-row-content">{email || 'Click to update'}</div>
      </div>
      <div className="settings-row" onClick={() => {updateAvatarModalOpened(true)}}>
        <div className="settings-row-header"> Avatar</div>
        <div className="settings-row-content">Click to update</div>
      </div>
      <div className="settings-row" onClick={() => {updateBannerModalOpened(true)}}>
        <div className="settings-row-header">Banner</div>
        <div className="settings-row-content">Click to update</div>
      </div>
      <div className="settings-row" onClick={handleSignOut}>
        <div className="settings-row-header">Sign out</div>
      </div>
      <About api={props.api}/>
      <Modal isOpen={displayNameModalOpened} style={modalStyles}>
        <input
          className="settings-display-name"
          type="text"
          value={displayName}
          onChange={e => updateDisplayName(e.target.value)}
        />
        <div className="settings-controls">
          <div
            className="settings-controls-button settings-display-name-button-cancel"
            onClick={() => {updateDisplayNameModalOpened(false)}}
          >Cancel</div>
          <div
            className="settings-controls-button settings-display-name-button-confirm"
            onClick={async () => {
              updateLoading(true)
              await props.api.updateDisplayName(displayName)
              await dispatch(loadMe())
              updateLoading(false)
              updateDisplayNameModalOpened(false)
            }}
          >Confirm</div>
        </div>
      </Modal>
      <Modal isOpen={emailModalOpened} style={modalStyles}>
        <input
          className="settings-email"
          type="email"
          value={email}
          onChange={e => updateEmail(e.target.value)}
        />
        <div className="settings-controls">
          <div
            className="settings-controls-button settings-email-button-cancel"
            onClick={() => {updateEmailModalOpened(false)}}
          >Cancel</div>
          <div
            className={`settings-controls-button ${emailValidated ? 'settings-email-button-confirm' : 'settings-email-button-confirm-disabled'}`}
            onClick={async () => {
              if (!validateEmail(email)) {
                return
              }
              updateLoading(true)
              try {
                await props.api.updateEmail(email)
              } catch (e: any) {
                if (e.message) {
                  alert(e.message)
                } else {
                  console.error(e)
                }
              } finally {
                await dispatch(loadMe())
                updateLoading(false)
                updateEmailModalOpened(false)
              }
            }}
          >Confirm</div>
        </div>
      </Modal>
      <Modal isOpen={avatarModalOpened} style={modalStyles}>
        <UpdateAvatar
          api={props.api}
          dismiss={() => {
            updateAvatarModalOpened(false)
          }}
          beforeUpdate={() => {
            updateLoading(true)
          }}
          afterUpdate={() => {
            updateLoading(false)
            updateAvatarModalOpened(false)
          }}
        />
      </Modal>
      <Modal isOpen={bannerModalOpened} style={modalStyles}>
        <UpdateBanner
          api={props.api}
          dismiss={() => {
            updateBannerModalOpened(false)
          }}
          beforeUpdate={() => {
            updateLoading(true)
          }}
          afterUpdate={() => {
            updateLoading(false)
            updateBannerModalOpened(false)
          }}
        />
      </Modal>
    </div>
  )

}

export default withApi(withAuthRedirect(withNavBar(Settings, '/settings')), api)
