import { supabase } from './supabase/client';
import { toast } from '../hooks/use-toast';

export type NotificationType = 'order' | 'message' | 'system' | 'alert' | 'payment';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  actionUrl
}: CreateNotificationParams) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        read: false
      });

    if (error) throw error;

    // Show toast notification
    toast.default(title, message);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Notification Service with predefined notification types
export const NotificationService = {
  // Order related notifications
  async newOrder(floristId: string, orderId: string, customerName: string) {
    await createNotification({
      userId: floristId,
      title: 'New Order Received',
      message: `New order from ${customerName}`,
      type: 'order',
      actionUrl: `/dashboard/orders/${orderId}`
    });
  },

  async orderStatusUpdate(customerId: string, orderId: string, status: string) {
    await createNotification({
      userId: customerId,
      title: 'Order Status Updated',
      message: `Your order #${orderId} is now ${status}`,
      type: 'order',
      actionUrl: `/orders/${orderId}`
    });
  },

  async orderDelivered(customerId: string, orderId: string) {
    await createNotification({
      userId: customerId,
      title: 'Order Delivered',
      message: `Your order #${orderId} has been delivered. Enjoy your flowers!`,
      type: 'order',
      actionUrl: `/orders/${orderId}`
    });
  },

  // Message related notifications
  async newMessage(userId: string, senderName: string, orderId: string) {
    await createNotification({
      userId,
      title: 'New Message',
      message: `New message from ${senderName}`,
      type: 'message',
      actionUrl: `/dashboard/messages?order=${orderId}`
    });
  },

  // Delivery related notifications
  async deliveryReminder(floristId: string, orderId: string, deliveryTime: string) {
    await createNotification({
      userId: floristId,
      title: 'Upcoming Delivery',
      message: `Reminder: Order #${orderId} delivery scheduled for ${deliveryTime}`,
      type: 'alert',
      actionUrl: `/dashboard/orders/${orderId}`
    });
  },

  async deliveryDelayed(customerId: string, orderId: string, newTime: string) {
    await createNotification({
      userId: customerId,
      title: 'Delivery Delayed',
      message: `Your order #${orderId} delivery has been rescheduled to ${newTime}`,
      type: 'alert',
      actionUrl: `/orders/${orderId}`
    });
  },

  // Payment related notifications
  async paymentSuccess(userId: string, orderId: string, amount: number) {
    await createNotification({
      userId,
      title: 'Payment Successful',
      message: `Payment of $${amount} for order #${orderId} was successful`,
      type: 'payment',
      actionUrl: `/orders/${orderId}`
    });
  },

  async paymentFailed(userId: string, orderId: string) {
    await createNotification({
      userId,
      title: 'Payment Failed',
      message: `Payment for order #${orderId} failed. Please update your payment method`,
      type: 'payment',
      actionUrl: `/orders/${orderId}/payment`
    });
  },

  // System notifications
  async systemMaintenance(userId: string, startTime: string, duration: string) {
    await createNotification({
      userId,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime} (Duration: ${duration})`,
      type: 'system'
    });
  },

  async accountUpdate(userId: string, updateType: string) {
    await createNotification({
      userId,
      title: 'Account Updated',
      message: `Your account ${updateType} has been updated successfully`,
      type: 'system',
      actionUrl: '/account/settings'
    });
  }
}; 