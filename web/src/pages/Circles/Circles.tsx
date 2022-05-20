import React, {useEffect, useState} from 'react'
import api from "../../api/Api";
import User from "../../models/User";
import Circle from "../../models/Circle";
import "./Circles.css"
import DraggableUserCard from "../../components/DraggableUserCard/DraggableUserCard";
import AddNewCircleButton from "../../components/AddNewCircleButton/AddNewCircleButton";
import DroppableCircleBoard from "../../components/DroppableCircleBoard/DroppableCircleBoard";

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

  const circleElements = [
    <AddNewCircleButton key={-1}/>
  ]
  for (let c of circles) {
    circleElements.push(
      <DroppableCircleBoard key={c.id} circle={c}/>
    )
  }

  return (
    <>
      <div className='circles-user-cards-container'>
        {users.map((u, i) => {
          return (
            <DraggableUserCard key={i} user={u}/>
          )
        })}
      </div>
      <div className="circles-boards-wrapper">
        <div className="circles-boards">
          {circleElements}
        </div>
      </div>
    </>
  )
}

export default Circles
