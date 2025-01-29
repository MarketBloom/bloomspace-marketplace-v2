import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/florist/DashboardNav';

export const metadata: Metadata = {
  title: 'Florist Dashboard | Bloomspace',
  description: 'Manage your flower shop on Bloomspace',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createClient();

  // Check if user is authenticated and is a florist
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/signin?callbackUrl=/florist/dashboard');
  }

  const { data: florist } = await supabase
    .from('florists')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!florist) {
    redirect('/florist/onboarding');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50/50">
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <DashboardNav florist={florist} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 