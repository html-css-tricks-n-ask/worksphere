import { createSlice, } from '@reduxjs/toolkit';






const initialState = {
  globalLoading: false,
  actionsLoading: {},
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setActionLoading: (state, action) => {
      const { actionKey, isLoading } = action.payload;
      state.actionsLoading[actionKey] = isLoading;
    },
  },
});

export const { setGlobalLoading, setActionLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
