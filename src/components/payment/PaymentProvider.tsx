import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/integrations/stripe/client';

interface PaymentProviderProps {
  children: React.ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
