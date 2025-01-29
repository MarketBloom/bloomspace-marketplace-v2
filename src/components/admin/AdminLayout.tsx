import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  UserCircle,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const AdminLayout = ({ children, currentPage }: AdminLayoutProps) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admin",
    },
    {
      title: "Applications",
      icon: <FileText className="w-4 h-4" />,
      path: "/admin/applications",
    },
    {
      title: "Florists",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/florists",
    },
    {
      title: "Orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      path: "/admin/orders",
    },
    {
      title: "Customers",
      icon: <UserCircle className="w-4 h-4" />,
      path: "/admin/customers",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="mt-4">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={currentPage === item.title ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 rounded-none"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.title}
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};