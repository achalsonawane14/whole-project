import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import "../styles/MainPage.css";
import costLogo from "../components/AWS/cost_logo.jpg";
import serviceLogo from "../components/AWS/service_logo.jpg";
import utilizerLogo from "../components/AWS/utilizer_logo.png";
import optimizationLogo from "../components/AWS/optimization_logo.png";
import accountLogo from "../components/AWS/account_logo.png";

const Sidebar = () => {
  const history = useHistory();
  const location = useLocation();

  // Extract selected dashboard from URL query params
  const params = new URLSearchParams(location.search);
  const selectedDashboard = params.get("dashboard");

  const menuItems = [
    { name: "Cost Usage", img: costLogo, },
    { name: "Service", img: serviceLogo }, // Changed path to aws_dashboard
    { name: "Low Utilization", img: utilizerLogo, path: "/UnusedService_AWS" }, // Added path to unused.js
    { name: "Optimization", img: optimizationLogo },
    { name: "Account", img: accountLogo },
  ];

  return (
    <div className="sidebar">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="sidebar-item"
          onClick={() => item.path && history.push(item.path)} // Navigates only if path exists
        >
          <img src={item.img} alt={item.name} className="sidebar-icon" />
          <span className="sidebar-text">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
