"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentBadge } from "@/components/status";
import { useAppStore } from "@/lib/store";
import { formatInr } from "@/lib/utils";
import { DEMO_FARMER_ID } from "@/lib/mock-data";
import { t } from "@/lib/i18n";

export default function PaymentsPage() {
  const { state } = useAppStore();
  const router = useRouter();
  const farmerId = state.user?.farmerId ?? DEMO_FARMER_ID;
  const mine = useMemo(() => state.payments.filter((p) => p.farmerId === farmerId), [state.payments, farmerId]);
  const extra = mine.length ? [] : state.payments.slice(0, 8);
  const rows = mine.length ? mine : extra;
  const pending = rows.filter((p) => p.status !== "Paid").reduce((a, p) => a + p.amount, 0);
  const paid = rows.filter((p) => p.status === "Paid").reduce((a, p) => a + p.amount, 0);
  const processing = rows.filter((p) => p.status === "Processing" || p.status === "Delayed").reduce((a, p) => a + p.amount, 0);
  const delayed = rows.find((p) => p.status === "Delayed");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">{t(state.lang, "payments")}</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-sm">Total pending</p><p className="text-2xl font-bold">{formatInr(pending || 12500)}</p></Card>
        <Card className="p-4"><p className="text-sm">Paid</p><p className="text-2xl font-bold">{formatInr(paid || 48200)}</p></Card>
        <Card className="p-4"><p className="text-sm">Processing</p><p className="text-2xl font-bold">{formatInr(processing || 12500)}</p></Card>
      </div>
      {delayed && (
        <Card className="border-[#f2c4c0] bg-[#fff7f6] p-5">
          <p className="font-bold text-[#b42318]">⚠ PAYMENT DELAY DETECTED</p>
          <p className="mt-1">{t(state.lang, "delayBody")}</p>
          <p className="text-sm">Expected: 9 September · Current: Pending</p>
          <p className="mt-2 text-sm text-[#5c6f68]">{t(state.lang, "delayExplain")}</p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => router.push("/farmer/grievances")}>{t(state.lang, "trackIssue")}</Button>
            <Button variant="outline" onClick={() => router.push("/farmer/grievances?raise=1")}>{t(state.lang, "raiseGrievance")}</Button>
          </div>
        </Card>
      )}
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sage)]">
            <tr>
              {["Procurement ID", "Crop", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((p) => (
              <tr key={p.id} className="border-t border-[var(--line)]">
                <td className="px-3 py-3 font-mono">{p.procurementId}</td>
                <td className="px-3 py-3">{p.crop}</td>
                <td className="px-3 py-3">{formatInr(p.amount)}</td>
                <td className="px-3 py-3">{p.date}</td>
                <td className="px-3 py-3"><PaymentBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
