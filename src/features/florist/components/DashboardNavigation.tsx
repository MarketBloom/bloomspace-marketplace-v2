import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDashboardMenuItems } from "./DashboardMenuItems";

interface DashboardNavigationProps {
  collapsed: boolean;
  handleHomeClick: () => void;
  isHome: boolean;
}

export const DashboardNavigation = ({
  collapsed,
  handleHomeClick,
  isHome,
}: DashboardNavigationProps) => {
  const navigate = useNavigate();
  const menuItems = getDashboardMenuItems(handleHomeClick, isHome);

  const handleItemClick = (path: string, label: string) => {
    if (label === "Homepage") {
      handleHomeClick();
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="flex-1 px-4 py-6">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-gray-100",
                collapsed && "justify-center px-2"
              )}
              onClick={() => handleItemClick(item.path, item.label)}
            >
              <item.icon className={cn("h-5 w-5", item.className)} />
              <span
                className={cn(
                  "transition-opacity",
                  collapsed ? "hidden" : "block"
                )}
              >
                {item.label}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};