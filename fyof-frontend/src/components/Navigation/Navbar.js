import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav>
      <div className="nav_bar">
        <div className="nav_header">
          <div className="logo nav_logo">
            <div><img src="/images/logo.png" alt="FYOFlogo" /></div>
            <div className="nav_menu_btn" id="menu-btn">
              <i className="fas fa-bars" style={{ fontSize: '24px', cursor: 'pointer' }}></i>
            </div>
          </div>
          <ul className="nav_links" id="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/login">Sign Up/log in</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 