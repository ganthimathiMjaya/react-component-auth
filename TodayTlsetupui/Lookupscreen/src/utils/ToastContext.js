import React, { createContext, useState, useContext } from "react";
import ToastNotification from "../components/ToastNotification";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toastConfig, setToastConfig] = useState({
        message: "",
        type: "info",
        visible: false,
    });

    const showToast = (message, type = "info") => {
        setToastConfig({ message, type, visible: true });
    };

    const hideToast = () => {
        setToastConfig((prev) => ({ ...prev, visible: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastNotification
                message={toastConfig.message}
                type={toastConfig.type}
                visible={toastConfig.visible}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
