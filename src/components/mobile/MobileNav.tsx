import { Link } from 'react-router-dom';

export function MobileNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F5]/90 backdrop-blur-sm md:hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-[#4A4F41] text-xl font-medium">
          Bloomspace
        </Link>
        <div className="flex items-center gap-6 text-[#4A4F41]/80">
          <Link to="/search" className="text-sm">Search</Link>
          <Link to="/about" className="text-sm">About</Link>
          <Link to="/contact" className="text-sm">Contact</Link>
          <Link to="/login" className="text-sm">Login</Link>
        </div>
      </div>
    </nav>
  );
} 