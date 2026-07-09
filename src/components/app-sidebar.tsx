import { Link, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { MODULE_CATEGORIES } from "@/config/modules";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-gold-foreground shadow-[0_0_20px_-6px_var(--gold)]">
            <span className="text-sm font-semibold tracking-tight">E</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">ETHAN</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Pilotage personnel
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {MODULE_CATEGORIES.map((category) => (
          <SidebarGroup key={category.id} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                {category.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {category.modules.map((m) => {
                  const active = pathname === m.to;
                  const Icon = m.icon;
                  return (
                    <SidebarMenuItem key={m.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={m.label}
                        className={cn(
                          "group/item h-8 rounded-md px-2 text-[13px] font-normal text-sidebar-foreground/80 transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active &&
                            "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-r-full before:bg-gold",
                        )}
                      >
                        <Link to={m.to} className="relative flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{m.label}</span>
                              {m.status === "soon" && (
                                <span className="ml-auto rounded-sm border border-border/60 px-1.5 py-0 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                  Soon
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn("flex items-center gap-2 px-2 py-2", collapsed && "justify-center")}>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-elevated text-xs font-medium ring-1 ring-border">
            E
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-medium">Opérateur</span>
              <span className="truncate text-[10px] text-muted-foreground">v0.1 · Fondation</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}