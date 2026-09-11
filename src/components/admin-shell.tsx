"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Settings,
  Sprout,
  Users,
  Wheat,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Farmer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/farmers", label: "Farmers", icon: Users },
  { href: "/admin/centers", label: "Procurement Centers", icon: Building2 },
  { href: "/admin/slots", label: "Slots & Queue", icon: CalendarClock },
  { href: "/admin/procurement", label: "Procurement", icon: Wheat },
  { href: "/admin/payments", label: "Payments", icon: IndianRupee },
  { href: "/admin/grievances", label: "Grievances", icon: Sprout },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/alerts", label: "Farmer Alerts", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { state, ready, logout, replaceFarmers } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!state.user || state.user.role !== "admin") router.replace("/");
  }, [ready, state.user, router]);

  useEffect(() => {
    if (!ready || state.user?.role !== "admin") return;
    void api.get<{ farmers: Farmer[] }>("/farmers.php", { farmers: [] }).then((result) => replaceFarmers(result.farmers));
  }, [ready, state.user?.role, replaceFarmers]);

  if (!ready || !state.user || state.user.role !== "admin") {
    return <div className="p-8 text-[#5c6f68]">Loading admin desk…</div>;
  }

  return (
    <div className="min-h-dvh bg-[var(--canvas)]">
      <div className="flex">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-[var(--line)] bg-white p-4 md:block">
          <Logo />
          <p className="mt-2 px-1 text-xs text-[#5c6f68]">Procurement operations</p>
          <nav className="mt-6 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                    active ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--sage)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-white/90 px-4 py-3 backdrop-blur">
            <div className="md:hidden">
              <Logo />
            </div>
            <p className="hidden text-sm font-semibold text-[var(--heading)] md:block">{state.user.email}</p>
            <div className="flex items-center gap-2 overflow-x-auto md:hidden">
              {nav.slice(0, 5).map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold">
                  {item.label.split(" ")[0]}
                </Link>
              ))}
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[var(--sage)]"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
