// Route.js
import React, { useState } from "react";
// import Landingpage from './Component/LandingPage';
import Login from './components/Login';
import { AuthProvider } from './Auth/AuthContext';


const App = () => (
<div className="login-body"> 
  <AuthProvider>   

 <Login />
 </AuthProvider>  
 </div>
);
export default App;
