import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#E8E3DD] backdrop-blur-md border-b border-[#4A4F41]/10 hidden md:block">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-[#4A4F41]">
            Bloomspace
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm text-[#4A4F41]/80 hover:text-[#4A4F41]">
              Search
            </Link>
            <Link to="/about" className="text-sm text-[#4A4F41]/80 hover:text-[#4A4F41]">
              About
            </Link>
            <Link to="/contact" className="text-sm text-[#4A4F41]/80 hover:text-[#4A4F41]">
              Contact
            </Link>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              {user.role === 'florist' && (
                <>
                  <Link to="/florist-dashboard">
                    <Button variant="ghost" className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10">
                      <Store className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button variant="ghost" className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10">
                      <ShoppingBag className="w-4 h-4" />
                      Orders
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'customer' && (
                <>
                  <Link to="/cart">
                    <Button variant="ghost" className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10">
                      <ShoppingBag className="w-4 h-4" />
                      Cart
                    </Button>
                  </Link>
                  <Link to="/customer-dashboard">
                    <Button variant="ghost" className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}
              
              <Button 
                variant="ghost" 
                className="text-sm gap-2 text-[#4A4F41]/80 hover:text-[#4A4F41] hover:bg-[#4A4F41]/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-sm bg-[#E8E3DD] text-[#4A4F41] hover:bg-[#4A4F41]/10">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  className="text-sm bg-[#4A4F41] text-[#E8E3DD] hover:bg-[#4A4F41]/90"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 