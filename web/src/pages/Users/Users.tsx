import React from 'react'
import DesktopUsers from "../../components/DesktopUsers/DesktopUsers";
import "./Users.css"
import {useMediaQuery} from "react-responsive";
import MobileUsers from "../../components/MobileUsers/MobileUsers";

const Users = () => {
  const isMobile = useMediaQuery({query: '(max-width: 750px)'})

  if (isMobile) {
    return <MobileUsers />
  } else {
    return <DesktopUsers />
  }
}

export default Users
