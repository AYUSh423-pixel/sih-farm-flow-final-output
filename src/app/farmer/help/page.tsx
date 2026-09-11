"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function HelpPage() {
  const { state } = useAppStore();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">{t(state.lang, "help")}</h1>
      <Card className="p-5">
        <p className="text-lg font-semibold">If something is delayed, raise it here. Do not wait at the center.</p>
        <div className="mt-4 grid gap-2">
          <Link href="/farmer/grievances?raise=1"><Button className="w-full">{t(state.lang, "raiseGrievance")}</Button></Link>
          <Link href="/farmer/payments"><Button variant="secondary" className="w-full">Check payment</Button></Link>
          <Link href="/farmer/bookings"><Button variant="outline" className="w-full">My bookings</Button></Link>
        </div>
      </Card>
      <Card className="p-5">
        <p className="font-bold">Helpline (demo)</p>
        <p>1800-123-3276</p>
        <p className="mt-2 text-sm text-[#5c6f68]">Ask a family member or center helper to book a slot if using a shared phone.</p>
      </Card>
    </div>
  );
}
