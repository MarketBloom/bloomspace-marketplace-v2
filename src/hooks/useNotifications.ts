import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import { toast } from '../hooks/use-toast';
import { NotificationType } from '../lib/notifications';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface UseNotificationsOptions {
  userId: string;
  limit?: number;
  onNewNotification?: (notification: Notification) => void;
}

export function useNotifications({ userId, limit = 10, onNewNotification }: UseNotificationsOptions) {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Subscribe to new notifications
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          queryClient.setQueryData(['notifications', userId], (old: Notification[] = []) => {
            return [newNotification, ...old].slice(0, limit);
          });
          setUnreadCount((prev) => prev + 1);
          onNewNotification?.(newNotification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, limit, queryClient, onNewNotification]);

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications', userId], (old: Notification[] = []) => {
        return old.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    onError: (error) => {
      toast.error('Error', 'Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications', userId], (old: Notification[] = []) => {
        return old.map((n) => ({ ...n, read: true }));
      });
      setUnreadCount(0);
    },
    onError: (error) => {
      toast.error('Error', 'Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', error);
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications', userId], (old: Notification[] = []) => {
        return old.filter((n) => n.id !== notificationId);
      });
      if (notifications.find((n) => n.id === notificationId)?.read === false) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    onError: (error) => {
      toast.error('Error', 'Failed to delete notification');
      console.error('Error deleting notification:', error);
    },
  });

  // Calculate unread count on initial load and updates
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
} 