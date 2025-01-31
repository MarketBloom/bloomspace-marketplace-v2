import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Spinner } from './components/ui/spinner';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FloristSignup from './pages/FloristSignup';
import CustomerSignup from './pages/CustomerSignup';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import FloristDetail from './pages/FloristDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import FloristDashboard from './pages/FloristDashboard';
import StoreManagement from './pages/StoreManagement';
import DeliverySettings from './pages/DeliverySettings';
import FloristOrders from './pages/FloristOrders';
import FloristApplication from './pages/FloristApplication';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationReview from './pages/admin/ApplicationReview';
import FloristManagement from './pages/admin/FloristManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'customer' | 'florist' | 'admin'>;
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  switch (user.role) {
    case 'florist':
      return <Navigate to="/florist-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/customer-dashboard" replace />;
  }
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/florist-signup" element={<FloristSignup />} />
      <Route path="/customer-signup" element={<CustomerSignup />} />
      <Route path="/search" element={<Search />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/florist/:id" element={<FloristDetail />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Customer Routes */}
      <Route
        path="/customer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Cart />
          </ProtectedRoute>
        }
      />

      {/* Florist Routes */}
      <Route
        path="/florist-dashboard"
        element={
          <ProtectedRoute allowedRoles={['florist']}>
            <FloristDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-management"
        element={
          <ProtectedRoute allowedRoles={['florist']}>
            <StoreManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery-settings"
        element={
          <ProtectedRoute allowedRoles={['florist']}>
            <DeliverySettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['florist']}>
            <FloristOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/become-florist"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <FloristApplication />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApplicationReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/florists"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FloristManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OrderManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CustomerManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
} 