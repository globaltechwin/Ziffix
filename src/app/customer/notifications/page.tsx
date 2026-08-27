"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  CreditCard,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  info: { icon: Info, color: "text-blue-600 bg-blue-50" },
  success: { icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  warning: { icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
  booking: { icon: Bell, color: "text-purple-600 bg-purple-50" },
  payment: { icon: CreditCard, color: "text-green-600 bg-green-50" },
};

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    fetch("/api/customer/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Bell className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, index) => {
            const config = typeConfig[notification.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`flex items-start gap-3 rounded-xl border border-border p-4 transition-colors ${
                  notification.isRead
                    ? "bg-card"
                    : "bg-card cursor-pointer hover:bg-muted/50"
                }`}
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${notification.isRead ? "font-medium" : "font-semibold"} text-foreground`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
