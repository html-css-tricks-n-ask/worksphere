import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  globalLoading: boolean;
  actionsLoading: Record<string, boolean>;
}

const initialState: LoadingState = {
  globalLoading: false,
  actionsLoading: {},
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setActionLoading: (state, action: PayloadAction<{ actionKey: string; isLoading: boolean }>) => {
      const { actionKey, isLoading } = action.payload;
      state.actionsLoading[actionKey] = isLoading;
    },
  },
});

export const { setGlobalLoading, setActionLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
