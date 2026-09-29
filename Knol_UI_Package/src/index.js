
import React from "react";
import "./App.css";
//  import AppRoutes from "./routes/Route";
import { AuthProvider } from "./Auth/AuthContext";
import MiniDrawer from "./components/MiniDrawer";
import config from 'devextreme/core/config';
import { licenseKey } from './devextreme-license';


config({ licenseKey });

function App(props) {
  return (
    <div >
      <MiniDrawer {...props} />
    </div>
  );
}
export default App;
