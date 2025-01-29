import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DailyAnalytics, AnalyticsPeriod, transformAnalytics, AnalyticsFilters } from '@/types/analytics';

export function useDailyAnalytics(floristId: string, filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['dailyAnalytics', floristId, filters],
    queryFn: async () => {
      let query = supabase
        .from('analytics_daily')
        .select('*')
        .eq('florist_id', floristId);

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;

      return data.map(transformAnalytics);
    },
    enabled: !!floristId
  });
}

export function useRevenueAnalytics(floristId: string, period: AnalyticsPeriod = 'week') {
  return useQuery({
    queryKey: ['revenueAnalytics', floristId, period],
    queryFn: async () => {
      let timeFilter: string;
      switch (period) {
        case 'today':
          timeFilter = 'today';
          break;
        case 'yesterday':
          timeFilter = 'yesterday';
          break;
        case 'week':
          timeFilter = '7 days';
          break;
        case 'month':
          timeFilter = '30 days';
          break;
        case 'year':
          timeFilter = '365 days';
          break;
        default:
          timeFilter = '7 days';
      }

      const { data, error } = await supabase
        .rpc('get_revenue_analytics', {
          p_florist_id: floristId,
          p_time_period: timeFilter
        });

      if (error) throw error;

      return data;
    },
    enabled: !!floristId
  });
}

export function usePopularProducts(floristId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['popularProducts', floristId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_popular_products', {
          p_florist_id: floristId,
          p_limit: limit
        });

      if (error) throw error;

      return data;
    },
    enabled: !!floristId
  });
}

export function useCustomerInsights(floristId: string) {
  return useQuery({
    queryKey: ['customerInsights', floristId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_customer_insights', {
          p_florist_id: floristId
        });

      if (error) throw error;

      return data;
    },
    enabled: !!floristId
  });
}

export function useDeliveryAnalytics(floristId: string) {
  return useQuery({
    queryKey: ['deliveryAnalytics', floristId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_delivery_analytics', {
          p_florist_id: floristId
        });

      if (error) throw error;

      return data;
    },
    enabled: !!floristId
  });
}

// Custom SQL functions needed on the Supabase side:

/*
-- Revenue Analytics Function
CREATE OR REPLACE FUNCTION get_revenue_analytics(p_florist_id UUID, p_time_period TEXT)
RETURNS TABLE (
    date DATE,
    revenue DECIMAL,
    orders INTEGER,
    average_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(o.created_at),
        SUM(o.total) as revenue,
        COUNT(*) as orders,
        AVG(o.total) as average_order_value
    FROM orders o
    WHERE o.florist_id = p_florist_id
    AND o.created_at >= (CURRENT_DATE - p_time_period::INTERVAL)
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at);
END;
$$ LANGUAGE plpgsql;

-- Popular Products Function
CREATE OR REPLACE FUNCTION get_popular_products(p_florist_id UUID, p_limit INTEGER)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_quantity INTEGER,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price_at_time * oi.quantity) as total_revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.florist_id = p_florist_id
    AND o.created_at >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Customer Insights Function
CREATE OR REPLACE FUNCTION get_customer_insights(p_florist_id UUID)
RETURNS TABLE (
    total_customers INTEGER,
    new_customers INTEGER,
    repeat_customers INTEGER,
    average_customer_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH customer_stats AS (
        SELECT
            customer_id,
            COUNT(*) as order_count,
            SUM(total) as total_spent,
            MIN(created_at) as first_order_date
        FROM orders
        WHERE florist_id = p_florist_id
        GROUP BY customer_id
    )
    SELECT
        COUNT(DISTINCT customer_id) as total_customers,
        COUNT(*) FILTER (WHERE order_count = 1) as new_customers,
        COUNT(*) FILTER (WHERE order_count > 1) as repeat_customers,
        COALESCE(AVG(total_spent), 0) as average_customer_value
    FROM customer_stats;
END;
$$ LANGUAGE plpgsql;

-- Delivery Analytics Function
CREATE OR REPLACE FUNCTION get_delivery_analytics(p_florist_id UUID)
RETURNS TABLE (
    delivery_type TEXT,
    total_orders INTEGER,
    average_distance DECIMAL,
    popular_suburbs JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.delivery_type::TEXT,
        COUNT(*) as total_orders,
        AVG(
            CASE 
                WHEN o.delivery_type = 'delivery' AND o.delivery_address->>'coordinates' IS NOT NULL 
                THEN ST_Distance(
                    ST_SetSRID(ST_MakePoint(
                        (o.delivery_address->'coordinates'->>'lng')::float,
                        (o.delivery_address->'coordinates'->>'lat')::float
                    ), 4326),
                    ST_SetSRID(ST_MakePoint(
                        (f.address_details->'coordinates'->>'lng')::float,
                        (f.address_details->'coordinates'->>'lat')::float
                    ), 4326)
                )
                ELSE 0
            END
        ) as average_distance,
        COALESCE(
            json_agg(
                json_build_object(
                    'suburb', o.delivery_address->>'suburb',
                    'count', COUNT(*)
                )
            ) FILTER (WHERE o.delivery_address->>'suburb' IS NOT NULL),
            '[]'::json
        ) as popular_suburbs
    FROM orders o
    JOIN florist_profiles f ON f.id = o.florist_id
    WHERE o.florist_id = p_florist_id
    AND o.created_at >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY o.delivery_type;
END;
$$ LANGUAGE plpgsql;
*/
