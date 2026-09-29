import dataPreviewReducer from "../redux/slices/dataPreviewSlice";
import dataSourceReducer from "../redux/slices/dataSourceSlice";
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    dataPreview: dataPreviewReducer, 
    dataSource: dataSourceReducer, 
  },
});

export default store;
