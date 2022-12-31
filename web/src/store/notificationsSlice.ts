import {AnyAction, createSlice, ThunkAction} from "@reduxjs/toolkit";
import Notification from "../models/Notification";
import api from "../api/Api";
import {RootState} from "./store";

interface NotificationsState {
  notifications: Notification[]
  loading: boolean
  loadingMore: boolean
  polling: boolean
}

const initialState: NotificationsState = {
  notifications: [],
  loading: true,
  loadingMore: false,
  polling: false,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.filter((n: any) => !n.notifier_blocked)
    },
    unsetLoading: state => {
      state.loading = false
    },
    setLoadingMore: state => {
      state.loadingMore = true
    },
    unsetLoadingMore: state => {
      state.loadingMore = false
    },
    setPolling: state => {
      state.polling = true
    },
    unsetPolling: state => {
      state.polling = false
    }
  }
})

const {
  setNotifications, unsetLoading, setLoadingMore, unsetLoadingMore, setPolling, unsetPolling
} = notificationsSlice.actions

export const loadNotifications = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch(setNotifications(await api.getNotifications()))
    dispatch(unsetLoading())
  }
}

export const loadMoreNotifications = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    if (getState().notifications.loadingMore) {
      return
    }
    dispatch(setLoadingMore())
    const notifications = getState().notifications.notifications
    const lastNotification = notifications[notifications.length - 1]
    const newNotifications = await api.getNotifications(lastNotification['id'])
    if (newNotifications.length !== 0) {
      dispatch(setNotifications(notifications.concat(newNotifications)))
    }
    dispatch(unsetLoadingMore())
  }
}

export const pollNotifications = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    const notifications = getState().notifications.notifications
    if (notifications.length === 0 || getState().notifications.loadingMore) {
      return
    }
    dispatch(setPolling())
    const newNotifications = await api.pollNotifications(notifications[0].id)
    if (newNotifications.length !== 0) {
      dispatch(setNotifications([...newNotifications, ...notifications]))
    }
    dispatch(unsetPolling())
  }
}

export const markNotificationAsRead = (notificationId: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    await api.markNotificationAsRead(notificationId)
    dispatch(setNotifications(getState().notifications.notifications.map(n => {
      if (n.id === notificationId) {
        return {
          ...n, unread: false
        }
      }
      return n
    })))  }
}

export const markAllNotificationsAsRead= (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    await api.markAllNotificationsAsRead()
    dispatch(setNotifications(getState().notifications.notifications.map(n => {
      return {
        ...n,
        unread: false
      }
    })))
  }
}

export default notificationsSlice.reducer
