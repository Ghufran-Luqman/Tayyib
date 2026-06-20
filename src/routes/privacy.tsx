import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & disclaimer · Tayyib" },
      {
        name: "description",
        content:
          "How Tayyib handles your health data, and what to know about the limits of its guidance.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fit-green/15 text-fit-green">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold">Tayyib</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Privacy & disclaimer
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-8">
          <MedicalDisclaimerBanner />
        </div>

        <div className="prose prose-sm mt-8 max-w-none text-foreground/90">
          <h2 className="mt-8 font-display text-xl font-bold">Not medical advice</h2>
          <p>
            Tayyib provides educational nutrition guidance based on your stated
            health profile and publicly available nutrition data. It does not
            diagnose, treat, or prescribe. Results use language like
            "may be a poor fit", "consider limiting", or "check with your
            clinician" — they are informational only.
          </p>
          <p>
            If you have a medical condition, are pregnant, take medication, or
            have allergies, please consult a qualified healthcare professional
            before making dietary decisions. Tayyib is not a regulated medical
            device.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold">Your data</h2>
          <p>
            In this demo, your profile, meal log, and cached foods are stored
            <strong> only in your browser</strong> (via local storage). Nothing
            is uploaded to a server by Tayyib itself.
          </p>
          <p>
            Product lookups query the public <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">Open Food Facts</a> API.
            We send only the barcode or search term — never your health profile.
          </p>
          <p>
            You can delete everything at any time from{" "}
            <Link to="/settings" className="text-fit-green underline">
              Settings → Delete all my data
            </Link>
            .
          </p>

          <h2 className="mt-8 font-display text-xl font-bold">Data sources</h2>
          <ul>
            <li>Open Food Facts — community-contributed packaged food data.</li>
            <li>User-entered values — for custom meals and fast-food entries.</li>
          </ul>
          <p>
            Data quality varies. When key fields are missing, Tayyib marks the
            analysis as <em>low</em> or <em>medium</em> confidence.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold">Tone</h2>
          <p>
            We try to avoid shame-based language. Foods aren't "bad" — they're
            more or less suitable for a specific person, on a specific day, in a
            specific portion. The goal is sustainable, informed choices over
            time.
          </p>
        </div>
      </main>
    </div>
  );
}
