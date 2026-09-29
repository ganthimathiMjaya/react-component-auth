// import React, { useState, useEffect } from "react";
// import "./styles/custom_field.css";
// import SubPanel from "./components/SubPanel";
// import "devextreme/dist/css/dx.light.css";
// import { BrowserRouter } from "react-router-dom";
// import { ToastProvider, useToast } from "./utils/ToastContext";


// const FieldMapping = () => {
//   const [apiResponse, setApiResponse] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { showToast } = useToast();


//   const API_URL =
//     "https://arcdev.accesshealthcare.com/ETL/api/ETLApi/GetFieldListForProcessMapping?processId=20";

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(API_URL);
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setApiResponse(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   const validate = () => {
//     showToast("Some mapper field is incorrect, Please check and update");
//   }

//   const { fields, fieldMappingConfigData } = apiResponse;

//   // Group fields by TableName
//   const groupedFields = fields.reduce((acc, field) => {
//     const tableName = field.TableName;

//     if (!acc[tableName]) acc[tableName] = [];
//     acc[tableName].push(field);

//     return acc;
//   }, {});

//   const getMapperOptions = (cpTableId) => {
//     if (!cpTableId) return [];
//     return fieldMappingConfigData.fieldData
//       .filter((field) => field.CpTableId === cpTableId)
//       .map((mapping) => ({
//         value: mapping.Column,
//         label: mapping.Column,
//       }));
//   };

//   const relationshipData = fieldMappingConfigData.relationshipData;

//   return (
//     <div>
//       <div className="container-fluid">
//         <div className="sectionpanel">

//           <div className="boxpanel submenulist">
//           <BrowserRouter>
//               <SubPanel />
//             </BrowserRouter>            <div className="content_section">
//               <div className="datalevel">
//                 <h3 className="fieldmapping_title">Field Mapping </h3>
//               </div>

//               <div className="contentbox">
//                 <div className="content">
//                   <div className="acc accordated">
//                     {Object.entries(groupedFields).map(([tableName, fields]) => (
//                       <div className="acc__card" key={tableName}>
//                         <div className="acc__title active">{tableName}</div>
//                         <div className="acc__panel" style={{ display: "block" }}>
//                           <table className="table encounter_tables">
//                             <thead>
//                               <tr>
//                                 <th>Fields</th>
//                                 <th>Mandatory</th>
//                                 <th>Mapper Column</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {fields.map((field) => (
//                                 <tr key={field.FieldId}>
//                                   <td>{field.FieldsName}</td>
//                                   <td>
//                                     {field.IsRequired ? (
//                                       <img
//                                         src="data:image/png;base64,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"
//                                         className="tick_image"
//                                         alt="Mandatory"
//                                       />
//                                     ) : (
//                                       <img
//                                         src="http://10.20.0.187:84/ETL/image/disablecheck.png"
//                                         className="tick_image"
//                                         alt="Mandatory"
//                                       />
//                                     )}
//                                   </td>
//                                   <td>
//                                     <select
//                                       className="fieldmappingSelect"
//                                       defaultValue={
//                                         fieldMappingConfigData.fieldData.find(
//                                           (mapping) =>
//                                             mapping.FieldId === field.FieldId
//                                         )?.Column || ""
//                                       }
//                                       onChange={(e) =>
//                                         console.log(
//                                           `Selected for ${field.FieldsName}: ${e.target.value}`
//                                         )
//                                       }
//                                     >
//                                       <option value="" disabled>
//                                         Select an option
//                                       </option>
//                                       {getMapperOptions(
//                                         field.CptableId
//                                       ).map((option) => (
//                                         <option
//                                           key={option.value}
//                                           value={option.value}
//                                         >
//                                           {option.label}
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>

//                           {/* Relationship Section */}
//                           {relationshipData
//                             .filter(
//                               (relation) =>
//                                 relation.CpTableId === fields[0]?.CptableId
//                             )
//                             .map((relation) => (
//                               <div
//                                 className="relationship-section"
//                                 key={relation.CpTableId}
//                                 style={{
//                                   marginTop: "15px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                 }}
//                               >
//                                 <label
//                                   style={{ marginRight: "10px", fontWeight: "bold" }}
//                                 >
//                                   Relationship
//                                 </label>
//                                 <select
//                                   className="relationshipSelect"
//                                   defaultValue={relation.JoinType}
//                                   style={{ marginRight: "10px", width: "150px" }}
//                                   disabled
//                                 >
//                                   <option value="From">From</option>
//                                   <option value="Inner">Inner Join</option>
//                                   <option value="Left">Left Join</option>
//                                 </select>
//                                 <label>{relation.DsName}</label>
//                                 <input
//                                   type="text"
//                                   value={relation.JoinColumn}
//                                   className="form-control"
//                                   style={{ marginLeft: "10px", width: "300px" }}
//                                   disabled
//                                 />
//                               </div>
//                             ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="footerlevel">
//                     <div className="footerbutton">
//                       <button
//                         onClick={validate}
//                         type="button"
//                         className="btn btn-default btnsave"
//                         data-dismiss="modal"
//                       >
//                         Validate And Save
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const App = () => (
//     <ToastProvider>
//       <FieldMapping />
//     </ToastProvider>
//   );

// export default App;


// import React from "react";
// import AppRoutes from "./routes/AppRoutes"; // Adjust path as needed
// import store from './redux/store';
// import { Provider } from "react-redux";
// import 'devextreme/dist/css/dx.light.css';
// import DashBoard from './components/DashBoard'; // Import components

// import config from 'devextreme/core/config';
// import { licenseKey } from './devextreme-license';

// config({ licenseKey });
// const App = (props) => (
//     <Provider store={store}>
//           <DashBoard {...props}/>
//         </Provider>

//       );
//        export default App;
import React from "react";
// import { Provider } from "react-redux";
import 'devextreme/dist/css/dx.light.css';
import OrdersMasterDetail from "./components/Service/OrdersMasterDetail";

import config from 'devextreme/core/config';
import { licenseKey } from './devextreme-license';

config({ licenseKey });

const App = (props) => (
  // <Provider>
  <OrdersMasterDetail {...props} />
  // </Provider>
);

export default App;
