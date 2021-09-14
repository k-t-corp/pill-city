import React from 'react';
import "./Notifications.css"
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";

export default (props) => {
  return (
    <NotificationDropdown api={props.api}/>
  )
}
