"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-[var(--sage)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "min-h-11 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-semibold",
            value === tab.id ? "bg-white text-[var(--heading)] shadow-sm" : "text-[#4d635a]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[#e4ece6]", className)} />;
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e4ece6]">
      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
      <p className="text-lg font-semibold text-[var(--heading)]">{title}</p>
      <p className="mt-1 text-[#5c6f68]">{hint}</p>
    </div>
  );
}
