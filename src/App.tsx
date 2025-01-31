import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/mobile/MobileNav';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FloristSignup from './pages/FloristSignup';
import CustomerSignup from './pages/CustomerSignup';
import FloristDashboard from './pages/FloristDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StoreManagement from './pages/StoreManagement';
import DeliverySettings from './pages/DeliverySettings';
import Cart from './pages/Cart';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import FloristDetail from './pages/FloristDetail';
import FloristApplication from './pages/FloristApplication';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationReview from './pages/admin/ApplicationReview';
import FloristManagement from './pages/admin/FloristManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import FloristOrders from './pages/FloristOrders';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-[#E8E3DD] text-[#4A4F41]">
              <Navbar />
              <MobileNav />
              <main className="flex-1 md:pt-16">
                <AppRoutes />
              </main>
              <Toaster />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App; 