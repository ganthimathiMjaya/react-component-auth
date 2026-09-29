
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'; // Correct imports
import OrdersMasterDetail from "./components/Service/OrdersMasterDetail";

const AppRoutes = (props) => {
  return (
    <HashRouter> {/* Wrap the app in HashRouter */}
      <Routes>
        <Route path="/" element={<OrdersMasterDetail />} />

      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;

