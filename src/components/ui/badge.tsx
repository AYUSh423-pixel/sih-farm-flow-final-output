import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const tones = {
    neutral: "bg-[#eef2ef] text-[var(--heading)]",
    good: "bg-[#e4f6ea] text-[#146c3c]",
    warn: "bg-[#fff4d6] text-[#8a5a00]",
    bad: "bg-[#fde8e6] text-[#b42318]",
    info: "bg-[#e8f1fb] text-[#1849a9]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
