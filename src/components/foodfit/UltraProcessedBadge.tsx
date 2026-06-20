export function UltraProcessedBadge({ nova }: { nova?: 1 | 2 | 3 | 4 }) {
  if (!nova) return null;
  const labels = {
    1: { text: "Unprocessed (NOVA 1)", tone: "bg-fit-green/12 text-fit-green border-fit-green/30" },
    2: { text: "Culinary (NOVA 2)", tone: "bg-fit-green/12 text-fit-green border-fit-green/30" },
    3: { text: "Processed (NOVA 3)", tone: "bg-fit-amber/12 text-fit-amber border-fit-amber/30" },
    4: { text: "Ultra-processed (NOVA 4)", tone: "bg-fit-red/12 text-fit-red border-fit-red/30" },
  } as const;
  const c = labels[nova];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${c.tone}`}
    >
      {c.text}
    </span>
  );
}
