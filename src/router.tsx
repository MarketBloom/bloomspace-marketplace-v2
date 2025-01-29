import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FloristSignup from "./pages/FloristSignup";
import CustomerSignup from "./pages/CustomerSignup";
import BecomeFlorist from "./pages/BecomeFlorist";
import FloristDashboard from "./pages/FloristDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import StoreManagement from "./pages/StoreManagement";
import DeliverySettings from "./pages/DeliverySettings";
import Cart from "./pages/Cart";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import FloristDetail from "./pages/FloristDetail";
import FloristApplication from "./pages/FloristApplication";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationReview from "./pages/admin/ApplicationReview";
import FloristManagement from "./pages/admin/FloristManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import FloristOrders from "./pages/FloristOrders";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/florist-signup",
    element: <FloristSignup />,
  },
  {
    path: "/customer-signup",
    element: <CustomerSignup />,
  },
  {
    path: "/become-florist",
    element: <FloristApplication />,
  },
  {
    path: "/florist-dashboard",
    element: <FloristDashboard />,
  },
  {
    path: "/customer-dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/store-management",
    element: <StoreManagement />,
  },
  {
    path: "/delivery-settings",
    element: <DeliverySettings />,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/product/:id",
    element: <ProductDetail />,
  },
  {
    path: "/florist/:id",
    element: <FloristDetail />,
  },
  {
    path: "/orders",
    element: <FloristOrders />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/applications",
    element: <ApplicationReview />,
  },
  {
    path: "/admin/florists",
    element: <FloristManagement />,
  },
  {
    path: "/admin/orders",
    element: <OrderManagement />,
  },
  {
    path: "/admin/customers",
    element: <CustomerManagement />,
  },
]);