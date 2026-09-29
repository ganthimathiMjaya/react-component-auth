import React, { useState, useEffect } from "react";
import { List as DxList } from "devextreme-react/list";
import TagBox from "devextreme-react/tag-box";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import { useDispatch } from "react-redux";
import actions from "../redux/actions/actions";
import SnackbarComponent from "../components/SnackbarComponent";

const RolesPage = () => {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'info', 'success', 'warning', 'error'
  });

  const fetchPermissionInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_PERMISSION_INFO({ appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c' })
      );
      if (!response?.payload?.error) {
        setPermissions(response.payload?.data?.Data);
      } else {
        setPermissions(null);
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching permission data:", error);
    }
  };

  const fetchRoleInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_ROLE_DETAILS_BY_APPID({
          appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        })
      );
      if (!response?.payload?.error) {
        setRoles(response.payload?.data?.Data);
      } else {
        setRoles(null);
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching role data:", error);
      setSnackbar({
        open: true,
        message: "Error fetching role data",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchRoleInfo();
    fetchPermissionInfo();
  }, [dispatch]);

  const handleSearch = (e) => {
    const term = e.value.toLowerCase(); // Access the search term from the event
    setSearchTerm(term);
  };
  const filteredRoles = roles?.filter((role) =>
    role.RoleName.toLowerCase().includes(searchTerm)
  );

  const handlePermissionChange = (event) => {
    setSelectedPermissions(event.value);
  };

  const handleRoleNameChange = (event) => {
    setRoleName(event.value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!roleName.trim()) {
      newErrors.roleName = "Role Name is required.";
    }
    if (selectedPermissions.length === 0) {
      newErrors.selectedPermissions =
        "At least one permission must be selected.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleCreate = async () => {
    try {
      const payload = {
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        OrgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
        roleName,
        permissionId: selectedPermissions.join(","),
      };
      const response = await dispatch(actions.CREATE_ROLE(payload));
      if (!response?.payload?.error) {
        setSnackbar({
          open: true,
          message: "Role Created Successfully",
          severity: "success",
        });
        fetchRoleInfo();
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating role:", error);
      setSnackbar({
        open: true,
        message: "Error in creating role",
        severity: "error",
      });
    }
  };

  const handleRoleUpdate = async () => {
    try {
      const payload = {
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        roleId,
        OrgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
        roleName,
        permissionId: selectedPermissions.join(","),
      };
      const response = await dispatch(actions.UPDATE_ROLE(payload));

      if (!response?.payload?.error) {
        setSnackbar({
          open: true,
          message: "Role Updated Successfully",
          severity: "success",
        });
        fetchRoleInfo();
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating role:", error);
      setSnackbar({
        open: true,
        message: "Error in updating role",
        severity: "error",
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (editMode) {
        handleRoleUpdate();
      } else {
        handleRoleCreate();
      }
      fetchRoleInfo();
      setRoleName("");
      setSelectedPermissions([]);
      setEditMode(false);
      setErrors({});
    }
  };

  const handleEditClick = (role) => {
    setRoleName(role.RoleName);
    const selectedPermissionIds = role.Permissions.map(
      (permission) => permission.PermissionId
    );
    setSelectedPermissions(selectedPermissionIds);
    setRoleId(role.RoleId);
    setEditMode(true);
  };

  return (
    <div
      style={{
        display: "flex", // Equivalent to Box's display="flex"
        minHeight: "80vh", // Sets the minimum height
        backgroundColor: "#f5f5f5", // Background color
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "25%",
          backgroundColor: "white",
          padding: "16px", // Padding: p={2} is equivalent to 16px
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Approximation of boxShadow={3}
          borderRadius: "8px", // borderRadius={2} is equivalent to 8px
          maxHeight: "calc(100vh - 64px)", // Maximum height
          overflowY: "auto", // Vertical scrolling
          marginRight: "16px", // mr={2} is equivalent to 16px
        }}
      >
        <h2 style={{ fontSize: "14px" }}>
          {`${filteredRoles?.length ?? 0} Roles`}
        </h2>

        <TextBox
          value={searchTerm}
          onValueChanged={(e) => handleSearch(e)}
          placeholder="Search roles"
          width="100%"
          showClearButton={true}
        />
        {/* <TextField
          label="Search"
          variant="outlined"
          fullWidth
          size="small"
          margin="normal"
          value={searchTerm}
          onChange={handleSearch}
        /> */}
         <DxList
      dataSource={filteredRoles} // Use filteredRoles as the data source
      itemRender={(role) => (
        <div key={role?.RoleId}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              padding: "8px 0",
            }}
          >
            <span style={{ fontSize: "14px" }}>{role?.RoleName}</span>
            <Button
              icon="edit" style={{padding:'4px'}}
              onClick={() => handleEditClick(role)}
               // Adds an outlined button style (like Material's IconButton)
            />
          </div>
          {/* <hr
            style={{
              border: "1px solid #e0e0e0",
              margin: "16px 0",
            }}
          /> */}
        </div>
      )}
    />
        {/* <List>
          {filteredRoles?.map((role) => (
            <div key={role?.RoleId}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                <ListItemText
                  primary={role?.RoleName}
                  primaryTypographyProps={{
                    fontSize: "14px",
                  }}
                />
                <IconButton onClick={() => handleEditClick(role)}>
                  <Edit />
                </IconButton>
              </ListItem>
              <hr style={{ border: "1px solid #e0e0e0", margin: "16px 0" }} />
            </div>
          ))}
        </List> */}
      </div>

      {/* Main Content */}
      <div
        style={{
          width: "75%", // Matches width="75%"
          backgroundColor: "white", // Matches bgcolor="white"
          padding: "16px", // Matches p={2} (padding of 16px)
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Approximation of boxShadow={3}
          borderRadius: "8px", // Matches borderRadius={2} (8px)
          maxHeight: "calc(100vh - 64px)", // Matches maxHeight
          overflowY: "auto", // Matches overflowY="auto"
        }}
      >
        <h4 style={{ fontSize: "16px", marginBottom: "16px" }}>
          {editMode ? "Update Role" : "Add New Role"}
        </h4>

        <hr style={{ border: "1px solid #e0e0e0", margin: "16px 0" }} />
        <div
          style={{
            display: "flex", // Matches display="flex"
            flexDirection: "column", // Matches flexDirection="column"
            alignItems: "flex-start", // Matches alignItems="flex-start"
            marginTop: "16px", // Matches sx={{ mt: 2 }} (2 * 8px = 16px)
          }}
        >
          <TextBox
            value={roleName}
            onValueChanged={handleRoleNameChange}
            placeholder="Role Name"
            width="100%"
            invalid={!!errors.roleName}
            message={errors.roleName}
          />
          <TagBox style={{ marginTop: "20px" }}
            value={selectedPermissions}
            onValueChanged={handlePermissionChange}
            dataSource={permissions}
            displayExpr="Name"
            valueExpr="PermissionId"
            searchEnabled={true}
            placeholder="Select permissions"
            width="100%"
            showClearButton={true}
            invalid={!!errors.selectedPermissions}
            message={errors.selectedPermissions}
          />

          {/* <TextField
            label="Role Name"
            value={roleName}
            onChange={handleRoleNameChange}
            variant="outlined"
            fullWidth
            error={!!errors.roleName}
            helperText={errors.roleName}
            size="small"
            sx={{
              mb: 2,
              "& .MuiInputBase-input": { fontSize: "14px" },
              "& .MuiInputLabel-root": { fontSize: "14px" },
            }}
          />

          <Autocomplete
            multiple
            fullWidth
            size="small"
            limitTags={2} // Limit the number of tags displayed
            id="multiple-permissions"
            options={permissions} // Pass the permissions array
            getOptionLabel={(option) => option.Name} // Display permission names
            value={permissions.filter((permission) =>
              selectedPermissions.includes(permission.PermissionId)
            )} // Map selected IDs to permission objects
            onChange={(event, newValue) => {
              const newSelectedIds = newValue.map(
                (permission) => permission.PermissionId
              );
              handlePermissionChange({ target: { value: newSelectedIds } }); // Trigger change handler with IDs
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Permissions"
                placeholder="Select permissions"
                error={!!errors.selectedPermissions}
                helperText={errors.selectedPermissions || ""}
              />
            )}
            sx={{
              "& .MuiAutocomplete-inputRoot": {
                fontSize: "14px",
              },
              "& .MuiAutocomplete-tag": {
                fontSize: "13px",
              },
              marginBottom: 1,
            }}
          /> */}
          <div
            style={{
              display: "flex", // Matches display="flex"
              justifyContent: "flex-end", // Matches justifyContent="flex-end"
              width: "100%", // Matches style={{ width: "100%" }}
              marginTop: "2%", // Matches style={{ marginTop: "2%" }}
            }}
          >
            <Button
              text={editMode ? "Update" : "Submit"}
              className="add-user-button"
              onClick={handleSubmit}
              style={{ marginRight: "10px", fontSize: "14px", color: "white !important" }}
            />
            <Button
              text="Cancel"
              onClick={() => {
                setRoleName("");
                setSelectedPermissions([]);
                setEditMode(false);
              }}
            />
          </div>
        </div>
      </div>
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onCloseCallback={handleCloseSnackbar}
      />
    </div>
  );
};

export default RolesPage;
