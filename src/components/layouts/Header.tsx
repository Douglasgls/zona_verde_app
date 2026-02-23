import { type ComponentType, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarCheck,
  CarFront,
  LayoutDashboard,
  Menu,
  MonitorSmartphone,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";
import { mainMenu } from "@/config/menu";
import { Logo } from "../logo";
import { ModeToggle } from "../mode-toggle";
import { Badge } from "../ui/badge";

const routeIconMap: Record<string, ComponentType<{ className?: string }>> = {
  "/": LayoutDashboard,
  "/clients": Users,
  "/spots": CarFront,
  "/devices": MonitorSmartphone,
  "/reservations": CalendarCheck,
};

export function Header() {
  const [open, setOpen] = useState(false);

  const menuItems = useMemo(
    () =>
      mainMenu.filter((item): item is typeof item & { to: string } =>
        Boolean(item.to)
      ),
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center gap-3 px-4 md:px-8">
        <NavLink to="/" className="hidden items-center gap-2 md:flex">
          <div className="rounded-lg border border-border/70 bg-card p-1.5 shadow-sm">
            <Logo />
          </div>
        </NavLink>

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {menuItems.map((menu) => {
            const Icon = routeIconMap[menu.to] ?? LayoutDashboard;

            return (
              <NavLink
                key={menu.to}
                to={menu.to}
                className={({ isActive }) =>
                  cn(
                    "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "border-emerald-300 bg-emerald-100/70 text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {menu.title}
              </NavLink>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge className="hidden border-none bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 md:inline-flex">
            Painel Operacional
          </Badge>

          <ModeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88%] border-border/70 bg-background/95 p-0 backdrop-blur">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <NavLink to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <Logo />
                </NavLink>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fechar menu</span>
                </Button>
              </div>

              <nav className="space-y-2 p-4">
                {menuItems.map((menu) => {
                  const Icon = routeIconMap[menu.to] ?? LayoutDashboard;

                  return (
                    <NavLink
                      key={menu.to}
                      to={menu.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                          isActive
                            ? "border-emerald-300 bg-emerald-100/80 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "border-border/60 bg-card/50 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{menu.title}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-auto border-t p-4 text-xs text-muted-foreground">
                {appConfig.name}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
