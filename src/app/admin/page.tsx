"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { api } from "@/lib/api";

type DashboardCenter = {
  id: string;
  name: string;
  dailyCapacity: number;
  bookedToday: number;
  currentQueue: number;
  countersOpen: number;
  countersTotal: number;
  expectedWaitMin: number;
  avgWaitMin: number;
  paymentReliability: number;
  reliabilityScore: number;
  onTimePayment: number;
  grievanceResolution: number;
};

type DashboardData = {
  kpis: {
    totalFarmers: number;
    activeCenters: number;
    confirmedBookings: number;
    procurementsToday: number;
    onTimePaymentRate: number;
    openGrievances: number;
    delayedPayments: number;
  };
  centers: DashboardCenter[];
  ahmedabad: DashboardCenter | null;
  farmerStatuses: {
    farmerId: string;
    name: string;
    procurementId: string | null;
    status: string;
    events: { key: string; done: boolean; current: boolean }[];
  }[];
};

const statusSteps = [
  ["received", "Received"],
  ["graded", "Graded"],
  ["approved", "Accepted"],
  ["processing", "Processing"],
  ["paid", "Paid"],
] as const;

export default function AdminHome() {
  const { state, applyCapacityRecommendation, dismissRecommendation } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void api.get<DashboardData | null>("/dashboard.php", null).then(setData);
  }, []);

  if (!data) {
    return <p className="p-4 text-[#5c6f68]">Loading dashboard…</p>;
  }

  const { kpis, centers, ahmedabad, farmerStatuses } = data;
  const load = centers.map((c) => ({
    name: c.name.replace(" Procurement Center", ""),
    load: Math.round((c.bookedToday / c.dailyCapacity) * 100),
  }));
  const centerC = centers.find((c) => c.id === "C-C");

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Welcome, Admin 👋</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Total Farmers" value={String(kpis.totalFarmers)} />
        <Kpi label="Active Centers" value={String(kpis.activeCenters)} />
        <Kpi label="Booked Slots" value={String(kpis.confirmedBookings)} />
        <Kpi label="Procurements Today" value={String(kpis.procurementsToday)} />
        <Kpi label="On-Time Payments" value={`${kpis.onTimePaymentRate}%`} />
        <Kpi label="Open Grievances" value={String(kpis.openGrievances)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-sm">New confirmed bookings</p><p className="text-2xl font-bold">{kpis.confirmedBookings}</p></Card>
        <Card className="p-4"><p className="text-sm">Delayed payments</p><p className="text-2xl font-bold text-[#b42318]">{kpis.delayedPayments}</p></Card>
        <Card className="p-4"><p className="text-sm">Queue load (Ahmedabad)</p><p className="text-2xl font-bold">{ahmedabad?.currentQueue ?? 0} farmers</p></Card>
      </div>
      <Card className="p-5">
        <h2 className="text-xl">Farmer live status</h2>
        <p className="mt-1 text-sm text-[#5c6f68]">Track every farmer&apos;s accepted and completed procurement steps.</p>
        <div className="mt-4 space-y-3">
          {farmerStatuses.map((farmer) => (
            <div key={farmer.farmerId} className="rounded-2xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{farmer.name}</p>
                  <p className="text-xs text-[#5c6f68]">Farmer ID {farmer.farmerId} · {farmer.status}</p>
                </div>
                {farmer.procurementId && <span className="font-mono text-xs">{farmer.procurementId}</span>}
              </div>
              {farmer.procurementId ? (
                <ol className="mt-4 grid grid-cols-5 gap-1">
                  {statusSteps.map(([key, label]) => {
                    const event = farmer.events.find((item) => item.key === key);
                    return <li key={key} className="text-center"><span className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${event?.done ? "bg-[var(--primary)] text-white" : event?.current ? "bg-[#c9a227] text-white" : "bg-[#e7eee9] text-[#5c6f68]"}`}>{event?.done ? "✓" : event?.current ? "…" : "○"}</span><p className="mt-1 text-[11px] font-semibold">{label}</p></li>;
                  })}
                </ol>
              ) : <p className="mt-3 text-sm text-[#5c6f68]">No produce submitted yet.</p>}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl">Center load overview</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={load}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="load" fill="#1f7a4d" name="Load %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl">AI Queue Prediction</h2>
        <p className="text-sm text-[#5c6f68]">Demo estimate from current bookings and counters — not a live model.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Mini label="Current queue" value={String(ahmedabad?.currentQueue ?? 0)} />
          <Mini label="Expected wait" value={`${ahmedabad?.expectedWaitMin ?? 0} min`} />
          <Mini label="Capacity" value={`${ahmedabad ? Math.round((ahmedabad.bookedToday / ahmedabad.dailyCapacity) * 100) : 0}%`} />
          <Mini label="Counters" value={`${ahmedabad?.countersOpen ?? 0} / ${ahmedabad?.countersTotal ?? 0}`} />
        </div>
      </Card>
      {!state.recommendationDismissed && centerC && (
        <Card className="border-[var(--gold)] p-5">
          <p className="font-bold">Smart Capacity Recommendation</p>
          <p className="mt-1">{centerC.name} is {Math.round((centerC.bookedToday / centerC.dailyCapacity) * 100)}% loaded.</p>
          <p className="mt-2">Open 20 additional slots at Center B (Gandhinagar) to reduce predicted congestion at Center C.</p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                applyCapacityRecommendation();
                toast.success("Center capacity updated.");
              }}
            >
              Apply Recommendation
            </Button>
            <Button variant="outline" onClick={dismissRecommendation}>Dismiss</Button>
          </div>
        </Card>
      )}
      <Card className="p-5">
        <h2 className="text-xl">Procurement Center Performance</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {centers.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[var(--line)] p-4">
              <div className="flex justify-between">
                <p className="font-bold">{c.name}</p>
                <Badge tone={c.reliabilityScore >= 80 ? "good" : "warn"}>Reliability {c.reliabilityScore}/100</Badge>
              </div>
              <p className="text-sm">Average waiting: {c.avgWaitMin} min</p>
              <p className="text-sm">On-time payment: {c.onTimePayment}%</p>
              <p className="text-sm">Grievance resolution: {c.grievanceResolution}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-[#5c6f68]">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--sage)] p-3">
      <p className="text-xs">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
