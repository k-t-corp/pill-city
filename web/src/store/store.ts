import { configureStore } from '@reduxjs/toolkit'
import homeReducer from "./homeSlice";
import meReducer from "./meSlice";

const store = configureStore({
  reducer: {
    home: homeReducer,
    me: meReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
