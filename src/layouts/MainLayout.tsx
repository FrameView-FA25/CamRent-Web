import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import CameraLoginModal from "../components/Modal/ModalLogin";
import CameraRegisterModal from "@/components/Modal/ModalRegister";

import { Button } from "@mui/material";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const handleSwitchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };
  const handleSwitchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };
  return (
    <div className="app-shell">
      <header className="app-header flex items-center justify-between px-6 py-3 shadow-sm bg-white">
        {/* Logo */}
        <Link to="/" className="brand flex items-center gap-2">
          <img src="/logo.png" alt="CamRent Logo" width="60" height="60" />
          <span className="font-bold text-lg text-gray-800">CamRent</span>
        </Link>

        {/* Navigation - căn giữa */}
        <nav className="app-nav flex items-center gap-6">
          <Link
            to="/"
            className={
              isActive("/")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={
              isActive("/explore")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Explore
          </Link>
          <Link
            to="/how-it-works"
            className={
              isActive("/how-it-works")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            How it works
          </Link>
          <Link
            to="/testimonials"
            className={
              isActive("/testimonials")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Testimonials
          </Link>
          <Link
            to="/why-us"
            className={
              isActive("/why-us")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Why Us
          </Link>
          <Link
            to="/contact"
            className={
              isActive("/contact")
                ? "active text-yellow-500 font-semibold"
                : "text-gray-700 hover:text-yellow-500"
            }
          >
            Contact
          </Link>
        </nav>

        {/* Login button - góc phải đối xứng logo */}
        <Button
          onClick={() => setLoginOpen(true)}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: "#FACC15",
            color: "#111827",
            fontWeight: 700,
            borderRadius: 999,
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#EAB308" },
          }}
        >
          LOGIN
        </Button>

        {/* Menu toggle - chỉ dùng cho mobile */}
        <div className="header-menu hidden">
          <button className="menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* Modal Login */}
      <CameraLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={(cred) => {
          console.log("Login:", cred);
          setLoginOpen(false);
        }}
        onSwitchToRegister={handleSwitchToRegister}
      />
      {/* Modal Register */}
      <CameraRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={(cred) => {
          console.log("Register:", cred);
          setRegisterOpen(false);
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default MainLayout;
