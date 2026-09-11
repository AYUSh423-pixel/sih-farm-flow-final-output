"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import type { Crop, FarmerStatus } from "@/lib/types";

export default function FarmersPage() {
  const { state, addFarmer } = useAppStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<FarmerStatus | "All">("All");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    return state.farmers.filter((f) => {
      const hit = `${f.name} ${f.mobile} ${f.village} ${f.id}`.toLowerCase().includes(q.toLowerCase());
      return hit && (status === "All" || f.status === status);
    });
  }, [state.farmers, q, status]);
  const slice = filtered.slice(page * 10, (page + 1) * 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">Farmers</h1>
        <Button onClick={() => setOpen(true)}>Add Farmer</Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search name, mobile, village" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Farmer ID", "Name", "Mobile", "Village", "Crop", "Credit", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((f) => (
              <tr key={f.id} className="border-t border-[var(--line)]">
                <td className="px-3 py-3 font-mono">{f.id}</td>
                <td className="px-3 py-3">{f.name}</td>
                <td className="px-3 py-3">{f.mobile}</td>
                <td className="px-3 py-3">{f.village}</td>
                <td className="px-3 py-3">{f.crop}</td>
              <td className="px-3 py-3 font-semibold">{f.creditScore ?? 700}</td>
                <td className="px-3 py-3"><Badge tone={f.status === "Active" ? "good" : "warn"}>{f.status}</Badge></td>
                <td className="px-3 py-3"><Link href={`/admin/farmers/${f.id}`}><Button size="sm" variant="outline">View</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" disabled={(page + 1) * 10 >= filtered.length} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add farmer">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            addFarmer({
              name: String(data.get("name")),
              mobile: String(data.get("mobile")),
              village: String(data.get("village")),
              crop: data.get("crop") as Crop,
              status: "Active",
            });
            toast.success("Farmer added");
            setOpen(false);
          }}
        >
          <div><Label>Name</Label><Input name="name" required /></div>
          <div><Label>Mobile</Label><Input name="mobile" required /></div>
          <div><Label>Village</Label><Input name="village" required /></div>
          <div>
            <Label>Crop</Label>
            <Select name="crop"><option>Wheat</option><option>Cotton</option><option>Rice</option><option>Groundnut</option><option>Mustard</option></Select>
          </div>
          <Button className="w-full" type="submit">Save</Button>
        </form>
      </Dialog>
    </div>
  );
}
