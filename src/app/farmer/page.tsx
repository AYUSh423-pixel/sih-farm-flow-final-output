"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { congestionLabel, congestionTone } from "@/components/status";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { queueTrend } from "@/lib/mock-data";
import { DEMO_FARMER_ID, DEMO_BOOKING_ID } from "@/lib/mock-data";
import { api } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";

export default function FarmerHome() {
  const { state } = useAppStore();
  const router = useRouter();
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const lang = state.lang;
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;
  useEffect(() => {
    if (!state.user?.farmerId) return;
    void api.get<{ alerts: NotificationItem[] }>(`/alerts.php?farmerId=${encodeURIComponent(state.user.farmerId)}`, { alerts: [] }).then((result) => setAlerts(result.alerts));
  }, [state.user?.farmerId]);
  const booking = state.bookings.find((b) => b.farmerId === farmerId && b.status === "Confirmed")
    ?? state.bookings.find((b) => b.id === DEMO_BOOKING_ID);
  const produce = state.procurements.find((p) => p.farmerId === farmerId);
  const payment = state.payments.find((p) => p.farmerId === farmerId);
  const center = state.centers.find((c) => c.id === (booking?.centerId ?? "C-A"))!;
  const recommended = state.centers.find((c) => c.id === "C-A") ?? state.centers[0];
  const delayed = state.payments.some((p) => p.farmerId === farmerId && p.status === "Delayed");
  const unreadAlert = alerts.find((alert) => !alert.read);

  return (
    <div className="space-y-5">
      {unreadAlert && (
        <Link href="/farmer/notifications" className="block rounded-2xl border-2 border-[#b42318] bg-[#fff1f0] p-4 shadow-[0_8px_24px_rgba(180,35,24,0.12)] transition hover:bg-[#ffe4e1]">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b42318] text-lg font-black text-white">!</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b42318]">Important alert</p>
              <p className="mt-1 text-lg font-bold text-[#7a1b14]">{unreadAlert.title}</p>
              <p className="mt-1 text-sm text-[#7a1b14]">{unreadAlert.body}</p>
              <p className="mt-2 text-sm font-bold text-[#b42318]">View all alerts</p>
            </div>
          </div>
        </Link>
      )}
      <div>
        <h1 className="text-3xl sm:text-4xl">{t(lang, "welcome", { name: "Ramesh" })} 👋</h1>
        <p className="mt-1 text-[#5c6f68]">See your next slot, wait time, and payment in one place.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button size="lg" className="w-full" onClick={() => router.push("/farmer/book")}>
          {t(lang, "bookSlot")}
        </Button>
        <Button size="lg" variant="secondary" className="w-full" onClick={() => router.push("/farmer/produce")}>
          {t(lang, "trackProduce")}
        </Button>
        <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/farmer/recommend")}>
          Find nearby centers with GPS
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5c6f68]">{t(lang, "nextSlot")}</p>
          <p className="mt-2 text-lg font-bold">Tomorrow</p>
          <p className="text-[var(--heading)]">{booking?.time ?? "10:30 AM – 11:00 AM"}</p>
          <p className="mt-1 text-sm text-[#5c6f68]">{center.name}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5c6f68]">{t(lang, "expectedWait")}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--primary)]">~{center.expectedWaitMin} min</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5c6f68]">{t(lang, "produceStatus")}</p>
          <p className="mt-2 text-2xl font-bold">{produce?.status === "Payment Pending" ? "Graded" : produce?.status}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5c6f68]">{t(lang, "payment")}</p>
          <p className="mt-2 text-2xl font-bold">{payment?.status === "Delayed" ? "Processing" : payment?.status}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t(lang, "whereGo")}</CardTitle>
          <Button onClick={() => router.push("/farmer/recommend")}>{t(lang, "findBest")}</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.centers.slice(0, 3).map((c) => (
            <div key={c.id} className={`rounded-2xl border p-4 ${c.id === recommended.id ? "border-[var(--primary)] bg-[var(--sage)]" : "border-[var(--line)]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-[#5c6f68]">{c.distanceKm} km · Capacity {Math.round((c.bookedToday / c.dailyCapacity) * 100)}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.id === recommended.id && <Badge tone="good">⭐ {t(lang, "recommended")}</Badge>}
                  <Badge tone={congestionTone(c.congestion)}>{c.congestion === "low" ? "🟢" : c.congestion === "medium" ? "🟡" : "🔴"} {congestionLabel(c.congestion)}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold">Expected wait: {c.expectedWaitMin >= 60 ? `${Math.floor(c.expectedWaitMin / 60)} hr ${c.expectedWaitMin % 60} min` : `${c.expectedWaitMin} min`}</p>
            </div>
          ))}
          <p className="text-sm">
            ⭐ {t(lang, "recommended")}: {recommended.name} at 10:30 AM — lowest predicted waiting time with an available slot.
          </p>
          <Button className="w-full sm:w-auto" onClick={() => router.push("/farmer/book?recommended=1")}>
            {t(lang, "bookRecommended")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "liveQueue")}</CardTitle>
          <p className="text-sm text-[#5c6f68]">{t(lang, "mockNote")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Farmers in queue" value={String(center.currentQueue)} />
            <Stat label={t(lang, "estimatedWait")} value={`${center.expectedWaitMin} min`} />
            <Stat label="Center load" value={`${Math.round((center.bookedToday / center.dailyCapacity) * 100)}%`} />
            <Stat label="Counters" value={`${center.countersOpen} / ${center.countersTotal}`} />
          </div>
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queueTrend}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line dataKey="wait" stroke="#1f7a4d" strokeWidth={2} name="Wait (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-2 text-xs font-semibold">
            <Badge tone="good">🟢 Low</Badge>
            <Badge tone="warn">🟡 Medium</Badge>
            <Badge tone="bad">🔴 High</Badge>
          </div>
        </CardContent>
      </Card>

      {delayed && (
        <Card className="border-[#f2c4c0] bg-[#fff7f6] p-5">
          <p className="text-lg font-bold text-[#b42318]">⚠️ {t(lang, "delayTitle")}</p>
          <p className="mt-1">{t(lang, "delayBody")}</p>
          <p className="mt-2 text-sm text-[#5c6f68]">{t(lang, "delayExplain")}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => router.push("/farmer/payments")}>{t(lang, "trackIssue")}</Button>
            <Button variant="outline" onClick={() => router.push("/farmer/grievances?raise=1")}>{t(lang, "raiseGrievance")}</Button>
          </div>
        </Card>
      )}

      <Link href="/farmer/help" className="block text-center text-sm font-semibold text-[var(--primary)]">
        Need help? Tap here.
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--sage)] p-3">
      <p className="text-xs text-[#5c6f68]">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
