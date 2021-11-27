import React, {useState} from 'react';
import "./Notifications.css"
import NotificationList from "../../components/NotificationDropdown/NotificationList";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";

const Notifications = (props) => {
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

export default withApi(withAuthRedirect(withNavBar(Notifications, '/notifications')), api)
