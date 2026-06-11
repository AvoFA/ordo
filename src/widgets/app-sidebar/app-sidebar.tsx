"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  FileText,
  PlayCircle,
  Target,
  Home,
  BookOpen,
  NotebookTabs,
  BarChart3,
  Settings,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/model/ui-store";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

export type SidebarFocusData = {
  sessionId: string;
  topic: string;
  path: string;
  progress: number;
} | null;


function isActivePath(pathname: string, href: string) {
  if (href === "/today") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

type AppSidebarProps = {
  focusData?: SidebarFocusData;
};

export function AppSidebar({ focusData }: AppSidebarProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  const navigationGroups = [
    {
      label: t("nav.learningGroup"),
      items: [
        { label: t("nav.today"), href: "/today", icon: Home },
        { label: t("nav.paths"), href: "/learning-paths", icon: BookOpen },
        { label: t("nav.sessions"), href: "/sessions", icon: PlayCircle },
      ],
    },
    {
      label: t("nav.knowledgeGroup"),
      items: [
        { label: t("nav.notes"), href: "/notes", icon: NotebookTabs },
        { label: t("nav.practice"), href: "/practice", icon: Target },
        { label: t("nav.inbox"), href: "/inbox", icon: Inbox },
      ],
    },
    {
      label: t("nav.insightsGroup"),
      items: [
        { label: t("nav.analytics"), href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      label: t("nav.systemGroup"),
      items: [
        { label: t("nav.settings"), href: "/settings", icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const saved = localStorage.getItem("ordo_sidebar_collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      } else {
        setSidebarCollapsed(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [setSidebarCollapsed]);

  const handleToggle = () => {
    const nextState = !isSidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem("ordo_sidebar_collapsed", String(nextState));
  };

  const collapsed = mounted ? isSidebarCollapsed : true;

  return (
    <aside
      className={cn(
        "hidden border-r border-border/40 bg-surface-nav md:block transition-[width] duration-200 ease-in-out shrink-0 overflow-x-hidden h-full",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col px-3 py-4 transition-[width] duration-200 ease-in-out select-none",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-6 pr-0.5">
          {/* Brand/Header */}
          <div
            className={cn(
              "transition-all duration-200 shrink-0 relative overflow-hidden flex items-center justify-between",
              collapsed ? "h-11 px-1.5 py-1.5" : "px-2 py-2"
            )}
          >
            <div className={cn("flex items-center gap-2 transition-all duration-200 shrink-0", collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto")}>
              <FileText aria-hidden="true" className="h-4 w-4 text-primary shrink-0" />
              <span className="text-[14px] font-bold leading-none text-foreground tracking-tight whitespace-nowrap">Ordo</span>
            </div>

            {collapsed ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleToggle}
                  className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer active:scale-95"
                  title="Expand sidebar"
                >
                  <FileText className="h-5 w-5 text-primary/80" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleToggle}
                className="flex size-6 items-center justify-center rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6 shrink-0">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                {!collapsed ? (
                  <div className="px-3 text-[9px] font-bold uppercase leading-none tracking-wider text-muted-foreground/80">
                    {group.label}
                  </div>
                ) : (
                  <div className="h-px bg-border/40 my-2 mx-1" />
                )}
                <div className="mt-2.5 space-y-1">
                  {group.items.map((item) => {
                    const isActive = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex h-9 cursor-pointer items-center rounded-lg border border-transparent transition-colors duration-150 ease-out",
                          "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                          isActive &&
                            "bg-card text-foreground shadow-sm border-border/30",
                          collapsed ? "justify-center px-0" : "px-3"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-1 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-transparent transition-all duration-200 ease-out",
                            isActive && "bg-primary h-4.5 w-1",
                            collapsed && "left-0"
                          )}
                        />
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:scale-105 duration-200",
                            isActive && "text-primary",
                            collapsed ? "mx-auto" : "ml-1.5"
                          )}
                        />
                        {!collapsed && <span className="ml-3 text-xs font-semibold leading-none">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Pinned Focus Block — live session data */}
        <div className="pt-4 border-t border-border/10 shrink-0">
          {focusData ? (
            collapsed ? (
              <Link
                href={`/sessions/${focusData.sessionId}`}
                className="mx-auto size-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-primary transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer group"
                title={`${t("nav.continueSession")}: ${focusData.topic} (${focusData.progress}%)`}
              >
                <PlayCircle className="h-5 w-5" />
              </Link>
            ) : (
              <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 transition-all duration-200 space-y-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-primary/75">
                    <Target className="h-3 w-3 text-primary/60" />
                    {t("nav.learningFocus")}
                  </div>
                  <span className="text-[10px] font-bold text-primary">{focusData.progress}%</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-foreground truncate">{focusData.topic}</div>
                  <div className="text-[9px] text-muted-foreground/85 truncate uppercase tracking-wider font-semibold mt-0.5">
                    {focusData.path}
                  </div>
                </div>

                <div className="h-1 w-full rounded-full bg-secondary/55 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${focusData.progress}%` }}
                  />
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full h-8 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:translate-y-[-0.5px]"
                >
                  <Link href={`/sessions/${focusData.sessionId}`}>
                    <PlayCircle className="h-3.5 w-3.5" />
                    {t("nav.continueSession")}
                  </Link>
                </Button>
              </div>
            )
          ) : (
            collapsed ? (
              <Link
                href="/learning-paths"
                className="mx-auto size-10 rounded-full border border-border/40 bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                title={`${t("nav.noActiveSession")} — ${t("nav.browsePaths")}`}
              >
                <BookOpen className="h-4 w-4" />
              </Link>
            ) : (
              <div className="rounded-xl border border-border/30 bg-secondary/10 p-4 space-y-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {t("nav.noActiveSession")}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("nav.sidebarNoActiveDesc") || "Open a path, pick a topic, and start a session."}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full h-7 text-[11px] rounded-lg border-border/50 mt-1">
                  <Link href="/learning-paths">{t("nav.browsePaths")}</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </aside>
  );
}
