"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/field";
import { GrievanceBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import type { GrievanceStatus } from "@/lib/types";

export default function AdminGrievances() {
  const { state, assignGrievance, resolveGrievance, escalateGrievance } = useAppStore();
  const [status, setStatus] = useState<GrievanceStatus | "All">("All");
  const [viewId, setViewId] = useState<string | null>(null);
  const counts = {
    Open: state.grievances.filter((g) => g.status === "Open").length,
    "In Progress": state.grievances.filter((g) => g.status === "In Progress").length,
    Resolved: state.grievances.filter((g) => g.status === "Resolved").length,
    Escalated: state.grievances.filter((g) => g.status === "Escalated").length,
  };
  const rows = useMemo(
    () => (status === "All" ? state.grievances : state.grievances.filter((g) => g.status === status)),
    [state.grievances, status],
  );
  const item = state.grievances.find((g) => g.id === viewId);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Grievances</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <Card key={k} className="p-4"><p className="text-sm">{k}</p><p className="text-2xl font-bold">{v}</p></Card>
        ))}
      </div>
      <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
        <option>All</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Resolved</option>
        <option>Escalated</option>
      </Select>
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Grievance ID", "Farmer", "Issue", "Procurement ID", "Priority", "Status", "Created", "Action"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const farmer = state.farmers.find((f) => f.id === g.farmerId);
              return (
                <tr key={g.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-3 font-mono">{g.id}</td>
                  <td className="px-3 py-3">{farmer?.name}</td>
                  <td className="px-3 py-3">{g.category}</td>
                  <td className="px-3 py-3 font-mono">{g.procurementId}</td>
                  <td className="px-3 py-3">{g.priority}</td>
                  <td className="px-3 py-3"><GrievanceBadge status={g.status} /></td>
                  <td className="px-3 py-3">{g.createdAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => setViewId(g.id)}>View</Button>
                      <Button size="sm" variant="secondary" onClick={() => { assignGrievance(g.id, "Officer Mehta"); toast.success("Grievance assigned"); }}>Assign</Button>
                      <Button size="sm" onClick={() => { resolveGrievance(g.id); toast.success("Grievance resolved"); }}>Resolve</Button>
                      <Button size="sm" variant="danger" onClick={() => { escalateGrievance(g.id); toast.success("Grievance escalated"); }}>Escalate</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog open={!!item} onClose={() => setViewId(null)} title="Grievance detail">
        {item && (
          <div className="space-y-2 text-sm">
            <p>{item.id}</p>
            <p>{item.category}</p>
            <p>{item.description}</p>
            <ol className="space-y-1">
              {item.timeline.map((t) => (
                <li key={t.label}>{t.done ? "✓" : "○"} {t.label} {t.at}</li>
              ))}
            </ol>
          </div>
        )}
      </Dialog>
    </div>
  );
}
