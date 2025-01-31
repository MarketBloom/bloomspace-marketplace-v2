import { Link } from 'react-router-dom';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:hidden min-h-screen bg-[#F5F5F5]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-4 py-3 bg-[#F5F5F5]/90 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between">
        <Link to="/" className="text-[#4A4F41] text-xl font-medium">
          Bloomspace
        </Link>
        <div className="flex items-center gap-6 text-[#4A4F41]/80">
          <Link to="/search" className="text-sm">Search</Link>
          <Link to="/about" className="text-sm">About</Link>
          <Link to="/contact" className="text-sm">Contact</Link>
          <Link to="/login" className="text-sm">Login</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Mobile Footer */}
      <footer className="bg-[#F5F5F5] border-t border-gray-200 py-6 px-4">
        <div className="text-sm text-[#4A4F41]/70 text-center">
          © 2024 Bloomspace. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 