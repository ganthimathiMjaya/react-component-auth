import { configureStore } from "@reduxjs/toolkit";
import appRepositoryReducer from "../redux/slices/appRepositorySlice";
import permissionReducer from "../redux/slices/permissionSlice";
import permissionMappingReducer from "../redux/slices/permissionMappingSlice";
import roleReducer from "../redux/slices/roleSlice";
import userRoleReducer from "../redux/slices/userRoleSlice";
import CustomerProjectMappingReducer from "../redux/slices/customerProjectMappingSlice";

const store = configureStore({
  reducer: {
    appRepository: appRepositoryReducer, 
    permission: permissionReducer, 
    permissionMapping: permissionMappingReducer,
    role: roleReducer,
    userRole: userRoleReducer,
    CustomerProjectMapping:CustomerProjectMappingReducer,
  },
});

export default store;
