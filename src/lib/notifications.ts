import { supabase } from './supabase/client';

export async function createNotification({
  userId,
  title,
  message,
  type,
  actionUrl
}: {
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'system' | 'alert';
  actionUrl?: string;
}) {
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
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Utility functions for common notifications
export const NotificationService = {
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

  async newMessage(userId: string, senderName: string, orderId: string) {
    await createNotification({
      userId,
      title: 'New Message',
      message: `New message from ${senderName}`,
      type: 'message',
      actionUrl: `/dashboard/messages?order=${orderId}`
    });
  },

  async deliveryReminder(floristId: string, orderId: string, deliveryTime: string) {
    await createNotification({
      userId: floristId,
      title: 'Upcoming Delivery',
      message: `Reminder: Order #${orderId} delivery scheduled for ${deliveryTime}`,
      type: 'alert',
      actionUrl: `/dashboard/orders/${orderId}`
    });
  }
}; 