import { cn } from "@/lib/utils";

export function SourceAttribution({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const label =
    source === "openfoodfacts"
      ? "Data from Open Food Facts (community-contributed)"
      : source === "demo"
        ? "Demo data (illustrative only)"
        : source === "fastfood"
          ? "User-entered restaurant data"
          : "User-entered data";
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{label}</p>
  );
}
