"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CircleHelp,
  Home,
  IndianRupee,
  LogOut,
  Radio,
  Sprout,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const desktopNav = [
  { href: "/farmer", key: "dashboard", icon: Home },
  { href: "/farmer/book", key: "bookSlot", icon: CalendarClock },
  { href: "/farmer/bookings", key: "myBookings", icon: CalendarClock },
  { href: "/farmer/live-status", key: "liveStatus", icon: Radio },
  { href: "/farmer/payments", key: "payments", icon: IndianRupee },
  { href: "/farmer/notifications", key: "notifications", icon: Bell },
  { href: "/farmer/grievances", key: "grievances", icon: Sprout },
  { href: "/farmer/profile", key: "profile", icon: UserRound },
] as const;

const mobileNav = [
  { href: "/farmer", key: "home", icon: Home },
  { href: "/farmer/book", key: "bookSlot", icon: CalendarClock },
  { href: "/farmer/bookings", key: "myBookings", icon: CalendarClock },
  { href: "/farmer/live-status", key: "liveStatus", icon: Radio },
  { href: "/farmer/payments", key: "payments", icon: IndianRupee },
  { href: "/farmer/help", key: "help", icon: CircleHelp },
] as const;

export function FarmerShell({ children }: { children: React.ReactNode }) {
  const { state, ready, logout, setLang } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const unread = state.notifications.filter((n) => n.farmerId === state.user?.farmerId && !n.read).length;

  useEffect(() => {
    if (!ready) return;
    if (!state.user || state.user.role !== "farmer") router.replace("/");
  }, [ready, state.user, router]);

  if (!ready || !state.user || state.user.role !== "farmer") {
    return <div className="p-8 text-[#5c6f68]">Loading your farm desk…</div>;
  }

  const lang = state.lang;

  return (
    <div className="min-h-dvh bg-[var(--canvas)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="lang">
              {t(lang, "language")}
            </label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="h-10 rounded-xl border border-[var(--line)] bg-white px-2 text-sm font-semibold"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
            <Link href="/farmer/notifications" className="relative grid h-11 w-11 place-items-center rounded-xl hover:bg-[var(--sage)]">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#b42318] px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link href="/farmer/profile" className="hidden items-center gap-2 rounded-xl px-2 py-1 hover:bg-[var(--sage)] sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--sage)] text-sm font-bold">
                {state.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <span className="text-sm font-semibold">{state.user.email}</span>
            </Link>
            <button onClick={() => { logout(); router.push("/"); }} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-[var(--sage)]" aria-label={t(lang, "logout")}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-5">
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
          <nav className="space-y-1">
            {desktopNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                    active ? "bg-[var(--primary)] text-white" : "text-[var(--heading)] hover:bg-white",
                  )}
                >
                  <Icon className="h-4 w-5" />
                  {t(lang, item.key)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-24 lg:pb-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white lg:hidden">
        <div className="grid grid-cols-6">
          {mobileNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold",
                  active ? "text-[var(--primary)]" : "text-[#5c6f68]",
                )}
              >
                <Icon className="h-5 w-5" />
                {t(lang, item.key === "bookSlot" ? "bookSlot" : item.key)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
