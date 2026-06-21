import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Camera, Keyboard, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/foodfit/AppShell";
import { MedicalDisclaimerBanner } from "@/components/foodfit/MedicalDisclaimerBanner";
import { openFoodFactsProvider } from "@/lib/foodProviders";
import { useFoodFitStore } from "@/lib/foodfit/store";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_app/scan")({
  head: () => ({ meta: [{ title: "Scan a barcode · Tayyib" }] }),
  component: ScanPage,
});

function ScanPage() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [looking, setLooking] = useState(false);

  const cacheFood = useFoodFitStore((s) => s.cacheFood);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  async function startCamera() {
    setError(null);
    setScanning(true);
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, err, ctrls) => {
          if (result) {
            const text = result.getText();
            ctrls.stop();
            controlsRef.current = null;
            setScanning(false);
            handleBarcode(text);
          }
        },
      );
      controlsRef.current = controls;
    } catch (e: any) {
      setScanning(false);
      setError(
        e?.name === "NotAllowedError"
          ? "Camera permission was denied. Enter the barcode manually below."
          : "Couldn't start the camera. Enter the barcode manually below.",
      );
    }
  }

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  async function handleBarcode(code: string) {
    setLooking(true);
    try {
      const food = await openFoodFactsProvider.getByBarcode(code);
      if (!food) {
        toast.error("We couldn't find this barcode in Open Food Facts.");
        setLooking(false);
        return;
      }
      cacheFood(food);
      toast.success(`Found: ${food.name}`);
      navigate({ to: "/food/$id", params: { id: food.id } });
    } catch (e) {
      toast.error("Lookup failed. Please try again.");
    } finally {
      setLooking(false);
    }
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) handleBarcode(manualCode.trim());
  }

  return (
    <>
      <PageHeader
        title={t("scan.title")}
        subtitle={t("scan.subtitle")}
      />
      <PageBody>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="overflow-hidden rounded-3xl border bg-black">
            <div className="relative aspect-[4/3] w-full">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold">{t("scan.cameraTitle")}</div>
                    <p className="mt-1 max-w-xs text-sm text-white/70">
                      {t("scan.cameraHint")}
                    </p>
                  </div>
                  <Button onClick={startCamera} className="bg-fit-green hover:bg-fit-green/90">
                    <Camera className="mr-2 h-4 w-4" /> {t("scan.startCamera")}
                  </Button>
                </div>
              )}
              {scanning && (
                <>
                  <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-2xl border-2 border-fit-green/80" />
                  <button
                    onClick={stopCamera}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              {looking && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("scan.lookingUp")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-fit-amber/30 bg-fit-amber/10 p-3 text-sm text-foreground/80">
              {error}
            </div>
          )}

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Keyboard className="h-4 w-4" /> {t("scan.manualTitle")}
            </div>
            <form onSubmit={submitManual} className="mt-3 flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 3017620422003"
                inputMode="numeric"
              />
              <Button
                type="submit"
                disabled={!manualCode.trim() || looking}
                className="bg-fit-green hover:bg-fit-green/90"
              >
                {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : t("scan.lookUp")}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("scan.offNote")}
            </p>
          </div>

          <MedicalDisclaimerBanner variant="compact" />
        </div>
      </PageBody>
    </>
  );
}
