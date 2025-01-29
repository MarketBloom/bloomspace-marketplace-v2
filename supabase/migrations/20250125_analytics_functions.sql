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

-- Order Analytics Function
CREATE OR REPLACE FUNCTION get_order_analytics(p_florist_id UUID, p_start_time TEXT)
RETURNS TABLE (
    total_orders INTEGER,
    total_revenue DECIMAL,
    average_order_value DECIMAL,
    delivery_orders INTEGER,
    pickup_orders INTEGER,
    pending_orders INTEGER,
    completed_orders INTEGER,
    cancelled_orders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value,
        COUNT(*) FILTER (WHERE delivery_type = 'delivery') as delivery_orders,
        COUNT(*) FILTER (WHERE delivery_type = 'pickup') as pickup_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status IN ('delivered', 'picked_up')) as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
    FROM orders
    WHERE florist_id = p_florist_id
    AND created_at >= (NOW() - p_start_time::INTERVAL);
END;
$$ LANGUAGE plpgsql;
