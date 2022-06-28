import React, {useState} from "react";
import MobileNavBar from "../../components/NavBar/MobileNavBar";
import SwipeableViews from "react-swipeable-views";
import Users from "../Users/Users";
import Circles from "../Circles/Circles";
import Notifications from "../Notifications/Notifications";
import Home from "../Home/Home";
import Profile from "../Profile/Profile";

export default () => {
  const [currentSlide, updateCurrentSlide] = useState(2)

  return (
    <div>
      <MobileNavBar />
      <SwipeableViews
        containerStyle={{"height": "100vh"}}
        index={currentSlide}
        onChangeIndex={i => updateCurrentSlide(i)}
      >
        <Users />
        <Circles />
        <Home />
        <Notifications />
        <Profile />
      </SwipeableViews>
    </div>
  )
}
