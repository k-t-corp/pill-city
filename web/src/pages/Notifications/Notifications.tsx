import React from 'react';
import NotificationList from "../../components/NotificationDropdown/NotificationList";
import {useAppDispatch} from "../../store/hooks";
import {markAllNotificationsAsRead} from "../../store/notificationsSlice";
import "./Notifications.css"
import {CheckIcon} from "@heroicons/react/solid";

interface Props {}

const Notifications = (_: Props) => {
  const dispatch = useAppDispatch()

  return (
    <div
      onClick={async (e) => {
        e.preventDefault()
        await dispatch(markAllNotificationsAsRead())
      }}
    >
      <div className='mobile-all-read-button'>
        <CheckIcon />
      </div>
      <NotificationList />
    </div>
  )
}

export default Notifications
