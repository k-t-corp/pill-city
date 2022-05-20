import React, {useEffect, useState} from 'react'
import DraggableUserProfileCards from "../../components/DraggableUserProfileCards/DraggableUserProfileCards";
import CircleBoards from "../../components/CircleBoards/CircleBoards";
import api from "../../api/Api";
import User from "../../models/User";
import Circle from "../../models/Circle";
import "./Circles.css"

const Circles = () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<User[]>([])
  const [circles, updateCircles] = useState<Circle[]>([])

  useEffect(() => {
    (async () => {
      updateLoading(true)
      updateCircles(await api.getCircles())
      updateUsers(await api.getUsers())
      updateLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className='circles-status'>Loading...</div>
    )
  }

  return (
    <>
      <DraggableUserProfileCards userProfileData={users}/>
      <CircleBoards circleData={circles}/>
    </>
  )
}

export default Circles
