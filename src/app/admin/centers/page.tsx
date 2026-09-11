"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { congestionLabel, congestionTone } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Center } from "@/lib/types";

export default function CentersPage() {
  const { state, replaceCenters, updateCenter } = useAppStore();
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const rows = useMemo(
    () => state.centers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.location.toLowerCase().includes(q.toLowerCase())),
    [state.centers, q],
  );
  const editing = state.centers.find((c) => c.id === editId);

  useEffect(() => {
    void api.get<{ centers: Center[] }>("/centers.php", { centers: [] }).then((result) => replaceCenters(result.centers));
  }, [replaceCenters]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Procurement centers</h1>
      <Input placeholder="Search center" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Center ID", "Center Name", "Location", "Daily Capacity", "Current Load", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-[var(--line)]">
                <td className="px-3 py-3">{c.id}</td>
                <td className="px-3 py-3">{c.name}</td>
                <td className="px-3 py-3">{c.location}</td>
                <td className="px-3 py-3">{c.dailyCapacity}</td>
                <td className="px-3 py-3">
                  <Badge tone={congestionTone(c.congestion)}>{Math.round((c.bookedToday / c.dailyCapacity) * 100)}% · {congestionLabel(c.congestion)}</Badge>
                </td>
                <td className="px-3 py-3">{c.status}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <Link href={`/admin/centers/${c.id}`}><Button size="sm" variant="outline">View</Button></Link>
                    <Button size="sm" variant="secondary" onClick={() => { setEditId(c.id); setEditName(c.name); setEditLocation(c.location); }}>Edit</Button>
                    <Link href={`/admin/slots?center=${c.id}`}><Button size="sm">Manage Slots</Button></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onClose={() => setEditId(null)} title="Edit center">
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                try {
                  const result = await api.post<{ center: Center }>("/centers.php", { id: editing.id, name: editName, location: editLocation });
                  updateCenter(result.center);
                  toast.success("Center details saved");
                  setEditId(null);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to save center");
                }
              })();
            }}
            className="space-y-3"
          >
            <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Location</Label><Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} /></div>
            <Button className="w-full" type="submit">Save</Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
