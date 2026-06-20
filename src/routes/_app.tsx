import { createFileRoute } from "@tanstack/react-router";
import { AppShellOutlet } from "@/components/foodfit/AppShell";

export const Route = createFileRoute("/_app")({
  component: AppShellOutlet,
});
