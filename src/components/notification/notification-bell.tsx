"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "@/actions/notifications";
import { formatKhmerDate } from "@/lib/utils";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const time = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return `${formatKhmerDate(value, { withDay: true })} ${time}`;
}

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  async function loadNotifications() {
    const data = await getMyNotifications();
    setNotifications(data as NotificationItem[]);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadNotifications(), 0);

    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  async function handleRead(id: string) {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl border border-(--panel-border) bg-(--panel) shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-(--panel-border)">
            <h3 className="text-sm font-semibold text-(--panel-text)">ការជូនដំណឹង</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-(--panel-text-subtle)">មិនទាន់មានការជូនដំណឹង</p>
            ) : (
              notifications.map((item) => {
                const content = (
                  <div
                    onClick={() => handleRead(item.id)}
                    className={`p-4 border-b border-(--panel-border) hover:bg-(--panel-hover) cursor-pointer ${
                      !item.is_read ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <p className="text-sm text-(--panel-text)">{item.message}</p>
                    <p className="text-xs text-(--panel-text-subtle) mt-1">
                      {formatNotificationTime(item.created_at)}
                    </p>
                  </div>
                );

                return item.link ? (
                  <Link key={item.id} href={item.link}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
