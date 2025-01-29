import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { HomeIcon, BellIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Browse', href: '/browse', icon: HomeIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] z-50 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur shadow-apple">
      <div className="mx-auto max-w-[1400px] h-full px-4">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-[8px] font-semibold text-[18px] text-[#1D1D1F] hover:text-[#D73459] transition-colors"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            <HomeIcon className="h-[20px] w-[20px]" />
            MktBloom
          </Link>

          {/* Navigation */}
          <nav className="hidden md:block relative z-50">
            <ul className="flex items-center gap-[8px]">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-lg px-4 gap-2",
                        "text-[14px] font-medium text-[#1D1D1F] transition-colors",
                        "hover:text-[#D73459] active:text-[#D73459]/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D73459]/20"
                      )}
                    >
                      <Icon className="h-[14px] w-[14px]" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="text-[14px] font-medium text-[#1D1D1F] hover:bg-[#1D1D1F]/10 disabled:opacity-50"
            >
              Sign In
            </Button>
            <Button 
              className="text-[14px] font-medium bg-[#D73459] text-white hover:bg-[#D73459]/90 disabled:opacity-50"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}