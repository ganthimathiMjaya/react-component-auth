import React from "react";
import './index.css';
import FlowChart from "./screens/FlowChart";
import { FlowProvider } from "./context/context";
import 'devextreme/dist/css/dx.light.css';
import FlowChart1 from "./screens/FlowChart1";

const App = (props) => (
  <FlowProvider {...props}>
    <FlowChart1  {...props} />
  </FlowProvider>

);
export default App;
