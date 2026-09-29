// Header.js
import React from 'react';
import '../App.css'; 
import arc_knol from '../assets/logo.png';

function Header() {
  return (
    <div className="main-header">
      <div className="logo-container">
        <img src={arc_knol} alt="Logo" className="logo" />
      </div>
      <h1 className="header-title"></h1>
    </div>
  );
}

export default Header;
