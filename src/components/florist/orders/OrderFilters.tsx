import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORDER_STATUS_CONFIG } from '@/config/orderStatus';
import { OrderStatus } from '@/types/order';
import { DatePicker } from '@/components/ui/date-picker';

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleStatusChange = (status: OrderStatus | 'all') => {
    const query = createQueryString({
      status: status === 'all' ? null : status,
    });
    router.push(`?${query}`);
  };

  const handleDeliveryTypeChange = (type: 'delivery' | 'pickup' | 'all') => {
    const query = createQueryString({
      delivery_type: type === 'all' ? null : type,
    });
    router.push(`?${query}`);
  };

  const handleDateChange = (field: 'date_from' | 'date_to', date: Date | null) => {
    const query = createQueryString({
      [field]: date ? date.toISOString().split('T')[0] : null,
    });
    router.push(`?${query}`);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get('search') as string;
    
    const query = createQueryString({
      search: search || null,
    });
    router.push(`?${query}`);
  };

  const handleReset = () => {
    router.push('?');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <Input
            name="search"
            placeholder="Search orders..."
            defaultValue={searchParams.get('search') || ''}
          />
        </form>

        {/* Status Filter */}
        <Select
          defaultValue={searchParams.get('status') || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUS_CONFIG.map((status) => (
              <SelectItem key={status.status} value={status.status}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Delivery Type Filter */}
        <Select
          defaultValue={searchParams.get('delivery_type') || 'all'}
          onValueChange={handleDeliveryTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Delivery type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <DatePicker
          placeholder="From date"
          value={searchParams.get('date_from') || undefined}
          onChange={(date) => handleDateChange('date_from', date)}
        />
        <DatePicker
          placeholder="To date"
          value={searchParams.get('date_to') || undefined}
          onChange={(date) => handleDateChange('date_to', date)}
        />

        {/* Reset */}
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 