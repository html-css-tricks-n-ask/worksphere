import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import loadingReducer from './slices/loadingSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    loading: loadingReducer,
    auth: authReducer,
  },
});

 


export default store;
