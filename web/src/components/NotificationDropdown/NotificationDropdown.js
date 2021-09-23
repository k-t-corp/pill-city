import React, {useEffect, useState} from 'react';
import {useHistory} from "react-router-dom";
import "./NotificationDropdown.css"
import getAvatarUrl from "../../api/getAvatarUrl";
import timePosted from "../../timePosted";
import {useInterval} from "react-interval-hook";
import summary from "../../summary";

export default (props) => {
  const [notifications, updateNotifications] = useState([])
  const [loadingNotifications, updateLoadingNotifications] = useState(true)
  const [loadingMoreNotifications, updateLoadingMoreNotifications] = useState(false)
  const history = useHistory()

  useEffect(async () => {
    updateNotifications(await props.api.getNotifications())
    updateLoadingNotifications(false)
  }, [])

  useInterval(async () => {
    if (notifications.length === 0 || loadingMoreNotifications) {
      return
    }
    const lastNotification = notifications[0]
    const fetchedNewNotifications = await props.api.getNotifications()
    // find position of lastNotification in fetchedNewNotifications
    // anything that comes "before" lastNotification are actual new notifications
    // TODO: there is a subtle bug that
    // TODO: if there are more than page size number of actual new notifications
    // TODO: some of them won't be displayed until load more or manual refresh page
    const newNotifications = []
    for (const n of fetchedNewNotifications) {
      if (n.id !== lastNotification.id) {
        newNotifications.push(n)
      } else {
        break
      }
    }
    updateNotifications([...newNotifications, ...notifications])
  }, 5000)

  const loadMoreNotifications = async () => {
    if (loadingMoreNotifications) {
      return
    }
    updateLoadingMoreNotifications(true)
    const lastNotification = notifications[notifications.length - 1]
    const newNotifications = await props.api.getNotifications(lastNotification['id'])
    if (newNotifications.length !== 0) {
      updateNotifications(notifications.concat(newNotifications))
    } else {
      alert('No more notifications.')
    }
    updateLoadingMoreNotifications(false)
  }

  const notificationSummary = (notification) => {
    const notification_summary = notification.notifying_summary
    return summary(notification_summary, 100)
  }

  const notificationElem = (notification, i) => {
    let action
    if (notification.notifying_action === "mention") action = "mentioned"
    if (notification.notifying_action === "reshare") action = "reshared"
    if (notification.notifying_action === "comment") action = "commented"
    if (notification.notifying_action === "reaction") action =  "reacted"

    let notifiedLocationPronoun
    if (notification.notifying_action === "mention") notifiedLocationPronoun = "their"
    else notifiedLocationPronoun = "your"

    let notifiedLocationType
    if (notification.notified_href.indexOf("#comment-") !== -1) notifiedLocationType = 'comment'
    else if (notification.notified_href.indexOf("/post/") !== -1) notifiedLocationType = 'post'

    const notificationOnClick = async () => {
      console.log(notification.id)
      await props.api.markNotificationAsRead(notification.id)
      history.push(notification.notified_href)
    }

    return (
      <div className="notification-wrapper" key={i} style={{
        backgroundColor: notification.unread ? 'white' : '#f0f0f0'
      }}>
        <div className="notification-first-row" onClick={notificationOnClick}>
          <div className="notification-info">
            <div className="post-avatar notification-avatar">
              <img
                className="post-avatar-img"
                src={getAvatarUrl(notification.notifier)}
                alt="avatar-img"
              />
            </div>
            <div className="notification-notifier">
              <div className="notification-notifier-wrapper">
                <b className="notification-notifier-id">
                  {notification.notifier.id}{' '}
                </b>
                {action}
                {' '}
                {
                  notification.notifying_action === "mention" ?
                    "you" :
                    <div className="notification-summary">
                      "{notificationSummary(notification)}"
                    </div>
                }
                {' '}
                on
                {' '}
                {notifiedLocationPronoun}
                {' '}
                {notifiedLocationType}
              </div>
            </div>
          </div>
          <div className="notification-time">
            {timePosted(notification.created_at_seconds)}
          </div>
        </div>

        <div className="notification-second-row" onClick={notificationOnClick}>
          {summary(notification.notified_summary, 150)}
        </div>
      </div>
    )
  }

  const notificationElems = () => {
    if (loadingNotifications) {
      return (
        <div
          key={notifications.length}
          className='notification-status'
        >Loading...</div>
      )
    }
    if (notifications.length === 0) {
      return (
        <div
          key={notifications.length}
          className='notification-status'
        >No notification</div>
      )
    }
    const res = []
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]
      res.push(notificationElem(notification, i))
    }
    if (!loadingMoreNotifications) {
      res.push(
        <div
          key={notifications.length}
          className='notification-load-more'
          onClick={loadMoreNotifications}
        >Load more</div>
      )
    } else {
      res.push(
        <div
          key={notifications.length}
          className='notification-load-more notification-load-more-disabled'
        >Loading...</div>
      )
    }
    return res
  }

  const unreadNotificationsCount = notifications ? notifications.filter(n => n.unread).length : 0

  return (
    <div className="notification-container">
      <div className="notification-header-wrapper">
        <div className="notification-header">
          <span className="notification-title">Notifications <span className={`notification-count ${unreadNotificationsCount === 0 ? "notification-count-grey" : "notification-count-red"}`}>{unreadNotificationsCount}</span></span>
          <svg
            className="notification-mark-all-button" xmlns="http://www.w3.org/2000/svg"  fill="none" viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={async (e) => {
             e.preventDefault()
             await props.api.markAllNotificationsAsRead()
             updateNotifications(notifications.map(n => {
               return {
                 ...n,
                 unread: false
               }
             }))
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>
      {notificationElems()}
    </div>
  )
}
