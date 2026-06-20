import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";
import { useFoodFitStore } from "@/lib/foodfit/store";
import type { HalalStrictness } from "@/lib/foodfit/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Tayyib" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useFoodFitStore((s) => s.settings);
  const setSettings = useFoodFitStore((s) => s.setSettings);
  const resetAll = useFoodFitStore((s) => s.resetAll);
  const loadDemo = useFoodFitStore((s) => s.loadDemoData);

  return (
    <>
      <PageHeader title="Settings" subtitle="Tune the app and manage your data." />
      <PageBody>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-base font-bold">Profile & targets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your nickname, track, allergies, conditions, and nutrient targets.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/onboarding">Edit profile</Link>
              </Button>
              <Button variant="outline" onClick={loadDemo}>
                Load demo profile
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-base font-bold">Experience</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how much detail Tayyib shows. Simple mode hides advanced
              numbers and uses plainer language.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="mode" className="text-sm">
                  <div className="font-medium">In-depth experience</div>
                  <div className="text-xs text-muted-foreground">
                    Show full nutrition breakdown, rule flags, and reasoning.
                  </div>
                </Label>
                <Switch
                  id="mode"
                  checked={settings.experienceMode === "detailed"}
                  onCheckedChange={(v) =>
                    setSettings({ experienceMode: v ? "detailed" : "simple" })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="large" className="text-sm">
                  <div className="font-medium">Larger text</div>
                  <div className="text-xs text-muted-foreground">
                    Easier to read on small screens and for older eyes.
                  </div>
                </Label>
                <Switch
                  id="large"
                  checked={settings.largeText}
                  onCheckedChange={(v) => setSettings({ largeText: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="llm" className="text-sm">
                  <div className="font-medium">Personalised summary</div>
                  <div className="text-xs text-muted-foreground">
                    Friendly plain-English summary at the top of every analysis.
                  </div>
                </Label>
                <Switch
                  id="llm"
                  checked={settings.llmExplanationsEnabled}
                  onCheckedChange={(v) => setSettings({ llmExplanationsEnabled: v })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-base font-bold">Halal / Tayyib scan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Flag ingredients that are haram or doubtful (mashbooh). This is a
              text-based heuristic — always verify with the manufacturer when it
              matters.
            </p>
            <div className="mt-4 max-w-sm">
              <Label htmlFor="halal" className="text-sm font-medium">
                Strictness
              </Label>
              <Select
                value={settings.halalStrictness}
                onValueChange={(v) =>
                  setSettings({ halalStrictness: v as HalalStrictness })
                }
              >
                <SelectTrigger id="halal" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="low">Low — flag obvious haram only</SelectItem>
                  <SelectItem value="medium">Medium — flag gelatin & known animal additives</SelectItem>
                  <SelectItem value="strict">Strict — flag all doubtful additives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-base font-bold">Privacy & data</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your profile and meal logs are stored only in this browser. Clearing
              your browser data will remove them.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/privacy">Read privacy disclaimer</Link>
              </Button>
              <Button
                variant="outline"
                className="text-fit-red hover:text-fit-red"
                onClick={() => {
                  if (
                    window.confirm(
                      "This will permanently delete your profile, meal log, and cached foods from this browser. Continue?",
                    )
                  ) {
                    resetAll();
                    toast.success("All Tayyib data cleared from this browser.");
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete all my data
              </Button>
            </div>
          </div>

          <MedicalDisclaimerBanner />
        </div>
      </PageBody>
    </>
  );
}
