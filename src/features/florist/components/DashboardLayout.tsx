import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardLogo } from "./DashboardLogo";
import { DashboardNavigation } from "./DashboardNavigation";
import { CollapseButton } from "./CollapseButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isHome, setIsHome] = useState(location.pathname === "/");

  const handleHomeClick = () => {
    if (isHome) {
      navigate("/florist-dashboard");
    } else {
      navigate("/");
    }
    setIsHome(!isHome);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={cn(
          "fixed left-0 top-0 z-20 h-full bg-white shadow-lg transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          <DashboardLogo collapsed={collapsed} />
          <DashboardNavigation 
            collapsed={collapsed} 
            handleHomeClick={handleHomeClick}
            isHome={isHome}
          />
          <CollapseButton 
            collapsed={collapsed} 
            onToggle={() => setCollapsed(!collapsed)} 
          />
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-300 bg-gray-50",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  );
};