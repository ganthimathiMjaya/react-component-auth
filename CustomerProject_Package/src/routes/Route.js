// Route.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Repository from '../Pages/Repository';
import Permission from '../Pages/Permission';
import Roles from '../Pages/Roles';
import Users from '../Pages/Users';
import CustomerProjectMapping from '../Pages/CustomerProjectMapping';

const AppRoutes = () => {
  
  return (
    <div>
      <Routes>
      <Route path="/repository" element={<Repository />} />
      <Route path="/permission" element={<Permission />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/users" element={<Users />} />
      <Route path='/customerprojectMapping' element={<CustomerProjectMapping />} />
      <Route path="*" element={<Navigate to="/repository" />} />
    </Routes>
    </div>
  );
};

export default AppRoutes;
