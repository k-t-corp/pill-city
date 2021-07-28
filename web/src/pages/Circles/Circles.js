import React, {useEffect, useState} from 'react'
import "./Circles.css"
import DraggableUserProfileCards from "../../components/DraggableUserProfileCards/DraggableUserProfileCards";
import CircleBoards from "../../components/CircleBoards/CircleBoards";

export default (props) => {
  const [userData, updateUserData] = useState([])
  const [loadingUserData, updateLoadingUserData] = useState(true)
  const [circleData, updateCircleData] = useState([])
  const [loadingCircleData, updateLoadingCircleData] = useState(true)
  useEffect(async () => {
    const latestCircleData = await props.api.getCircles()
    updateCircleData(latestCircleData)
    updateLoadingCircleData(false)
  }, [])
  useEffect(async () => {
    const latestUserData = await props.api.getUsers()
    updateUserData(latestUserData)
    updateLoadingUserData(false)
  }, [])
  const circleDataTemp = [
    {
      name: "circle 1",
      members: [{id: "user1"}, {id: "user2"}, {id: "user4"}]
    },
    {
      name: "circle 2",
      members: [{id: "user5"}, {id: "user2"}, {id: "user4"}]
    },
    {
      name: "circle 3",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 4",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 5",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 6",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
    {
      name: "circle 7",
      members: [{id: "user5"}, {id: "user4"}, {id: "user3"}]
    },
  ]
  const userProfileData = [{id: "user1"}, {id: "user2"}, {id: "user3"}, {id: "user4"}, {id: "user5"}, {id: "user6"}, {id: "user7"}]
  return (
    <div className="circle-wrapper">
      {loadingUserData ? <div>loading</div> : <DraggableUserProfileCards userProfileData={userData}/>}
      {loadingCircleData ? <div>loading</div> : <CircleBoards circleData={circleData} api={props.api}/>}
    </div>
  )

}
