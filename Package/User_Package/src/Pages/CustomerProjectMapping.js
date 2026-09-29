import React, { useState, useEffect } from "react";
import "devextreme/dist/css/dx.light.css";
import Button from "devextreme-react/button";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/actions/actions";
import DataGrid, {
  Column,
  Paging,
  FilterRow,
  SearchPanel,
} from "devextreme-react/data-grid";
import CustomerProjectMappingComp from "../components/customerProjectMappingComp";

const CustomerProjectMapping = () => {
  const [data, setData] = useState([]);
  const [showMappingComp, setShowMappingComp] = useState(false);
  const [actionMode, setActionMode] = useState("");
  const [editData, setEditData] = useState({});
  const dispatch = useDispatch();
  const loading = useSelector(
    (state) =>
      state.CustomerProjectMapping.fetchCustomerProjectMappingByOrgid.loading
  );

  const fetchCustomerProjectMapping = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await dispatch(
        actions.FETCH_CUSTOMER_PROJECT_MAPPING_BY_ORGID({
          orgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
          token,
        })
      );
      if (!response?.payload?.error) {
        const flattenedData = response.payload.data.Data.CustomerList.flatMap(
          (customer) =>
            customer.ProjectList.map((project) => ({
              MappingId: project.MappingId,
              CustomerId: customer.CustomerId,
              CustomerName: customer.CustomerName,
              ProjectId: project.ProjectId,
              ProjectName: project.ProjectName,
            }))
        );

        setData(flattenedData);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching permission data:", error);
    }
  };

  useEffect(() => {
    fetchCustomerProjectMapping();
  }, [dispatch, setData]);

  const handleEdit = (rowData) => {
    setActionMode("Edit");
    setEditData(rowData);
    // alert(`Editing: ${JSON.stringify(rowData)}`);
    setShowMappingComp(true);
  };

  const handleAddUserMapping = () => {
    setShowMappingComp(true);
    setActionMode("Add");
  };

  return (
    <div className="table-container">
      <div className="table-header">
        {actionMode === "Edit" ? (
          <>
            {" "}
            <h1 className="table-heading">Edit Users Customer Project Mapping</h1>
          </>
        ) : (
          <>
            <h1 className="table-heading">Users Customer Project Mapping</h1>
            <Button className="add-user-button" onClick={handleAddUserMapping}>
              Add User Mapping
            </Button>
          </>
        )}
      </div>
      {!showMappingComp && (
        <div>
          <DataGrid
            dataSource={data}
            showBorders={true}
            style={{ width: "100%" }}
          >
            {/* Filter Row */}
            <FilterRow visible={true} />

            {/* Search Panel */}
            <SearchPanel visible={true} />

            {/* Paging */}
            <Paging defaultPageSize={5} />

            {/* Columns */}
            <Column
              dataField="CustomerId"
              caption="Customer ID"
              width={100}
              alignment="center"
            />
            <Column
              dataField="CustomerName"
              caption="Customer Name"
              headerCellRender={(column) => (
                <div style={{ textAlign: "center" }}>
                  {column.column.caption}
                </div>
              )}
            />
            <Column
              dataField="ProjectId"
              caption="Project ID"
              width={100}
              alignment="center"
            />
            <Column dataField="ProjectName" caption="Project Name" />
            <Column
              caption="Action"
              width={100}
              alignment="center"
              cellRender={(cellData) => (
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEdit(cellData.data)}
                >
                  <i
                    className="dx-icon-edit"
                    style={{ fontSize: 18, color: "#007acc" }}
                  ></i>
                </button>
              )}
            />
          </DataGrid>
        </div>
      )}
      {/* Conditionally render CustomerProjectMappingComp */}
      {showMappingComp && (
        <div>
          <CustomerProjectMappingComp
            setShowMappingComp={setShowMappingComp}
            showMappingComp={showMappingComp}
            fetchCustomerProjectMapping={fetchCustomerProjectMapping}
            actionMode={actionMode}
            editData={editData}
            setActionMode={setActionMode}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerProjectMapping;
