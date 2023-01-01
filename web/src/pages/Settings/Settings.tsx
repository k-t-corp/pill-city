import React, {useEffect, useState} from 'react'
import {removeAccessToken} from "../../api/AuthStorage";
import About from "../../components/About/About";
import UpdateAvatar from "../../components/UpdateAvatar/UpdateAvatar";
import api from "../../api/Api";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import UpdateBanner from "../../components/UpdateBanner/UpdateBanner";
import {loadMe} from "../../store/meSlice";
import {validateEmail} from "../../utils/validators";
import PillModal from "../../components/PillModal/PillModal";
import {useToast} from "../../components/Toast/ToastProvider";
import './Settings.css'
import {getUseMultiColumn, setUseMultiColumn} from "../../utils/SettingsStorage";
import PillForm from "../../components/PillForm/PillForm";
import PillInput from "../../components/PillInput/PillInput";
import PillButtons from "../../components/PillButtons/PillButtons";
import PillButton, {PillButtonVariant} from "../../components/PillButtons/PillButton";
import PillCheckbox from "../../components/PillCheckbox/PillCheckbox";
import {purgeCache} from "../../store/persistorUtils";
import User from "../../models/User";

type NotifyingActionToRssCode = {[action: string]: string}

interface RssToken {
  rss_token: string,
  rss_notifications_url: string,
  notifying_action_to_rss_code: NotifyingActionToRssCode
}

const Settings = () => {
  const me = useAppSelector(state => state.me.me)

  const [displayName, updateDisplayName] = useState<string | null>('')
  const [email, updateEmail] = useState<string | null>('')
  const [emailValidated, updateEmailValidated] = useState(false)
  const [rssToken, updateRssToken] = useState<RssToken | null>()
  const [rssCodesChecked, updateRssCodesChecked] = useState<{[action: string]: boolean} | undefined>(undefined)
  const [multipleColumns, updateMultipleColumns] = useState(getUseMultiColumn())
  const [blocking, updateBlocking] = useState<User[]>([])

  const [displayNameModalOpened, updateDisplayNameModalOpened] = useState(false)
  const [emailModalOpened, updateEmailModalOpened] = useState(false)
  const [avatarModalOpened, updateAvatarModalOpened] = useState(false)
  const [bannerModalOpened, updateBannerModalOpened] = useState(false)
  const [rssTokenModalOpened, updateRssTokenModalOpened] = useState(false)
  const [blockedUsersModalOpened, updateBlockedUsersModalOpened] = useState(false)

  useEffect(() => {
    if (validateEmail(email)) {
      updateEmailValidated(true)
    } else {
      updateEmailValidated(false)
    }
  }, [email])

  useEffect(() => {
    (async () => {
      if (!me) {
        return
      }
      updateDisplayName(me.display_name || '')
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
      updateBlocking(await api.getBlocking())
    })()
  }, [me])

  const handleSignOut = () => {
    removeAccessToken()
    purgeCache()
    // This is needed so that the App component is fully reloaded
    // so that getting the first home page and auto refresh is disabled
    window.location.href = '/signin'
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
        <div className="settings-row-content">{displayName !== null ? (displayName || 'Click to update') : 'Loading...'}</div>
      </div>
      <div className="settings-row" onClick={() => {updateEmailModalOpened(true)}}>
        <div className="settings-row-header">Email</div>
        {/*unlike display name, if email is not set, it also returns null (the same as loading lol)*/}
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
        <div className="settings-row-content">{rssToken ? rssToken.rss_token ? 'Enabled' : 'Disabled' : 'Loading...'}</div>
      </div>
      <div className="settings-row" onClick={() => {
        setUseMultiColumn(!multipleColumns)
        updateMultipleColumns(!multipleColumns)
      }}>
        <div className="settings-row-header">Multiple columns on home</div>
        <div className="settings-row-content">{`${multipleColumns ? "Enabled" : "Disabled"}. Click to ${multipleColumns ? 'disable' : 'enable'}.`}</div>
      </div>
      <div className="settings-row" onClick={() => {updateBlockedUsersModalOpened(true)}}>
        <div className="settings-row-header">Blocked users</div>
        <div className="settings-row-content">{blocking.length} users blocked</div>
      </div>
      <div className="settings-row" onClick={handleSignOut}>
        <div className="settings-row-header">Sign out</div>
      </div>
      <About/>
      <PillModal
        isOpen={displayNameModalOpened}
        onClose={() => {updateDisplayNameModalOpened(false)}}
        title="Update display name"
      >
        <PillForm>
          <PillInput
            placeholder='Display name'
            value={displayName || ''}
            onChange={updateDisplayName}
          />
          <PillButtons>
            <PillButton
              text='Cancel'
              variant={PillButtonVariant.Neutral}
              onClick={() => {updateDisplayNameModalOpened(false)}}
            />
            <PillButton
              text='Confirm'
              variant={PillButtonVariant.Positive}
              onClick={async () => {
                await api.updateDisplayName(displayName)
                await dispatch(loadMe())
                updateDisplayNameModalOpened(false)
              }}
            />
          </PillButtons>
        </PillForm>
      </PillModal>
      <PillModal
        isOpen={emailModalOpened}
        onClose={() => {updateEmailModalOpened(false)}}
        title="Update email"
      >
        <PillForm>
          <PillInput
            placeholder='Email'
            value={email || ''}
            onChange={updateEmail}
          />
          <PillButtons>
            <PillButton
              text='Cancel'
              variant={PillButtonVariant.Neutral}
              onClick={() => {updateEmailModalOpened(false)}}
            />
            <PillButton
              text='Confirm'
              variant={PillButtonVariant.Positive}
              onClick={async () => {
                if (!validateEmail(email)) {
                  return
                }
                await api.updateEmail(email)
                await dispatch(loadMe())
                updateEmailModalOpened(false)
              }}
              disabled={!emailValidated}
            />
          </PillButtons>
        </PillForm>
      </PillModal>
      <PillModal
        isOpen={avatarModalOpened}
        onClose={() => {updateAvatarModalOpened(false)}}
        title="Update avatar"
      >
        <UpdateAvatar
          dismiss={() => {
            updateAvatarModalOpened(false)
          }}
          beforeUpdate={() => {}}
          afterUpdate={() => {
            updateAvatarModalOpened(false)
          }}
        />
      </PillModal>
      <PillModal
        isOpen={bannerModalOpened}
        onClose={() => {updateBannerModalOpened(false)}}
        title="Update banner"
      >
        <UpdateBanner
          user={me}
          dismiss={() => {
            updateBannerModalOpened(false)
          }}
          beforeUpdate={() => {}}
          afterUpdate={() => {
            updateBannerModalOpened(false)
          }}
        />
      </PillModal>
      <PillModal
        isOpen={rssTokenModalOpened}
        onClose={() => {updateRssTokenModalOpened(false)}}
        title="RSS notification"
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
                        <PillCheckbox
                          label={a}
                          checked={checked}
                          onChange={(c) => {
                            if (Object.entries(rssCodesChecked).filter(([_, checked]) => checked).length === 1 && (Object.entries(rssCodesChecked).filter(([_, checked]) => checked)[0][0] === a)) {
                              alert('You have to choose at least one type of notifications')
                            } else {
                              updateRssCodesChecked({
                                ...rssCodesChecked,
                                [a]: c
                              })
                            }
                          }}
                        />
                      )
                    })
                  }
                </div>
              }
              <p/>
              <button type='button' className='link-button' onClick={async () => {
                await navigator.clipboard.writeText(rssUrl)
                addToast('Copied to clipboard')
              }}>Copy to clipboard</button>
              <p/>
              <p>You should <b>not</b> share this URL to anyone else. If you believe this URL is compromised, <button type='button' className='link-button' onClick={async () => {
                if (window.confirm('Are you sure you want to rotate RSS token?')) {
                  updateRssToken(await api.rotateRssToken())
                }
              }}>click here to rotate RSS token</button></p>
              <p/>
              <button type='button' className='link-button' onClick={async () => {
                if (window.confirm('Are you sure you want to disable RSS Notifications?')) {
                  await api.deleteRssToken()
                  updateRssToken(undefined)
                }
              }}>Click here to disable</button>
            </div> :
            <div>
              <p>RSS Notifications is disabled</p>
              <button type='button' className='link-button' onClick={async () => {
                updateRssToken(await api.rotateRssToken())
              }}>Click here to enable</button>
            </div>
        }
      </PillModal>
      <PillModal
        isOpen={blockedUsersModalOpened}
        onClose={() => {updateBlockedUsersModalOpened(false)}}
        title="Blocked users"
      >
        {blocking.length > 0 ?
          <ul>
            {blocking.map(u => {
              return (
                <li key={u.id}>
                  <a href={`/profile/${u.id}`}>{u.id}</a>
                </li>
              )
            })}
          </ul> :
          <p>No blocked users</p>
        }
      </PillModal>
    </div>
  )

}

export default Settings
