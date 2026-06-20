import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Heart,
  Leaf,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tayyib — Is this food a good fit for you?" },
      {
        name: "description",
        content:
          "Tayyib helps you check whether packaged foods, fast-food meals, and everyday meals fit your personal health profile. Scan, search, and track — educational, not medical advice.",
      },
      { property: "og:title", content: "Tayyib — Is this food a good fit for you?" },
      {
        property: "og:description",
        content:
          "Personalised nutrition guidance based on your health profile. Scan a barcode and see.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fit-green/15 text-fit-green">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">Tayyib</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
            >
              Open app
            </Link>
            <Button asChild size="sm" className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/onboarding">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--fit-green) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-fit-green">
              <Sparkles className="h-3.5 w-3.5" /> Personalised nutrition guidance
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Find out whether a food is a{" "}
              <span className="text-fit-green">good fit</span> for your health profile.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Scan a barcode, search a product, or log a meal. Tayyib compares it
              against your stated health profile and your day so far — and gives
              you a clear, friendly verdict.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-fit-green hover:bg-fit-green/90">
                <Link to="/onboarding">
                  Create health profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/scan">
                  <Camera className="mr-2 h-4 w-4" /> Scan a food
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No sign-up needed for the demo. Your data stays in your browser.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border bg-card p-5 shadow-xl shadow-fit-green/5">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-fit-amber/30 to-fit-red/20" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Chocolate chip cookies</div>
                  <div className="text-xs text-muted-foreground">Demo Bakery · 2 cookies (30g)</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-fit-red/30 bg-fit-red/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-fit-red">
                  <span className="h-1.5 w-1.5 rounded-full bg-fit-red" /> Poor fit
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-muted-foreground">Sugar</div>
                  <div className="font-semibold">12 g</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-muted-foreground">Sat fat</div>
                  <div className="font-semibold">4 g</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-muted-foreground">NOVA</div>
                  <div className="font-semibold">4</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-fit-red/5 p-3 text-xs text-foreground/80">
                <span className="font-semibold text-fit-red">Why: </span>
                High sugar with your prediabetes profile, and your sodium is
                already high today. Consider a lower-sugar alternative.
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Tayyib score</span>
                <span className="font-display text-2xl font-bold text-fit-red">28</span>
              </div>
            </div>
            <div className="absolute -right-3 -top-3 hidden rotate-3 rounded-2xl border bg-card px-3 py-2 text-xs shadow-lg md:block">
              <div className="font-semibold text-fit-green">+ 17g protein</div>
              <div className="text-muted-foreground">Better alternative</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Everything you need to eat with intention
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Built for everyday decisions, designed for long-term wellbeing.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ScanLine,
              title: "Barcode scanning",
              body: "Point your camera at a packaged food and we'll pull nutrition data from Open Food Facts.",
            },
            {
              icon: Utensils,
              title: "Ingredient analysis",
              body: "Allergens, additives, and ultra-processed flags — explained in plain English.",
            },
            {
              icon: Heart,
              title: "Personalised flags",
              body: "Rules tuned for diabetes, hypertension, heart health, allergies, and dietary preferences.",
            },
            {
              icon: BarChart3,
              title: "Calorie & nutrient tracking",
              body: "Log meals and see today's sodium, sugar, and saturated fat against your targets.",
            },
            {
              icon: Sparkles,
              title: "Tayyib score",
              body: "A 0–100 score with a clear verdict: good fit, occasional, or worth limiting.",
            },
            {
              icon: ShieldCheck,
              title: "Privacy-first",
              body: "Demo data stays in your browser. Sensitive health data isn't shared.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fit-green/10 text-fit-green">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Tell us about you", b: "Age, goals, conditions, allergies, and preferences. Edit any time." },
              { n: "02", t: "Add a food", b: "Scan, search, or log a custom meal. Public OFF data does most of the work." },
              { n: "03", t: "Get a clear verdict", b: "Tayyib score, key reasons, portion guidance, and friendly alternatives." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-card p-6">
                <div className="font-display text-sm font-bold text-fit-green">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="rounded-3xl border bg-gradient-to-br from-fit-green/10 via-card to-fit-blue/10 p-8 md:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Ready to see if your next snack is a fit?
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Set up your profile in under a minute. Try the demo without an account.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-fit-green hover:bg-fit-green/90">
              <Link to="/onboarding">Create health profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">Try the demo</Link>
            </Button>
          </div>
          <div className="mt-6">
            <MedicalDisclaimerBanner variant="compact" />
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-fit-green" />
            <span>© {new Date().getFullYear()} Tayyib. Educational use only.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy & disclaimer</Link>
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Data: Open Food Facts
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
