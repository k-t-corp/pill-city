import React, {useEffect, useState} from 'react'
import {removeAccessToken} from "../../api/AuthStorage";
import About from "../../components/About/About";
import UpdateAvatar from "../../components/UpdateAvatar/UpdateAvatar";
import User from "../../models/User";
import api from "../../api/Api";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import UpdateBanner from "../../components/UpdateBanner/UpdateBanner";
import {loadMe} from "../../store/meSlice";
import {validateEmail} from "../../utils/validators";
import MyModal from "../../components/MyModal/MyModal";
import {useToast} from "../../components/Toast/ToastProvider";
import './Settings.css'

type NotifyingActionToRssCode = {[action: string]: string}

interface RssToken {
  rss_token: string,
  rss_notifications_url: string,
  notifying_action_to_rss_code: NotifyingActionToRssCode
}

const Settings = () => {
  const me = useAppSelector(state => state.me.me)
  const meLoading = useAppSelector(state => state.me.loading)

  const [displayNameModalOpened, updateDisplayNameModalOpened] = useState(false)
  const [emailModalOpened, updateEmailModalOpened] = useState(false)
  const [avatarModalOpened, updateAvatarModalOpened] = useState(false)
  const [bannerModalOpened, updateBannerModalOpened] = useState(false)
  const [rssTokenModalOpened, updateRssTokenModalOpened] = useState(false)

  const [loading, updateLoading] = useState(true)
  const [displayName, updateDisplayName] = useState<string | undefined>()
  const [email, updateEmail] = useState<string | undefined>()
  const [emailValidated, updateEmailValidated] = useState(false)
  const [rssToken, updateRssToken] = useState<RssToken | undefined>()
  const [rssCodesChecked, updateRssCodesChecked] = useState<{[action: string]: boolean} | undefined>(undefined)

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

      updateEmail(await api.getEmail())
      const rssToken = await api.getRssToken() as RssToken
      updateRssToken(rssToken)
      updateRssCodesChecked(
        Object.fromEntries(
          Object.entries(rssToken.notifying_action_to_rss_code).map(([a, _]) => {
            return [a, true]
          })
        )
      )
      updateLoading(false)
    })()
  }, [meLoading])

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
  const { addToast } = useToast()

  let rssUrlTypes = ''
  if (rssToken && rssCodesChecked &&
    Object.entries(rssToken.notifying_action_to_rss_code).length
    !== Object.entries(rssCodesChecked).filter(([_, checked]) => checked).length
  ) {
    rssUrlTypes = '&types='
    for (let [a, checked] of Object.entries(rssCodesChecked)) {
      if (checked) {
        rssUrlTypes += rssToken.notifying_action_to_rss_code[a]
      }
    }
  }
  let rssUrl = ''
  if (rssToken) {
    rssUrl = rssToken.rss_notifications_url + rssUrlTypes
  }

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
      <div className="settings-row" onClick={() => {updateRssTokenModalOpened(true)}}>
        <div className="settings-row-header">RSS Notifications</div>
        <div className="settings-row-content">{rssToken && rssToken.rss_token ? 'Enabled' : 'Disabled'}</div>
      </div>
      <div className="settings-row" onClick={handleSignOut}>
        <div className="settings-row-header">Sign out</div>
      </div>
      <About/>
      <MyModal
        isOpen={displayNameModalOpened}
        onClose={() => {updateDisplayNameModalOpened(false)}}
      >
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
              await api.updateDisplayName(displayName)
              await dispatch(loadMe())
              updateLoading(false)
              updateDisplayNameModalOpened(false)
            }}
          >Confirm</div>
        </div>
      </MyModal>
      <MyModal
        isOpen={emailModalOpened}
        onClose={() => {updateEmailModalOpened(false)}}
      >
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
                await api.updateEmail(email)
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
      </MyModal>
      <MyModal
        isOpen={avatarModalOpened}
        onClose={() => {updateAvatarModalOpened(false)}}
      >
        <UpdateAvatar
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
      </MyModal>
      <MyModal
        isOpen={bannerModalOpened}
        onClose={() => {updateBannerModalOpened(false)}}
      >
        <UpdateBanner
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
      </MyModal>
      <MyModal
        isOpen={rssTokenModalOpened}
        onClose={() => {updateRssTokenModalOpened(false)}}
      >
        {
          rssToken && rssToken.rss_token ?
            <div>
              <p>Your RSS Notification URL is</p>
              <div className='settings-rss-url'>{rssUrl}</div>
              <p/>
              {
                rssCodesChecked &&
                <div className="settings-rss-code-checkboxes">
                  {
                    Object.entries(rssCodesChecked).map(([a, checked]) => {
                      return (
                        <>
                          <input
                            className="settings-rss-code-checkbox"
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (Object.entries(rssCodesChecked).filter(([_, checked]) => checked).length === 1 && (Object.entries(rssCodesChecked).filter(([_, checked]) => checked)[0][0] === a)) {
                                alert('You have to choose at least one type of notifications')
                              } else {
                                updateRssCodesChecked({
                                  ...rssCodesChecked,
                                  [a]: !checked
                                })
                              }
                            }}
                          />
                          <span className="settings-rss-code-checkbox-label">{a}</span>
                        </>
                      )
                    })
                  }
                </div>
              }
              <p/>
              <a href="#" onClick={async () => {
                await navigator.clipboard.writeText(rssUrl)
                addToast('Copied to clipboard')
              }}>Copy to clipboard</a>
              <p/>
              <p>You should <b>not</b> share this URL to anyone else. If you believe this URL is compromised, <a href="#" onClick={async () => {
                if (confirm('Are you sure you want to rotate RSS token?')) {
                  updateRssToken(await api.rotateRssToken())
                }
              }}>click here to rotate RSS token</a></p>
              <p/>
              <a href="#" onClick={async () => {
                if (confirm('Are you sure you want to disable RSS Notifications?')) {
                  await api.deleteRssToken()
                  updateRssToken(undefined)
                }
              }}>Click here to disable</a>
            </div> :
            <div>
              <p>RSS Notifications is disabled</p>
              <a href="#" onClick={async () => {
                updateRssToken(await api.rotateRssToken())
              }}>Click here to enable</a>
            </div>
        }
      </MyModal>
    </div>
  )

}

export default Settings
