import React, {useState} from 'react';
import "./Notifications.css"
import NotificationList from "../../components/NotificationDropdown/NotificationList";

export default (props) => {
  const [notifications, updateNotifications] = useState([])


  return (
    <div>
      <svg className="mobile-all-read-button"
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
           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>

      <NotificationList
        notifications={notifications}
        updateNotifications={updateNotifications}
        api={props.api}/>
    </div>

  )
}
