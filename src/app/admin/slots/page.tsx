"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

function SlotsInner() {
  const params = useSearchParams();
  const { state, closeSlot, increaseSlotCapacity } = useAppStore();
  const [centerId, setCenterId] = useState(params.get("center") ?? "C-A");
  const [date, setDate] = useState("2026-09-11");
  const [queue, setQueue] = useState(false);
  const [create, setCreate] = useState(false);
  const slots = useMemo(
    () => state.slots.filter((s) => s.centerId === centerId && s.date === date),
    [state.slots, centerId, date],
  );
  const bookings = state.bookings.filter((b) => b.centerId === centerId).slice(0, 8);
  const center = state.centers.find((c) => c.id === centerId);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Slots & queue</h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={centerId} onChange={(e) => setCenterId(e.target.value)}>
          {state.centers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={date} onChange={(e) => setDate(e.target.value)}>
          <option value="2026-09-11">11 Sep 2026</option>
          <option value="2026-09-12">12 Sep 2026</option>
          <option value="2026-09-13">13 Sep 2026</option>
        </Select>
        <Button onClick={() => setCreate(true)}>Create slot</Button>
        <Button variant="secondary" onClick={() => setQueue(true)}>View queue</Button>
      </div>
      {slots.map((s) => (
        <Card key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">{s.start}–{s.end}</p>
            <p className="text-sm">{s.booked} / {s.capacity}</p>
          </div>
          <Badge tone={s.state === "FULL" ? "bad" : s.state === "AVAILABLE" ? "good" : "warn"}>{s.state === "AVAILABLE" ? "ACTIVE" : s.state}</Badge>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { increaseSlotCapacity(s.id, 10); toast.success("Center capacity updated."); }}>Increase capacity</Button>
            <Button size="sm" variant="danger" onClick={() => { closeSlot(s.id); toast.success("Slot closed"); }}>Close slot</Button>
          </div>
        </Card>
      ))}
      <Dialog open={queue} onClose={() => setQueue(false)} title={`${center?.name} queue`}>
        <p>Current farmers in queue: {center?.currentQueue}</p>
        <p>Expected wait: {center?.expectedWaitMin} min</p>
        <p className="mt-3 font-semibold">Recent bookings</p>
        {bookings.map((b) => (
          <p key={b.id} className="text-sm">{b.id} · {b.time} · {b.status}</p>
        ))}
      </Dialog>
      <Dialog open={create} onClose={() => setCreate(false)} title="Create slot">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Slot created (demo)");
            setCreate(false);
          }}
        >
          <div><Label>Start</Label><Input defaultValue="14:00" /></div>
          <div><Label>End</Label><Input defaultValue="15:00" /></div>
          <div><Label>Capacity</Label><Input defaultValue="50" /></div>
          <Button className="w-full" type="submit">Create</Button>
        </form>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading slots…</p>}>
      <SlotsInner />
    </Suspense>
  );
}
