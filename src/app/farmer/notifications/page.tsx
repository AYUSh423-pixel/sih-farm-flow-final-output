"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, IndianRupee, Tractor, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";

const icons = {
  slot: Calendar,
  center: Tractor,
  payment: IndianRupee,
  delay: TriangleAlert,
  system: Bell,
};

export default function NotificationsPage() {
  const { state } = useAppStore();
  const farmerId = state.user?.farmerId;
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!farmerId) return;
    void api.get<{ alerts: NotificationItem[] }>(`/alerts.php?farmerId=${encodeURIComponent(farmerId)}`, { alerts: [] }).then((result) => setItems(result.alerts));
  }, [farmerId]);

  async function markRead(id: string) {
    if (!farmerId) return;
    await api.post("/alerts.php", { action: "mark_read", alertId: id, farmerId });
    setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  }

  async function markAllRead() {
    if (!farmerId) return;
    await api.post("/alerts.php", { action: "mark_all_read", alertId: 1, farmerId });
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl">{t(state.lang, "notifications")}</h1>
        <Button variant="outline" onClick={() => { void markAllRead(); toast.success("All marked as read"); }}>
          {t(state.lang, "markAll")}
        </Button>
      </div>
      {items.length === 0 && <p>No notifications.</p>}
      {items.map((n) => {
        const Icon = icons[n.type];
        return (
          <Card key={n.id} className={`p-4 ${n.read ? "opacity-70" : ""}`}>
            <div className="flex gap-3">
              <Icon className="mt-1 h-5 w-5 text-[var(--primary)]" />
              <div className="flex-1">
                <p className="font-bold">{n.title}</p>
                <p>{n.body}</p>
                <p className="text-xs text-[#5c6f68]">{n.createdAt}</p>
                {!n.read && (
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => { void markRead(n.id); }}>
                    {t(state.lang, "markRead")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
