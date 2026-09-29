import React from 'react';
import LoadIndicator from 'devextreme-react/load-indicator';
 
const CustomLoadingPanel = ({ loading }) => {
  return (
    <>
      {loading && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              cursor: 'not-allowed',
            }}
          />
 
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <LoadIndicator
              show={loading}
              height={50}
              width={50}
            />
          </div>
        </>
      )}
    </>
  );
};
 
export default CustomLoadingPanel;