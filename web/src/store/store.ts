import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import homeReducer from "./homeSlice";
import meReducer from "./meSlice";
import notificationsReducer from "./notificationsSlice";

const reducers = combineReducers({
  home: homeReducer,
  me: meReducer,
  notifications: notificationsReducer
})

export const persistKey = 'persist'

const persistConfig = {
  key: persistKey,
  storage,
  whitelist: ['me'],
}

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
