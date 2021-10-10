import NotificationComponent from "./NotificaitonComponent";
import React, {useEffect, useState} from "react";
import Notification from "../../models/Notification";
import {useInterval} from "react-interval-hook";

interface Props {
  notifications: Notification[]
  updateNotifications: (notifications: Notification[]) => {}
  api: any
}

export default (props: Props) => {
  const [loadingNotifications, updateLoadingNotifications] = useState(true)
  const [loadingMoreNotifications, updateLoadingMoreNotifications] = useState(false)

  useEffect(() => {
    (async () => {
      props.updateNotifications(await props.api.getNotifications())
      updateLoadingNotifications(false)
    })()
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
    props.updateNotifications([...newNotifications, ...notifications])
  }, 5000)

  const loadMoreNotifications = async () => {
    if (loadingMoreNotifications) {
      return
    }
    updateLoadingMoreNotifications(true)
    const lastNotification = notifications[notifications.length - 1]
    const newNotifications = await props.api.getNotifications(lastNotification['id'])
    if (newNotifications.length !== 0) {
      props.updateNotifications(notifications.concat(newNotifications))
    } else {
      alert('No more notifications.')
    }
    updateLoadingMoreNotifications(false)
  }

  const notifications = props.notifications
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
    res.push(<NotificationComponent
      notification={notification}
      key={i}
      api={props.api}
    />)
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
