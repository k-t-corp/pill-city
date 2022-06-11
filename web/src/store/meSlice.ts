import User from "../models/User";
import {AnyAction, createSlice, ThunkAction} from "@reduxjs/toolkit";
import {RootState} from "./store";
import api from "../api/Api";

interface MeState {
  me: User | null
}

const initialState: MeState = {
  me: null,
}

const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setMe: (state, action) => {
      state.me = action.payload
    },
  }
})

const {
  setMe
} = meSlice.actions

export const loadMe = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch(setMe(await api.getMe()))
  }
}

export default meSlice.reducer
