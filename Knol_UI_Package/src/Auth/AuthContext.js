// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);  // Track loading state

    useEffect(() => {
        const storedAuthStatus = sessionStorage.getItem('isAuthenticated');
        if (storedAuthStatus === 'true') {
            setIsAuthenticated(true);
        }
        setLoading(false);  // Authentication status has been loaded
    }, []);

    const login = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAuthenticated', 'true');
    };

    const logout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('isAuthenticated');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
