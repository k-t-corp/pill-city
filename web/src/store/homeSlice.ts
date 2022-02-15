import {AnyAction, createSlice, ThunkAction} from "@reduxjs/toolkit";
import Post from "../models/Post";
import api from "../api/Api";
import {RootState} from "./store";

interface HomeState {
  posts: Post[]
  loading: boolean
  loadingMore: boolean
  polling: boolean
  noMore: boolean
}

const initialState: HomeState = {
  posts: [],
  loading: true,
  loadingMore: false,
  polling: false,
  noMore: false
}

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload
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
    },
    setNoMore: state => {
      state.noMore = true
    }
  }
})

const {
  setPosts, unsetLoading, setLoadingMore, unsetLoadingMore, setPolling, unsetPolling, setNoMore
} = homeSlice.actions


export const loadPosts = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch(setPosts(await api.getHome()))
    dispatch(unsetLoading())
  }
}

export const loadMorePosts = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    if (getState().home.loadingMore) {
      return
    }
    dispatch(setLoadingMore())
    const homePosts = getState().home.posts
    const lastPost = homePosts[homePosts.length - 1]
    const newPosts = await api.getHome(lastPost['id'])
    if (newPosts.length !== 0) {
      dispatch(setPosts(homePosts.concat(newPosts)))
    } else {
      dispatch(setNoMore())
    }
    dispatch(unsetLoadingMore())
  }
}

export const pollPosts = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch, getState) => {
    const homePosts = getState().home.posts
    if (homePosts.length === 0 || getState().home.loading || getState().home.polling) {
      return
    }
    dispatch(setPolling())
    const newPosts = await api.pollHome(homePosts[0].id)
    if (newPosts.length !== 0) {
      dispatch(setPosts([...newPosts, ...homePosts]))
    }
    dispatch(unsetPolling())
  }
}

export default homeSlice.reducer
