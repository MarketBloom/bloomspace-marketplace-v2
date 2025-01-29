import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

export async function createPaymentIntent(request: Request) {
  try {
    const { amount, orderId } = await request.json();

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (orderError || !order) {
      return new Response('Order not found', { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.user_metadata.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user metadata with Stripe customer ID
      await supabase.auth.updateUser({
        data: { stripe_customer_id: customer.id },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'aud',
      customer: stripeCustomerId,
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment transaction record
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        amount,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
      });

    if (transactionError) {
      throw transactionError;
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function addPaymentMethod(request: Request) {
  try {
    const { paymentMethodId, isDefault } = await request.json();

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get Stripe customer ID
    const stripeCustomerId = user.user_metadata.stripe_customer_id;
    if (!stripeCustomerId) {
      return new Response('Stripe customer not found', { status: 404 });
    }

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    if (isDefault) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Get payment method details
    const { card } = paymentMethod;
    if (!card) {
      throw new Error('Invalid payment method');
    }

    // Save payment method to database
    const { error: dbError } = await supabase.from('payment_methods').insert({
      customer_id: user.id,
      type: 'card',
      card_last4: card.last4,
      card_brand: card.brand,
      card_exp_month: card.exp_month,
      card_exp_year: card.exp_year,
      is_default: isDefault,
      stripe_payment_method_id: paymentMethodId,
    });

    if (dbError) {
      throw dbError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error adding payment method:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to add payment method',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function removePaymentMethod(request: Request) {
  try {
    const { paymentMethodId } = await request.json();

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify payment method belongs to user
    const { data: paymentMethod, error: dbError } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('id', paymentMethodId)
      .eq('customer_id', user.id)
      .single();

    if (dbError || !paymentMethod) {
      return new Response('Payment method not found', { status: 404 });
    }

    // Detach payment method from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripe_payment_method_id);

    // Delete payment method from database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error removing payment method:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to remove payment method',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
