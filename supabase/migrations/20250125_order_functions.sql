-- Function to create an order with items in a transaction
CREATE OR REPLACE FUNCTION create_order(
  p_florist_id UUID,
  p_delivery_date TIMESTAMP WITH TIME ZONE,
  p_delivery_time_slot TEXT,
  p_delivery_address JSONB,
  p_order_items JSONB[]
)
RETURNS TABLE (
  id UUID,
  customer_id UUID,
  florist_id UUID,
  status TEXT,
  total_amount NUMERIC,
  delivery_fee NUMERIC,
  delivery_address JSONB,
  delivery_date TIMESTAMP WITH TIME ZONE,
  delivery_time_slot TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_customer_id UUID;
  v_total_amount NUMERIC := 0;
  v_delivery_fee NUMERIC := 0;
  v_item JSONB;
  v_product_price NUMERIC;
BEGIN
  -- Get the current user ID
  v_customer_id := auth.uid();
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get delivery fee from florist settings
  SELECT COALESCE((business_settings->'delivery'->>'fee')::NUMERIC, 0)
  INTO v_delivery_fee
  FROM florist_profiles
  WHERE id = p_florist_id;

  -- Start transaction
  BEGIN
    -- Create the order
    INSERT INTO orders (
      customer_id,
      florist_id,
      status,
      total_amount,
      delivery_fee,
      delivery_address,
      delivery_date,
      delivery_time_slot
    )
    VALUES (
      v_customer_id,
      p_florist_id,
      'pending',
      0, -- Will update after calculating items
      v_delivery_fee,
      p_delivery_address,
      p_delivery_date,
      p_delivery_time_slot
    )
    RETURNING id INTO v_order_id;

    -- Create order items and calculate total
    FOR v_item IN SELECT * FROM jsonb_array_elements(array_to_json(p_order_items)::JSONB)
    LOOP
      -- Get current product price
      SELECT price INTO v_product_price
      FROM products
      WHERE id = (v_item->>'product_id')::UUID
      AND florist_id = p_florist_id
      AND status = 'active';

      IF v_product_price IS NULL THEN
        RAISE EXCEPTION 'Invalid product ID or product not available';
      END IF;

      -- Create order item
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price_at_time
      )
      VALUES (
        v_order_id,
        (v_item->>'product_id')::UUID,
        (v_item->>'quantity')::INTEGER,
        v_product_price
      );

      -- Add to total amount
      v_total_amount := v_total_amount + (v_product_price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- Update order with total amount
    UPDATE orders
    SET total_amount = v_total_amount
    WHERE id = v_order_id;

    -- Return the created order
    RETURN QUERY
    SELECT *
    FROM orders
    WHERE id = v_order_id;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE;
  END;
END;
$$;

-- Function to update order status with history tracking
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status order_status,
  p_notes TEXT DEFAULT NULL
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the order and lock it for update
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Check permissions
  IF NOT (
    -- Allow if user is the florist
    v_order.florist_id = v_user_id OR
    -- Or if user is the customer
    v_order.customer_id = v_user_id OR
    -- Or if user is an admin (you'll need to implement this check based on your roles system)
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = v_user_id AND role = 'admin'
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this order';
  END IF;

  -- Update the order status
  UPDATE orders
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  -- Add status history entry
  INSERT INTO order_status_history (
    order_id,
    status,
    notes,
    created_by
  ) VALUES (
    p_order_id,
    p_status,
    p_notes,
    v_user_id
  );

  -- Notify relevant channels
  PERFORM pg_notify(
    'order_status_changed',
    json_build_object(
      'order_id', p_order_id,
      'status', p_status,
      'previous_status', v_order.status
    )::text
  );

  RETURN v_order;
END;
$$;

-- Function to check if a status transition is valid
CREATE OR REPLACE FUNCTION is_valid_status_transition(
  p_current_status order_status,
  p_new_status order_status,
  p_delivery_type delivery_type
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Define valid transitions
  RETURN CASE p_current_status
    WHEN 'pending' THEN
      p_new_status IN ('confirmed', 'cancelled')
    WHEN 'confirmed' THEN
      p_new_status IN ('preparing', 'cancelled')
    WHEN 'preparing' THEN
      CASE p_delivery_type
        WHEN 'delivery' THEN p_new_status IN ('ready_for_delivery', 'cancelled')
        WHEN 'pickup' THEN p_new_status IN ('ready_for_pickup', 'cancelled')
      END
    WHEN 'ready_for_delivery' THEN
      p_new_status IN ('out_for_delivery', 'cancelled')
    WHEN 'out_for_delivery' THEN
      p_new_status IN ('delivered', 'cancelled')
    WHEN 'ready_for_pickup' THEN
      p_new_status IN ('picked_up', 'cancelled')
    ELSE false
  END;
END;
$$;

-- Add trigger to validate status transitions
CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_valid_status_transition(OLD.status, NEW.status, OLD.delivery_type) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_order_status_transition
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION validate_order_status_transition();
