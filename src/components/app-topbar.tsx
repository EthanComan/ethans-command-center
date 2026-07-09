import { useRouterState } from "@tanstack/react-router";
import { Search, Command } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getModuleByPath, MODULE_CATEGORIES } from "@/config/modules";

function findCategoryLabel(path: string): string | null {
  for (const c of MODULE_CATEGORIES) {
    if (c.modules.some((m) => m.to === path)) return c.label;
  }
  return null;
}

export function AppTopbar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const mod = getModuleByPath(pathname);
  const category = findCategoryLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-5 bg-border/60" />
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {category && (
          <>
            <span className="text-muted-foreground/70">{category}</span>
            <span className="text-muted-foreground/40">/</span>
          </>
        )}
        <span className="truncate font-medium text-foreground">{mod?.label ?? "ETHAN"}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-md border border-border/60 bg-elevated/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground md:flex"
          aria-label="Rechercher"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Rechercher…</span>
          <span className="ml-6 inline-flex items-center gap-0.5 rounded-sm border border-border/60 bg-background/60 px-1 py-0 text-[10px]">
            <Command className="h-2.5 w-2.5" /> K
          </span>
        </button>
      </div>
    </header>
  );
}