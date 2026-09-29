import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import actions from "../redux/actions/actions";
import SnackbarComponent from "../components/SnackbarComponent";
import Button from 'devextreme-react/button';
import DataGrid, {
  Column,
  Selection,
  FilterRow,  Editing,
  Scrolling,
  MasterDetail,
} from 'devextreme-react/data-grid';
import { TextBox } from "devextreme-react/text-box";
import CheckBox from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import 'devextreme/dist/css/dx.light.css';

const Permission = () => {
  const [expanded, setExpanded] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [newPermission, setNewPermission] = useState("");
  const [checkedState, setCheckedState] = useState({});
  const [permissionMapping, setPermissionMapping] = useState("");
  const [errors, setErrors] = useState({});
  const [permissionIdvalue, setPermissionIdvalue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'info', 'success', 'warning', 'error'
  });
  const [appRepoDetails, setAppRepoDetails] = useState(null);

  const fetchPermissionInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_PERMISSION_INFO({ appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c' })
      );
      if (!response?.payload?.error) {
        setPermissions(response.payload?.data?.Data);
        setFilteredPermissions(response.payload?.data?.Data);
      } else {
        setPermissions(null);
        setFilteredPermissions(null);
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

  const fetchRepositoryData = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_APP_REPOSITORY({ appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c' })
      );
      if (!response.payload?.error) {
        setAppRepoDetails(response.payload?.data);
        setData(response.payload?.data?.Data);
      } else {
        setAppRepoDetails(null);
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching repository data:", error);
    }
  };

  const fetchPermissionMapping = async (Permission) => {
    debugger
    const { PermissionId } = Permission;
    setLoadingStates((prev) => ({ ...prev, [PermissionId]: true }));
    setPermissionIdvalue(PermissionId);
    try {
      const response = await dispatch(
        actions.FETCH_PERMISSION_MAPPING({ PermissionId: PermissionId })
      );
      if (!response.payload?.error) {
        const fetchedData = response.payload?.data;
        setAppRepoDetails(fetchedData);
        setData(fetchedData?.Data);

        const newCheckedState = {};
        fetchedData?.Data?.forEach((parent) => {
          const {
            RespositoryId,
            IsCreate,
            IsRead,
            IsUpdate,
            IsDelete,
            Children,
            MappingId,
            ParentId
          } = parent;
          // Check if any action is true for the parent
          const isParentChecked = IsCreate || IsRead || IsUpdate || IsDelete;

          // Set parent state
          newCheckedState[RespositoryId] = {
            checked: isParentChecked,
            Create: IsCreate,
            Read: IsRead,
            Update: IsUpdate,
            Delete: IsDelete,
            MappingId: MappingId ?? '',
            parentId: ParentId
          };

          // Process children
          Children?.forEach((child) => {
            const {
              RespositoryId: RespositoryId,
              IsCreate: childCreate,
              IsRead: childRead,
              IsUpdate: childUpdate,
              IsDelete: childDelete,
              Children: childChildren,
              MappingId: MappingId,
              ParentId: childParentId
            } = child;


            const isChildChecked =
              childCreate || childRead || childUpdate || childDelete;

            if (isChildChecked) {
              newCheckedState[RespositoryId] = {
                checked: isChildChecked,
                Create: childCreate,
                Read: childRead,
                Update: childUpdate,
                Delete: childDelete,
                MappingId: MappingId ?? '',
                parentId: childParentId
              };
            }

          });
        });


        // Update the checkbox state
        setCheckedState(newCheckedState);
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching repository data:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [PermissionId]: false }));
    }
  };


  useEffect(() => {
    fetchPermissionInfo();
    fetchRepositoryData();
  }, [dispatch]);


  const handleSearch = (event) => {
    const term = event.value.toLowerCase();
    setSearchTerm(term);
    setFilteredPermissions(
      permissions.filter((permission) =>
        permission.Name.toLowerCase().includes(term)
      )
    );
  };


  const handlePermissionToggle = (
    RespositoryId,
    isChild = false,
    parentId = null,
    MappingId
  ) => {
    setCheckedState((prev) => {
      const newState = { ...prev };

      const isChecked = !newState[RespositoryId]?.checked;
      newState[RespositoryId] = {
        checked: isChecked,
        Create: isChecked,
        Read: isChecked,
        Update: isChecked,
        Delete: isChecked,
        parentId: isChild ? parentId : '',
        MappingId: MappingId,
      };

      if (!isChild) {
        const parent = data.find((item) => item.RespositoryId === RespositoryId);
        parent?.Children?.forEach((child) => {
          newState[child.RespositoryId] = {
            checked: isChecked,
            Create: isChecked,
            Read: isChecked,
            Update: isChecked,
            Delete: isChecked,
            parentId: child?.ParentId,
            MappingId: child?.MappingId,
          };
        });
      }
      console.log("newState",)
      return newState;
    });
  };

  const handleActionToggle = (RespositoryId, action, MappingId) => {
    debugger
    setCheckedState((prev) => {
      const newState = { ...prev };

      if (!newState[RespositoryId]) {
        newState[RespositoryId] = {
          checked: false,
          Create: false,
          Read: false,
          Update: false,
          Delete: false,
          parentId: '',
          MappingId: MappingId,
        };
      }
      newState[RespositoryId][action] = !newState[RespositoryId][action];
      newState[RespositoryId].checked =
        newState[RespositoryId].Create ||
        newState[RespositoryId].Read ||
        newState[RespositoryId].Update ||
        newState[RespositoryId].Delete;

      return newState;
    });
  };

  const mappingCheckedState = (permissionId) => {
    return Object.entries(checkedState)
      .filter(([id, permission]) => permission.checked)
      .map(([id, permission]) => ({
        id: permission?.MappingId,
        repositoryId: id,
        isCreate: permission.Create,
        isRead: permission.Read,
        isUpdate: permission.Update,
        isDelete: permission.Delete,
        permissionId: permissionId,
        parentRepositoryId:
          permission.parentId === null ? '' : permission.parentId ?? '',
        permissionId: permissionId,
      }));
  };


  const mappingUpdateCheckedState = (permissionId) => {

    return Object.entries(checkedState)
      .filter(
        ([, permission]) =>
          permission.checked || permission?.MappingId !== ''
      )
      .map(([id, permission]) => ({
        id: permission?.MappingId,
        repositoryId: id,
        isCreate: permission.Create,
        isRead: permission.Read,
        isUpdate: permission.Update,
        isDelete: permission.Delete,
        parentRepositoryId:
          permission.parentId === null ? '' : permission.parentId ?? '',
        permissionId: permissionId,
      }));
  };


  const toggleExpand = (name) => {
    setExpanded((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handleCreatePermission = async () => {
    try {
      const payload = {
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        name: newPermission,
      };
      const response = await dispatch(actions.CREATE_PERMISSION(payload));
      if (!response?.payload?.error) {
        let permissionId = response?.payload?.data?.Data?.PermissionId;
        const mappingData = mappingCheckedState(permissionId);
        const repoResponse = await dispatch(
          actions.CREATE_REPOSITORY_PERMISSION_MAPPING(mappingData)
        );
        if (!repoResponse?.payload?.error) {
          fetchPermissionInfo();
          fetchRepositoryData();
          setNewPermission("");
          setCheckedState({});
          setSnackbar({
            open: true,
            message: "Permission and Repo Mappings Created Successfully",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: repoResponse?.payload?.message,
            severity: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating permission:", error);
      setSnackbar({
        open: true,
        message: "Error in creating permission",
        severity: "error",
      });
    }
  };

  const handleUpdatePermission = async (permissionId) => {
    try {
      const payload = {
        id: permissionId,
        appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        name: newPermission,
      };
      const response = await dispatch(actions.UPDATE_PERMISSION(payload));
      if (!response?.payload?.error) {
        let permissionId = response?.payload?.data?.Data?.PermissionId;
        const mappingData = mappingUpdateCheckedState(permissionId);
        const repoResponse = await dispatch(
          actions.UPDATE_REPOSITORY_PERMISSION_MAPPING(mappingData)
        );
        if (!repoResponse?.payload?.error) {
          fetchPermissionInfo();
          fetchRepositoryData();
          setNewPermission("");
          setCheckedState({});
          setSnackbar({
            open: true,
            message: "Permission and Repo Mappings Updated Successfully",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: repoResponse?.payload?.message,
            severity: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: response?.payload?.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating permission:", error);
      setSnackbar({
        open: true,
        message: "Error in creating permission",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = () => {
    if (editMode) {
      handleUpdatePermission(permissionIdvalue);
    } else {
      handleCreatePermission();
    }

    setCheckedState({});
    fetchPermissionInfo();
    fetchRepositoryData();
    setEditMode(false);
    setPermissionIdvalue(0);
  };

  const handleCancel = () => {
    setNewPermission("");
    setEditMode(false);
    setCheckedState({});
    fetchPermissionInfo();
    fetchRepositoryData();
  };

  const handlePermissionEdit = (permission) => {
    fetchPermissionMapping(permission);
    setNewPermission(permission.Name);
    setEditMode(true);
  };
  return (
    <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '16px' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '25%',
          backgroundColor: 'white',
          padding: '16px', // Equivalent to p={2}
          marginRight: '16px', // Equivalent to mr={2}
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // boxShadow={3} (approximated)
          borderRadius: '8px', // borderRadius={2} (8px)
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '14px' }}>
            {`${filteredPermissions?.length ?? 0} Permissions`}
          </h2>
        </div>

        <TextBox
          value={searchTerm}
          onValueChanged={handleSearch}  // DevExtreme uses `onValueChanged` instead of `onChange`
          placeholder="Search..."
          showClearButton={true}  // Shows the clear button (optional)
          width="100%"  // Makes the textbox full-width
          height={36}  // Optional, adjust based on your design
        />
        <List
          dataSource={filteredPermissions}
          itemRender={(permission, index) => (
            <div
              key={permission.PermissionId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                marginBottom: '8px', // Add some space between items
              }}
            >
              <span>{permission.Name}</span>
              <Button
                icon={loadingStates[permission.PermissionId] ? 'refresh' : 'edit'} // Conditional icon for loading or editing
                onClick={() => handlePermissionEdit(permission)}
                disabled={loadingStates[permission.PermissionId]}
                stylingMode="text" // Makes the button appear like an icon button
                width={40} // Optional: Set button size if required
              />
            </div>
          )}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: 'white', padding: '16px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>

        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>
          {editMode ? 'Edit Permission' : 'Add New Permission'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '10px' }}>

          <div style={{ width: '100%' }}>
            <TextBox
              value={newPermission}
              onValueChanged={(e) => setNewPermission(e.value)}
              placeholder="Permission Name"
              stylingMode="outlined"
              elementAttr={{
                style: { marginRight: '16px', fontSize: '14px', width: '800px' },
              }}
            />
          </div>
          <div>
            <Button
              text={editMode ? 'Update' : 'Submit'}
              onClick={handleSubmit}
              type="default"
              stylingMode="contained"
              elementAttr={{
                class: 'add-user-button',
                style: { marginRight: '8px', fontSize: '14px' },
              }}
            />
          </div>
          <div>
            <Button
              text="Cancel"
              onClick={handleCancel}
              stylingMode="outlined"
              elementAttr={{
                style: { fontSize: '14px' },
              }}
            />
          </div>
        </div>
        <DataGrid
        dataSource={data}
        showBorders={true}
        rowAlternationEnabled={true}
        height="calc(100vh - 150px)"
        keyExpr="RespositoryId"
        parentIdExpr="ParentId"
        allowColumnResizing={true}
      >
        <Editing mode="batch" allowUpdating={true} />
        <Selection mode="multiple" />

        {/* Columns */}
        <Column
          dataField="Name"
          caption="Repository"
          allowEditing={false}
          width="40%"
        />
        <Column
          dataField="Create"
          caption="Create"
          cellRender={({ data }) => (
            <input
              type="checkbox"
              checked={!!checkedState[data.RespositoryId]?.Create}
              onChange={() => handlePermissionToggle(data.RespositoryId, "Create")}
            />
          )}
        />
        <Column
          dataField="Read"
          caption="Read"
          cellRender={({ data }) => (
            <input
              type="checkbox"
              checked={!!checkedState[data.RespositoryId]?.Read}
              onChange={() => handlePermissionToggle(data.RespositoryId, "Read")}
            />
          )}
        />
        <Column
          dataField="Update"
          caption="Update"
          cellRender={({ data }) => (
            <input
              type="checkbox"
              checked={!!checkedState[data.RespositoryId]?.Update}
              onChange={() =>
                handlePermissionToggle(data.RespositoryId, "Update")
              }
            />
          )}
        />
        <Column
          dataField="Delete"
          caption="Delete"
          cellRender={({ data }) => (
            <input
              type="checkbox"
              checked={!!checkedState[data.RespositoryId]?.Delete}
              onChange={() =>
                handlePermissionToggle(data.RespositoryId, "Delete")
              }
            />
          )}
        />
      </DataGrid>
        {/* <TableContainer
          sx={{
            maxHeight: "calc(100vh - 230px)",
            overflowY: "auto",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Repository</TableCell>
                <TableCell>Create</TableCell>
                <TableCell>Read</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((parent) => (
                <React.Fragment key={parent?.RespositoryId}>
                  <TableRow>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(parent?.RespositoryId)}
                        >
                          {expanded[parent.RespositoryId] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </IconButton>
                        <Checkbox
                          checked={!!checkedState[parent?.RespositoryId]?.checked}
                          onChange={() =>
                            handlePermissionToggle(
                              parent?.RespositoryId,
                              parent?.MappingId
                            )
                          }
                        />
                        {parent?.Name}
                      </Box>
                    </TableCell>
                    {["Create", "Read", "Update", "Delete"].map((action) => (
                      <TableCell key={action}>
                        <Checkbox
                          checked={!!checkedState[parent?.RespositoryId]?.[action]}
                          onChange={() =>
                            handleActionToggle(
                              parent?.RespositoryId,
                              action,
                              parent?.MappingId
                            )
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                  {expanded[parent?.RespositoryId] &&
                    parent?.Children?.map((child) => (
                      <TableRow key={child?.RespositoryId}>
                        <TableCell>
                          <Box ml={4} display="flex" alignItems="center">
                            <Checkbox
                              checked={!!checkedState[child?.RespositoryId]?.checked}
                              onChange={() =>
                                handlePermissionToggle(
                                  child?.RespositoryId,
                                  true,
                                  parent?.RespositoryId,
                                  child?.MappingId
                                )
                              }
                            />
                            {child?.Name}
                          </Box>
                        </TableCell>
                        {["Create", "Read", "Update", "Delete"].map(
                          (action) => (
                            <TableCell key={action}>
                              <Checkbox
                                checked={!!checkedState[child?.RespositoryId]?.[action]}
                                onChange={() =>
                                  handleActionToggle(
                                    child?.RespositoryId,
                                    action,
                                    parent?.MappingId
                                  )
                                }
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}
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

export default Permission;
