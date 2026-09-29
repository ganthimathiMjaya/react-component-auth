import { appRepositoryActions} from "../slices/appRepositorySlice";
import { permissionActions } from "../slices/permissionSlice";
import { permissionMappingActions } from "../slices/permissionMappingSlice";
import { roleActions } from "../slices/roleSlice";
import { userRoleActions } from "../slices/userRoleSlice";
import { customerprojectMappingActions } from "../slices/customerProjectMappingSlice";

const actions = {
  ...appRepositoryActions, 
  ...permissionActions,
  ...permissionMappingActions,
  ...roleActions,
  ...userRoleActions,
  ...customerprojectMappingActions,
};

export default actions;
