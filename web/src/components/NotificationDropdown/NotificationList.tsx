import NotificationItem from "./NotificaitonItem";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {loadMoreNotifications} from "../../store/notificationsSlice";

interface Props {}

export default (_: Props) => {
  const dispatch = useAppDispatch()

  const notifications = useAppSelector(state => state.notifications.notifications)
  const loading = useAppSelector(state => state.notifications.loading)
  const loadingMore = useAppSelector(state => state.notifications.loadingMore)

  if (loading) {
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
    if (!notification.notifier_blocked) {
      res.push(<NotificationItem
        notification={notification}
        key={i}
      />)
    }
  }
  if (!loadingMore) {
    res.push(
      <div
        key={notifications.length}
        className='notification-load-more'
        onClick={async () => {
          await dispatch(loadMoreNotifications())
        }}
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
  return (
    <div>
      {res}
    </div>
  )
}
