import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice.js';
import loadingReducer from './slices/loadingSlice.js';
import authReducer from './slices/authSlice.js';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    loading: loadingReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
