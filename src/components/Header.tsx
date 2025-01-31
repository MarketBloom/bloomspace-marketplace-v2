import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";
import { NotificationBell } from "./notifications/NotificationBell";

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/search' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Bloomspace</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/search" className="text-gray-600 hover:text-rose-700 transition-colors">
              Search
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-rose-700 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-rose-700 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}