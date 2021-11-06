import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import timePosted from "../../utils/timePosted";
import summary from "../../utils/summary";
import React from "react";
import Notification from "../../models/Notification";
import './NotificationItem.css'
import {useHistory} from "react-router-dom";

interface Props {
  notification: Notification
  api: any
}

const notificationSummary = (notification: Notification) => {
  const notification_summary = notification.notifying_summary
  return summary(notification_summary, 100)
}

export default (props: Props) => {
  let notifier
  const notification = props.notification
  const history = useHistory()

  if (notification.notifying_action !== "mention") {
    notifier = !notification.notifying_deleted ? notification.notifier : null
  } else {
    notifier = !notification.notified_deleted ? notification.notifier : null
  }

  let action
  if (notification.notifying_action === "mention") action = "mentioned"
  if (notification.notifying_action === "reshare") action = "reshared"
  if (notification.notifying_action === "comment") action = "commented"
  if (notification.notifying_action === "reaction") action =  "reacted"
  if (notification.notifying_action === 'follow') action = "followed"

  let notifiedLocationPronoun
  if (notification.notifying_action === "mention") notifiedLocationPronoun = "their"
  else notifiedLocationPronoun = "your"

  let notifiedLocationType
  if (notification.notified_href.indexOf("#comment-") !== -1) notifiedLocationType = 'comment'
  else if (notification.notified_href.indexOf("/post/") !== -1) notifiedLocationType = 'post'

  const notificationOnClick = async () => {
    await props.api.markNotificationAsRead(notification.id)
    history.push(notification.notified_href)
  }

  return (
    <div className="notification-wrapper" style={{
      backgroundColor: notification.unread ? 'white' : '#f0f0f0'
    }}>
      <div className="notification-first-row" onClick={notificationOnClick}>
        <div className="notification-info">
          <div className="post-avatar notification-avatar">
            <RoundAvatar user={notification.notifier}/>
          </div>
          <div className="notification-notifier">
            <div className="notification-notifier-wrapper">
              <b className="notification-notifier-id">
                <ClickableId user={notifier}/>{' '}
              </b>
              {action}
              {' '}
              {
                notification.notifying_action === "mention" || notification.notifying_action === "follow" ?
                  "you" :
                  <div className="notification-summary">
                    "{notificationSummary(notification)}"
                  </div>
              }
              {
                notification.notifying_action !== 'follow' &&
                  ` on ${notifiedLocationPronoun} ${notifiedLocationType}`
              }
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
