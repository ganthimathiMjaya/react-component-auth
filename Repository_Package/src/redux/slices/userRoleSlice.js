import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import {
  defaultState,
  defaultReject,
  defaultLoading,
} from "../../utils/commonSchema";

export const FETCH_USER_ROLES_BY_APPID = createAsyncThunk(
  "userRoleSlice/fetchUserRolesByAppId",
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
        `https://iamapi.accesshealthcare.co/api/IAM/GetUserRolesByAppId?appId=${appId}&OrgId=9ba8241f-ab2c-4c1b-98be-81a97b165f00`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const Get_User_Info = createAsyncThunk(
  "userRoleSlice/getAllUserInfo",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const data = await fetchData(
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/GetUserInfo`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const FETCH_USER_ROLES_BY_USERID = createAsyncThunk(
  "userRoleSlice/fetchUserRolesByUserId",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const { userId } = payload;
      const data = await fetchData(
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/GetUserRolesByUserId?UserId=${userId}`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const CREATE_USER_ROLE = createAsyncThunk(
  "userRoleSlice/createUserRole",
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/CreateUserRole`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const UPDATE_USER_ROLE = createAsyncThunk(
  "userRoleSlice/updateUserRole",
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/UpdateUserRole`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

const initialState = {
  fetchUserRolesByAppId: { ...defaultState },
  fetchUserRolesByUserId: { ...defaultState },
  createUserRole: { ...defaultState },
  updateUserRole: { ...defaultState },
  getAllUserInfo: {...defaultState},
};

const userRoleSlice = createSlice({
  name: "userRole",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH_USER_ROLES_BY_APPID
      .addCase(FETCH_USER_ROLES_BY_APPID.pending, (state) => {
        state.fetchUserRolesByAppId = { ...defaultLoading };
      })
      .addCase(FETCH_USER_ROLES_BY_APPID.fulfilled, (state, action) => {
        state.fetchUserRolesByAppId = action.payload || {};
      })
      .addCase(FETCH_USER_ROLES_BY_APPID.rejected, (state, action) => {
        state.fetchUserRolesByAppId = action.payload || {};
      })
      // FETCH_USER_ROLES_BY_USERID
      .addCase(FETCH_USER_ROLES_BY_USERID.pending, (state) => {
        state.fetchUserRolesByUserId = { ...defaultLoading };
      })
      .addCase(FETCH_USER_ROLES_BY_USERID.fulfilled, (state, action) => {
        state.fetchUserRolesByUserId = action.payload || {};
      })
      .addCase(FETCH_USER_ROLES_BY_USERID.rejected, (state, action) => {
        state.fetchUserRolesByUserId = action.payload || {};
      })
       // Get_User_Info
       .addCase(Get_User_Info.pending, (state) => {
        state.getAllUserInfo = { ...defaultLoading };
      })
      .addCase(Get_User_Info.fulfilled, (state, action) => {
        state.getAllUserInfo = action.payload || {};
      })
      .addCase(Get_User_Info.rejected, (state, action) => {
        state.getAllUserInfo = action.payload || {};
      })
      // CREATE_USER_ROLE
      .addCase(CREATE_USER_ROLE.pending, (state) => {
        state.createUserRole = { ...defaultLoading };
      })
      .addCase(CREATE_USER_ROLE.fulfilled, (state, action) => {
        state.createUserRole = action.payload || {};
      })
      .addCase(CREATE_USER_ROLE.rejected, (state, action) => {
        state.createUserRole = action.payload || {};
      })
      // UPDATE_USER_ROLE
      .addCase(UPDATE_USER_ROLE.pending, (state) => {
        state.updateUserRole = { ...defaultLoading };
      })
      .addCase(UPDATE_USER_ROLE.fulfilled, (state, action) => {
        state.updateUserRole = action.payload || {};
      })
      .addCase(UPDATE_USER_ROLE.rejected, (state, action) => {
        state.updateUserRole = action.payload || {};
      });
  },
});

// Export actions and reducer
export const userRoleActions = {
  FETCH_USER_ROLES_BY_APPID,
  FETCH_USER_ROLES_BY_USERID,
  CREATE_USER_ROLE,
  UPDATE_USER_ROLE,
  Get_User_Info,
};
export default userRoleSlice.reducer;
