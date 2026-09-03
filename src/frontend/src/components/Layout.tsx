import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, Outlet } from "@tanstack/react-router";
import { Activity, Gauge, Rocket } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/mission", label: "Mission", icon: Rocket },
];

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar nav rail */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg gradient-telemetry shadow-elevated">
            <Activity className="size-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight">
              MALE UAV
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Engine Health
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3" data-ocid="sidebar_nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground",
                )}
                activeOptions={{ exact: item.to === "/" }}
                data-ocid={`nav.${item.label.toLowerCase()}`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border p-4">
          <Badge
            variant="outline"
            className="w-full justify-center border-border font-mono text-[10px] text-muted-foreground"
            data-ocid="demo_badge"
          >
            SYNTHETIC DEMO DATA
          </Badge>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
