import type { Verdict } from "../foodfit/types";

export function verdictColorClasses(v: Verdict): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  label: string;
} {
  if (v === "green")
    return {
      bg: "bg-fit-green/10",
      text: "text-fit-green",
      border: "border-fit-green/30",
      ring: "ring-fit-green/40",
      label: "Good fit",
    };
  if (v === "amber")
    return {
      bg: "bg-fit-amber/10",
      text: "text-fit-amber",
      border: "border-fit-amber/30",
      ring: "ring-fit-amber/40",
      label: "Occasional",
    };
  return {
    bg: "bg-fit-red/10",
    text: "text-fit-red",
    border: "border-fit-red/30",
    ring: "ring-fit-red/40",
    label: "Poor fit",
  };
}

export function calcBmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg) return undefined;
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiLabel(bmi?: number): string {
  if (!bmi) return "—";
  if (bmi < 18.5) return "Below typical range";
  if (bmi < 25) return "Within typical range";
  if (bmi < 30) return "Above typical range";
  return "Well above typical range";
}

export function fmt(n: number | undefined, unit = "", digits = 0): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}${unit}`;
}
