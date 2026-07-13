import { createSlice, } from '@reduxjs/toolkit';
















const savedToken = localStorage.getItem('worksphere-token');
const savedUser = localStorage.getItem('worksphere-user');

const initialState = {
  isAuthenticated: !!savedToken,
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('worksphere-token', action.payload.token);
      localStorage.setItem('worksphere-user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('worksphere-token');
      localStorage.removeItem('worksphere-user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
