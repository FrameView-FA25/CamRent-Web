import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const MainLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="CamRent Logo" width="70" height="70" />
        </Link>
        <nav className="app-nav">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Home
          </Link>
          <Link to="/explore" className={isActive("/explore") ? "active" : ""}>
            Explore
          </Link>
          <Link
            to="/how-it-works"
            className={isActive("/how-it-works") ? "active" : ""}
          >
            How it works
          </Link>
          <Link
            to="/testimonials"
            className={isActive("/testimonials") ? "active" : ""}
          >
            Testimonials
          </Link>
          <Link to="/why-us" className={isActive("/why-us") ? "active" : ""}>
            Why Us
          </Link>
          <Link to="/contact" className={isActive("/contact") ? "active" : ""}>
            Contact
          </Link>
        </nav>
        <div className="header-menu">
          <button className="menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
