import { Subscription } from '@supabase/supabase-js';

export class SubscriptionManager {
  private subscriptions: Subscription[] = [];

  add(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  cleanup() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}

export function useSubscriptionCleanup() {
  const manager = new SubscriptionManager();

  return {
    addSubscription: (subscription: Subscription) => manager.add(subscription),
    cleanup: () => manager.cleanup()
  };
} 