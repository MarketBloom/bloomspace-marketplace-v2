import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function Analytics({ floristId }: { floristId: string }) {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    dailyOrders: [],
    popularProducts: []
  });
  const [dateRange, setDateRange] = useState('7'); // days
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      // Get orders for the period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('florist_id', floristId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get daily orders
      const dailyOrders = Array.from({ length: parseInt(dateRange) }, (_, i) => {
        const date = subDays(new Date(), i);
        const dayOrders = orders.filter(order => 
          format(new Date(order.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date: format(date, 'MMM dd'),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
        };
      }).reverse();

      // Get popular products
      const { data: products, error: productsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            id,
            title
          )
        `)
        .eq('florist_id', floristId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (productsError) throw productsError;

      const productCounts = products.reduce((acc, item) => {
        const productId = item.products.id;
        acc[productId] = {
          title: item.products.title,
          count: (acc[productId]?.count || 0) + item.quantity
        };
        return acc;
      }, {});

      const popularProducts = Object.entries(productCounts)
        .map(([id, data]: [string, any]) => ({
          id,
          title: data.title,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        dailyOrders,
        popularProducts
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
          <p className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Orders Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.dailyOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Popular Products</h3>
        <div className="space-y-2">
          {analytics.popularProducts.map(product => (
            <div key={product.id} className="flex justify-between items-center">
              <span>{product.title}</span>
              <span className="font-medium">{product.count} orders</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 