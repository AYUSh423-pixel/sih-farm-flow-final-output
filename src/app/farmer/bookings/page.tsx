"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/field";
import { BookingBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { DEMO_FARMER_ID } from "@/lib/mock-data";
import type { BookingStatus } from "@/lib/types";

export default function BookingsPage() {
  const { state, cancelBooking, rescheduleBooking, replaceBookings } = useAppStore();
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;
  const [filter, setFilter] = useState<BookingStatus | "All">("All");
  const [page, setPage] = useState(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const rows = useMemo(() => {
    const list = state.bookings.filter((b) => b.farmerId === farmerId);
    return filter === "All" ? list : list.filter((b) => b.status === filter);
  }, [state.bookings, farmerId, filter]);
  const pageSize = 8;
  const slice = rows.slice(page * pageSize, (page + 1) * pageSize);
  const viewing = state.bookings.find((b) => b.id === viewId);
  const rescheduling = state.bookings.find((b) => b.id === rescheduleId);
  const slots = state.slots.filter((s) => s.centerId === (rescheduling?.centerId ?? "C-A") && s.date === "2026-09-13");

  useEffect(() => {
    if (!state.user?.farmerId) return;
    void api.get(`/bookings.php?farmerId=${encodeURIComponent(state.user.farmerId)}`, { bookings: [] }).then((result) => {
      replaceBookings(result.bookings);
    });
  }, [state.user?.farmerId, replaceBookings]);

  async function cancelRemote(id: string) {
    try {
      await api.post("/bookings.php", { id, farmerId, action: "cancel" });
      cancelBooking(id);
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel booking");
    }
  }

  async function rescheduleRemote(id: string, slotId: string, date: string, time: string) {
    try {
      await api.post("/bookings.php", { id, farmerId, action: "reschedule", slotId });
      rescheduleBooking(id, slotId, date, time);
      toast.success("Booking rescheduled");
      setRescheduleId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reschedule booking");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">My bookings</h1>
      <Select value={filter} onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(0); }}>
        <option>All</option>
        <option>Confirmed</option>
        <option>Completed</option>
        <option>Cancelled</option>
        <option>Rescheduled</option>
      </Select>
      <div className="space-y-3 lg:hidden">
        {slice.map((b) => {
          const center = state.centers.find((c) => c.id === b.centerId);
          return (
            <Card key={b.id} className="p-4">
              <div className="flex justify-between gap-2">
                <p className="font-mono text-sm">{b.id}</p>
                <BookingBadge status={b.status} />
              </div>
              <p className="mt-1 font-bold">{b.crop} · {center?.name}</p>
              <p className="text-sm">{b.date} · {b.time}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setViewId(b.id)}>View</Button>
                {b.status === "Confirmed" && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setRescheduleId(b.id)}>Reschedule</Button>
                    <Button size="sm" variant="danger" onClick={() => void cancelRemote(b.id)}>Cancel</Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Booking ID", "Crop", "Center", "Date", "Time", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((b) => {
              const center = state.centers.find((c) => c.id === b.centerId);
              return (
                <tr key={b.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-3 font-mono">{b.id}</td>
                  <td className="px-3 py-3">{b.crop}</td>
                  <td className="px-3 py-3">{center?.name}</td>
                  <td className="px-3 py-3">{b.date}</td>
                  <td className="px-3 py-3">{b.time}</td>
                  <td className="px-3 py-3"><BookingBadge status={b.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setViewId(b.id)}>View</Button>
                      {b.status === "Confirmed" && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => setRescheduleId(b.id)}>Reschedule</Button>
                          <Button size="sm" variant="danger" onClick={() => void cancelRemote(b.id)}>Cancel</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p>No bookings in this filter.</p>}
      <div className="flex justify-between">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" disabled={(page + 1) * pageSize >= rows.length} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      <Dialog open={!!viewing} onClose={() => setViewId(null)} title="Booking details">
        {viewing && (
          <div className="space-y-1 text-sm">
            <p><b>ID:</b> {viewing.id}</p>
            <p><b>Crop:</b> {viewing.crop}</p>
            <p><b>Center:</b> {state.centers.find((c) => c.id === viewing.centerId)?.name}</p>
            <p><b>Date / time:</b> {viewing.date} · {viewing.time}</p>
            <p><b>Wait:</b> ~{viewing.expectedWaitMin} min</p>
          </div>
        )}
      </Dialog>
      <Dialog open={!!rescheduling} onClose={() => setRescheduleId(null)} title="Reschedule">
        <div className="space-y-2">
          {slots.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              className="w-full justify-between"
              disabled={s.state === "FULL"}
              onClick={() => {
                if (!rescheduling) return;
                void rescheduleRemote(rescheduling.id, s.id, s.date, `${s.start} – ${s.end}`);
              }}
            >
              {s.date} {s.start}–{s.end} ({s.state})
            </Button>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
