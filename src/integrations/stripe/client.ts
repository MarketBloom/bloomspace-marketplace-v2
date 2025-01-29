import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };
