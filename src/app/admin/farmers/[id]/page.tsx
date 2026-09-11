"use client";

import { use, useState } from "react";
import { Tabs } from "@/components/ui/misc";
import { Card } from "@/components/ui/card";
import { BookingBadge, GrievanceBadge, PaymentBadge, ProcBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { formatInr } from "@/lib/utils";

export default function FarmerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useAppStore();
  const farmer = state.farmers.find((f) => f.id === id);
  const [tab, setTab] = useState("profile");
  if (!farmer) return <p>Farmer not found.</p>;
  const bookings = state.bookings.filter((b) => b.farmerId === id);
  const produce = state.procurements.filter((p) => p.farmerId === id);
  const pays = state.payments.filter((p) => p.farmerId === id);
  const grvs = state.grievances.filter((g) => g.farmerId === id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">{farmer.name}</h1>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "bookings", label: "Bookings" },
          { id: "produce", label: "Produce" },
          { id: "payments", label: "Payments" },
          { id: "grievances", label: "Grievances" },
        ]}
      />
      {tab === "profile" && (
        <Card className="space-y-1 p-5">
          <p>ID: {farmer.id}</p>
          <p>Mobile: {farmer.mobile}</p>
          <p>Village: {farmer.village}</p>
          <p>Crop: {farmer.crop}</p>
          <p>Status: {farmer.status}</p>
        </Card>
      )}
      {tab === "bookings" && bookings.map((b) => (
        <Card key={b.id} className="flex items-center justify-between p-4">
          <span>{b.id} · {b.date} {b.time}</span>
          <BookingBadge status={b.status} />
        </Card>
      ))}
      {tab === "produce" && produce.slice(0, 12).map((p) => (
        <Card key={p.id} className="flex items-center justify-between p-4">
          <span>{p.id} · {p.crop} · {p.quantityKg} kg</span>
          <ProcBadge status={p.status} />
        </Card>
      ))}
      {tab === "payments" && pays.slice(0, 12).map((p) => (
        <Card key={p.id} className="flex items-center justify-between p-4">
          <span>{p.procurementId} · {formatInr(p.amount)}</span>
          <PaymentBadge status={p.status} />
        </Card>
      ))}
      {tab === "grievances" && (grvs.length ? grvs : <p>No grievances.</p>)}
      {tab === "grievances" && grvs.map((g) => (
        <Card key={g.id} className="flex items-center justify-between p-4">
          <span>{g.id} · {g.category}</span>
          <GrievanceBadge status={g.status} />
        </Card>
      ))}
    </div>
  );
}
