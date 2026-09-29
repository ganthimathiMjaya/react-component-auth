import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperFunctions";
import { defaultReject, defaultState } from "../../utils/commonSchema";

// Async Thunks

// First API call
export const FETCH_APP_SOURCE = createAsyncThunk(
  "dataSource/fetchProcessDataset",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchData(
        {
          method: "get"
        },
        `https://etlapi.accesshealthcare.co/api/ETLApi/GetDataSourceByCreatedBy?createdBy=1&projectId=${props?.projectId}&modelId=${props?.modelId}`
      );
      return response;
    } catch (err) {
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);

// Formula API call
export const FETCH_FORMULA_API = createAsyncThunk(
  "dataSource/fetchFormulaApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchData(
        {
          method: "get"
        },
        'https://etlapi.accesshealthcare.co/api/ETLApi/GetFormulaList?null' 
      );
      return response;
    } catch (err) {
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);


export const FETCH_SOURCE_NAME = createAsyncThunk(
  "dataSourceName/fetchSourceNameApi",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchData(
        {
          method: "get"
        },
        'https://etlapi.accesshealthcare.co/api/ETLApi/GetDsNewSuggestedName?processId=20&null' 
      );
      return response;
    } catch (err) {
      console.error("Error fetching data:", err);
      return rejectWithValue({
        ...defaultReject,
        message: err.message,
      });
    }
  }
);

// Initial State
const initialState = {
  fetchAppRepository: {
    data: null,
    loading: false,
    error: null,
    ...defaultState  
  },
  fetchFormulaApi: {
    data: null,
    loading: false,
    error: null,
    ...defaultState
  },
  fetchSourceNameApi: {
    data: null,
    loading: false,
    error: null,
    ...defaultState
  }
};

// Slice
const dataSourceSlice = createSlice({
  name: "dataSource",
  initialState,
  extraReducers: (builder) => {
    // FETCH_APP_SOURCE
    builder
      .addCase(FETCH_APP_SOURCE.pending, (state) => {
        state.fetchAppRepository.loading = true;
        state.fetchAppRepository.error = null;
      })
      .addCase(FETCH_APP_SOURCE.fulfilled, (state, action) => {
        state.fetchAppRepository.loading = false;
        state.fetchAppRepository.data = action.payload ?? null;
        state.fetchAppRepository.error = null;
      })
      .addCase(FETCH_APP_SOURCE.rejected, (state, action) => {
        state.fetchAppRepository.loading = false;
        state.fetchAppRepository.error = action.payload.message || "Failed to fetch data";
      });

    // FETCH_SECOND_API
    builder
      .addCase(FETCH_FORMULA_API.pending, (state) => {
        state.fetchFormulaApi.loading = true;
        state.fetchFormulaApi.error = null;
      })
      .addCase(FETCH_FORMULA_API.fulfilled, (state, action) => {
        state.fetchFormulaApi.loading = false;
        state.fetchFormulaApi.data = action.payload ?? null;
        state.fetchFormulaApi.error = null;
      })
      .addCase(FETCH_FORMULA_API.rejected, (state, action) => {
        state.fetchFormulaApi.loading = false;
        state.fetchFormulaApi.error = action.payload.message || "Failed to fetch data";
      });

      //FetchName API
      builder
      .addCase(FETCH_SOURCE_NAME.pending, (state) => {
        state.fetchSourceNameApi.loading = true;
        state.fetchSourceNameApi.error = null;
      })
      .addCase(FETCH_SOURCE_NAME.fulfilled, (state, action) => {
        state.fetchSourceNameApi.loading = false;
        state.fetchSourceNameApi.data = action.payload ?? null;
        state.fetchSourceNameApi.error = null;
      })
      .addCase(FETCH_SOURCE_NAME.rejected, (state, action) => {
        state.fetchSourceNameApi.loading = false;
        state.fetchSourceNameApi.error = action.payload.message || "Failed to fetch data";
      });
  },
});

// Export Actions
export const dataSourceActions = {
  FETCH_APP_SOURCE,
  FETCH_FORMULA_API,
  FETCH_SOURCE_NAME
};

// Export Reducer
export default dataSourceSlice.reducer;

