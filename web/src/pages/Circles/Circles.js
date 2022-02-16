import React, {useEffect, useState} from 'react'
import DraggableUserProfileCards from "../../components/DraggableUserProfileCards/DraggableUserProfileCards";
import CircleBoards from "../../components/CircleBoards/CircleBoards";
import withAuthRedirect from "../../hoc/withAuthRedirect";
import api from "../../api/Api";
import "./Circles.css"

const Circles = () => {
  const [userData, updateUserData] = useState([])
  const [loadingUserData, updateLoadingUserData] = useState(true)
  const [circleData, updateCircleData] = useState([])
  const [loadingCircleData, updateLoadingCircleData] = useState(true)

  useEffect(async () => {
    updateLoadingCircleData(true)
    const latestCircleData = await api.getCircles()
    updateCircleData(latestCircleData)
    updateLoadingCircleData(false)
  }, [])
  useEffect(async () => {
    const latestUserData = await api.getUsers()
    updateUserData(latestUserData)
    updateLoadingUserData(false)
  }, [])
  return (
    <div className="circle-wrapper">
      {loadingUserData ? <div>loading</div> : <DraggableUserProfileCards userProfileData={userData}/>}
      {loadingCircleData ? <div>loading</div> :
        <CircleBoards
          circleData={circleData}
          api={api}
        />}
    </div>
  )
}

export default withAuthRedirect(Circles)
