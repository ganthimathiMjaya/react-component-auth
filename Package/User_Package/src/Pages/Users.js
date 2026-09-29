import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import { DataGrid, Column, Pager, Paging } from "devextreme-react/data-grid";
import UserRole from "../components/UserRole";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/actions/actions";
import SnackbarComponent from "../components/SnackbarComponent";

const Users = () => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editUserData, setEditUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // Current page (0-based index)
    pageSize: 5, // Number of rows per page
  });
  const dispatch = useDispatch();
  const loading = useSelector(
    (state) => state.userRole.fetchUserRolesByAppId.loading
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'info', 'success', 'warning', 'error'
  });
  const fetchUserRoleInfo = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_USER_ROLES_BY_APPID({
          appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c',
        })
      );
      if (!response?.payload?.error) {
        const formattedData = response.payload.data.Data.map((user) => ({
          id: user.Id,
          userId: user.UserId,
          rolename:
            user.UserRole.length > 0
              ? user.UserRole.map((role) => role.RoleName).join(", ")
              : "No Role",
        }));

        setUserData(formattedData);
      } else {
        setUserData(null);
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

  useEffect(() => {
    fetchUserRoleInfo();
  }, [dispatch]);

  const handlePageChange = (params) => {
    setCurrentPage(params.page);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setEditMode(false);
  };

  const handleEdit = (user) => {
    setEditUserData(user);
    setOpenModal(true);
    setEditMode(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditUserData(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // const columns = [
  //   {
  //     field: "id",
  //     headerName: "ID",
  //     width: 100,
  //     sortable: false,
  //   },
  //   { field: "userId", headerName: "User Id", flex: 1 },
  //   { field: "rolename", headerName: "Role Name", flex: 1 },
  //   {
  //     field: "action",
  //     headerName: "Action",
  //     width: 100,
  //     renderCell: (params) => (
  //       <EditNoteIcon
  //         style={{ cursor: "pointer" }}
  //         onClick={() => handleEdit(params.row)}
  //       />
  //     ),
  //   },
  // ];
  const handlePaginationChange = (model) => {
    setPaginationModel(model);
  };
  return (
    <div className="table-container">
      <div className="table-header">
        <h1 className="table-heading">Users</h1>
        <Button
          text="Add User Role Mapping"
          className="add-user-button"
          stylingMode="contained"
          onClick={handleOpenModal}
        />
      </div>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          dataSource={userData}
          showBorders={true}
          keyExpr="id"
          rowAlternationEnabled={true}
          hoverStateEnabled={true}
          onRowClick={(e) => handleEdit(e.data)}
          focusedRowEnabled={true}
          loading={loading}
        >
          <Column dataField="id" caption="ID" width={100} />
          <Column dataField="userId" caption="User Id" />
          <Column dataField="rolename" caption="Role Name" />
          <Column
            type="buttons"
            caption="Action"
            buttons={[
              {
                hint: "Edit",
                icon: "edit",
                onClick: (e) => handleEdit(e.row.data),
              },
            ]}
          />
          <Paging defaultPageSize={rowsPerPage} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />
        </DataGrid>
      </div>
      <Popup
        visible={openModal}
        onHiding={handleCloseModal}
        dragEnabled={true}
        closeOnOutsideClick={true}
        showCloseButton={true}
        title={editMode ? "Edit User Role" : "Add User Role"}
        width={400}
        height="auto"
      > <UserRole
          setSnackbar={setSnackbar}
          editUserData={editUserData}
          editMode={editMode}
          handleClose={handleCloseModal}
          onSuccess={fetchUserRoleInfo}
        />
      </Popup>

      {/* <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="user-role-model"
        aria-describedby="add-new-user-role"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "8px",
          }}
        >
          <UserRole
            setSnackbar={setSnackbar}
            editUserData={editUserData}
            editMode={editMode}
            handleClose={handleCloseModal}
            onSuccess={fetchUserRoleInfo}
          />
        </Box>
      </Modal> */}
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onCloseCallback={handleCloseSnackbar}
      />
    </div>
  );
};

export default Users;
