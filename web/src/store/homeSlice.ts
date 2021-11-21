import { createSlice } from "@reduxjs/toolkit";

interface HomeState {
  homePostsLoadingMore: boolean
  homePostsNoMore: boolean
}

const initialState: HomeState = {
  homePostsLoadingMore: false,
  homePostsNoMore: false
}

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setHomePostsLoadingMore: state => {
      state.homePostsLoadingMore = true
    },
    unsetHomePostsLoadingMore: state => {
      state.homePostsLoadingMore = false
    },
    setHomePostsNoMore: state => {
      state.homePostsNoMore = true
    },
    unsetHomePostsNoMore: state => {
      state.homePostsNoMore = false
    }
  }
})

export const {
  setHomePostsLoadingMore,
  unsetHomePostsLoadingMore,
  setHomePostsNoMore,
  unsetHomePostsNoMore
} = homeSlice.actions

export default homeSlice.reducer
