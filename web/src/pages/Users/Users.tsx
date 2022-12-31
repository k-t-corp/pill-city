import React, {useEffect, useState} from 'react'
import DesktopUsers from "../../components/DesktopUsers/DesktopUsers";
import "./Users.css"
import {useMediaQuery} from "react-responsive";
import MobileUsers from "../../components/MobileUsers/MobileUsers";
import User from "../../models/User";
import Circle from "../../models/Circle";
import api from "../../api/Api";
import ApiError from "../../api/ApiError";
import {useToast} from "../../components/Toast/ToastProvider";

const Users = () => {
  const [loading, updateLoading] = useState(true)
  const [users, updateUsers] = useState<User[]>([])
  const [circles, updateCircles] = useState<Circle[]>([])
  const [followings, updateFollowings] = useState<User[]>([])

  const {addToast} = useToast()

  useEffect(() => {
    (async () => {
      updateLoading(true)
      updateCircles(await api.getCircles())
      updateUsers((await api.getUsers()).filter((u: any) => !u.is_blocking))
      updateFollowings(await api.getFollowings())
      updateLoading(false)
    })()
  }, [])

  const isMobile = useMediaQuery({query: '(max-width: 750px)'})

  if (isMobile) {
    return (
      <MobileUsers
        loading={loading}
        users={users}
        followings={followings}
        updateFollowings={updateFollowings}
      />
    )
  } else {
    return (
      <DesktopUsers
        loading={loading}
        users={users}
        circles={circles}
        createCircle={async (name: string) => {
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
        }}
        updateCircle={circle => {
          updateCircles(circles.map(c => {
            if (c.id !== circle.id) {
              return c
            }
            return circle
          }))
        }}
        deleteCircle={async c => {
          updateCircles(circles.filter(cc => cc.id !== c.id))
          await api.deleteCircle(c.id)
        }}
        followings={followings}
        updateFollowings={updateFollowings}
      />
    )
  }
}

export default Users
