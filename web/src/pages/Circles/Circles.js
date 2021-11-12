import React, {useEffect, useState} from 'react'
import "./Circles.css"
import DraggableUserProfileCards from "../../components/DraggableUserProfileCards/DraggableUserProfileCards";
import CircleBoards from "../../components/CircleBoards/CircleBoards";
import withApi from "../../hoc/withApi";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import withNavBar from "../../hoc/withNavBar/withNavBar";
import api from "../../api/Api";

const Circles = (props) => {
  const [userData, updateUserData] = useState([])
  const [loadingUserData, updateLoadingUserData] = useState(true)
  const [circleData, updateCircleData] = useState([])
  const [loadingCircleData, updateLoadingCircleData] = useState(true)

  useEffect(async () => {
    updateLoadingCircleData(true)
    const latestCircleData = await props.api.getCircles()
    updateCircleData(latestCircleData)
    updateLoadingCircleData(false)
  }, [])
  useEffect(async () => {
    const latestUserData = await props.api.getUsers()
    updateUserData(latestUserData)
    updateLoadingUserData(false)
  }, [])
  return (
    <div className="circle-wrapper">
      {loadingUserData ? <div>loading</div> : <DraggableUserProfileCards userProfileData={userData}/>}
      {loadingCircleData ? <div>loading</div> :
        <CircleBoards
          circleData={circleData}
          api={props.api}
        />}
    </div>
  )
}

export default withApi(withAuthRedirect(withNavBar(Circles, '/circles')), api)
