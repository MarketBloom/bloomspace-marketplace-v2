import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrderNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
      <p className="text-gray-600 mb-6">
        The order you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/orders">View All Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
} 