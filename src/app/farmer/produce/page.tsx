"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { QrPlaceholder } from "@/components/brand";
import { ProcBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { DEMO_FARMER_ID, DEMO_PROCUREMENT_ID } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Procurement } from "@/lib/types";

export default function ProducePage() {
  const { state, updateProcurementStatus } = useAppStore();
  const router = useRouter();
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;
  const [remoteItems, setRemoteItems] = useState<Procurement[]>([]);
  useEffect(() => {
    if (!state.user?.farmerId) return;
    void api.get<{ procurements: Procurement[] }>(`/procurements.php?farmerId=${encodeURIComponent(state.user.farmerId)}`, { procurements: [] }).then((result) => setRemoteItems(result.procurements));
  }, [state.user?.farmerId]);
  const item = remoteItems[0] ?? state.procurements.find((p) => p.farmerId === farmerId) ?? state.procurements.find((p) => p.id === DEMO_PROCUREMENT_ID)!;
  const center = state.centers.find((c) => c.id === item.centerId);
  const [receipt, setReceipt] = useState(false);
  const [grade, setGrade] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Track my produce</h1>
      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <p><b>Crop:</b> {item.crop}</p>
          <p><b>Quantity:</b> {item.quantityKg} kg</p>
          <p><b>Center:</b> {center?.name}</p>
          <p><b>Procurement ID:</b> {item.id}</p>
        </div>
        <div className="mt-6 hidden md:block">
          <ol className="grid grid-cols-5 gap-2">
            {item.timeline.map((ev, i) => (
              <li key={ev.key} className="text-center">
                <div className={cn("mx-auto mb-2 h-3 rounded-full", ev.done ? "bg-[var(--primary)]" : ev.current ? "bg-[#c9a227]" : "bg-[#d7e3db]")} />
                <p className="text-sm font-bold">{ev.done ? "✓ " : ev.current ? "⏳ " : "○ "}{ev.label}</p>
                <p className="text-xs text-[#5c6f68]">{ev.at || ev.expected || "Pending"}</p>
                {i < item.timeline.length - 1 && <span className="sr-only">next</span>}
              </li>
            ))}
          </ol>
        </div>
        <ol className="mt-4 space-y-3 md:hidden">
          {item.timeline.map((ev) => (
            <li key={ev.key} className="flex gap-3">
              <span className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", ev.done ? "bg-[var(--primary)]" : ev.current ? "bg-[#c9a227]" : "bg-[#d7e3db]")} />
              <div>
                <p className="font-bold">{ev.done ? "✓ " : ev.current ? "⏳ " : "○ "}{ev.label}</p>
                <p className="text-sm text-[#5c6f68]">{ev.at || ev.expected || "Pending"}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setReceipt(true)}>Digital crop receipt</Button>
          <Button variant="secondary" onClick={() => setGrade(true)}>Why was my crop graded this way?</Button>
        </div>
      </Card>
      <Dialog open={receipt} onClose={() => setReceipt(false)} title="Digital crop receipt">
        <div className="flex flex-col items-center gap-3 text-sm">
          <QrPlaceholder value={item.id} />
          <div className="w-full space-y-1 text-left">
            <p><b>Farmer:</b> Ramesh Patel</p>
            <p><b>Crop:</b> {item.crop}</p>
            <p><b>Quantity:</b> {item.quantityKg} kg</p>
            <p><b>Center:</b> {center?.name}</p>
            <p><b>Date/time:</b> {item.date} {item.time}</p>
            <p><b>Lot ID:</b> {item.lotId}</p>
            <p><b>Procurement ID:</b> {item.id}</p>
            <p><b>Grade:</b> {item.grade}</p>
            <p><b>Status:</b> <ProcBadge status={item.status} /></p>
          </div>
          <Button className="w-full" onClick={() => { setReceipt(false); toast.message("Showing full history"); }}>View Full History</Button>
        </div>
      </Dialog>
      <Dialog open={grade} onClose={() => setGrade(false)} title="Why was my crop graded this way?">
        <p className="text-3xl font-bold">Grade {item.grade}</p>
        <div className="mt-3 space-y-1 text-sm">
          <p>Moisture {item.moisture}%</p>
          <p>Foreign material {item.foreignMaterial}%</p>
          <p>Damaged produce {item.damaged}%</p>
        </div>
        <p className="mt-4 font-semibold">Reason for Grade {item.grade}</p>
        <p>{item.gradeReason}</p>
        <Button className="mt-4 w-full" onClick={() => router.push("/farmer/grievances?raise=1&category=Incorrect%20Grading")}>
          Raise Dispute
        </Button>
      </Dialog>
    </div>
  );
}
