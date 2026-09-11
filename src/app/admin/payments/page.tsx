"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { PaymentBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { formatInr } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

export default function AdminPayments() {
  const { state, updatePaymentStatus } = useAppStore();
  const [status, setStatus] = useState<PaymentStatus | "All">("All");
  const [page, setPage] = useState(0);
  const rows = useMemo(
    () => (status === "All" ? state.payments : state.payments.filter((p) => p.status === status)),
    [state.payments, status],
  );
  const total = state.payments.reduce((a, p) => a + p.amount, 0);
  const paid = state.payments.filter((p) => p.status === "Paid").reduce((a, p) => a + p.amount, 0);
  const processing = state.payments.filter((p) => p.status === "Processing").reduce((a, p) => a + p.amount, 0);
  const delayed = state.payments.filter((p) => p.status === "Delayed").reduce((a, p) => a + p.amount, 0);
  const slice = rows.slice(page * 10, (page + 1) * 10);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Payments</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4"><p className="text-sm">Total</p><p className="text-xl font-bold">{formatInr(total)}</p></Card>
        <Card className="p-4"><p className="text-sm">Paid</p><p className="text-xl font-bold">{formatInr(paid)}</p></Card>
        <Card className="p-4"><p className="text-sm">Processing</p><p className="text-xl font-bold">{formatInr(processing)}</p></Card>
        <Card className="p-4"><p className="text-sm">Delayed</p><p className="text-xl font-bold">{formatInr(delayed)}</p></Card>
      </div>
      <Select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(0); }}>
        <option>All</option>
        <option>Paid</option>
        <option>Processing</option>
        <option>Delayed</option>
      </Select>
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Payment ID", "Farmer", "Procurement ID", "Amount", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => {
              const farmer = state.farmers.find((f) => f.id === p.farmerId);
              return (
                <tr key={p.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-3 font-mono">{p.id}</td>
                  <td className="px-3 py-3">{farmer?.name}</td>
                  <td className="px-3 py-3 font-mono">{p.procurementId}</td>
                  <td className="px-3 py-3">{formatInr(p.amount)}</td>
                  <td className="px-3 py-3"><PaymentBadge status={p.status} /></td>
                  <td className="px-3 py-3">{p.date}</td>
                  <td className="px-3 py-3">
                    {(["Processing", "Paid", "Delayed"] as PaymentStatus[]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          updatePaymentStatus(p.id, s);
                          toast.success("Payment status updated.");
                        }}
                      >
                        {s}
                      </Button>
                    ))}
                  </td>
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
    </div>
  );
}
