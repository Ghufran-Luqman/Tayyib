import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { EmptyState } from "@/components/foodfit/EmptyState";
import { BmiFigure } from "@/components/foodfit/BmiFigure";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { bmiLabel } from "@/lib/foodfit/format";


export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Your profile · Tayyib" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useFoodFitStore((s) => s.profile);
  const loadDemo = useFoodFitStore((s) => s.loadDemoData);

  if (!profile) {
    return (
      <PageBody>
        <EmptyState
          title="No profile yet"
          description="Create your health profile to get personalised verdicts."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDemo}>
                Load demo profile
              </Button>
              <Button asChild className="bg-fit-green hover:bg-fit-green/90">
                <Link to="/onboarding">Create profile</Link>
              </Button>
            </div>
          }
        />
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title="Your profile"
        subtitle="The information Tayyib uses to personalise verdicts."
        action={
          <Button asChild variant="outline">
            <Link to="/onboarding">
              <Pencil className="mr-2 h-4 w-4" /> Edit profile
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Basics">
            <Row label="Nickname" value={profile.nickname} />
            <Row label="Age" value={profile.age?.toString()} />
            <Row label="Sex" value={profile.sex} />
            <Row label="Activity" value={profile.activityLevel} />
            <Row label="Main goal" value={profile.goal?.replace(/-/g, " ")} />
          </Card>
          <Card title="Body">
            <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : undefined} />
            <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : undefined} />
            <Row label="BMI" value={profile.bmi ? `${profile.bmi} (${bmiLabel(profile.bmi)})` : undefined} />
          </Card>
          {profile.bmi && (
            <div className="lg:col-span-2">
              <BmiFigure bmi={profile.bmi} sex={profile.sex} />
            </div>
          )}

          <Card title="Medical conditions">
            {profile.medicalConditions.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {profile.medicalConditions.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border bg-card px-2.5 py-1 text-xs"
                  >
                    {c.replace(/-/g, " ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None listed.</p>
            )}
          </Card>
          <Card title="Allergies & diet">
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Allergies
                </div>
                <p className="mt-1 text-sm">
                  {profile.allergies.length ? profile.allergies.join(", ") : "None listed."}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Diet preferences
                </div>
                <p className="mt-1 text-sm">
                  {profile.dietaryPreferences.length
                    ? profile.dietaryPreferences.join(", ")
                    : "None set."}
                </p>
              </div>
              {profile.halalRequired && (
                <div className="rounded-xl border border-fit-green/40 bg-fit-green/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-fit-green">
                      Halal scanning is ON
                    </div>
                    <span className="rounded-full bg-fit-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {profile.halalStrictness ?? "strict"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tayyib will flag products that contain haram or doubtful
                    (mashbooh) ingredients. Always verify with the manufacturer
                    when it matters.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Daily targets">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Row label="Calories" value={profile.clinicianLimits.calorieTarget?.toString()} unit="kcal" />
              <Row label="Protein" value={profile.clinicianLimits.proteinTargetG?.toString()} unit="g" />
              <Row label="Carbs" value={profile.clinicianLimits.carbTargetG?.toString()} unit="g" />
              <Row label="Sugar limit" value={profile.clinicianLimits.sugarLimitG?.toString()} unit="g" />
              <Row label="Sat fat limit" value={profile.clinicianLimits.saturatedFatLimitG?.toString()} unit="g" />
              <Row label="Sodium limit" value={profile.clinicianLimits.sodiumLimitMg?.toString()} unit="mg" />
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <div className="mt-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value, unit }: { label: string; value?: string; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value ? `${value}${unit ? ` ${unit}` : ""}` : "—"}
      </span>
    </div>
  );
}
