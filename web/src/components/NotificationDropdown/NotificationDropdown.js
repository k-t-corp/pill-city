import React from 'react';
import "./NotificationDropdown.css"
import getAvatarUrl from "../../api/getAvatarUrl";
import timePosted from "../../timePosted";

export default (props) => {
  const notificationSummary = (notification) => {
    if (notification.notifying_action === "mention") {
      return "you"
    }
    const summary = notification.notifying_location.summary
    const summaryLength = 100
    if (summary.length > summaryLength) return `${summary.slice(0,summaryLength)}...`
    else return summary
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
    if (notification.notified_location.href.indexOf("#comment-") !== -1) notifiedLocationType = 'comment'
    else if (notification.notified_location.href.indexOf("/post/") !== -1) notifiedLocationType = 'post'

    const notificationOnClick = async () => {
      console.log(notification.id)
      await props.api.markNotificationAsRead(notification.id)
      window.location.href = notification.notified_location.href
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
          {notification.notified_location.summary}
        </div>
      </div>
    )
  }

  const notificationElems = () => {
    if (props.notifications === null) {
      return <p>Loading...</p>
    } else if (props.notifications.length === 0) {
      return <p>No notifications.</p>
    } else {
      const res = []
      for (let i = 0; i < props.notifications.length; i++) {
        const notification = props.notifications[i]
        res.push(notificationElem(notification, i))
      }
      return res
    }
  }

  const unreadNotificationsCount = props.notifications !== null ? props.notifications.filter(n => n.unread).length : 0

  return (
    <div className="notification-container">
      <div className="notification-header-wrapper">
        <div className="notification-header">
          <span className="notification-title">Notifications <span className={`notification-count ${unreadNotificationsCount === 0 ? "notification-count-grey" : "notification-count-red"}`}>{unreadNotificationsCount}</span></span>
          <svg className="notification-mark-all-button" xmlns="http://www.w3.org/2000/svg"  fill="none" viewBox="0 0 24 24"
               stroke="currentColor"
               onClick={async (e) => {
                 e.preventDefault()
                 await props.api.markAllNotificationsAsRead()
                 window.location.reload()
               }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>
      {notificationElems()}
    </div>
  )
}
