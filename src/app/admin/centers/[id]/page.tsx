"use client";

import { use } from "react";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export default function CenterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useAppStore();
  const c = state.centers.find((x) => x.id === id);
  const openG = state.grievances.filter((g) => g.status !== "Resolved").length;
  if (!c) return <p>Center not found.</p>;
  const booked = state.bookings.filter((b) => b.centerId === c.id && b.status === "Confirmed").length;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">{c.name}</h1>
      <p className="text-[#5c6f68]">{c.location}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4"><p className="text-sm">Today&apos;s capacity</p><p className="text-2xl font-bold">{c.dailyCapacity}</p></Card>
        <Card className="p-4"><p className="text-sm">Booked slots</p><p className="text-2xl font-bold">{booked}</p></Card>
        <Card className="p-4"><p className="text-sm">Current queue</p><p className="text-2xl font-bold">{c.currentQueue}</p></Card>
        <Card className="p-4"><p className="text-sm">Processing rate</p><p className="text-2xl font-bold">{c.processingRatePerHour}/hr</p></Card>
        <Card className="p-4"><p className="text-sm">Average waiting</p><p className="text-2xl font-bold">{c.avgWaitMin} min</p></Card>
        <Card className="p-4"><p className="text-sm">Payment reliability</p><p className="text-2xl font-bold">{c.paymentReliability}%</p></Card>
        <Card className="p-4"><p className="text-sm">Open grievances</p><p className="text-2xl font-bold">{Math.max(1, Math.round(openG / state.centers.length))}</p></Card>
      </div>
    </div>
  );
}
