import React, {useEffect, useState} from "react"
import User from "../../models/User";
import Circle from "../../models/Circle";
import api from "../../api/Api";
import './Circles.css'
import PillModal from "../../components/PillModal/PillModal";
import CreateNewCircle from "../../components/CreateNewCircle/CreateNewCircle";
import {
  PlusIcon,
  UserGroupIcon as UserGroupIconSolid,
} from "@heroicons/react/solid";
import {UserGroupIcon as UserGroupIconOutline} from "@heroicons/react/outline";
import EditCircle from "../../components/EditCircle/EditCircle";
import ApiError from "../../api/ApiError";
import {useToast} from "../../components/Toast/ToastProvider";

interface CircleCardProps {
  circle: Circle,
  users: User[]
  updateCircle: (circle: Circle) => void
  deleteCircle: () => void
}

const CircleCard = (props: CircleCardProps) => {
  const {circle, updateCircle, deleteCircle, users} = props
  const [showingEditCircle, updateShowingEditCircle] = useState(false)

  return (
    <>
      <div className="circles-circle-card-wrapper" onClick={e => {
        e.stopPropagation()
        updateShowingEditCircle(true)
      }}>
        <div className="circles-circle-card-name">
          {circle.name}
        </div>
        <div className='circles-circle-card-right'>
          {circle.members.length !== 0 ?
            <div className='circles-circle-card-count-icon'>
              <UserGroupIconSolid />
            </div> :
            <div className='circles-circle-card-count-icon'>
              <UserGroupIconOutline />
            </div>
          }
          <div className='circles-circle-card-count'>
            {circle.members.length}
          </div>
        </div>
      </div>
      <PillModal
        isOpen={showingEditCircle}
        onClose={() => {updateShowingEditCircle(false)}}
        title={`Edit circle "${circle.name}"`}
      >
        <EditCircle
          circle={circle}
          updateCircle={updateCircle}
          deleteCircle={() => {
            updateShowingEditCircle(false)
            deleteCircle()
          }}
          users={users}
          onClose={() => {updateShowingEditCircle(false)}}
          showAddUser={true}
        />
      </PillModal>
    </>
  )
}

const renderCreateCircleComponents = (isOpen: boolean, onCreate: (name: string) => void, onClose: () => void, onOpen: () => void) => {
  return (
    <>
      <PillModal
        isOpen={isOpen}
        onClose={onClose}
        title='Create new circle'
      >
        <CreateNewCircle
          onCreate={(name) => {
            onClose()
            onCreate(name)
          }}
          onCancel={onClose}
        />
      </PillModal>
      <div
        className='circles-create-circle-button'
        onClick={onOpen}
      >
        <PlusIcon />
      </div>
    </>
  )
}

const Circles = () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<User[]>([])
  const [circles, updateCircles] = useState<Circle[]>([])
  const [showingCreateCircleModal, updateShowingCreateCircleModal] = useState(false)

  const {addToast} = useToast()

  useEffect(() => {
    (async () => {
      updateLoading(true)
      updateCircles(await api.getCircles())
      updateUsers((await api.getUsers()).filter((u: any) => !u.is_blocking))
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

  const createCircle = async (name: string) => {
    try {
      const data = await api.createCircle(name)
      updateCircles([
        { id: data.id, name, members: []},
        ...circles,
      ])
    } catch (e) {
      if (e instanceof ApiError) {
        addToast(e.message)
      } else {
        addToast("Unknown error")
      }
    }
  }
  const closeCreateCircleModal = () => {updateShowingCreateCircleModal(false)}
  const openCreateCircleModal = () => {updateShowingCreateCircleModal(true)}

  if (circles.length === 0) {
    return (
      <div className='circles-wrapper'>
        <div className='circles-status'>
          <p>You don't have any circles</p>
          <p>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                updateShowingCreateCircleModal(true)
              }}>Create one</button>
          </p>
        </div>
        {renderCreateCircleComponents(showingCreateCircleModal, createCircle, closeCreateCircleModal, openCreateCircleModal)}
      </div>
    )
  }

  return (
    <div className='circles-grid-container'>
      {circles.map(c => {
        return (
          <CircleCard
            key={c.id}
            circle={c}
            updateCircle={circle => {
              updateCircles(circles.map(c => {
                if (c.id !== circle.id) {
                  return c
                }
                return circle
              }))
            }}
            deleteCircle={async () => {
              updateCircles(circles.filter(cc => cc.id !== c.id))
              await api.deleteCircle(c.id)
            }}
            users={users}
          />
        )
      })}
      {renderCreateCircleComponents(showingCreateCircleModal, createCircle, closeCreateCircleModal, openCreateCircleModal)}
    </div>
  )
}

export default Circles
