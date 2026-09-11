"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { GrievanceBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { DEMO_FARMER_ID, DEMO_PROCUREMENT_ID } from "@/lib/mock-data";
import { t } from "@/lib/i18n";
import type { GrievanceCategory } from "@/lib/types";

function GrievancesInner() {
  const params = useSearchParams();
  const { state, raiseGrievance } = useAppStore();
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;
  const [open, setOpen] = useState(params.get("raise") === "1");
  const [category, setCategory] = useState<GrievanceCategory>(
    (params.get("category") as GrievanceCategory) || "Payment Delay",
  );
  const [pid, setPid] = useState(DEMO_PROCUREMENT_ID);
  const [desc, setDesc] = useState("Payment has not arrived after the promised date.");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const mine = useMemo(
    () => state.grievances.filter((g) => g.farmerId === farmerId),
    [state.grievances, farmerId],
  );
  const list = mine.length ? mine : state.grievances.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">{t(state.lang, "grievances")}</h1>
        <Button onClick={() => setOpen(true)}>+ {t(state.lang, "raiseGrievance")}</Button>
      </div>
      {submitted && (
        <Card className="border-[var(--primary)] p-5">
          <p className="font-bold">Grievance submitted.</p>
          <p className="font-mono">{submitted}</p>
          <p>Status: Open</p>
        </Card>
      )}
      {list.map((g) => (
        <Card key={g.id} className="p-4">
          <div className="flex justify-between gap-2">
            <p className="font-mono text-sm">{g.id}</p>
            <GrievanceBadge status={g.status} />
          </div>
          <p className="mt-1 font-bold">{g.category}</p>
          <p className="text-sm">{g.description}</p>
          <ol className="mt-3 flex flex-wrap gap-2 text-xs">
            {g.timeline.map((tItem) => (
              <li key={tItem.label} className={`rounded-lg px-2 py-1 ${tItem.done ? "bg-[var(--sage)]" : "bg-[#eef2ef]"}`}>
                {tItem.label}
              </li>
            ))}
          </ol>
        </Card>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} title="Raise grievance">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              try {
                const result = await api.post<{ grievance: { id: string } }>("/grievance.php", {
                  farmerId,
                  procurementId: pid,
                  category,
                  description: desc,
                });
                const id = raiseGrievance({ id: result.grievance.id, farmerId, procurementId: pid, category, description: desc });
                toast.success("Grievance submitted.");
                setSubmitted(id);
                setOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to submit grievance");
              }
            })();
          }}
        >
          <div>
            <Label>Procurement ID</Label>
            <Input value={pid} onChange={(e) => setPid(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as GrievanceCategory)}>
              <option>Payment Delay</option>
              <option>Incorrect Grading</option>
              <option>Slot Problem</option>
              <option>Center Problem</option>
              <option>Other</option>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <div>
            <Label>Optional attachment</Label>
            <Input type="file" />
          </div>
          <Button className="w-full" type="submit">Submit</Button>
        </form>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <GrievancesInner />
    </Suspense>
  );
}
