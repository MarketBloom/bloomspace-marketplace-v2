import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { useNotificationContext } from '../../contexts/NotificationContext';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markAsRead(notificationId);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-muted-foreground">
                No notifications
              </span>
            </div>
          ) : (
            <div className="grid gap-1">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    'flex flex-col gap-1 px-4 py-2 text-left hover:bg-muted/50',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.action_url
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {notification.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <span className="sr-only">Delete notification</span>
                      <span aria-hidden className="text-lg">
                        ×
                      </span>
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'PPp')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 