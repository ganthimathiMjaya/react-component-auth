import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperfunction";
import {
  defaultState,
  defaultReject,
  defaultLoading,
} from "../../utils/commonSchema";

export const FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID = createAsyncThunk(
  "userRoleSlice/fetchCustomerProjectMappingByOrgid",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const { orgId, token } = payload;
      const data = await fetchData(
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        `https://iamapi.accesshealthcare.co/api/IAM/User/GetCustomerProjectMappingByOrgId?OrgId=${orgId}`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);
//GetCustomerProjectMappingById
export const GET_CUSTOMER_PROJECT_MAPPINGID = createAsyncThunk(
    "userRoleSlice/getCustomerProjectMappingById",
    async (payload = {}, { rejectWithValue }) => {
      try {
        const { MappingId, token } = payload;
        const data = await fetchData(
          {
            method: "get",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          `https://iamapi.accesshealthcare.co/api/User/GetCustomerProjectMappingById?MappingId=${MappingId}`
        );
        return { ...defaultState, data };
      } catch (err) {
        return rejectWithValue({ ...defaultReject, message: err.message });
      }
    }
  );

export const UPSERT_CUSTOMER_PROJECT_MAPPING = createAsyncThunk(
  "userRoleSlice/upsertCustomerProjectMapping",
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
        `https://iamapi.accesshealthcare.co/api/User/UpsertCustomerProjectMapping`
      );
      return { ...defaultState, data };
    } catch (err) {
      return rejectWithValue({ ...defaultReject, message: err.message });
    }
  }
);

const initialState = {
  fetchCustomerProjectMappingByOrgid: { ...defaultState },
  getCustomerProjectMappingById: {...defaultState},
  upsertCustomerProjectMapping: { ...defaultState },
};

const customerprojectMappingSlice = createSlice({
  name: "customerprojectMapping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID
      .addCase(FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID.pending, (state) => {
        state.fetchCustomerProjectMappingByOrgid = { ...defaultLoading };
      })
      .addCase(
        FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID.fulfilled,
        (state, action) => {
          state.fetchCustomerProjectMappingByOrgid = action.payload || {};
        }
      )
      .addCase(
        FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID.rejected,
        (state, action) => {
          state.fetchCustomerProjectMappingByOrgid = action.payload || {};
        }
      )
      // GET_CUSTOMER_PROJECT_MAPPINGID
      .addCase(GET_CUSTOMER_PROJECT_MAPPINGID.pending, (state) => {
        state.getCustomerProjectMappingById = { ...defaultLoading };
      })
      .addCase(
        GET_CUSTOMER_PROJECT_MAPPINGID.fulfilled,
        (state, action) => {
          state.getCustomerProjectMappingById = action.payload || {};
        }
      )
      .addCase(
        GET_CUSTOMER_PROJECT_MAPPINGID.rejected,
        (state, action) => {
          state.getCustomerProjectMappingById = action.payload || {};
        }
      )
      // UPSERT_CUSTOMER_PROJECT_MAPPING
      .addCase(UPSERT_CUSTOMER_PROJECT_MAPPING.pending, (state) => {
        state.upsertCustomerProjectMapping = { ...defaultLoading };
      })
      .addCase(UPSERT_CUSTOMER_PROJECT_MAPPING.fulfilled, (state, action) => {
        state.upsertCustomerProjectMapping = action.payload || {};
      })
      .addCase(UPSERT_CUSTOMER_PROJECT_MAPPING.rejected, (state, action) => {
        state.upsertCustomerProjectMapping = action.payload || {};
      });
  },
});

// Export actions and reducer
export const customerprojectMappingActions = {
  FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID,
  GET_CUSTOMER_PROJECT_MAPPINGID,
  UPSERT_CUSTOMER_PROJECT_MAPPING
};
export default customerprojectMappingSlice.reducer;
