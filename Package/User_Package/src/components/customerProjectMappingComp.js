import React, { useState, useEffect } from "react";
import "devextreme/dist/css/dx.light.css";
import List from "devextreme-react/list";
import axios from "axios";
import { useDispatch } from "react-redux";
import actions from "../redux/actions/actions";
import Button from "devextreme-react/button";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

const CustomerProjectMappingComp = (props) => {
  const {
    showMappingComp,
    setShowMappingComp,
    fetchCustomerProjectMapping,
    actionMode,
    editData,
    setActionMode,
  } = props;
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState([]);
  const [unselectedProjectId, setUnselectedProjectId] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // To store selected users
  const [unselectedUsers, setUnselectedUsers] = useState([]);
  const [mappingData, setMappingData] = useState({});
  const dispatch = useDispatch();
  const token = sessionStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const UserId = decoded.UserId;
  console.log("editData", editData);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "https://arcflowcustomeronboardingapi.accesshealthcare.co/CustomerProjects/GetCustomerProjects?OrgId=1&CustomerId=0&DataModelId=0&ProjectId=0"
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(
            `https://arcflowcustomeronboardingapi.accesshealthcare.co/CustomerProjects/GetCustomerProjects?OrgId=1&CustomerId=${selectedCustomerId?.CustomerId}&DataModelId=0&ProjectId=0`
          );
          const projectData = response.data[0]?.CustomerProjectDTOs || [];
          setProjects(projectData);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };
      fetchProjects();
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchUsers = async () => {
        try {
          const response = await dispatch(actions.Get_User_Info());
          const userData = response.payload.data.Data || [];
          setUsers(userData);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (actionMode === "Edit" && editData?.MappingId) {
      getCustomerProjectMappingById(editData.MappingId);
    }
  }, [actionMode, editData]);
  const getCustomerProjectMappingById = async (MappingId) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await dispatch(
        actions.GET_CUSTOMER_PROJECT_MAPPINGID({
          MappingId,
          token,
        })
      );

      if (response?.payload?.data?.Success) {
        const data = response.payload.data.Data;

        // Extract customer details
        const customer = data.CustomerList?.find((c) =>
          c.ProjectList.some((p) => p.MappingId === MappingId)
        );

        if (customer) {
          setSelectedCustomerId({
            CustomerId: customer.CustomerId,
            FullName: customer.CustomerName,
          });

          // Extract project details
          const project = customer.ProjectList.find(
            (p) => p.MappingId === MappingId
          );

          if (project) {
            setSelectedProjectId([
              {
                ProjectId: project.ProjectId,
                ProjectName: project.ProjectName,
              },
            ]);

            // Extract users for the project
            setSelectedUsers(
              project.UsersList.map((user) => ({
                Id: user.Id,
                Name: user.Name,
                RecUserId: user.RecUserId,
                NT_UserName: user.NT_UserName,
                EmpId: user.EmpId,
                EmailId: user.EmailId,
                PhoneNo: user.PhoneNo,
                Gender: user.Gender,
              }))
            );
          }
        }
      } else {
        console.error("Error fetching mapping data:", response?.payload?.error);
      }
    } catch (error) {
      console.error("Error fetching mapping data:", error);
    }
  };

  const handleCustomerSelection = (e) => {
    setSelectedCustomerId(e.itemData);
  };

  //   const handleProjectSelection = (e) => {
  //     setSelectedProjectId(e.itemData);
  //   };

  const handleProjectSelection = (e) => {
    const addedUsers = e.addedItems;
    const removedUsers = e.removedItems;

    setSelectedProjectId((prevSelectedUsers) => [
      ...prevSelectedUsers.filter(
        (user) => !removedUsers.some((removed) => removed.Id === user.Id)
      ),
      ...addedUsers,
    ]);

    setUnselectedProjectId((prevUnselectedUsers) => [
      ...prevUnselectedUsers.filter(
        (user) => !addedUsers.some((added) => added.Id === user.Id)
      ),
      ...removedUsers,
    ]);
  };

  const handleUserSelectionChange = (e) => {
    // Get the newly added and removed users
    const addedUsers = e.addedItems;
    const removedUsers = e.removedItems;

    // Update selected users
    setSelectedUsers((prevSelectedUsers) => [
      ...prevSelectedUsers.filter(
        (user) => !removedUsers.some((removed) => removed.Id === user.Id)
      ),
      ...addedUsers,
    ]);

    // Update unselected users
    setUnselectedUsers((prevUnselectedUsers) => [
      ...prevUnselectedUsers.filter(
        (user) => !addedUsers.some((added) => added.Id === user.Id)
      ),
      ...removedUsers,
    ]);
  };

  const handleUpsertCustomerProjectMapping = async () => {
    try {
        const projectList = selectedProjectId.map((project) => ({
            ProjectId: project.ProjectId,
            ProjectName: project.ProjectName,
            ProjectDescription: project.ProjectDescription || "",
          }));
      const payload = {
        MappingId: actionMode === "Edit" ? editData?.MappingId : null,
        OrgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
        CustomerId: selectedCustomerId.CustomerId,
        CustomerName: selectedCustomerId.FullName,
        CustomerDescription: "",
        Projects:projectList,
        Status: true,
        CreatedBy: UserId,
        UserIds: selectedUsers.map((item) => item.Id),
        ...(actionMode === "Edit"
          ? {
              ModifiedBy: UserId,
              ModifiedDt: moment().format("YYYY-MM-DD HH:mm:ss"),
            }
          : {
              CreatedBy: UserId,
            }),
      };
      const response = await dispatch(
        actions.UPSERT_CUSTOMER_PROJECT_MAPPING(payload)
      );
      if (!response?.payload?.error) {
        alert("Inserted Successfully");
      } else {
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  console.log("Selected Users:", selectedUsers);
  console.log("CustomerId", selectedCustomerId);
  console.log("ProjectId", selectedProjectId);

  const handleSubmit = () => {
    console.log("Selected Users:", selectedUsers);
    console.log("CustomerId", selectedCustomerId);
    console.log("ProjectId", selectedProjectId);
    console.log("unselectedUsers", unselectedUsers);

    handleUpsertCustomerProjectMapping();
    fetchCustomerProjectMapping();
    setShowMappingComp(false);
    setActionMode("");
    // window.location.reload();
  };

  const handleCancel = () => {
    setShowMappingComp(false);
    setActionMode("");
    fetchCustomerProjectMapping();
    // window.location.reload();
    // setSelectedUsers([]); // Clear selected users
    // alert("Selection cleared!");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Panels Container */}
      <div
        className="panels-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Customer Panel */}
        <div
          className="panel customer-panel"
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "20px",
            background: "#f9f9f9",
            height: "400px",
            overflowY: "auto",
          }}
        >
          <h2>Customer Listing</h2>
          <List
            key={actionMode}
            dataSource={customers}
            displayExpr={(item) => item.FullName || "Unknown"}
            valueExpr="CustomerId"
            onItemClick={handleCustomerSelection}
            // selectionMode={actionMode === "Edit" ? "none" : "single"}
            selectionMode="single"
            // searchEnabled={true}
            height={300}
            selectedItemKeys={[selectedCustomerId?.CustomerId]}
            itemRender={(item) => {
              const isSelected =
                item.CustomerId === selectedCustomerId?.CustomerId;
              return (
                <div
                  style={{
                    backgroundColor: isSelected ? "#D0E8FF" : "transparent", // Highlight selected item with a light blue background
                    padding: "5px",
                    borderRadius: "4px",
                  }}
                >
                  {item.FullName || "Unknown"}
                </div>
              );
            }}
          />
        </div>

        {/* Project Panel */}
        <div
          className="panel project-panel"
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "20px",
            background: "#f9f9f9",
            height: "400px",
            overflowY: "auto",
          }}
        >
          <h2>Project Listing</h2>
          {selectedCustomerId ? (
            <List
              key={actionMode}
              dataSource={projects}
              displayExpr="ProjectName"
              valueExpr="ProjectId"
              selectionMode="multiple"
              //   searchEnabled={true}
              height={300}
              //   onItemClick={handleProjectSelection}
              showSelectionControls={true}
              onSelectionChanged={handleProjectSelection}
              //   selectedItemKeys={[selectedProjectId?.ProjectId]}
              selectedItemKeys={selectedProjectId.map((selectedProject) =>
                projects.find((project) => project.ProjectId === selectedProject.ProjectId)
              )}
              
            />
          ) : (
            <p>Select a customer to view projects.</p>
          )}
        </div>

        {/* User Panel */}
        <div
          className="panel user-panel"
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "20px",
            background: "#f9f9f9",
            height: "400px",
            overflowY: "auto",
          }}
        >
          <h2>User Listing</h2>
          {selectedProjectId.length > 0 ? (
            <List
              dataSource={users}
              displayExpr="Name"
              valueExpr="Id"
              selectionMode="multiple"
              //   searchEnabled={true}
              showSelectionControls={true}
              height={300}
              onSelectionChanged={handleUserSelectionChange}
              //   selectedItemKeys={[users[1],users[2]]}
              selectedItemKeys={selectedUsers.map((selectedUser) =>
                users.find((user) => user.Id === selectedUser.Id)
              )}
            />
          ) : (
            <p>Select a projects to view users.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="action-buttons"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <Button
          text={actionMode === "Edit" ? "Update" : "Submit"}
          type="default"
          onClick={handleSubmit}
        />
        <Button text="Cancel" type="normal" onClick={handleCancel} />
      </div>
    </div>
  );
};

export default CustomerProjectMappingComp;
