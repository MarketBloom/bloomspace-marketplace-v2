-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type = 'card'),
    card_last4 TEXT NOT NULL,
    card_brand TEXT NOT NULL,
    card_exp_month INTEGER NOT NULL,
    card_exp_year INTEGER NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    stripe_payment_method_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_id, stripe_payment_method_id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
    payment_method_id UUID REFERENCES payment_methods(id),
    stripe_payment_intent_id TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method_id ON payment_transactions(payment_method_id);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
    ON payment_methods FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Users can insert their own payment methods"
    ON payment_methods FOR INSERT
    TO authenticated
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
    ON payment_methods FOR UPDATE
    TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods"
    ON payment_methods FOR DELETE
    TO authenticated
    USING (customer_id = auth.uid());

-- RLS policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
    ON payment_transactions FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        )
    );

-- Function to set default payment method
CREATE OR REPLACE FUNCTION set_default_payment_method(p_payment_method_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    -- Get customer_id from the payment method
    SELECT customer_id INTO v_customer_id
    FROM payment_methods
    WHERE id = p_payment_method_id;

    -- Verify the customer owns this payment method
    IF v_customer_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Update all payment methods for this customer
    UPDATE payment_methods
    SET is_default = (id = p_payment_method_id)
    WHERE customer_id = v_customer_id;
END;
$$;
