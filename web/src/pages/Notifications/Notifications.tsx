import React from 'react';
import "./Notifications.css"
import NotificationList from "../../components/NotificationDropdown/NotificationList";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";
import {useAppDispatch} from "../../store/hooks";
import {markAllNotificationsAsRead} from "../../store/notificationsSlice";

interface Props {}

const Notifications = (_: Props) => {
  const dispatch = useAppDispatch()

  return (
    <div>
      <svg
        className="mobile-all-read-button"
        onClick={async (e) => {
          e.preventDefault()
          await dispatch(markAllNotificationsAsRead())
        }}
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>

      <NotificationList />
    </div>
  )
}

export default withApi(withAuthRedirect(withNavBar(Notifications, '/notifications')), api)
