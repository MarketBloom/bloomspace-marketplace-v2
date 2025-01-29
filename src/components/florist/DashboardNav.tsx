import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/florist/dashboard',
    icon: 'layout-dashboard'
  },
  {
    title: 'Orders',
    href: '/florist/dashboard/orders',
    icon: 'shopping-bag'
  },
  {
    title: 'Products',
    href: '/florist/dashboard/products',
    icon: 'flower'
  },
  {
    title: 'Inventory',
    href: '/florist/dashboard/inventory',
    icon: 'package'
  },
  {
    title: 'Delivery Zones',
    href: '/florist/dashboard/delivery-zones',
    icon: 'map'
  },
  {
    title: 'Settings',
    href: '/florist/dashboard/settings',
    icon: 'settings'
  }
];

interface DashboardNavProps {
  florist: {
    name: string;
    logo_url?: string;
  };
}

export function DashboardNav({ florist }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Shop Info */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {florist.logo_url ? (
            <img
              src={florist.logo_url}
              alt={florist.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {florist.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-semibold">{florist.name}</h2>
            <p className="text-sm text-gray-500">Florist Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    {
                      'bg-primary text-primary-foreground': isActive,
                      'hover:bg-primary/10': !isActive,
                    }
                  )}
                >
                  <i className={`icon-${item.icon} w-4 h-4`} />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <i className="icon-external-link w-4 h-4" />
          View Store
        </Link>
      </div>
    </div>
  );
} 