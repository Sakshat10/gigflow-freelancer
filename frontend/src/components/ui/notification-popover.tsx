
import React, { useState, useEffect } from "react";
import { Bell, File, FileAudio, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification } from "@/types";
import { cn } from "@/lib/utils";

export interface NotificationPopoverProps {
  buttonClassName?: string;
  popoverClassName?: string;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
  headerBorderColor?: string;
  onNotificationsChange?: (notifications: Notification[]) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  buttonClassName,
  popoverClassName,
  textColor = "text-gray-800",
  hoverBgColor = "hover:bg-gray-100",
  dividerColor = "divide-gray-200",
  headerBorderColor = "border-gray-200",
  onNotificationsChange,
  onNotificationClick,
}) => {
  const { notifications, markAsRead, markAllAsRead, clearAll, handleNotificationClick: contextHandleNotificationClick } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Update local state when context notifications change
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    if (onNotificationsChange) {
      onNotificationsChange(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const handleClearAll = () => {
    clearAll();
    if (onNotificationsChange) {
      onNotificationsChange([]);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      if (onNotificationsChange) {
        onNotificationsChange(
          notifications.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      contextHandleNotificationClick(notification);
    }

    setIsOpen(false);
  };

  // Close the popover and mark visible notifications as read when popover is closed
  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      // Mark all currently visible notifications as read when closing
      const visibleNotificationIds = localNotifications
        .filter(n => !n.read)
        .slice(0, 10) // Assuming we show the first 10 notifications in the popover
        .map(n => n.id);

      visibleNotificationIds.forEach(id => markAsRead(id));

      if (onNotificationsChange && visibleNotificationIds.length > 0) {
        onNotificationsChange(
          notifications.map(n =>
            visibleNotificationIds.includes(n.id) ? { ...n, read: true } : n
          )
        );
      }
    }
    setIsOpen(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={buttonClassName || "rounded-full hover-translate"}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-80 p-0 ${popoverClassName}`}
        align="end"
      >
        <NotificationHeader
          handleMarkAllAsRead={handleMarkAllAsRead}
          handleClearAll={handleClearAll}
          textColor={textColor}
          hoverBgColor={hoverBgColor}
          headerBorderColor={headerBorderColor}
        />
        <NotificationList
          notifications={localNotifications}
          handleNotificationClick={handleNotificationClick}
          textColor={textColor}
          hoverBgColor={hoverBgColor}
          dividerColor={dividerColor}
        />
      </PopoverContent>
    </Popover>
  );
};

interface NotificationHeaderProps {
  handleMarkAllAsRead: () => void;
  handleClearAll: () => void;
  textColor?: string;
  hoverBgColor?: string;
  headerBorderColor?: string;
}

const NotificationHeader = ({
  handleMarkAllAsRead,
  handleClearAll,
  textColor = "text-foreground",
  hoverBgColor = "hover:bg-muted",
  headerBorderColor = "border-border",
}: NotificationHeaderProps) => (
  <div className={`p-4 border-b ${headerBorderColor} flex justify-between items-center`}>
    <h3 className="text-sm font-medium">Notifications</h3>
    <div className="flex items-center gap-2">
      <Button
        onClick={handleMarkAllAsRead}
        variant="ghost"
        size="sm"
        className={`text-xs ${hoverBgColor}`}
      >
        Mark all as read
      </Button>
      <Button
        onClick={handleClearAll}
        variant="ghost"
        size="sm"
        className={`text-xs text-red-600 hover:text-red-700 ${hoverBgColor}`}
      >
        Clear all
      </Button>
    </div>
  </div>
);

interface NotificationListProps {
  notifications: Notification[];
  handleNotificationClick: (notification: Notification) => void;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
}

const NotificationList = ({
  notifications,
  handleNotificationClick,
  textColor,
  hoverBgColor,
  dividerColor = "divide-border",
}: NotificationListProps) => (
  <div className={`divide-y ${dividerColor} max-h-[300px] overflow-y-auto`}>
    {notifications.length > 0 ? (
      notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onNotificationClick={handleNotificationClick}
          textColor={textColor}
          hoverBgColor={hoverBgColor}
        />
      ))
    ) : (
      <div className={`p-4 text-center ${textColor} opacity-70`}>
        No notifications
      </div>
    )}
  </div>
);

export interface NotificationItemProps {
  notification: Notification;
  index: number;
  onNotificationClick: (notification: Notification) => void;
  textColor?: string;
  hoverBgColor?: string;
  dotColor?: string;
}

const NotificationItem = ({
  notification,
  index,
  onNotificationClick,
  textColor = "text-foreground",
  dotColor = "bg-primary",
  hoverBgColor = "hover:bg-muted",
}: NotificationItemProps) => {
  // Check for attachment information in the notification
  const hasAttachment = notification.link?.includes('attachment=true');
  const attachmentType = notification.link?.includes('attachmentType=')
    ? notification.link.split('attachmentType=')[1].split('&')[0]
    : null;

  // Determine attachment icon based on type
  const renderAttachmentIcon = () => {
    if (!hasAttachment) return null;

    if (attachmentType?.startsWith('image')) {
      return <FileImage className="h-4 w-4 ml-2 text-blue-500" />;
    } else if (attachmentType?.startsWith('audio')) {
      return <FileAudio className="h-4 w-4 ml-2 text-green-500" />;
    } else if (attachmentType?.startsWith('pdf')) {
      return <File className="h-4 w-4 ml-2 text-red-500" />;
    }
    return null;
  };

  return (
    <div
      className={cn(`p-4 ${hoverBgColor} cursor-pointer transition-colors animate-fade-in`)}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {!notification.read && (
            <span className={`h-1 w-1 rounded-full ${dotColor}`} />
          )}
          <h4 className={`text-sm font-medium ${textColor} flex items-center`}>
            {notification.title}
            {renderAttachmentIcon()}
          </h4>
        </div>

        <span className={`text-xs opacity-80 ${textColor}`}>
          {notification.timestamp.toLocaleDateString()}
        </span>
      </div>
      <p className={`text-xs opacity-70 mt-1 ${textColor}`}>
        {notification.description}
        {hasAttachment && (
          <span className="ml-1 italic">
            {attachmentType?.includes('image') ? '(with image)' :
              attachmentType?.includes('audio') ? '(with voice message)' :
                attachmentType?.includes('pdf') ? '(with PDF)' :
                  '(with attachment)'}
          </span>
        )}
      </p>
    </div>
  );
};
