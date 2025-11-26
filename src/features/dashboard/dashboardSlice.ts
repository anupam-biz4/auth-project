import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

type Profile = {
  id?: string | number;
  name?: string;
  email?: string;
  isVerified?: boolean;
  [key: string]: unknown;
};

interface DashboardState {
  profile: Profile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

const initialState: DashboardState = {
  profile: null,
  status: 'idle',
};

export const fetchProfile = createAsyncThunk<Profile>(
  'dashboard/fetchProfile',
  async () => {
    const res = await authAPI.getProfile();
    const data = (res as { data?: Profile })?.data ?? res;
    return data as Profile;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setProfile(state: DashboardState, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
    },
    clearProfile(state: DashboardState) {
      state.profile = null;
      state.status = 'idle';
      state.error = undefined;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<DashboardState>) => {
    builder
      .addCase(fetchProfile.pending, (state: DashboardState) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state: DashboardState, action: PayloadAction<Profile>) => {
          state.status = 'succeeded';
          state.profile = action.payload ?? null;
        }
      )
      .addCase(fetchProfile.rejected, (state: DashboardState, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setProfile, clearProfile } = dashboardSlice.actions;
export default dashboardSlice.reducer;
