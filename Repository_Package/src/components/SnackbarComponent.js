import React, { useState, useEffect } from 'react';
import Toast from 'devextreme-react/toast'; // Import Toast component from devextreme

const SnackbarComponent = ({ open, message, severity = 'info', duration = 6000, onCloseCallback }) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseCallback) {
      onCloseCallback();
    }
  };

  // Mapping severity to Toast type
  const toastType = severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info';

  return (
    <Toast
      visible={isOpen} // Use 'visible' to control Toast visibility
      message={message} // Message to display in Toast
      type={toastType} // Set the severity type ('info', 'warning', 'error', 'success')
      displayTime={duration} // Duration for which the Toast is displayed
      onHiding={handleClose} // Callback function when the Toast hides
      width="300px"
      position={{ my: 'top right', at: 'top right' }} // Position of Toast (top-right)
    />
  );
};

export default SnackbarComponent;



