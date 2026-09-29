import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import {
  defaultState,
  defaultReject,
  defaultLoading,
} from "../../utils/commonSchema";

export const FETCH_ROLE_DETAILS_BY_APPID = createAsyncThunk(
  "roleSlice/fetchRoleDetailsByAppId",
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
        `https://iamapi.accesshealthcare.co/api/IAM/GetRoleDetailsByAppId?AppId=${appId}&OrgId=9ba8241f-ab2c-4c1b-98be-81a97b165f00`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const CREATE_ROLE = createAsyncThunk(
  "roleSlice/createRole",
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
        `https://iamapi.accesshealthcare.co/api/IAM/CreateRole`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const UPDATE_ROLE = createAsyncThunk(
  "roleSlice/updateRole",
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
        `https://iamapi.accesshealthcare.co/api/IAM/UpdateRole`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

const initialState = {
  fetchRoleDetailsByAppId: { ...defaultState },
  createRole: { ...defaultState },
  updateRole: { ...defaultState },
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH_ROLE_DETAILS_BY_APPID
      .addCase(FETCH_ROLE_DETAILS_BY_APPID.pending, (state) => {
        state.fetchRoleDetailsByAppId = { ...defaultLoading };
      })
      .addCase(FETCH_ROLE_DETAILS_BY_APPID.fulfilled, (state, action) => {
        state.fetchRoleDetailsByAppId = action.payload || {};
      })
      .addCase(FETCH_ROLE_DETAILS_BY_APPID.rejected, (state, action) => {
        state.fetchRoleDetailsByAppId = action.payload || {};
      })
      // CREATE_ROLE
      .addCase(CREATE_ROLE.pending, (state) => {
        state.createRole = { ...defaultLoading };
      })
      .addCase(CREATE_ROLE.fulfilled, (state, action) => {
        state.createRole = action.payload || {};
      })
      .addCase(CREATE_ROLE.rejected, (state, action) => {
        state.createRole = action.payload || {};
      })
      // UPDATE_ROLE
      .addCase(UPDATE_ROLE.pending, (state) => {
        state.updateRole = { ...defaultLoading };
      })
      .addCase(UPDATE_ROLE.fulfilled, (state, action) => {
        state.updateRole = action.payload || {};
      })
      .addCase(UPDATE_ROLE.rejected, (state, action) => {
        state.updateRole = action.payload || {};
      });
  },
});

// Export actions and reducer
export const roleActions = {
  FETCH_ROLE_DETAILS_BY_APPID,
  CREATE_ROLE,
  UPDATE_ROLE,
};
export default roleSlice.reducer;
