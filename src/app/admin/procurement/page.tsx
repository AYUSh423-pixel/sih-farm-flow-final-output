"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/field";
import { ProcBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import type { Procurement, ProcurementStatus } from "@/lib/types";
import { api } from "@/lib/api";

const flow: ProcurementStatus[] = ["Received", "Graded", "Approved", "Payment Pending", "Paid"];

export default function ProcurementPage() {
  const { state, updateProcurementStatus, replaceProcurements } = useAppStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProcurementStatus | "All">("All");
  const [page, setPage] = useState(0);
  const [id, setId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const rows = useMemo(() => {
    return state.procurements.filter((p) => {
      const farmer = state.farmers.find((f) => f.id === p.farmerId);
      const hit = `${p.id} ${farmer?.name} ${p.crop}`.toLowerCase().includes(q.toLowerCase());
      return hit && (status === "All" || p.status === status);
    });
  }, [state.procurements, state.farmers, q, status]);
  const slice = rows.slice(page * 10, (page + 1) * 10);
  const item = state.procurements.find((p) => p.id === id);

  useEffect(() => {
    void api.get<{ procurements: Procurement[] }>("/procurements.php", { procurements: [] }).then((result) => replaceProcurements(result.procurements));
  }, [replaceProcurements]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">Procurement</h1>
        <Button onClick={() => setCreateOpen(true)}>Receive Produce</Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search ID, farmer, crop" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option>All</option>
          {flow.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Procurement ID", "Farmer", "Crop", "Quantity", "Center", "Grade", "Status", "Date"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => {
              const farmer = state.farmers.find((f) => f.id === p.farmerId);
              const center = state.centers.find((c) => c.id === p.centerId);
              return (
                <tr key={p.id} className="cursor-pointer border-t border-[var(--line)]" onClick={() => setId(p.id)}>
                  <td className="px-3 py-3 font-mono">{p.id}</td>
                  <td className="px-3 py-3">{farmer?.name}</td>
                  <td className="px-3 py-3">{p.crop}</td>
                  <td className="px-3 py-3">{p.quantityKg} kg</td>
                  <td className="px-3 py-3">{center?.name.replace(" Procurement Center", "")}</td>
                  <td className="px-3 py-3">{p.grade}</td>
                  <td className="px-3 py-3"><ProcBadge status={p.status} /></td>
                  <td className="px-3 py-3">{p.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" disabled={(page + 1) * 10 >= rows.length} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      <Dialog open={!!item} onClose={() => setId(null)} title="Procurement detail">
        {item && (
          <div className="space-y-2 text-sm">
            <p>{item.id} · Lot {item.lotId}</p>
            <p>Grade {item.grade} · Moisture {item.moisture}%</p>
            <p>Accepted quantity: {item.acceptedQuantityKg ?? item.quantityKg} kg</p>
            <p>Government rate: ₹{item.pricePerKg ?? 0}/kg</p>
            <p>Quality deduction: {item.qualityDeductionPercent ?? 0}%</p>
            <p>Estimated amount: ₹{item.estimatedAmount ?? 0}</p>
            <p>{item.gradeReason}</p>
            <p>Update status</p>
            <div className="flex flex-wrap gap-2">
              {flow.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={item.status === s ? "default" : "outline"}
                  onClick={() => {
                    void (async () => {
                      try {
                        await api.post("/procurements.php", { id: item.id, status: s });
                        updateProcurementStatus(item.id, s);
                        toast.success("Procurement status updated.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Unable to update status");
                      }
                    })();
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Dialog>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Receive produce">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void (async () => {
              try {
                await api.post("/create-procurement.php", {
                  farmerId: form.get("farmerId"),
                  bookingId: form.get("bookingId"),
                  crop: form.get("crop"),
                  quantityKg: Number(form.get("quantityKg")),
                  acceptedQuantityKg: Number(form.get("acceptedQuantityKg")),
                  centerId: form.get("centerId"),
                  date: form.get("date"),
                  time: form.get("time"),
                  lotId: form.get("lotId"),
                  grade: form.get("grade"),
                  moisture: Number(form.get("moisture")),
                  foreignMaterial: Number(form.get("foreignMaterial")),
                  damaged: Number(form.get("damaged")),
                  gradeReason: form.get("gradeReason"),
                });
                const result = await api.get<{ procurements: Procurement[] }>("/procurements.php", { procurements: [] });
                replaceProcurements(result.procurements);
                toast.success("Produce received and timeline created");
                setCreateOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to receive produce");
              }
            })();
          }}
        >
          <div className="sm:col-span-2"><Label>Farmer</Label><Select name="farmerId" required><option value="">Select farmer</option>{state.farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.id} · {farmer.name}</option>)}</Select></div>
          <div><Label>Crop</Label><Select name="crop" defaultValue="Wheat"><option>Wheat</option><option>Cotton</option><option>Rice</option><option>Groundnut</option><option>Mustard</option><option>Other</option></Select></div>
          <div><Label>Quantity (kg)</Label><Input name="quantityKg" type="number" min="1" required /></div>
          <div><Label>Accepted quantity (kg)</Label><Input name="acceptedQuantityKg" type="number" min="0" step="0.01" required /></div>
          <div><Label>Center</Label><Select name="centerId" defaultValue={state.centers[0]?.id}>{state.centers.map((center) => <option key={center.id} value={center.id}>{center.id} · {center.name}</option>)}</Select></div>
          <div><Label>Booking ID (optional)</Label><Input name="bookingId" /></div>
          <div><Label>Date</Label><Input name="date" type="date" defaultValue="2026-09-11" required /></div>
          <div><Label>Time</Label><Input name="time" type="time" defaultValue="10:00" required /></div>
          <div><Label>Lot ID</Label><Input name="lotId" placeholder="LOT-AHM-1001" required /></div>
          <div><Label>Grade</Label><Select name="grade"><option>A</option><option>B</option><option>C</option></Select></div>
          <div><Label>Moisture (%)</Label><Input name="moisture" type="number" step="0.01" min="0" defaultValue="14" required /></div>
          <div><Label>Foreign material (%)</Label><Input name="foreignMaterial" type="number" step="0.01" min="0" defaultValue="1" required /></div>
          <div><Label>Damaged (%)</Label><Input name="damaged" type="number" step="0.01" min="0" defaultValue="1" required /></div>
          <div className="sm:col-span-2"><Label>Grade reason</Label><Input name="gradeReason" defaultValue="Quality checks completed at receiving center." required /></div>
          <Button className="sm:col-span-2" type="submit">Save received produce</Button>
        </form>
      </Dialog>
    </div>
  );
}
