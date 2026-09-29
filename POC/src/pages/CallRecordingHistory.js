import React, { useState, useEffect } from "react";
import { DataGrid, Column, Button } from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import "devextreme/dist/css/dx.light.css";
import { useDispatch, useSelector } from "react-redux";
import { useGlobalContext } from "../Context/GlobalContext";
import { getCallrecordingDetail } from "../redux/CallrecordingSlice";
import CallFilterComponent from "../components/Callhistoryfilter";

const CallRecordingHistory = () => {
  const { globalDataStore } = useGlobalContext();
  const calldetails = useSelector((state) => state.call?.data);
  const customerId = 67;
  const projectId = globalDataStore.ProjectId;
  const username = "udhaya.a";
  const [callData, setcallData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchtypeval, setSearchTypeVal] = useState("claimNo");
  const dispatch = useDispatch();
  useEffect(() => {
    if (customerId && username) {
      dispatch(getCallrecordingDetail({ customerId, username,projectId }));
    }
  }, [dispatch, customerId, username]);
  useEffect(() => {
    setcallData(Array.isArray(calldetails) ? calldetails[0]?.callData : []);
  }, [calldetails]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Handle when the link is clicked to show the popup
  const handleLinkClick = (data) => {
    setPopupData(data); // Set clicked row data to state
    setPopupVisible(true); // Make the popup visible
  };

  // Close the popup
  const handlePopupClose = () => {
    setPopupVisible(false); // Hide the popup
    setPopupData(null); // Clear the popup data
  };
  const handleSearchTypeChange = (selectedValue) => {
    setSearchTypeVal(selectedValue);
  };

  const handleFilter = (dateRange, searchText, searchtypeval) => {
    const [startDate, endDate] = dateRange;
    const filtered = callData.filter((item) => {
      const callInitiatedTime = new Date(item.callInitiatedTime);

      const isAfterStartDate = startDate
        ? callInitiatedTime >= new Date(startDate)
        : true;
      const isBeforeEndDate = endDate
        ? callInitiatedTime <= new Date(endDate)
        : true;

      const isSearchMatch = searchText
        ? item[searchtypeval] &&
          item[searchtypeval]
            .toString()
            .toLowerCase()
            .includes(searchText.toLowerCase())
        : true;

      return isAfterStartDate && isBeforeEndDate && isSearchMatch;
    });
    setFilteredData(filtered); // Update filtered data
  };
  return (
    <div className="tab-content">
      <div id="home" className="tab-pane fade in active">
        <div className="flexboxpanel">
          <CallFilterComponent
            onFilter={handleFilter}
            searchtypeval={searchtypeval}
            handleSearchTypeChange={handleSearchTypeChange}
          />
          <div className="tabbox">
            <div className="tab-content Gridpanel clearfix grid_view_style">
              <DataGrid
                dataSource={filteredData}
                showBorders={true}
                columnAutoWidth={true}
              >
                <Column dataField="sno" />
                <Column dataField="claimNo" />
                <Column dataField="uniqueid" />
                <Column dataField="phoneNumber" />
                <Column dataField="callInitiatedTime" />
                <Column dataField="callEndTime" />
                <Column dataField="duration" />
                <Column dataField="agent" />
                <Column dataField="callDate" />
                <Column dataField="rowId" />
                <Column dataField="callDisposition" />
                <Column dataField="vendor" />
                <Column dataField="dataSource" />
                <Column
                  caption="Action"
                  cellRender={({ data }) => (
                    <a
                      href="#"
                      style={{ textDecoration: "underline", color: "blue" }}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        handleLinkClick(data); // Show the popup with data
                      }}
                    >
                      Click Here
                    </a>
                  )}
                />
              </DataGrid>
            </div>
          </div>

      {/* Popup component for showing details */}
      <Popup
        visible={popupVisible}
        onHiding={handlePopupClose} 
        width={400}
        height={230}
        showTitle={true}
        title="Call Details"
        dragEnabled={true}
      
      >
         <div  id="callrecording" className="popup-content">
        {popupData && (
         <div>
            <h3 className='player_heading1'>Unique ID: {popupData.uniqueid}</h3>
            <h4 className='player_heading2'>Claim No: {popupData.claimNo}</h4>

            {popupData.recordingURL && popupData.recordingURL !== 'No Recording available' && (
              <div>
                <audio style={{width:"100%"}} controls>
                  <source src={popupData.recordingURL} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
          )} 

                  {popupData.recordingURL === "No Recording available" && (
                    <p>No audio recording available.</p>
                  )}
                </div>
              )}
            </div>
          </Popup>
        </div>
      </div>
    </div>
  );
};

export default CallRecordingHistory;
