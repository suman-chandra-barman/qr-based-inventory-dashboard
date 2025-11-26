import React, { useState } from "react";
import { Bell, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  useGetAdminNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@/redux/api/api";
import type { Notification } from "@/types";

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarking: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isMarking,
}) => {
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification._id);
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? "bg-blue-50/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              !notification.read
                ? "font-semibold text-gray-900"
                : "text-gray-700"
            }`}
          >
            {notification.text || notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatTimeAgo(new Date(notification.createdAt))}
          </p>
        </div>
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            disabled={isMarking}
            className="h-8 w-8 p-0 hover:bg-green-100 shrink-0"
            title="Mark as read"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface NotificationDropdownProps {
  count: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  count,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const {
    data: notificationsData,
    refetch,
    isLoading,
    isError,
  } = useGetAdminNotificationsQuery({});
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const notifications = notificationsData?.data?.result || [];
  const unreadCount = count;

  // Mark all as read when modal opens
  const handleOpenModal = async () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      try {
        await markAsRead("").unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingId(id);
      await markAsRead(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingId("all");
      await markAsRead("").unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={handleOpenModal}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 text-white border-0">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Notifications
                </DialogTitle>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markingId === "all"}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="h-[500px] px-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-sm text-red-500">
                  Failed to load notifications
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: Notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    isMarking={markingId === notification._id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationDropdown;
