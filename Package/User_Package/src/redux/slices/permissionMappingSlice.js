import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import {
  defaultState,
  defaultReject,
  defaultLoading,
} from "../../utils/commonSchema";

export const FETCH_PERMISSION_MAPPING = createAsyncThunk(
  "permissionMappingSlice/fetchPermissionMapping",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("accessToken"); 
      if (!token) {
        return rejectWithValue("Token not found");
      }
      const { PermissionId } = payload;
      const data = await fetchData(
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/GetPermissionMappingByPermisssionId?PermissionId=${PermissionId}`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);



export const CREATE_REPOSITORY_PERMISSION_MAPPING = createAsyncThunk(
  "permissionMappingSlice/createRepositoryPermissionMapping",
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
        `https://iamapi.accesshealthcare.co/api/IAM/CreateRepositoryPermissionMapping`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

export const UPDATE_REPOSITORY_PERMISSION_MAPPING = createAsyncThunk(
  "permissionMappingSlice/updateRepositoryPermissionMapping",
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
        `https://iamapi.accesshealthcare.co/api/IAM/UpdateRepositoryPermissionMapping`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

const initialState = {
  fetchPermissionMapping: { ...defaultState },
  createRepositoryPermissionMapping: { ...defaultState },
  updateRepositoryPermissionMapping: { ...defaultState },
};

const permissionMappingSlice = createSlice({
  name: "permissionMapping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH_PERMISSION_MAPPING
      .addCase(FETCH_PERMISSION_MAPPING.pending, (state) => {
        state.fetchPermissionMapping = { ...defaultLoading };
      })
      .addCase(FETCH_PERMISSION_MAPPING.fulfilled, (state, action) => {
        state.fetchPermissionMapping = action.payload || {};
      })
      .addCase(FETCH_PERMISSION_MAPPING.rejected, (state, action) => {
        state.fetchPermissionMapping = action.payload || {};
      })
      // CREATE_REPOSITORY_PERMISSION_MAPPING
      .addCase(CREATE_REPOSITORY_PERMISSION_MAPPING.pending, (state) => {
        state.createRepositoryPermissionMapping = { ...defaultLoading };
      })
      .addCase(
        CREATE_REPOSITORY_PERMISSION_MAPPING.fulfilled,
        (state, action) => {
          state.createRepositoryPermissionMapping = action.payload || {};
        }
      )
      .addCase(
        CREATE_REPOSITORY_PERMISSION_MAPPING.rejected,
        (state, action) => {
          state.createRepositoryPermissionMapping = action.payload || {};
        }
      )
      // UPDATE_REPOSITORY_PERMISSION_MAPPING
      .addCase(UPDATE_REPOSITORY_PERMISSION_MAPPING.pending, (state) => {
        state.updateRepositoryPermissionMapping = { ...defaultLoading };
      })
      .addCase(
        UPDATE_REPOSITORY_PERMISSION_MAPPING.fulfilled,
        (state, action) => {
          state.updateRepositoryPermissionMapping = action.payload || {};
        }
      )
      .addCase(
        UPDATE_REPOSITORY_PERMISSION_MAPPING.rejected,
        (state, action) => {
          state.updateRepositoryPermissionMapping = action.payload || {};
        }
      );
  },
});

// Export actions and reducer
export const permissionMappingActions = {
  FETCH_PERMISSION_MAPPING,
  CREATE_REPOSITORY_PERMISSION_MAPPING,
  UPDATE_REPOSITORY_PERMISSION_MAPPING,
};
export default permissionMappingSlice.reducer;
