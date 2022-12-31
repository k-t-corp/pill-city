import React from 'react';
import NotificationList from "../../components/NotificationDropdown/NotificationList";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {markAllNotificationsAsRead} from "../../store/notificationsSlice";
import "./Notifications.css"
import {CheckIcon} from "@heroicons/react/solid";

interface Props {}

const Notifications = (_: Props) => {
  const dispatch = useAppDispatch()
  const unreadNotificationsCount = useAppSelector(state => state.notifications.notifications.filter(n => n.unread).length)

  return (
    <div
      onClick={async (e) => {
        e.preventDefault()
        await dispatch(markAllNotificationsAsRead())
      }}
    >
      {unreadNotificationsCount !== 0 &&
        <div className='mobile-all-read-button'>
          <CheckIcon />
        </div>
      }
      <NotificationList />
    </div>
  )
}

export default Notifications
