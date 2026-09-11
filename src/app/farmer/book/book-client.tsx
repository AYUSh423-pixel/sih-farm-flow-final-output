"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { QrPlaceholder } from "@/components/brand";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Crop } from "@/lib/types";
import { DEMO_FARMER_ID } from "@/lib/mock-data";

const crops: Crop[] = ["Wheat", "Cotton", "Rice", "Groundnut", "Other"];

export default function BookPage() {
  const params = useSearchParams();
  const recommended = params.get("recommended") === "1";
  const presetCenter = params.get("center") ?? (recommended ? "C-A" : "");
  const { state, bookSlot } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(recommended ? 6 : 1);
  const [crop, setCrop] = useState<Crop>("Wheat");
  const [qty, setQty] = useState("250");
  const [centerId, setCenterId] = useState(presetCenter || "C-A");
  const [date, setDate] = useState("2026-09-12");
  const [slotId, setSlotId] = useState(recommended ? "C-A-2026-09-12-10:00" : "");
  const [doneId, setDoneId] = useState<string | null>(null);
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;

  const slots = useMemo(
    () => state.slots.filter((s) => s.centerId === centerId && s.date === date),
    [state.slots, centerId, date],
  );
  const selected = state.slots.find((s) => s.id === slotId);
  const center = state.centers.find((c) => c.id === centerId);

  if (doneId) {
    const booking = state.bookings.find((b) => b.id === doneId);
    return (
      <Card className="p-6 text-center">
        <p className="text-sm font-bold text-[var(--primary)]">BOOKING CONFIRMED</p>
        <h1 className="mt-2 text-3xl">Slot booked successfully.</h1>
        <p className="mt-4 font-mono text-lg">{doneId}</p>
        <div className="mt-4 flex justify-center">
          <QrPlaceholder value={doneId} />
        </div>
        <div className="mt-4 space-y-1 text-left text-sm">
          <p><b>Center:</b> {center?.name}</p>
          <p><b>Date:</b> {booking?.date === "2026-09-12" ? "12 September 2026" : booking?.date}</p>
          <p><b>Time:</b> {booking?.time}</p>
          <p><b>Expected waiting:</b> ~{booking?.expectedWaitMin} minutes</p>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => toast.success("Added to calendar (demo)")}>Add to Calendar</Button>
          <Button variant="outline" onClick={() => toast.success("Receipt downloaded (demo)")}>Download Receipt</Button>
          <Button onClick={() => router.push("/farmer/bookings")}>View Booking</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Book a slot</h1>
      <p className="text-sm font-semibold text-[#5c6f68]">Step {step} of 6</p>
      <div className="h-2 overflow-hidden rounded-full bg-[#e4ece6]">
        <div className="h-full bg-[var(--primary)]" style={{ width: `${(step / 6) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setCrop(c)}
              className={`h-16 rounded-2xl border text-lg font-bold ${crop === c ? "border-[var(--primary)] bg-[var(--sage)]" : "border-[var(--line)] bg-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div>
          <Label htmlFor="qty">Quantity (kg)</Label>
          <Input id="qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
      )}
      {step === 3 && (
        <div className="space-y-2">
          {state.centers.map((c) => (
            <button
              key={c.id}
              onClick={() => setCenterId(c.id)}
              className={`w-full rounded-2xl border p-4 text-left ${centerId === c.id ? "border-[var(--primary)] bg-[var(--sage)]" : "border-[var(--line)] bg-white"}`}
            >
              <p className="font-bold">{c.name}</p>
              <p className="text-sm">{c.distanceKm} km · wait ~{c.expectedWaitMin} min</p>
            </button>
          ))}
        </div>
      )}
      {step === 4 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {["2026-09-11", "2026-09-12", "2026-09-13"].map((d) => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`h-16 rounded-2xl border font-bold ${date === d ? "border-[var(--primary)] bg-[var(--sage)]" : "border-[var(--line)] bg-white"}`}
            >
              {d === "2026-09-11" ? "Today, 11 Sep" : d === "2026-09-12" ? "Tomorrow, 12 Sep" : "13 Sep"}
            </button>
          ))}
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2">
          {slots.map((s) => (
            <button
              key={s.id}
              disabled={s.state === "FULL" || s.state === "CLOSED"}
              onClick={() => setSlotId(s.id)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left disabled:opacity-50 ${slotId === s.id ? "border-[var(--primary)] bg-[var(--sage)]" : "border-[var(--line)] bg-white"}`}
            >
              <span className="font-bold">{s.start} – {s.end === "13:00" ? "01:00" : s.end}</span>
              <span className="flex items-center gap-2">
                <Badge tone={s.state === "FULL" ? "bad" : s.state === "LIMITED" ? "warn" : "good"}>{s.state}</Badge>
                <span className="text-sm">{s.booked} / {s.capacity} booked</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {step === 6 && (
        <Card className="space-y-2 p-5">
          <p><b>Crop:</b> {crop}</p>
          <p><b>Quantity:</b> {qty} kg</p>
          <p><b>Center:</b> {center?.name}</p>
          <p><b>Date:</b> {date}</p>
          <p><b>Time:</b> {selected ? `${selected.start} – ${selected.end}` : "10:00 – 11:00"}</p>
          <p><b>Expected waiting:</b> ~{center?.expectedWaitMin} minutes</p>
        </Card>
      )}

      <div className="flex gap-2">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < 6 && (
          <Button
            className="flex-1"
            onClick={() => {
              if (step === 2 && (!qty || Number(qty) <= 0)) {
                toast.error("Enter quantity");
                return;
              }
              if (step === 5 && !slotId) {
                toast.error("Pick a time slot");
                return;
              }
              setStep(step + 1);
            }}
          >
            Continue
          </Button>
        )}
        {step === 6 && (
          <Button
            className="flex-1"
            onClick={() => {
              const slot = selected ?? state.slots.find((s) => s.id === "C-A-2026-09-12-10:00");
              if (!slot || !center) return;
              void (async () => {
                try {
                  const result = await api.post<{ booking: { id: string } }>("/save.php", {
                    farmerId,
                    crop,
                    quantityKg: Number(qty),
                    centerId,
                    date,
                    slotId: slot.id,
                    time: `${slot.start} – ${slot.end}`,
                    expectedWaitMin: center.expectedWaitMin,
                  });
                  const booking = bookSlot({
                    id: result.booking.id,
                    farmerId,
                    crop,
                    quantityKg: Number(qty),
                    centerId,
                    date,
                    slotId: slot.id,
                    time: `${slot.start} – ${slot.end}`,
                    expectedWaitMin: center.expectedWaitMin,
                  });
                  toast.success("Slot booked successfully.");
                  setDoneId(booking.id);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to book slot");
                }
              })();
            }}
          >
            Confirm booking
          </Button>
        )}
      </div>
    </div>
  );
}
