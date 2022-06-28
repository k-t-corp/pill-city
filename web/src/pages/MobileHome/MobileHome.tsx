import React from "react";
import MobileNavBar from "../../components/NavBar/MobileNavBar";
import SwipeableViews from "react-swipeable-views";
import Users from "../Users/Users";
import Circles from "../Circles/Circles";
import Notifications from "../Notifications/Notifications";
import Home from "../Home/Home";
import Profile from "../Profile/Profile";

interface Props {
  currentPage: number
  onChangePage: (page: number) => void
}

export default (props: Props) => {
  return (
    <div>
      <SwipeableViews
        containerStyle={{"height": "calc(100vh - 50px)"}}
        index={props.currentPage}
        onChangeIndex={props.onChangePage}
      >
        <Circles />
        <Users />
        <Home />
        <Notifications />
        <Profile />
      </SwipeableViews>
      <MobileNavBar
        currentPage={props.currentPage}
        onChangePage={props.onChangePage}
      />
    </div>
  )
}
