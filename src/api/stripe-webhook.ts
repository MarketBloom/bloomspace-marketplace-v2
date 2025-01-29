import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  if (!metadata?.orderId) return;

  const { error: transactionError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'succeeded',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (transactionError) throw transactionError;

  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
    })
    .eq('id', metadata.orderId);

  if (orderError) throw orderError;
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      error_message: paymentIntent.last_payment_error?.message,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) throw error;
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  if (!paymentMethod.customer) return;

  const { error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', paymentMethod.customer)
    .single();

  if (userError) throw userError;

  if (paymentMethod.type !== 'card' || !paymentMethod.card) return;

  const { error } = await supabase.from('payment_methods').insert({
    customer_id: userError.id,
    type: 'card',
    card_last4: paymentMethod.card.last4,
    card_brand: paymentMethod.card.brand,
    card_exp_month: paymentMethod.card.exp_month,
    card_exp_year: paymentMethod.card.exp_year,
    stripe_payment_method_id: paymentMethod.id,
  });

  if (error) throw error;
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id);

  if (error) throw error;
}
