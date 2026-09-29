import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../../utils/helperFunctions";
import { defaultReject, defaultState } from "../../utils/commonSchema";

// Async Thunks
export const FETCH_APP_PREVIEW = createAsyncThunk(
  "dataPreview/fetchProcessDataset",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchData(
        { 
          method: "get"
        },
        'https://etlapi.accesshealthcare.co/api/ETLApi/GetProcessDataSet?processId=20&null'
      );
      return response?.dataSet; 
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
    ...defaultState  // Assuming defaultState includes other relevant default fields
  }
};

// Slice
const dataPreviewSlice = createSlice({
  name: "dataPreview",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(FETCH_APP_PREVIEW.pending, (state) => {
        state.fetchAppRepository.loading = true;
        state.fetchAppRepository.error = null;
      })
      .addCase(FETCH_APP_PREVIEW.fulfilled, (state, action) => {
        state.fetchAppRepository.loading = false;
        state.fetchAppRepository.data = action.payload ?? null;
        state.fetchAppRepository.error = null;
      })
      .addCase(FETCH_APP_PREVIEW.rejected, (state, action) => {
        state.fetchAppRepository.loading = false;
        state.fetchAppRepository.error = action.payload.message || "Failed to fetch data";
      });
  },
});

// Export Actions
export const dataPreviewActions = {
  FETCH_APP_PREVIEW
};

// Export Reducer
export default dataPreviewSlice.reducer;
