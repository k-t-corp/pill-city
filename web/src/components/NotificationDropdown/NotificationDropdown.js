import React from 'react';
import "./NotificationDropdown.css"
import getAvatarUrl from "../../api/getAvatarUrl";
import timePosted from "../../timePosted";

export default (props) => {
  let notificationElems = []
  const notificationSummary = (summary) => {
    const summaryLength = 100
    if (summary.length > summaryLength) return `${summary.slice(0,summaryLength)}...`
    else return summary
  }
  const notificationElem = (notification, i) => {
    let action
    if (notification.notifying_action === "reshare") action = "reshared"
    if (notification.notifying_action === "comment") action = "commented"
    if (notification.notifying_action === "reaction") action =  "reacted"

    return (<div className="notification-wrapper" key={i}>
      <div className="notification-first-row" onClick={() => window.location.href = notification.notifying_location.href}>
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
              <b className="notification-notifier-id">{notification.notifier.id}</b> {action} <div className="notification-summary">"{notificationSummary(notification.notifying_location.summary)}"</div> on your post
            </div>
          </div>
        </div>
        <div className="notification-time">
          {timePosted(notification.created_at_seconds)}
        </div>
      </div>

      <div className="notification-second-row" onClick={() => window.location.href = notification.notified_location.href}>
        {notification.notified_location.summary}
      </div>
    </div>)
  }
  if (props.notifications !== null) {
    for (let i = 0; i < props.notifications.length; i++) {
      const notification = props.notifications[i]
      notificationElems.push(notificationElem(notification, i))
    }
  }

  return (
    <div className="notification-container">
      <div className="notification-header-wrapper">
        <div className="notification-header">
          Notifications
        </div>
      </div>

      {notificationElems}
    </div>
  )
}
