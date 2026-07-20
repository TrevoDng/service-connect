import React from 'react';
import './nav.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">ServiceConnect</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
      </ul>
    </nav>
  );
};
