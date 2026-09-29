import React, { useEffect, useState } from "react";
import { TagBox } from "devextreme-react/tag-box";
import { Button } from "devextreme-react/button";
import { useDispatch } from "react-redux";
import actions from "../redux/actions/actions";
import { TextBox } from "devextreme-react/text-box";

const UserRole = ({
  editMode,
  editUserData,
  setSnackbar,
  handleClose,
  onSuccess,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({ user: "", roles: "" });
  const dispatch = useDispatch();
  const fetchRoleInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_ROLE_DETAILS_BY_APPID({
          appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        })
      );

      if (!response?.payload?.error) {
        const formattedRoles = response.payload?.data?.Data.map((role) => ({
          Id: role.RoleId,
          Name: role.RoleName,
        }));
        setRoles(formattedRoles);
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message || "Error fetching roles",
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

  const fetchUserRoleInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_USER_ROLES_BY_USERID({
          userId: editUserData?.userId,
        })
      );

      if (response?.payload?.data) {
        const formattedRoles = response.payload?.data?.Data?.UserRole.map(
          (role) => ({
            Id: role.RoleId,
            Name: role.RoleName,
          })
        );

        setSelectedUser(response.payload?.data?.Data?.UserId);
        setSelectedRoles(formattedRoles.map((role) => role.Id));
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message || "Error fetching roles",
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

  useEffect(() => {
    fetchRoleInfo();
    if (editMode) {
      fetchUserRoleInfo();
    }
  }, [dispatch, editMode]);

  const validateInputs = () => {
    let isValid = true;
    let userError = "";
    let rolesError = "";

    if (
      !selectedUser ||
      (typeof selectedUser === "string" && !selectedUser.trim())
    ) {
      userError = "User ID is required.";
      isValid = false;
    }

    if (selectedRoles.length === 0) {
      rolesError = "Please select at least one role.";
      isValid = false;
    }

    setErrors({ user: userError, roles: rolesError });
    return isValid;
  };

  const handleRoleChange = (event) => {
    const value = event.target.value;
    setSelectedRoles(value);
  };

  const handleCreateUserRole = async () => {
    try {
      const payload = {
        usertId: selectedUser,
        roleId: selectedRoles.join(","),
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        orgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
      };
      const response = await dispatch(actions.CREATE_USER_ROLE(payload));
      if (!response?.payload?.error) {
        setSnackbar({
          open: true,
          message: "User role created successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating role:", error);
      setSnackbar({
        open: true,
        message: "Error creating role.",
        severity: "error",
      });
    }
  };

  const handleUpdateUserRole = async () => {
    try {
      const payload = {
        id: editUserData?.id,
        usertId: selectedUser,
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        orgId: '9ba8241f-ab2c-4c1b-98be-81a97b165f00',
        roleId: selectedRoles.join(","),
      };
      const response = await dispatch(actions.UPDATE_USER_ROLE(payload));
      if (!response?.payload?.error) {
        setSnackbar({
          open: true,
          message: "User role updated successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error updating role:", error);
      setSnackbar({
        open: true,
        message: "Error updating role.",
        severity: "error",
      });
    }
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      if (editMode) {
        handleUpdateUserRole();
      } else {
        handleCreateUserRole();
      }
    }
  };

  const handleCancel = () => {
    setSelectedUser("");
    setSelectedRoles([]);
    setErrors({ user: "", roles: "" });
    handleClose();
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "300px",
        fontSize: "14px",
      }}
    >
      {/* <Typography variant="h6" gutterBottom>
        User Role Mapping
      </Typography> */}

      <TextBox
        value={selectedUser}
        onValueChanged={(e) => setSelectedUser(e.value)}
        placeholder="User ID"
        showClearButton={false}
        width="100%"
        height={36} // Adjust height to match size="small"
        stylingMode="outlined"
        validationMessageMode="always"
        className={errors.user ? "dx-error" : ""}
        hint={errors.user} // Tooltip for error message
        style={{
          fontSize: "14px",
          marginBottom: "24px", // Equivalent to marginBottom: 3 in Material-UI
        }}
      />

      {/* <TextField
        fullWidth
        margin="normal"
        label="User ID"
        name="selectedUser"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        size="small"
        error={!!errors.user}
        helperText={errors.user}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "14px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "14px",
          },
          marginBottom: 3,
        }}
      /> */}
      {/* 
      <Autocomplete
        multiple
        id="roles-autocomplete"
        options={roles}
        getOptionLabel={(option) => option.Name}
        value={roles.filter((role) => selectedRoles.includes(role.Id))}
        onChange={(event, newValue) => {
          const newSelectedIds = newValue.map((role) => role.Id);
          handleRoleChange({ target: { value: newSelectedIds } });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Roles"
            placeholder="Select roles"
            error={!!errors.roles}
            helperText={errors.roles || ""}
            size="small"
            sx={{
              "& .MuiAutocomplete-inputRoot": {
                fontSize: "14px",
              },
              "& .MuiAutocomplete-tag": {
                fontSize: "13px",
              },
            }}
          />
        )}
        sx={{
          marginBottom: 1,
        }}
      /> */}
      <TagBox
        dataSource={roles} // Roles data source
        displayExpr="Name" // Field to display as the label
        valueExpr="Id" // Field to bind to the selected values
        value={selectedRoles} // Selected roles
        onValueChanged={(e) => handleRoleChange({ target: { value: e.value } })} // Handle changes
        placeholder="Select roles"
        showClearButton={true}
        searchEnabled={true} // Enables searching within the dropdown
        multiline={true} // Allows multiple selection display in separate lines
        validationMessageMode="always"
        hint={errors.roles} // Tooltip for errors
        className={errors.roles ? "dx-error" : ""}
        style={{
          marginBottom: "8px", // Equivalent to marginBottom: 1
          fontSize: "14px",
        }}
      />
      {errors.roles && (
        <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          {errors.roles}
        </div>
      )}


      <div style={{ marginTop: "20px" }}>
        <Button
          text="Submit"
          style={{ marginRight: "10px", color: "white", fontSize: "14px" }}
          className="add-user-button"
          onClick={handleSubmit}
        />
        <Button text="Cancel" type="default" style={{
          fontSize: "14px",
        }} onClick={handleCancel} />
        {/* <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
          style={{ marginRight: "10px", fontSize: "14px" }}
          className="add-user-button"
        >
          Submit
        </Button> */}

        {/* <Button
          variant="outlined"
          size="small"
          sx={{
            fontSize: "14px",
          }}
          onClick={handleCancel}
        >
          Cancel
        </Button> */}
      </div>
    </div>
  );
};

export default UserRole;
