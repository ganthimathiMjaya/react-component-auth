import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import {
  defaultState,
  defaultReject,
  defaultLoading,
} from "../../utils/commonSchema";

export const FETCH_PERMISSION_INFO = createAsyncThunk(
  "permissionSlice/fetchPermissionInfo",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
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
        `https://iamapi.accesshealthcare.co/api/IAM/GetPermissionInfoByAppId?appId=${appId}&OrgId=9ba8241f-ab2c-4c1b-98be-81a97b165f00`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const CREATE_PERMISSION = createAsyncThunk(
  "permissionSlice/createPermission",
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/CreatePermission`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const UPDATE_PERMISSION = createAsyncThunk(
  "permissionSlice/updatePermission",
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/UpdatePermission`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

const initialState = {
  fetchPermissionInfo: { ...defaultState },
  createPermission: { ...defaultState },
  updatePermission: { ...defaultState },
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch permission info
      .addCase(FETCH_PERMISSION_INFO.pending, (state) => {
        state.fetchPermissionInfo = { ...defaultLoading };
      })
      .addCase(FETCH_PERMISSION_INFO.fulfilled, (state, action) => {
        state.fetchPermissionInfo = action.payload || {};
      })
      .addCase(FETCH_PERMISSION_INFO.rejected, (state, action) => {
        state.fetchPermissionInfo = action.payload || {};
      })

      // Create permission
      .addCase(CREATE_PERMISSION.pending, (state) => {
        state.createPermission = { ...defaultLoading };
      })
      .addCase(CREATE_PERMISSION.fulfilled, (state, action) => {
        state.createPermission = action.payload || {};
      })
      .addCase(CREATE_PERMISSION.rejected, (state, action) => {
        state.createPermission = action.payload || {};
      })

      // Update permission
      .addCase(UPDATE_PERMISSION.pending, (state) => {
        state.updatePermission = { ...defaultLoading };
      })
      .addCase(UPDATE_PERMISSION.fulfilled, (state, action) => {
        state.updatePermission = action.payload || {};
      })
      .addCase(UPDATE_PERMISSION.rejected, (state, action) => {
        state.updatePermission = action.payload || {};
      });
  },
});

// Export actions and reducer
export const permissionActions = {
  FETCH_PERMISSION_INFO,
  CREATE_PERMISSION,
  UPDATE_PERMISSION,
};
export default permissionSlice.reducer;
