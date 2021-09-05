import React, {useEffect, useState} from 'react';
import "./Notifications.css"
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import {useInterval} from "react-interval-hook";

export default (props) => {
  const [loading, updateLoading] = useState(true)
  const [notifications, updateNotifications] = useState(null)

  useEffect(async () => {
    updateNotifications(await props.api.getNotifications())
    updateLoading(false)
  }, [])

  useInterval(async () => {
    updateNotifications(await props.api.getNotifications())
  }, 5000)

  return (
    <div>
      <NotificationDropdown notifications={notifications} api={props.api}/>
    </div>
  )
}
