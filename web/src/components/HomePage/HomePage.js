import React from "react";
import "./HomePage.css"

const HomePage = (props) => {
  return (
    <div className="home-page-wrapper">
      <div className="home-page-info-wrapper">
        <div className="welcome">
          Welcome back to
        </div>
        <div className="title h1">
          Pill City
        </div>
      </div>

      <div className="home-page-form-wrapper">
        {props.formElement}
      </div>
    </div>
  )
}

export default HomePage
