'use client'
import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Collapse,
  NavbarToggler,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { FaBell } from "react-icons/fa"; // Importing a notification icon
import styles from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { keycloakAuthenticated, logoutKeycloak } from "../../../services/keycloak.ts";

interface MainNavbarProps { }

const MainNavbar: React.FC<MainNavbarProps> = () => {
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [hideNavbar, setHideNavbar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleTabClick = (tabName: string): void => {
    if(tabName === "Logout") {
      logoutKeycloak();
      return;
    }
    setActiveTab(tabName);
    navigate(`/${tabName}`);
  };

  const handleScroll = () => {
    if (isOpen) {
      return;
    }
  
    const currentScrollY = window.scrollY;
    if (currentScrollY > scrollY) {
      setHideNavbar(true);
    } else {
      setHideNavbar(false);
    }
    setScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollY]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div>
      <Navbar 
  dark expand="md" 
  className={`${styles.mainNavbar} ${hideNavbar && !isOpen ? styles.navbarHidden : ""}`}
>
  <div className="container-fluid d-flex justify-content-between align-items-center">
    {/* Left - Dropdown Menu */}
    <div className="order-1">
      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
        <DropdownToggle color="transparent" className={styles.dropdownToggle}>
          <i className="fa fa-bars"></i>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Destinations</DropdownItem>
            {[
              'Home',
              'Gallery',
              'Statistics', 
              'Manage-factors',
              'Account',
              'Settings',
              keycloakAuthenticated() ? 'Logout' : 'Login'
            ].map((item) => (
            <DropdownItem 
              key={item}
              onClick={() => handleTabClick(item)}
            >
              {item}
            </DropdownItem>
            ))}
        </DropdownMenu>
      </Dropdown>
    </div>

    {/* Center - Brand */}
    <div className="order-2 mx-auto d-flex align-items-center">
      <NavbarBrand className={styles.brand}>
        <p className="text-black font-light mb-0">
          <span className="font-bold"> {window.location.pathname.replace("/","").trimStart()}</span>
        </p>
      </NavbarBrand>
    </div>

    {/* Right - Notification Icon */}
    <div className="order-3">
      <div 
      className={styles.notificationIcon} 
      onClick={() => navigate('/notification')} 
      role="button"
      aria-label="Notification"
      >
      <FaBell />
      </div>
    </div>
  </div>
</Navbar>
    </div>
  );
};

export default MainNavbar;