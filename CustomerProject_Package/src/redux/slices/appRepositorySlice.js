import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import { defaultReject, defaultState } from "../../utils/commonSchema";

// Async Thunks
export const FETCH_APP_REPOSITORY = createAsyncThunk(
  "appRepositorySlice/fetchAppRepository",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      console.log("token", token)
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const { appId } = payload;
      const data = await fetchData(
        { 
          method: "get", 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/GetAppRepositoryByAppId?appId=${appId}&OrgId=9ba8241f-ab2c-4c1b-98be-81a97b165f00`
      );
      return {
        ...defaultState,
        data: data,
      };
    } catch (err) {
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);

export const CREATE_APP_REPOSITORY = createAsyncThunk(
  "appRepositorySlice/createAppRepository",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const data = await fetchData(
        {
          method: "post",
          data: payload,
          headers: {
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/CreateAppRepository`
      );
      return {
        ...defaultState,
        data: data,
      };
    } catch (err) {
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);

export const UPDATE_APP_REPOSITORY = createAsyncThunk(
  "appRepositorySlice/updateAppRepository",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const data = await fetchData(
        {
          method: "post",
          data: payload,
          headers: {
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/UpdateAppRepository`
      );
      return {
        ...defaultState,
        data: data,
      };
    } catch (err) {
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);

// Initial State
const initialState = {
  fetchAppRepository: { ...defaultState },
  createAppRepository: { ...defaultState },
  updateAppRepository: {...defaultState},
};

// Slice
const appRepositorySlice = createSlice({
  name: "appRepository",
  initialState,
  extraReducers: (builder) => {
    builder
      // FETCH_APP_REPOSITORY
      .addCase(FETCH_APP_REPOSITORY.pending, (state) => {
        state.fetchAppRepository = { ...defaultState, loading: true };
      })
      .addCase(FETCH_APP_REPOSITORY.fulfilled, (state, action) => {
        state.fetchAppRepository = action.payload ?? {};
      })
      .addCase(FETCH_APP_REPOSITORY.rejected, (state, action) => {
        state.fetchAppRepository = action.payload ?? {};
      })
      // CREATE_APP_REPOSITORY
      .addCase(CREATE_APP_REPOSITORY.pending, (state) => {
        state.createAppRepository = { ...defaultState, loading: true };
      })
      .addCase(CREATE_APP_REPOSITORY.fulfilled, (state, action) => {
        state.createAppRepository = action.payload ?? {};
      })
      .addCase(CREATE_APP_REPOSITORY.rejected, (state, action) => {
        state.createAppRepository = action.payload ?? {};
      })
      // UPDATE_APP_REPOSITORY
      .addCase(UPDATE_APP_REPOSITORY.pending, (state) => {
        state.updateAppRepository = { ...defaultState, loading: true };
      })
      .addCase(UPDATE_APP_REPOSITORY.fulfilled, (state, action) => {
        state.updateAppRepository = action.payload ?? {};
      })
      .addCase(UPDATE_APP_REPOSITORY.rejected, (state, action) => {
        state.updateAppRepository = action.payload ?? {};
      });
  },
});

// Export Actions
export const appRepositoryActions = {
  FETCH_APP_REPOSITORY,
  CREATE_APP_REPOSITORY,
  UPDATE_APP_REPOSITORY
};

// Export Reducer
export default appRepositorySlice.reducer;
