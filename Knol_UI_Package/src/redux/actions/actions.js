import { dataPreviewActions} from "../slices/dataPreviewSlice";
import { dataSourceActions} from "../slices/dataSourceSlice";


const actions = {
  ...dataPreviewActions, 
  ...dataSourceActions, 
};

export default actions;
