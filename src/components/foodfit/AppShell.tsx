import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Camera,
  History,
  Home,
  Leaf,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFoodFitStore } from "@/lib/foodfit/store";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/scan", label: "Scan", icon: Camera },
  { to: "/search", label: "Search", icon: Search },
  { to: "/history", label: "Meals", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const bottomItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: Camera },
  { to: "/search", label: "Add", icon: Plus },
  { to: "/history", label: "Meals", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const largeText = useFoodFitStore((s) => s.settings.largeText);
  const theme = useFoodFitStore((s) => s.settings.theme);
  const setSettings = useFoodFitStore((s) => s.setSettings);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("tayyib-large", largeText);
  }, [largeText]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () =>
    setSettings({ theme: theme === "dark" ? "light" : "dark" });




  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fit-green/15 text-fit-green">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold">Tayyib</div>
              <div className="text-xs text-muted-foreground">Nutrition fit checker</div>
            </div>
          </Link>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-fit-green/12 text-fit-green"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/settings"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="mt-3 rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-fit-green">
                <Sparkles className="h-3.5 w-3.5" />
                Demo mode
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your data stays in this browser. Sign-in & cloud sync coming soon.
              </p>
            </div>
          </div>

        </aside>

        {/* Main */}
        <main className="min-h-screen flex-1 pb-24 md:pb-8">
          {/* Mobile header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fit-green/15 text-fit-green">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold">Tayyib</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {bottomItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                  active ? "text-fit-green" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function AppShellOutlet() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-6 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="px-4 py-6 md:px-8">{children}</div>;
}

export function ActivityIcon() {
  return <Activity className="h-4 w-4" />;
}
