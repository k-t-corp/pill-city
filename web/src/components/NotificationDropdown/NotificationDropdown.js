import React, {useState} from 'react';
import "./NotificationDropdown.css"
import NotificationList from "./NotificationList";

export default (props) => {
  const [notifications, updateNotifications] = useState([])

  const unreadNotificationsCount = notifications ? notifications.filter(n => n.unread).length : 0

  return (
    <div className="notification-container">
      <div className="notification-header-wrapper">
        <div className="notification-header">
          <span className="notification-title">Notifications <span
            className={`notification-count ${unreadNotificationsCount === 0 ? "notification-count-grey" : "notification-count-red"}`}>{unreadNotificationsCount}</span></span>
          <svg
            className="notification-mark-all-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
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
      <NotificationList
        notifications={notifications}
        updateNotifications={updateNotifications}
        api={props.api}/>
    </div>
  )
}
