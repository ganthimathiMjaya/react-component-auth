import React, { useState, useEffect } from "react";
import { DataGrid } from "devextreme-react/data-grid";
import "devextreme/dist/css/dx.light.css";
import { useDispatch, useSelector } from "react-redux";
import { useGlobalContext } from "../../Context/GlobalContext";
import { getCallrecordingDetail } from "../../redux/CallrecordingSlice";
import Reportsfilter from "../../components/reportsfilter";

const ReportsComp = () => {
  const { globalDataStore } = useGlobalContext();
  const calldetails = useSelector((state) => state.call?.data);
  const customerId = globalDataStore.CustomerId;
  const projectId = globalDataStore.ProjectId;
  const [callData, setcallData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    if (customerId && projectId) {
      //dispatch(getCallrecordingDetail({ customerId, projectId }));
    }
  }, [dispatch, customerId, projectId]);
  useEffect(() => {
    setcallData(Array.isArray(calldetails) ? calldetails[0]?.callData : []);
  }, [calldetails]); 
  const handleFilter = (dateRange) => {
    const [startDate, endDate] = dateRange;
    const filtered = callData.filter((item) => {
      const callInitiatedTime = new Date(item.callInitiatedTime);

      const isAfterStartDate = startDate
        ? callInitiatedTime >= new Date(startDate)
        : true;
      const isBeforeEndDate = endDate
        ? callInitiatedTime <= new Date(endDate)
        : true;
      return isAfterStartDate && isBeforeEndDate;
    });
    setFilteredData(filtered); // Update filtered data
  };
  return (
    <div className="tab-content">
      <div id="home" className="tab-pane fade in active">
        <div className="flexboxpanel">
          <Reportsfilter
            onFilter={handleFilter}
          />
          <div className="tabbox">
            <div className="tab-content Gridpanel clearfix grid_view_style">
              <DataGrid
                dataSource={filteredData}
                showBorders={true}
                columnAutoWidth={true}
              >
              </DataGrid>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsComp;
