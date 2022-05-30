import React from 'react';
import "./NotificationDropdown.css"
import NotificationList from "./NotificationList";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {markAllNotificationsAsRead} from "../../store/notificationsSlice";
import {CheckIcon} from "@heroicons/react/solid";

interface Props {}

export default (_: Props) => {
  const dispatch = useAppDispatch()
  const unreadNotificationsCount = useAppSelector(state => state.notifications.notifications.filter(n => n.unread).length)

  return (
    <div className="notification-container">
      <div className="notification-header-wrapper">
        <div className="notification-header">
          <span className="notification-title">Notifications <span
            className={`notification-count ${unreadNotificationsCount === 0 ? "notification-count-grey" : "notification-count-red"}`}>{unreadNotificationsCount}</span></span>
          {
            unreadNotificationsCount !== 0 && <div className='notification-mark-all-button' onClick={async (e) => {
              e.preventDefault()
              await dispatch(markAllNotificationsAsRead())
            }}>
              <CheckIcon/>
            </div>
          }
        </div>
      </div>
      <NotificationList />
    </div>
  )
}
