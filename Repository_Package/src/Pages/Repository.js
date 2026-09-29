import React, { useState, useEffect } from "react";
import TreeViewComponent from "../components/TreeViewComponent";
import OverlayForm from "../components/OverlayForm";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/actions/actions";
import SnackbarComponent from "../components/SnackbarComponent";
import { GetAppRepositoryByAppId } from "../utils/constants"
import 'devextreme/dist/css/dx.light.css';
import '../App.css'
import Button from 'devextreme-react/button';
import { Box } from 'devextreme-react/box';

const Repository = () => {
  const [appRepoDetails, setAppRepoDetails] = useState(null);
  const [isOverlayPageOpen, setIsOverlayPageOpen] = useState(false);
  const loading = useSelector((state) => state.appRepository.fetchAppRepository.loading);
  const openOverlayPage = () => setIsOverlayPageOpen(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'info', 'success', 'warning', 'error'
  });
  const dispatch = useDispatch();
  const fetchRepositoryData = async () => {
    try {
      const response = await dispatch(
        actions.FETCH_APP_REPOSITORY({ appId: '35fb0de3-0f90-4acd-8994-63766ec99c6c' })
      );
      console.log("response", response)
      if (!response.payload?.error) {
        setAppRepoDetails(response.payload?.data);
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

  useEffect(() => {
    fetchRepositoryData();
  }, [dispatch]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };


  return (
    <>
    <div
      style={{
        padding: '24px',  // equivalent to MUI's padding: 3
        margin: '24px',   // equivalent to MUI's margin: 3
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Mimic Paper's elevation
        backgroundColor: '#fff', // Similar to Paper's default background color
        borderRadius: '8px', // Optional: Adds rounded corners
      }}
    >
        {!isOverlayPageOpen ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>
                Repository
              </h2>
              <Button
                text="Add New Repo"
                onClick={openOverlayPage}
                width="auto"
                stylingMode="contained"
                className="add-user-button"
                style={{ fontSize: "14px", color: "fff" }}
              />
            </div>
            <hr
              style={{
                borderTop: '1px solid #e0e0e0', // Similar to Divider appearance
                margin: '16px 0', // Margin for vertical spacing
              }}
            />
            <div
              style={{
                height: "calc(80vh - 100px)",
                overflowY: "auto",
                padding: "10px",
                minWidth: 250,
                boxSizing: "border-box",
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 352,
                  }}
                >
                  <Button
                    icon="refresh"
                  />                </div>
              ) : appRepoDetails?.Data ? (
                <TreeViewComponent
                  dataSource={appRepoDetails?.Data}
                  appRepoDetails={appRepoDetails}
                  setSnackbar={setSnackbar}
                  refreshData={fetchRepositoryData}
                />
              ) : (
                <h2
                  style={{
                    fontSize: '14px',
                    color: '#757575', // This matches Material UI's textSecondary color
                    margin: 0,
                  }}
                >
                  No repository data available.
                </h2>
              )}
            </div>

          </>
        ) : (
          <OverlayForm
            GetAppRepositoryByAppId={appRepoDetails}
            setIsOverlayPageOpen={setIsOverlayPageOpen}
            setSnackbar={setSnackbar}
            refreshData={fetchRepositoryData}
          />
        )}
      </div>
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onCloseCallback={handleCloseSnackbar}
      />
    </>
  );
};

export default Repository;
