import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Moon, Sun } from "lucide-react";
import { NAV_GROUPS, NAV_ITEMS } from "./nav";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/app-store";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-4 px-3 pb-6">
      {NAV_GROUPS.map((group) => (
        <div key={group}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
            {group}
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                      active
                        ? "bg-gradient-to-r from-primary/15 to-transparent font-semibold text-ink ring-1 ring-primary/30"
                        : "font-medium text-mute hover:veil hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md",
                        active ? "bg-primary/20 text-primary" : "veil text-mute",
                      )}
                    >
                      <item.icon className="size-3.5" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ThemeToggle() {
  const { data, setSettings } = useStore();
  const dark = data.settings.theme === "dark";
  return (
    <button
      onClick={() => setSettings({ theme: dark ? "light" : "dark" })}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-2 rounded-full veil px-2.5 py-1.5 text-[11px] font-semibold text-ink ring-1 ring-line transition-colors hover:text-primary"
    >
      {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="app-canvas min-h-dvh bg-background text-ink">
      <div className="relative mx-auto flex max-w-[1560px] flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 z-30 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-background/70 backdrop-blur lg:flex">
          <Link to="/" className="flex items-center gap-2.5 px-5 py-4">
            <Logo />
            <span className="min-w-0">
              <span className="block font-display text-[15px] font-semibold leading-none">
                StudentOS
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-mute">
                Control Panel
              </span>
            </span>
          </Link>
          <div className="scrollbar-slim flex-1 overflow-y-auto">
            <NavList />
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <span className="text-[11px] font-medium text-mute">Appearance</span>
            <ThemeToggle />
          </div>
        </aside>

        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-background/90 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="grid size-9 shrink-0 place-items-center rounded-lg veil ring-1 ring-line"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Logo size={24} />
            <span className="truncate font-display text-sm font-semibold">StudentOS</span>
          </Link>
          <div className="ml-auto shrink-0">
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile drawer */}
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 flex w-[276px] max-w-[86vw] flex-col border-r border-line bg-background">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Logo size={26} />
                  <span className="font-display text-sm font-semibold">StudentOS</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="grid size-9 place-items-center rounded-lg veil ring-1 ring-line"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="scrollbar-slim flex-1 overflow-y-auto">
                <NavList onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
