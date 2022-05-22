import React, {useEffect, useState} from "react"
import User from "../../models/User";
import Circle from "../../models/Circle";
import api from "../../api/Api";
import './Circles.css'
import PillModal from "../../components/PillModal/PillModal";
import CreateNewCircle from "../../components/CreateNewCircle/CreateNewCircle";

const renderCreateCircleModal = (isOpen: boolean, onClose: () => void) => {
  return (
    <PillModal
      isOpen={isOpen}
      onClose={onClose}
      title='Create new circle'
    >
      <CreateNewCircle onCancel={onClose}/>
    </PillModal>
  )
}

export default () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<User[]>([])
  const [circles, updateCircles] = useState<Circle[]>([])
  const [showingCreateCircleModal, updateShowingCreateCircleModal] = useState(false)

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
      <div className='circles-wrapper'>
        <div className='circles-status'>Loading...</div>
      </div>
    )
  }

  const closeCreateCircleModal = () => {updateShowingCreateCircleModal(false)}

  if (circles.length === 0) {
    return (
      <div className='circles-wrapper'>
        <div className='circles-status'>
          <p>You don't have any circles</p>
          <p><a href="#" onClick={() => {
            updateShowingCreateCircleModal(true)
          }}>Create one</a></p>
        </div>
        {renderCreateCircleModal(showingCreateCircleModal, closeCreateCircleModal)}
      </div>
    )
  }

  return (
    <div className='circles-wrapper'>
      circles
    </div>
  )
}
