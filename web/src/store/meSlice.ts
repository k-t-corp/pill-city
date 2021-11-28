import User from "../models/User";
import {AnyAction, createSlice, ThunkAction} from "@reduxjs/toolkit";
import {RootState} from "./store";
import api from "../api/Api";

interface MeState {
  me: User | null
  loading: boolean
}

const initialState: MeState = {
  me: null,
  loading: true
}

const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setMe: (state, action) => {
      state.me = action.payload
    },
    setLoading: state => {
      state.loading = true
    },
    unsetLoading: state => {
      state.loading = false
    },
  }
})

const {
  setMe, setLoading, unsetLoading
} = meSlice.actions

export const loadMe = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch(setLoading())
    dispatch(setMe(await api.getMe()))
    dispatch(unsetLoading())
  }
}

export default meSlice.reducer
