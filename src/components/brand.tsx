export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ${light ? "bg-white/15 text-white" : "bg-[var(--primary)] text-white"}`}
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
          <path d="M16 4c4 5 6 9 6 13a6 6 0 1 1-12 0c0-4 2-8 6-13Z" />
          <path d="M8 24h16v2H8z" opacity=".7" />
        </svg>
      </span>
      <span className={`font-[family-name:var(--font-display)] text-xl tracking-tight ${light ? "text-white" : "text-[var(--heading)]"}`}>
        FARM FLOW
      </span>
    </div>
  );
}

export function QrPlaceholder({ value }: { value: string }) {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const n = value.charCodeAt(i % value.length) + i * 13;
    return n % 3 !== 0;
  });
  return (
    <div className="inline-block rounded-xl border border-[var(--line)] bg-white p-3" aria-label={`QR for ${value}`}>
      <div className="grid grid-cols-11 gap-0.5">
        {cells.map((on, i) => (
          <span key={i} className={`h-2.5 w-2.5 ${on ? "bg-[var(--heading)]" : "bg-white"}`} />
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-[#5c6f68]">{value}</p>
    </div>
  );
}
